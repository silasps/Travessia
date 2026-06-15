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
