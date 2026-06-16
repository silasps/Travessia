-- ─────────────────────────────────────────
-- ANOTAÇÕES TÉCNICAS (diário de campo)
-- ─────────────────────────────────────────
-- Registros internos da equipe técnica sobre o acolhido.
-- Imutáveis após criação (não se edita, não se deleta).
-- Visíveis apenas para técnico+ — NÃO aparecem no portal do acolhido.

CREATE TABLE anotacoes_tecnicas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id  UUID NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  conteudo      TEXT NOT NULL,
  autor_id      UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_anotacoes_residente ON anotacoes_tecnicas(residente_id);
CREATE INDEX idx_anotacoes_autor ON anotacoes_tecnicas(autor_id);

ALTER TABLE anotacoes_tecnicas ENABLE ROW LEVEL SECURITY;

-- Apenas técnico+ pode ler anotações (cuidador não tem acesso)
CREATE POLICY "anotacoes_tecnico_read" ON anotacoes_tecnicas
  FOR SELECT USING (
    has_staff_role('super_admin') OR
    has_staff_role('coordenacao') OR
    has_staff_role('tecnico')
  );

-- Técnico+ pode inserir
CREATE POLICY "anotacoes_tecnico_insert" ON anotacoes_tecnicas
  FOR INSERT WITH CHECK (
    has_staff_role('super_admin') OR
    has_staff_role('coordenacao') OR
    has_staff_role('tecnico')
  );

-- Ninguém pode editar ou deletar (registro imutável por design)
-- (sem policies de UPDATE/DELETE = bloqueado por RLS)
