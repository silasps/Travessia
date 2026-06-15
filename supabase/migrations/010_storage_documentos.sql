-- =============================================
-- Projeto Travessia — Storage: Documentos Públicos
-- Execute no Supabase Dashboard → SQL Editor
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos-publicos',
  'documentos-publicos',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Qualquer pessoa pode ler (bucket público)
CREATE POLICY "docs_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos-publicos');

-- Coordenação+ pode fazer upload
CREATE POLICY "docs_storage_coordenacao_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentos-publicos'
    AND is_coordenacao_or_above()
  );

-- Coordenação+ pode atualizar
CREATE POLICY "docs_storage_coordenacao_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documentos-publicos'
    AND is_coordenacao_or_above()
  );

-- Coordenação+ pode deletar
CREATE POLICY "docs_storage_coordenacao_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documentos-publicos'
    AND is_coordenacao_or_above()
  );
