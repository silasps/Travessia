-- =============================================
-- Projeto Travessia — Portal da Transparência
-- =============================================

CREATE TYPE documento_categoria_publica AS ENUM (
  'ata',
  'relatorio_atividades',
  'prestacao_contas',
  'balancete',
  'estatuto',
  'regimento',
  'plano_trabalho',
  'contrato_parceria',
  'outros'
);

CREATE TABLE documentos_publicos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        TEXT NOT NULL,
  descricao     TEXT,
  categoria     documento_categoria_publica NOT NULL,
  arquivo_url   TEXT NOT NULL,
  competencia   TEXT,
  publicado     BOOLEAN NOT NULL DEFAULT false,
  publicado_em  TIMESTAMPTZ,
  tamanho_kb    INT,
  criado_por    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_documentos_publicos_updated_at
  BEFORE UPDATE ON documentos_publicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_docs_publicos_categoria  ON documentos_publicos(categoria) WHERE publicado = true;
CREATE INDEX idx_docs_publicos_publicados ON documentos_publicos(publicado_em DESC) WHERE publicado = true;

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE documentos_publicos ENABLE ROW LEVEL SECURITY;

-- Documentos publicados são visíveis para todos (incluindo anônimos)
CREATE POLICY "docs_publicos_public_read" ON documentos_publicos
  FOR SELECT USING (publicado = true);

-- Coordenação gerencia documentos
CREATE POLICY "docs_publicos_coordenacao_all" ON documentos_publicos
  FOR ALL USING (is_coordenacao_or_above());
