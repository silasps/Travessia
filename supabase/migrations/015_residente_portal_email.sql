-- =============================================
-- Projeto Travessia — e-mail de portal para auto-link no login
-- =============================================

ALTER TABLE residente_portals
  ADD COLUMN IF NOT EXISTS email_portal TEXT;

CREATE INDEX IF NOT EXISTS idx_residente_portals_email
  ON residente_portals(email_portal);
