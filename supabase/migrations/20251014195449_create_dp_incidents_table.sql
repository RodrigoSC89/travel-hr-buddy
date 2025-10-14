-- ===========================
-- DP INCIDENTS - Dynamic Positioning Incidents Database
-- Table for storing DP incidents from IMCA and other sources
-- ===========================

-- Create dp_incidents table
CREATE TABLE IF NOT EXISTS public.dp_incidents (
  id TEXT PRIMARY KEY, -- Ex: 'imca-2025-014'
  title TEXT NOT NULL,
  date DATE NOT NULL,
  vessel TEXT,
  location TEXT,
  root_cause TEXT,
  class_dp TEXT,
  source TEXT,
  link TEXT,
  summary TEXT,
  tags TEXT[], -- Array de palavras-chave para filtro rápido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dp_incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
-- Somente usuários autenticados podem ler
CREATE POLICY "Allow read access to authenticated users"
  ON public.dp_incidents 
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_date ON public.dp_incidents(date DESC);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_vessel ON public.dp_incidents(vessel);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_tags ON public.dp_incidents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_created_at ON public.dp_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_class_dp ON public.dp_incidents(class_dp);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_source ON public.dp_incidents(source);

-- Add table comment
COMMENT ON TABLE public.dp_incidents IS 'Tabela para armazenamento de incidentes de Dynamic Positioning (DP) obtidos via API/crawler de fontes como IMCA';

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.id IS 'Identificador único do incidente, ex: imca-2025-014';
COMMENT ON COLUMN public.dp_incidents.title IS 'Título/descrição breve do incidente';
COMMENT ON COLUMN public.dp_incidents.date IS 'Data de ocorrência do incidente';
COMMENT ON COLUMN public.dp_incidents.vessel IS 'Nome ou identificação da embarcação envolvida';
COMMENT ON COLUMN public.dp_incidents.location IS 'Localização geográfica do incidente';
COMMENT ON COLUMN public.dp_incidents.root_cause IS 'Causa raiz identificada do incidente';
COMMENT ON COLUMN public.dp_incidents.class_dp IS 'Classificação DP da embarcação (DP1, DP2, DP3)';
COMMENT ON COLUMN public.dp_incidents.source IS 'Fonte da informação (IMCA, etc)';
COMMENT ON COLUMN public.dp_incidents.link IS 'Link para documento/relatório original';
COMMENT ON COLUMN public.dp_incidents.summary IS 'Resumo detalhado do incidente';
COMMENT ON COLUMN public.dp_incidents.tags IS 'Array de palavras-chave para filtro e busca rápida';
COMMENT ON COLUMN public.dp_incidents.created_at IS 'Data/hora de criação do registro no sistema';
