-- ===========================
-- AUDITORIAS IMCA - RLS Implementation
-- Table for storing IMCA audits with row level security
-- ===========================

-- Create auditorias_imca table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auditorias_imca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'approved')),
  audit_date DATE,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  findings JSONB DEFAULT '{}',
  recommendations TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditorias_imca ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver auditorias que criaram
CREATE POLICY "Usuários veem apenas suas auditorias" 
  ON public.auditorias_imca
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas auditorias
CREATE POLICY "Usuários podem inserir auditorias" 
  ON public.auditorias_imca
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas auditorias
CREATE POLICY "Usuários podem atualizar auditorias próprias" 
  ON public.auditorias_imca
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política: Usuários podem deletar suas auditorias
CREATE POLICY "Usuários podem deletar auditorias próprias" 
  ON public.auditorias_imca
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Política: Admins podem ver todas auditorias
CREATE POLICY "Admins podem ver todas auditorias" 
  ON public.auditorias_imca
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem atualizar todas auditorias
CREATE POLICY "Admins podem atualizar todas auditorias" 
  ON public.auditorias_imca
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem deletar todas auditorias
CREATE POLICY "Admins podem deletar todas auditorias" 
  ON public.auditorias_imca
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem inserir auditorias para qualquer usuário
CREATE POLICY "Admins podem inserir auditorias" 
  ON public.auditorias_imca
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_user_id ON public.auditorias_imca(user_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_created_at ON public.auditorias_imca(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_audit_date ON public.auditorias_imca(audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_status ON public.auditorias_imca(status);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_auditorias_imca_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auditorias_imca_updated_at
  BEFORE UPDATE ON public.auditorias_imca
  FOR EACH ROW
  EXECUTE FUNCTION update_auditorias_imca_updated_at();

-- Add table and column comments
COMMENT ON TABLE public.auditorias_imca IS 'Tabela para armazenamento de auditorias IMCA com Row Level Security';
COMMENT ON COLUMN public.auditorias_imca.id IS 'Identificador único da auditoria';
COMMENT ON COLUMN public.auditorias_imca.user_id IS 'ID do usuário que criou a auditoria';
COMMENT ON COLUMN public.auditorias_imca.title IS 'Título da auditoria';
COMMENT ON COLUMN public.auditorias_imca.description IS 'Descrição detalhada da auditoria';
COMMENT ON COLUMN public.auditorias_imca.status IS 'Status da auditoria: draft, in_progress, completed, approved';
COMMENT ON COLUMN public.auditorias_imca.audit_date IS 'Data de realização da auditoria';
COMMENT ON COLUMN public.auditorias_imca.score IS 'Pontuação da auditoria (0-100)';
COMMENT ON COLUMN public.auditorias_imca.findings IS 'Resultados e descobertas da auditoria em formato JSON';
COMMENT ON COLUMN public.auditorias_imca.recommendations IS 'Array de recomendações';
COMMENT ON COLUMN public.auditorias_imca.metadata IS 'Metadados adicionais em formato JSON';
COMMENT ON COLUMN public.auditorias_imca.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.auditorias_imca.updated_at IS 'Data/hora da última atualização';
