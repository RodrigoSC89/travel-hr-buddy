-- ===========================
-- AUDITORIA ALERTAS - Create Table
-- 🔔 Registro de alertas críticos detectados por IA
-- ===========================

-- Create auditoria_alertas table
CREATE TABLE IF NOT EXISTS public.auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES public.auditoria_comentarios(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'Falha Crítica' CHECK (tipo IN ('Falha Crítica', 'Alerta', 'Aviso', 'Informação')),
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditoria_alertas ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ver todos os alertas
CREATE POLICY "Admins podem ver todos os alertas" 
  ON public.auditoria_alertas
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Sistema pode inserir alertas (função segura ou trigger)
CREATE POLICY "Sistema pode inserir alertas" 
  ON public.auditoria_alertas
  FOR INSERT 
  WITH CHECK (true);

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
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_comentario_id ON public.auditoria_alertas(comentario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_tipo ON public.auditoria_alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_criado_em ON public.auditoria_alertas(criado_em DESC);

-- Add table and column comments
COMMENT ON TABLE public.auditoria_alertas IS '🔔 Registro de alertas críticos detectados por IA';
COMMENT ON COLUMN public.auditoria_alertas.id IS 'Identificador único do alerta';
COMMENT ON COLUMN public.auditoria_alertas.auditoria_id IS 'ID da auditoria referenciada';
COMMENT ON COLUMN public.auditoria_alertas.comentario_id IS 'ID do comentário relacionado (opcional)';
COMMENT ON COLUMN public.auditoria_alertas.tipo IS 'Tipo do alerta: Falha Crítica, Alerta, Aviso, Informação';
COMMENT ON COLUMN public.auditoria_alertas.descricao IS 'Descrição detalhada do alerta';
COMMENT ON COLUMN public.auditoria_alertas.criado_em IS 'Data/hora de criação do alerta';
