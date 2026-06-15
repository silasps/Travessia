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
