-- ─────────────────────────────────────────
-- ENCAMINHAMENTOS EXTERNOS
-- ─────────────────────────────────────────
-- Rastreamento de encaminhamentos formais da equipe técnica para
-- serviços externos (CRAS, CAPS, saúde, emprego, etc.).
-- Visível para técnico+. Não aparece no portal do acolhido.

CREATE TYPE encaminhamento_servico AS ENUM (
  'cras',
  'creas',
  'caps',
  'saude',
  'emprego_sine',
  'curso_profissionalizante',
  'beneficio_social',
  'juridico',
  'moradia',
  'outros'
);

CREATE TYPE encaminhamento_status AS ENUM (
  'pendente',
  'realizado',
  'sem_retorno',
  'cancelado'
);

CREATE TABLE encaminhamentos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id          UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  servico               encaminhamento_servico NOT NULL,
  descricao             TEXT NOT NULL,
  data_encaminhamento   DATE NOT NULL DEFAULT CURRENT_DATE,
  responsavel_id        UUID NOT NULL REFERENCES auth.users(id),
  retorno_previsto      DATE,
  status                encaminhamento_status NOT NULL DEFAULT 'pendente',
  observacoes_retorno   TEXT,
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_encaminhamentos_updated_at
  BEFORE UPDATE ON encaminhamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_encaminhamentos_residente ON encaminhamentos(residente_id);

ALTER TABLE encaminhamentos ENABLE ROW LEVEL SECURITY;

-- Técnico+ pode ler e inserir
CREATE POLICY "encaminhamentos_tecnico_read" ON encaminhamentos
  FOR SELECT USING (
    has_staff_role('super_admin') OR
    has_staff_role('coordenacao') OR
    has_staff_role('tecnico')
  );

CREATE POLICY "encaminhamentos_tecnico_insert" ON encaminhamentos
  FOR INSERT WITH CHECK (
    has_staff_role('super_admin') OR
    has_staff_role('coordenacao') OR
    has_staff_role('tecnico')
  );

-- Técnico+ pode atualizar status e observações de retorno
CREATE POLICY "encaminhamentos_tecnico_update" ON encaminhamentos
  FOR UPDATE USING (
    has_staff_role('super_admin') OR
    has_staff_role('coordenacao') OR
    has_staff_role('tecnico')
  );
