-- Criar tabela para histórico de versões de documentos
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem visualizar versões de documentos que podem visualizar
CREATE POLICY "Users can view document versions they can access" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_versions.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Política: usuários podem criar versões para seus próprios documentos
CREATE POLICY "Users can create versions for their documents" ON public.document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_versions.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Índices para melhorar performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);
CREATE UNIQUE INDEX idx_document_versions_document_version ON public.document_versions(document_id, version_number);
