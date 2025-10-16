-- ===========================
-- AUDITORIA COMENTARIOS - Comments system for audits with AI integration
-- Table for storing audit comments with AI-powered responses
-- ===========================

-- Create auditoria_comentarios table
CREATE TABLE IF NOT EXISTS public.auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditoria_comentarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver comentários das auditorias que têm acesso
CREATE POLICY "Usuários veem comentários de suas auditorias" 
  ON public.auditoria_comentarios
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_comentarios.auditoria_id
      AND (auditorias_imca.user_id = auth.uid() OR user_id = 'ia-auto-responder')
    )
  );

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

-- Política: Usuários podem inserir comentários em suas auditorias
CREATE POLICY "Usuários podem inserir comentários" 
  ON public.auditoria_comentarios
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_comentarios.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- Política: Sistema pode inserir comentários de IA
CREATE POLICY "Sistema pode inserir comentários IA" 
  ON public.auditoria_comentarios
  FOR INSERT 
  WITH CHECK (user_id = 'ia-auto-responder');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_auditoria_id ON public.auditoria_comentarios(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_created_at ON public.auditoria_comentarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_user_id ON public.auditoria_comentarios(user_id);

-- Add table and column comments
COMMENT ON TABLE public.auditoria_comentarios IS 'Tabela para armazenamento de comentários de auditorias com respostas IA';
COMMENT ON COLUMN public.auditoria_comentarios.id IS 'Identificador único do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.auditoria_id IS 'ID da auditoria relacionada';
COMMENT ON COLUMN public.auditoria_comentarios.comentario IS 'Texto do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.user_id IS 'ID do usuário que criou o comentário ou "ia-auto-responder"';
COMMENT ON COLUMN public.auditoria_comentarios.created_at IS 'Data/hora de criação do comentário';
