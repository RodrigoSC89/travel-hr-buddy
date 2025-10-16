-- ===========================
-- AUDITORIA COMENTARIOS - Create Table
-- Table for storing comments on IMCA audits
-- ===========================

-- Create auditoria_comentarios table
CREATE TABLE IF NOT EXISTS public.auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditoria_comentarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver comentários de auditorias que criaram ou que podem ver
CREATE POLICY "Usuários veem comentários de suas auditorias" 
  ON public.auditoria_comentarios
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_comentarios.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- Política: Usuários podem inserir comentários em suas auditorias
CREATE POLICY "Usuários podem comentar em suas auditorias" 
  ON public.auditoria_comentarios
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_comentarios.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- Política: Usuários podem atualizar seus próprios comentários
CREATE POLICY "Usuários podem atualizar seus comentários" 
  ON public.auditoria_comentarios
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios comentários
CREATE POLICY "Usuários podem deletar seus comentários" 
  ON public.auditoria_comentarios
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Política: Admins podem ver todos os comentários
CREATE POLICY "Admins podem ver todos comentários" 
  ON public.auditoria_comentarios
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem inserir comentários em qualquer auditoria
CREATE POLICY "Admins podem inserir comentários" 
  ON public.auditoria_comentarios
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem atualizar todos os comentários
CREATE POLICY "Admins podem atualizar todos comentários" 
  ON public.auditoria_comentarios
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem deletar todos os comentários
CREATE POLICY "Admins podem deletar todos comentários" 
  ON public.auditoria_comentarios
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_auditoria_id ON public.auditoria_comentarios(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_user_id ON public.auditoria_comentarios(user_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_created_at ON public.auditoria_comentarios(created_at DESC);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_auditoria_comentarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auditoria_comentarios_updated_at
  BEFORE UPDATE ON public.auditoria_comentarios
  FOR EACH ROW
  EXECUTE FUNCTION update_auditoria_comentarios_updated_at();

-- Add table and column comments
COMMENT ON TABLE public.auditoria_comentarios IS 'Tabela para armazenamento de comentários em auditorias IMCA';
COMMENT ON COLUMN public.auditoria_comentarios.id IS 'Identificador único do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.auditoria_id IS 'ID da auditoria referenciada';
COMMENT ON COLUMN public.auditoria_comentarios.user_id IS 'ID do usuário que criou o comentário';
COMMENT ON COLUMN public.auditoria_comentarios.comentario IS 'Texto do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.created_at IS 'Data/hora de criação do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.updated_at IS 'Data/hora da última atualização';
