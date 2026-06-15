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
