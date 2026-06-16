-- ─────────────────────────────────────────
-- ADVERTÊNCIAS (infrações de regras)
-- ─────────────────────────────────────────
-- Distinto de ocorrencias: advertência é um ato formal de disciplina
-- que o próprio acolhido pode visualizar no portal.

CREATE TYPE advertencia_tipo AS ENUM (
  'verbal',
  'escrita',
  'suspensao'
);

CREATE TABLE advertencias (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id    UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  tipo            advertencia_tipo NOT NULL,
  motivo          TEXT NOT NULL,
  descricao       TEXT,
  data_aplicacao  DATE NOT NULL DEFAULT CURRENT_DATE,
  aplicado_por    UUID NOT NULL REFERENCES auth.users(id),
  reconhecido_em  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_advertencias_updated_at
  BEFORE UPDATE ON advertencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_advertencias_residente ON advertencias(residente_id);

ALTER TABLE advertencias ENABLE ROW LEVEL SECURITY;

-- Staff lê todas as advertências
CREATE POLICY "advertencias_staff_read" ON advertencias
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff_roles WHERE user_id = auth.uid())
  );

-- Cuidador pode registrar advertência verbal; técnico+ pode registrar qualquer tipo
CREATE POLICY "advertencias_staff_insert" ON advertencias
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM staff_roles WHERE user_id = auth.uid())
  );

-- Apenas coordenação+ pode atualizar (marcar reconhecimento, por exemplo)
CREATE POLICY "advertencias_coordenacao_update" ON advertencias
  FOR UPDATE USING (has_staff_role('coordenacao') OR has_staff_role('super_admin'));

-- Acolhido vê suas próprias advertências via residente_portals
CREATE POLICY "advertencias_residente_read" ON advertencias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM residente_portals rp
      WHERE rp.user_id = auth.uid()
        AND rp.residente_id = advertencias.residente_id
        AND rp.is_active = true
    )
  );
