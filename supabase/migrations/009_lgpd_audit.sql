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
