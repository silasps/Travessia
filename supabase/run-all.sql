-- =============================================
-- Projeto Travessia — Schema Inicial
-- =============================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────
-- FUNÇÕES UTILITÁRIAS
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

CREATE TYPE staff_role AS ENUM (
  'super_admin',
  'coordenacao',
  'tecnico',
  'cuidador'
);

-- ─────────────────────────────────────────
-- STAFF — PERFIS E PAPÉIS
-- ─────────────────────────────────────────

CREATE TABLE staff_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  cpf               TEXT,
  phone             TEXT,
  cargo             TEXT,
  avatar_url        TEXT,
  lgpd_consent_at   TIMESTAMPTZ,
  lgpd_consent_ip   TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE staff_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role        staff_role NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- CONFIGURAÇÕES DO SISTEMA
-- ─────────────────────────────────────────

CREATE TABLE configuracoes_sistema (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave       TEXT NOT NULL UNIQUE,
  valor       TEXT NOT NULL,
  descricao   TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_configuracoes_updated_at
  BEFORE UPDATE ON configuracoes_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- RLS — ROW LEVEL SECURITY
-- ─────────────────────────────────────────

ALTER TABLE staff_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Função helper: verificar papel do usuário atual
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS staff_role AS $$
  SELECT role FROM staff_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_staff_role(check_role staff_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid() AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_coordenacao_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'coordenacao')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_tecnico_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'coordenacao', 'tecnico')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_any_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas: staff_profiles
CREATE POLICY "staff_profiles_own" ON staff_profiles
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "staff_profiles_coordenacao_read" ON staff_profiles
  FOR SELECT USING (is_coordenacao_or_above());

-- Políticas: staff_roles
CREATE POLICY "staff_roles_own" ON staff_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "staff_roles_coordenacao_read" ON staff_roles
  FOR SELECT USING (is_coordenacao_or_above());
CREATE POLICY "staff_roles_super_admin_write" ON staff_roles
  FOR ALL USING (has_staff_role('super_admin'));

-- Políticas: configuracoes_sistema
CREATE POLICY "configuracoes_staff_read" ON configuracoes_sistema
  FOR SELECT USING (is_any_staff());
CREATE POLICY "configuracoes_coordenacao_write" ON configuracoes_sistema
  FOR ALL USING (is_coordenacao_or_above());

-- ─────────────────────────────────────────
-- DADOS INICIAIS
-- ─────────────────────────────────────────

INSERT INTO configuracoes_sistema (chave, valor, descricao) VALUES
  ('dpo_nome',            'Responsável pela OSC',             'Nome do Encarregado de Dados (DPO)'),
  ('dpo_email',           'dpo@projetotravessia.org.br',      'E-mail do DPO para requisições LGPD'),
  ('capacidade_total',    '50',                               'Número máximo de vagas do abrigo'),
  ('nome_osc',            'Projeto Travessia',                'Nome da Organização da Sociedade Civil'),
  ('cnpj_osc',            '00.000.000/0001-00',               'CNPJ da OSC — atualizar'),
  ('endereco_osc',        'Ribeirão Preto, SP',               'Endereço do abrigo'),
  ('telefone_osc',        '',                                 'Telefone de contato da OSC'),
  ('email_osc',           'contato@projetotravessia.org.br',  'E-mail de contato da OSC');
-- =============================================
-- Projeto Travessia — Residentes e Movimentos
-- =============================================

CREATE TYPE residente_status AS ENUM (
  'ativo',
  'desligado',
  'evadido',
  'transferido',
  'obito'
);

CREATE TYPE motivo_saida AS ENUM (
  'reintegracao_familiar',
  'encaminhamento_habitacao',
  'encaminhamento_trabalho',
  'conclusao_processo',
  'evasao',
  'transferencia',
  'obito',
  'desligamento_disciplinar',
  'outros'
);

CREATE TYPE movimento_tipo AS ENUM (
  'entrada',
  'saida_temporaria',
  'retorno',
  'saida_definitiva'
);

