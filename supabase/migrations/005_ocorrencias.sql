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
