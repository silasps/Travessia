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
