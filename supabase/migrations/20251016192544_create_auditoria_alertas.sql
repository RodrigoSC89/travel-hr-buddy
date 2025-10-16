-- ===========================
-- AUDITORIA ALERTAS - Table Creation
-- Table for storing AI-detected audit alerts
-- ===========================

-- Create auditoria_alertas table
CREATE TABLE IF NOT EXISTS public.auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditoria_alertas ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ver todos os alertas
CREATE POLICY "Admins podem ver todos alertas" 
  ON public.auditoria_alertas
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem inserir alertas
CREATE POLICY "Admins podem inserir alertas" 
  ON public.auditoria_alertas
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem atualizar alertas
CREATE POLICY "Admins podem atualizar alertas" 
  ON public.auditoria_alertas
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem deletar alertas
CREATE POLICY "Admins podem deletar alertas" 
  ON public.auditoria_alertas
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_auditoria_id ON public.auditoria_alertas(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_criado_em ON public.auditoria_alertas(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_comentario_id ON public.auditoria_alertas(comentario_id);

-- Add comment to the table
COMMENT ON TABLE public.auditoria_alertas IS 'Stores AI-detected critical alerts from audit comments';
