-- Criar tabela base de documentos
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Criar tabela de versões de documentos
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  change_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone default now(),
  UNIQUE(document_id, version_number)
);

-- Criar tabela de logs de restauração de versões
CREATE TABLE IF NOT EXISTS public.document_restore_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
  restored_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  restored_at timestamp with time zone default now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_restore_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para documents
-- Usuários podem visualizar documentos ativos
CREATE POLICY "Users can view active documents" 
ON public.documents 
FOR SELECT 
USING (status = 'active' OR created_by = auth.uid());

-- Usuários podem criar seus próprios documentos
CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- Usuários podem atualizar seus próprios documentos
CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (created_by = auth.uid());

-- Usuários podem deletar seus próprios documentos
CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (created_by = auth.uid());

-- Políticas RLS para document_versions
-- Usuários podem visualizar versões de documentos que podem visualizar
CREATE POLICY "Users can view document versions" 
ON public.document_versions 
FOR SELECT 
USING (
  document_id IN (
    SELECT id FROM public.documents 
    WHERE status = 'active' OR created_by = auth.uid()
  )
);

-- Usuários podem criar versões de seus próprios documentos
CREATE POLICY "Users can create versions of their documents" 
ON public.document_versions 
FOR INSERT 
WITH CHECK (
  document_id IN (
    SELECT id FROM public.documents WHERE created_by = auth.uid()
  )
);

-- Políticas RLS para document_restore_logs
-- Usuários podem visualizar logs de restauração de seus documentos
CREATE POLICY "Users can view restore logs of their documents" 
ON public.document_restore_logs 
FOR SELECT 
USING (
  document_id IN (
    SELECT id FROM public.documents WHERE created_by = auth.uid()
  )
);

-- Usuários podem criar logs ao restaurar seus documentos
CREATE POLICY "Users can create restore logs for their documents" 
ON public.document_restore_logs 
FOR INSERT 
WITH CHECK (
  document_id IN (
    SELECT id FROM public.documents WHERE created_by = auth.uid()
  ) AND restored_by = auth.uid()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON public.document_versions(document_id, version_number);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON public.document_versions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_restore_logs_document_id ON public.document_restore_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_restore_logs_restored_by ON public.document_restore_logs(restored_by);
CREATE INDEX IF NOT EXISTS idx_document_restore_logs_restored_at ON public.document_restore_logs(restored_at DESC);

-- Trigger para atualizar updated_at em documents
CREATE OR REPLACE FUNCTION public.update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_documents_updated_at();
