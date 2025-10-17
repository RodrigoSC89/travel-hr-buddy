-- ===========================
-- AUDITORIAS TABLE
-- Table for storing audit records with compliance results
-- ===========================

-- Create auditorias table
CREATE TABLE IF NOT EXISTS public.auditorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  navio TEXT NOT NULL,
  norma TEXT,
  resultado TEXT NOT NULL CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação')),
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Authenticated users can view all auditorias
CREATE POLICY "Authenticated users can view auditorias"
  ON public.auditorias
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can do anything
CREATE POLICY "Service role full access"
  ON public.auditorias
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auditorias_navio ON public.auditorias(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_data ON public.auditorias(data DESC);
CREATE INDEX IF NOT EXISTS idx_auditorias_resultado ON public.auditorias(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_created_at ON public.auditorias(created_at DESC);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_auditorias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auditorias_updated_at
  BEFORE UPDATE ON public.auditorias
  FOR EACH ROW
  EXECUTE FUNCTION update_auditorias_updated_at();

-- Add table and column comments
COMMENT ON TABLE public.auditorias IS 'Tabela para armazenamento de registros de auditoria com resultados de conformidade';
COMMENT ON COLUMN public.auditorias.id IS 'Identificador único da auditoria';
COMMENT ON COLUMN public.auditorias.navio IS 'Nome da embarcação auditada';
COMMENT ON COLUMN public.auditorias.norma IS 'Norma ou padrão aplicado na auditoria';
COMMENT ON COLUMN public.auditorias.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, ou Observação';
COMMENT ON COLUMN public.auditorias.data IS 'Data de realização da auditoria';
COMMENT ON COLUMN public.auditorias.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.auditorias.updated_at IS 'Data/hora da última atualização';

-- Insert some sample data for testing
INSERT INTO public.auditorias (navio, norma, resultado, data)
VALUES
  ('MV Atlantic', 'IMCA', 'Conforme', '2025-10-01 10:00:00+00'),
  ('MV Atlantic', 'IMCA', 'Não Conforme', '2025-10-05 14:00:00+00'),
  ('MV Atlantic', 'ISO 9001', 'Observação', '2025-10-10 09:00:00+00'),
  ('MV Pacific', 'IMCA', 'Conforme', '2025-10-02 11:00:00+00'),
  ('MV Pacific', 'IMCA', 'Conforme', '2025-10-08 15:00:00+00'),
  ('MV Pacific', 'ISO 9001', 'Não Conforme', '2025-10-12 10:00:00+00'),
  ('MV Indian', 'IMCA', 'Observação', '2025-09-15 13:00:00+00'),
  ('MV Indian', 'IMCA', 'Conforme', '2025-09-20 16:00:00+00')
ON CONFLICT DO NOTHING;
