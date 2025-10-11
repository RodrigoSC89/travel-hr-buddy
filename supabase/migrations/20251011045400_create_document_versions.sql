-- Criar tabela para versões de documentos
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem visualizar versões de seus próprios documentos
CREATE POLICY "Users can view versions of their own documents" ON public.document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.ai_generated_documents WHERE generated_by = auth.uid()
    )
  );

-- Política: usuários podem criar versões de seus próprios documentos
CREATE POLICY "Users can create versions of their own documents" ON public.document_versions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM public.ai_generated_documents WHERE generated_by = auth.uid()
    )
  );

-- Índices para melhorar performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);

-- Função trigger para criar versão automaticamente ao atualizar documento
CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir versão antiga antes da atualização
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.document_versions (document_id, content, created_by)
    VALUES (OLD.id, OLD.content, OLD.generated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para versionar documentos automaticamente
CREATE TRIGGER trigger_create_document_version
  BEFORE UPDATE ON public.ai_generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_version();
