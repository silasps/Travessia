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