-- Sequência para número de prontuário
CREATE SEQUENCE prontuario_seq START 1;

CREATE TABLE residentes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificação
  nome_completo       TEXT NOT NULL,
  nome_social         TEXT,
  data_nascimento     DATE,
  naturalidade        TEXT,
  nacionalidade       TEXT NOT NULL DEFAULT 'Brasileira',
  -- Documentos
  cpf                 TEXT UNIQUE,
  rg                  TEXT,
  rg_orgao_emissor    TEXT,
  rg_uf               CHAR(2),
  nis                 TEXT,
  -- Situação de rua
  ultimo_endereco     TEXT,
  tempo_situacao_rua  TEXT,
  -- Foto
  foto_url            TEXT,
  -- Controle
  status              residente_status NOT NULL DEFAULT 'ativo',
  numero_prontuario   TEXT NOT NULL UNIQUE DEFAULT ('PT-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('prontuario_seq')::TEXT, 3, '0')),
  fase_atual          SMALLINT NOT NULL DEFAULT 1 CHECK (fase_atual BETWEEN 1 AND 4),
  -- Datas
  data_entrada        DATE NOT NULL DEFAULT CURRENT_DATE,
  data_saida          DATE,
  motivo_saida        motivo_saida,
  observacoes_saida   TEXT,
  -- LGPD
  lgpd_consent_at     TIMESTAMPTZ,
  lgpd_consent_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lgpd_consent_method TEXT CHECK (lgpd_consent_method IN ('verbal_registrado', 'escrito', 'digital')),
  -- Metadados
  cadastrado_por      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_residentes_updated_at
  BEFORE UPDATE ON residentes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE movimentos_residentes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id  UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  tipo          movimento_tipo NOT NULL,
  data_hora     TIMESTAMPTZ NOT NULL DEFAULT now(),
  motivo        TEXT,
  destino       TEXT,
  registrado_por UUID NOT NULL REFERENCES auth.users(id),
  observacoes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices
CREATE INDEX idx_residentes_status       ON residentes(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_residentes_fase         ON residentes(fase_atual) WHERE deleted_at IS NULL;
CREATE INDEX idx_residentes_nome_search  ON residentes USING gin(to_tsvector('portuguese', nome_completo));
CREATE INDEX idx_movimentos_residente    ON movimentos_residentes(residente_id);
CREATE INDEX idx_movimentos_data         ON movimentos_residentes(data_hora DESC);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE residentes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentos_residentes ENABLE ROW LEVEL SECURITY;

-- Qualquer staff vê residentes ativos
CREATE POLICY "residentes_staff_read" ON residentes
  FOR SELECT USING (is_any_staff() AND deleted_at IS NULL);

-- Técnico e acima podem criar e editar
CREATE POLICY "residentes_tecnico_insert" ON residentes
  FOR INSERT WITH CHECK (is_tecnico_or_above());

CREATE POLICY "residentes_tecnico_update" ON residentes
  FOR UPDATE USING (is_tecnico_or_above());

-- Apenas coordenação pode deletar (soft delete)
CREATE POLICY "residentes_coordenacao_delete" ON residentes
  FOR DELETE USING (is_coordenacao_or_above());

-- Movimentos: qualquer staff pode registrar
CREATE POLICY "movimentos_staff_read" ON movimentos_residentes
  FOR SELECT USING (is_any_staff());

CREATE POLICY "movimentos_staff_insert" ON movimentos_residentes
  FOR INSERT WITH CHECK (is_any_staff());

-- Movimentos definitivos só podem ser inseridos por técnico+
-- (checado na aplicação via RBAC, o RLS permite qualquer staff)
-- =============================================
-- Projeto Travessia — Documentos, Família e Evolução
-- =============================================

CREATE TYPE documento_tipo AS ENUM (
  'rg',
  'cpf',
  'certidao_nascimento',
  'certidao_casamento',
  'carteira_trabalho',
  'titulo_eleitor',
  'nis_cadastro_unico',
  'cartao_sus',
  'comprovante_residencia',
  'foto_3x4',
  'outros'
);

CREATE TYPE documento_status_residente AS ENUM (
  'nao_possui',
  'em_processo',
  'obtido',
  'entregue_residente'
);

-- ─────────────────────────────────────────
-- DOCUMENTOS DO RESIDENTE
-- ─────────────────────────────────────────

CREATE TABLE documentos_residente (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id  UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  tipo          documento_tipo NOT NULL,
  status        documento_status_residente NOT NULL DEFAULT 'nao_possui',
  arquivo_url   TEXT,
  numero        TEXT,
  data_obtido   DATE,
  observacoes   TEXT,
  atualizado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(residente_id, tipo)
);

CREATE TRIGGER trg_documentos_residente_updated_at
  BEFORE UPDATE ON documentos_residente
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- CONTATOS FAMILIARES
-- ─────────────────────────────────────────

CREATE TABLE contatos_familiares (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id  UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  parentesco    TEXT,
  telefone      TEXT,
  endereco      TEXT,
  observacoes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE historico_contatos_familia (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id    UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  contato_id      UUID REFERENCES contatos_familiares(id) ON DELETE SET NULL,
  data_contato    DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_contato    TEXT CHECK (tipo_contato IN ('visita', 'ligacao', 'carta', 'email', 'outro')),
  descricao       TEXT NOT NULL,
  registrado_por  UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ─────────────────────────────────────────
-- FASES E MARCOS DE EVOLUÇÃO
-- ─────────────────────────────────────────

CREATE TABLE fases_evolucao (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            SMALLINT NOT NULL UNIQUE,
  nome              TEXT NOT NULL,
  descricao         TEXT,
  duracao_min_dias  INT,
  duracao_max_dias  INT,
  objetivos         JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE marcos_evolucao (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id  UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  fase          SMALLINT NOT NULL,
  descricao     TEXT NOT NULL,
  data_marco    DATE NOT NULL DEFAULT CURRENT_DATE,
  registrado_por UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_documentos_residente     ON documentos_residente(residente_id);
CREATE INDEX idx_contatos_residente       ON contatos_familiares(residente_id);
CREATE INDEX idx_historico_residente      ON historico_contatos_familia(residente_id);
CREATE INDEX idx_marcos_residente         ON marcos_evolucao(residente_id);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE documentos_residente       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_familiares        ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_contatos_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE fases_evolucao             ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcos_evolucao            ENABLE ROW LEVEL SECURITY;

-- Documentos: técnico+ vê e edita; cuidador não vê documentos pessoais
CREATE POLICY "documentos_tecnico_all" ON documentos_residente
  FOR ALL USING (is_tecnico_or_above());

-- Contatos: técnico+ gerencia
CREATE POLICY "contatos_tecnico_all" ON contatos_familiares
  FOR ALL USING (is_tecnico_or_above());
CREATE POLICY "historico_tecnico_all" ON historico_contatos_familia
  FOR ALL USING (is_tecnico_or_above());

-- Fases: leitura para qualquer staff
CREATE POLICY "fases_staff_read" ON fases_evolucao
  FOR SELECT USING (is_any_staff());
CREATE POLICY "fases_super_admin_write" ON fases_evolucao
  FOR ALL USING (has_staff_role('super_admin'));

-- Marcos: técnico+ registra; qualquer staff lê
CREATE POLICY "marcos_staff_read" ON marcos_evolucao
  FOR SELECT USING (is_any_staff());
CREATE POLICY "marcos_tecnico_insert" ON marcos_evolucao
  FOR INSERT WITH CHECK (is_tecnico_or_above());

-- ─────────────────────────────────────────
-- DADOS INICIAIS — FASES
-- ─────────────────────────────────────────

INSERT INTO fases_evolucao (numero, nome, descricao, duracao_min_dias, duracao_max_dias, objetivos) VALUES
(1, 'Fase 1 — Acolhimento e Estabilização',
 'Período inicial de adaptação ao abrigo, estabilização das necessidades básicas e construção de vínculo com a equipe.',
 0, 60,
 '["Adaptação às regras e rotinas do abrigo", "Avaliação inicial de saúde física e mental", "Identificação de documentos faltantes", "Construção de vínculo com técnico de referência", "Estabilização alimentar e de higiene"]'::jsonb),

(2, 'Fase 2 — Reorganização',
 'Início da regularização documental, tratamento de saúde e primeiros passos para autonomia.',
 61, 120,
 '["Regularização de documentos (RG, CPF, NIS)", "Acompanhamento de saúde físico e mental", "Reestabelecimento ou fortalecimento de vínculos familiares", "Início de cursos e qualificação", "Elaboração do PIA com técnico responsável"]'::jsonb),

(3, 'Fase 3 — Autonomia Progressiva',
 'Desenvolvimento de habilidades para vida independente, busca ativa de trabalho e moradia.',
 121, 240,
 '["Inserção no mercado de trabalho", "Busca por moradia alternativa", "Gestão financeira básica", "Participação em atividades comunitárias", "Fortalecimento da rede de apoio"]'::jsonb),

(4, 'Fase 4 — Preparação para Desligamento',
 'Consolidação da autonomia e planejamento do desligamento com encaminhamentos formalizados.',
 241, 365,
 '["Moradia formalizada ou em processo", "Renda própria ou encaminhamento de benefício", "Rede de apoio consolidada", "Plano de desligamento elaborado com equipe", "Documentação completa"]'::jsonb);
-- =============================================
-- Projeto Travessia — PIA (Plano Individual de Atendimento)
-- =============================================

CREATE TYPE pia_status AS ENUM (
  'rascunho',
  'em_elaboracao',
  'concluido',
  'revisao',
  'desatualizado'
);

CREATE TABLE pia (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id          UUID NOT NULL UNIQUE REFERENCES residentes(id) ON DELETE CASCADE,
  status                pia_status NOT NULL DEFAULT 'rascunho',
  tecnico_id            UUID NOT NULL REFERENCES auth.users(id),
  data_inicio           DATE NOT NULL DEFAULT CURRENT_DATE,
  data_revisao          DATE,
  -- Seções do PIA como JSONB (expansível sem migração)
  secao_identificacao   JSONB NOT NULL DEFAULT '{}',
  secao_historico_vida  JSONB NOT NULL DEFAULT '{}',
  secao_saude           JSONB NOT NULL DEFAULT '{}',
  secao_objetivos       JSONB NOT NULL DEFAULT '{}',
  secao_plano_acao      JSONB NOT NULL DEFAULT '{}',
  secao_rede_apoio      JSONB NOT NULL DEFAULT '{}',
  observacoes_gerais    TEXT,
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_pia_updated_at
  BEFORE UPDATE ON pia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Histórico de atualizações do PIA
CREATE TABLE pia_registros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pia_id          UUID NOT NULL REFERENCES pia(id) ON DELETE CASCADE,
  tecnico_id      UUID NOT NULL REFERENCES auth.users(id),
  descricao       TEXT NOT NULL,
  data_registro   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_pia_residente ON pia(residente_id);
CREATE INDEX idx_pia_registros ON pia_registros(pia_id);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE pia          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pia_registros ENABLE ROW LEVEL SECURITY;

-- Apenas técnico e acima podem ver e editar o PIA
CREATE POLICY "pia_tecnico_all" ON pia
  FOR ALL USING (is_tecnico_or_above());

CREATE POLICY "pia_registros_tecnico_all" ON pia_registros
  FOR ALL USING (is_tecnico_or_above());
-- =============================================
-- Projeto Travessia — Ocorrências
-- =============================================

CREATE TYPE ocorrencia_gravidade AS ENUM (
  'leve',
  'moderada',
  'grave',
  'gravissima'
);

CREATE TYPE ocorrencia_status AS ENUM (
  'aberta',
  'em_avaliacao',
  'confirmada',
  'improcedente'
);

CREATE SEQUENCE ocorrencia_seq START 1;

CREATE TABLE ocorrencias (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero           TEXT NOT NULL UNIQUE DEFAULT ('OC-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('ocorrencia_seq')::TEXT, 3, '0')),
  residente_id     UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  aberto_por       UUID NOT NULL REFERENCES auth.users(id),
  data_ocorrencia  TIMESTAMPTZ NOT NULL DEFAULT now(),
  gravidade        ocorrencia_gravidade NOT NULL,
  descricao        TEXT NOT NULL,
  local            TEXT,
  testemunhas      TEXT,
  -- Fluxo de avaliação
  status           ocorrencia_status NOT NULL DEFAULT 'aberta',
  avaliado_por     UUID REFERENCES auth.users(id),
  data_avaliacao   TIMESTAMPTZ,
  parecer          TEXT,
  providencias     TEXT,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_ocorrencias_updated_at
  BEFORE UPDATE ON ocorrencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_ocorrencias_residente ON ocorrencias(residente_id);
CREATE INDEX idx_ocorrencias_status    ON ocorrencias(status);
CREATE INDEX idx_ocorrencias_data      ON ocorrencias(data_ocorrencia DESC);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

-- Qualquer staff pode abrir ocorrência
CREATE POLICY "ocorrencias_staff_insert" ON ocorrencias
  FOR INSERT WITH CHECK (is_any_staff());

-- Qualquer staff lê ocorrências (supervisores veem todas, cuidadores verão as suas via app RBAC)
CREATE POLICY "ocorrencias_staff_read" ON ocorrencias
  FOR SELECT USING (is_any_staff());

-- Apenas coordenação pode avaliar (UPDATE de status)
CREATE POLICY "ocorrencias_coordenacao_update" ON ocorrencias
  FOR UPDATE USING (is_coordenacao_or_above());
-- =============================================
-- Projeto Travessia — Notificações (padrão go_guide)
-- =============================================

CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  payload             JSONB NOT NULL DEFAULT '{}',
  read_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_notifications_unread    ON notifications(recipient_user_id) WHERE read_at IS NULL;

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (recipient_user_id = auth.uid());

-- Sistema pode inserir notificações para qualquer usuário via service_role
-- (chamado de Server Actions com createAdminClient)

-- ─────────────────────────────────────────
-- FUNÇÃO: Notificar coordenação quando ocorrência é aberta
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_coordenacao_nova_ocorrencia()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_user_id, type, payload)
  SELECT
    sr.user_id,
    'nova_ocorrencia',
    jsonb_build_object(
      'ocorrencia_id',    NEW.id,
      'numero',           NEW.numero,
      'residente_id',     NEW.residente_id,
      'gravidade',        NEW.gravidade,
      'descricao',        LEFT(NEW.descricao, 120)
    )
  FROM staff_roles sr
  WHERE sr.role IN ('super_admin', 'coordenacao')
    AND sr.user_id != NEW.aberto_por;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_nova_ocorrencia
  AFTER INSERT ON ocorrencias
  FOR EACH ROW EXECUTE FUNCTION notify_coordenacao_nova_ocorrencia();
-- =============================================
-- Projeto Travessia — Portal da Transparência
-- =============================================

CREATE TYPE documento_categoria_publica AS ENUM (
  'ata',
  'relatorio_atividades',
  'prestacao_contas',
  'balancete',
  'estatuto',
  'regimento',
  'plano_trabalho',
  'contrato_parceria',
  'outros'
);

CREATE TABLE documentos_publicos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        TEXT NOT NULL,
  descricao     TEXT,
  categoria     documento_categoria_publica NOT NULL,
  arquivo_url   TEXT NOT NULL,
  competencia   TEXT,
  publicado     BOOLEAN NOT NULL DEFAULT false,
  publicado_em  TIMESTAMPTZ,
  tamanho_kb    INT,
  criado_por    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_documentos_publicos_updated_at
  BEFORE UPDATE ON documentos_publicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_docs_publicos_categoria  ON documentos_publicos(categoria) WHERE publicado = true;
CREATE INDEX idx_docs_publicos_publicados ON documentos_publicos(publicado_em DESC) WHERE publicado = true;

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE documentos_publicos ENABLE ROW LEVEL SECURITY;

-- Documentos publicados são visíveis para todos (incluindo anônimos)
CREATE POLICY "docs_publicos_public_read" ON documentos_publicos
  FOR SELECT USING (publicado = true);

-- Coordenação gerencia documentos
CREATE POLICY "docs_publicos_coordenacao_all" ON documentos_publicos
  FOR ALL USING (is_coordenacao_or_above());
-- =============================================
-- Projeto Travessia — Portal do Residente (self-service)
-- =============================================

CREATE TABLE residente_portals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id  UUID NOT NULL UNIQUE REFERENCES residentes(id) ON DELETE CASCADE,
  user_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT false,
  activated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_residente_portals_user ON residente_portals(user_id);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE residente_portals ENABLE ROW LEVEL SECURITY;

-- Residente acessa apenas seus próprios dados via portal
CREATE POLICY "residente_portal_own" ON residente_portals
  FOR SELECT USING (user_id = auth.uid());

-- Staff técnico+ gerencia os portais
CREATE POLICY "residente_portal_tecnico_all" ON residente_portals
  FOR ALL USING (is_tecnico_or_above());

-- ─────────────────────────────────────────
-- Residente pode ler apenas seu próprio prontuário
-- ─────────────────────────────────────────

-- Política adicional em residentes: residente lê o próprio registro
CREATE POLICY "residentes_own_portal" ON residentes
  FOR SELECT USING (
    id IN (
      SELECT residente_id FROM residente_portals
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Idem para documentos, marcos e fases
CREATE POLICY "documentos_residente_own_portal" ON documentos_residente
  FOR SELECT USING (
    residente_id IN (
      SELECT residente_id FROM residente_portals
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "marcos_residente_own_portal" ON marcos_evolucao
  FOR SELECT USING (
    residente_id IN (
      SELECT residente_id FROM residente_portals
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
-- =============================================
-- Projeto Travessia — LGPD: Audit Log e Consentimentos
-- =============================================

-- ─────────────────────────────────────────
-- AUDIT LOG (imutável — apenas INSERT, nunca UPDATE/DELETE)
-- ─────────────────────────────────────────

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role    TEXT,
  action       TEXT NOT NULL,
  entity       TEXT NOT NULL,
  entity_id    UUID,
  entity_name  TEXT,
  details      JSONB,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_audit_user    ON audit_logs(user_id);
CREATE INDEX idx_audit_entity  ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ─────────────────────────────────────────
-- LGPD: CONSENTIMENTOS (somente INSERT — nunca UPDATE)
-- ─────────────────────────────────────────

CREATE TABLE lgpd_consentimentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sujeito_tipo  TEXT NOT NULL CHECK (sujeito_tipo IN ('residente', 'staff')),
  sujeito_id    UUID NOT NULL,
  finalidade    TEXT NOT NULL,
  aceito        BOOLEAN NOT NULL,
  metodo        TEXT NOT NULL CHECK (metodo IN ('verbal_registrado', 'escrito', 'digital')),
  coletado_por  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip            TEXT,
  revogado_em   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_lgpd_sujeito ON lgpd_consentimentos(sujeito_tipo, sujeito_id);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consentimentos ENABLE ROW LEVEL SECURITY;

-- Audit logs: apenas coordenação lê; sistema insere (via service_role)
CREATE POLICY "audit_coordenacao_read" ON audit_logs
  FOR SELECT USING (is_coordenacao_or_above());

CREATE POLICY "audit_system_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Consentimentos: coordenação lê; qualquer staff insere (coleta consentimento)
CREATE POLICY "lgpd_coordenacao_read" ON lgpd_consentimentos
  FOR SELECT USING (is_coordenacao_or_above());

CREATE POLICY "lgpd_staff_insert" ON lgpd_consentimentos
  FOR INSERT WITH CHECK (is_any_staff());
