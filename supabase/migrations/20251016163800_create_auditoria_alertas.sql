-- Create auditoria_alertas table
-- This table stores audit alerts detected by the AI system
-- Used by the admin panel to display critical failures

CREATE TABLE IF NOT EXISTS public.auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_criado_em ON public.auditoria_alertas(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_auditoria_id ON public.auditoria_alertas(auditoria_id);

-- Enable Row Level Security
ALTER TABLE public.auditoria_alertas ENABLE ROW LEVEL SECURITY;

-- Create policy: Only admins can read alerts
CREATE POLICY "Allow admin users to read auditoria_alertas"
  ON public.auditoria_alertas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy: Allow system (service role) to insert alerts
CREATE POLICY "Allow service role to insert auditoria_alertas"
  ON public.auditoria_alertas
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE public.auditoria_alertas IS 'Stores audit alerts detected by the AI system for admin monitoring';
