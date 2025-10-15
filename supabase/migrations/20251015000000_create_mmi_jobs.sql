-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create mmi_jobs table for maintenance management with AI support
CREATE TABLE IF NOT EXISTS public.mmi_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  component TEXT,
  asset_name TEXT,
  vessel TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  embedding vector(1536) -- OpenAI ada-002 embedding dimension
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS mmi_jobs_embedding_idx ON public.mmi_jobs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all mmi_jobs" ON public.mmi_jobs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert mmi_jobs" ON public.mmi_jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update mmi_jobs" ON public.mmi_jobs FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to match similar jobs using embeddings
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  component TEXT,
  asset_name TEXT,
  vessel TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_jobs.id,
    mmi_jobs.title,
    mmi_jobs.description,
    mmi_jobs.status,
    mmi_jobs.priority,
    mmi_jobs.component,
    mmi_jobs.asset_name,
    mmi_jobs.vessel,
    1 - (mmi_jobs.embedding <=> query_embedding) as similarity
  FROM public.mmi_jobs
  WHERE 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Insert sample historical jobs for testing
INSERT INTO public.mmi_jobs (title, description, status, priority, component, asset_name, vessel, due_date, embedding)
VALUES 
  (
    'Falha no gerador STBD',
    'Gerador STBD apresentando ruído incomum e aumento de temperatura durante operação. Identificado desgaste no ventilador e necessidade de limpeza de dutos. Resolvido com troca de ventilador e limpeza completa.',
    'completed',
    'high',
    'Gerador Diesel',
    'Gerador STBD #2',
    'Navio Atlantic Star',
    '2024-04-15',
    NULL -- Will be populated via API
  ),
  (
    'Manutenção preventiva bomba hidráulica',
    'Bomba hidráulica principal apresentando vibração excessiva. Histórico indica desgaste acelerado nas últimas 200h de operação. Substituídos rolamentos e vedações.',
    'completed',
    'medium',
    'Sistema Hidráulico',
    'Bomba Hidráulica #3',
    'Navio Oceanic Explorer',
    '2024-03-20',
    NULL
  ),
  (
    'Falha válvula de segurança',
    'Válvula de alívio #2 com leitura fora do padrão. Substituição imediata recomendada. Impacto crítico na segurança operacional.',
    'completed',
    'critical',
    'Sistema de Segurança',
    'Válvulas de Alívio',
    'Navio Pacific Voyager',
    '2024-05-10',
    NULL
  ),
  (
    'Calibração sensores temperatura',
    'Sensor #7 apresentando drift de +3°C. Calibração urgente necessária para manter precisão do sistema de monitoramento.',
    'completed',
    'medium',
    'Sistema de Monitoramento',
    'Sensores Sala de Máquinas',
    'Navio Oceanic Explorer',
    '2024-02-28',
    NULL
  );

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_jobs_updated_at
  BEFORE UPDATE ON public.mmi_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
