-- Criar tabela para documentos gerados por IA
CREATE TABLE IF NOT EXISTS public.ai_generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ai_generated_documents ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem visualizar seus próprios documentos
CREATE POLICY "Users can view their own AI documents" ON public.ai_generated_documents
  FOR SELECT USING (generated_by = auth.uid());

-- Política: usuários podem criar documentos
CREATE POLICY "Users can create AI documents" ON public.ai_generated_documents
  FOR INSERT WITH CHECK (generated_by = auth.uid());

-- Política: usuários podem atualizar seus próprios documentos
CREATE POLICY "Users can update their own AI documents" ON public.ai_generated_documents
  FOR UPDATE USING (generated_by = auth.uid());

-- Política: usuários podem deletar seus próprios documentos
CREATE POLICY "Users can delete their own AI documents" ON public.ai_generated_documents
  FOR DELETE USING (generated_by = auth.uid());

-- Índices para melhorar performance
CREATE INDEX idx_ai_generated_documents_generated_by ON public.ai_generated_documents(generated_by);
CREATE INDEX idx_ai_generated_documents_created_at ON public.ai_generated_documents(created_at DESC);
