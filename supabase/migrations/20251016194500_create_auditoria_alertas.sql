-- ===========================
-- AUDITORIA ALERTAS - Table for storing audit alerts and critical failures
-- ===========================

-- Create auditoria_alertas table
CREATE TABLE IF NOT EXISTS public.auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('critica', 'alta', 'media', 'baixa')),
  descricao TEXT NOT NULL,
  severidade TEXT DEFAULT 'media' CHECK (severidade IN ('critica', 'alta', 'media', 'baixa')),
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_analise', 'resolvido', 'fechado')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditoria_alertas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver alertas das suas auditorias
CREATE POLICY "Usuários veem alertas de suas auditorias" 
  ON public.auditoria_alertas
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca a
      WHERE a.id = auditoria_alertas.auditoria_id
      AND a.user_id = auth.uid()
    )
  );

-- Política: Usuários podem inserir alertas nas suas auditorias
CREATE POLICY "Usuários podem inserir alertas em suas auditorias" 
  ON public.auditoria_alertas
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca a
      WHERE a.id = auditoria_alertas.auditoria_id
      AND a.user_id = auth.uid()
    )
  );

-- Política: Usuários podem atualizar alertas de suas auditorias
CREATE POLICY "Usuários podem atualizar alertas de suas auditorias" 
  ON public.auditoria_alertas
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca a
      WHERE a.id = auditoria_alertas.auditoria_id
      AND a.user_id = auth.uid()
    )
  );

-- Política: Usuários podem deletar alertas de suas auditorias
CREATE POLICY "Usuários podem deletar alertas de suas auditorias" 
  ON public.auditoria_alertas
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca a
      WHERE a.id = auditoria_alertas.auditoria_id
      AND a.user_id = auth.uid()
    )
  );

-- Política: Admins podem ver todos alertas
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

-- Política: Admins podem atualizar todos alertas
CREATE POLICY "Admins podem atualizar todos alertas" 
  ON public.auditoria_alertas
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Admins podem deletar todos alertas
CREATE POLICY "Admins podem deletar todos alertas" 
  ON public.auditoria_alertas
  FOR DELETE 
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_auditoria_id 
ON public.auditoria_alertas(auditoria_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_tipo 
ON public.auditoria_alertas(tipo);

CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_status 
ON public.auditoria_alertas(status);

CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_created_at 
ON public.auditoria_alertas(created_at DESC);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_auditoria_alertas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auditoria_alertas_updated_at
  BEFORE UPDATE ON public.auditoria_alertas
  FOR EACH ROW
  EXECUTE FUNCTION update_auditoria_alertas_updated_at();

-- Add table and column comments
COMMENT ON TABLE public.auditoria_alertas IS 'Tabela para armazenamento de alertas e falhas críticas de auditorias';
COMMENT ON COLUMN public.auditoria_alertas.id IS 'Identificador único do alerta';
COMMENT ON COLUMN public.auditoria_alertas.auditoria_id IS 'ID da auditoria associada';
COMMENT ON COLUMN public.auditoria_alertas.tipo IS 'Tipo do alerta: critica, alta, media, baixa';
COMMENT ON COLUMN public.auditoria_alertas.descricao IS 'Descrição detalhada do alerta';
COMMENT ON COLUMN public.auditoria_alertas.severidade IS 'Severidade do alerta';
COMMENT ON COLUMN public.auditoria_alertas.status IS 'Status do alerta: aberto, em_analise, resolvido, fechado';
COMMENT ON COLUMN public.auditoria_alertas.metadata IS 'Metadados adicionais em formato JSON';
COMMENT ON COLUMN public.auditoria_alertas.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.auditoria_alertas.updated_at IS 'Data/hora da última atualização';
