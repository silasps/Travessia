-- =============================================
-- Projeto Travessia — Pastas de documentos públicos (nomes editáveis)
-- =============================================
-- Decopla o rótulo exibido da pasta (editável pela coordenação) do valor
-- técnico fixo do enum documento_categoria_publica.

CREATE TABLE categorias_documentos_publicos (
  categoria   documento_categoria_publica PRIMARY KEY,
  nome        TEXT NOT NULL,
  ordem       INT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_categorias_documentos_publicos_updated_at
  BEFORE UPDATE ON categorias_documentos_publicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO categorias_documentos_publicos (categoria, nome, ordem) VALUES
  ('estatuto',             'Estatuto Social',                   1),
  ('regimento',            'Regimentos e Regulamentos',         2),
  ('ata',                  'Atas',                               3),
  ('contrato_parceria',    'Termos de Colaboração e Convênios', 4),
  ('plano_trabalho',       'Planos de Trabalho',                5),
  ('relatorio_atividades', 'Relatórios de Atividades',          6),
  ('prestacao_contas',     'Prestação de Contas',               7),
  ('balancete',            'Balancetes e Demonstrativos',       8),
  ('outros',               'Outros Documentos',                 9);

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

ALTER TABLE categorias_documentos_publicos ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler os nomes das pastas (exibidos no portal público)
CREATE POLICY "categorias_docs_public_read" ON categorias_documentos_publicos
  FOR SELECT USING (true);

-- Apenas coordenação+ pode renomear pastas
CREATE POLICY "categorias_docs_coordenacao_update" ON categorias_documentos_publicos
  FOR UPDATE USING (is_coordenacao_or_above());
