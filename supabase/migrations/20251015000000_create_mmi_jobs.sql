-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create MMI Jobs table
CREATE TABLE IF NOT EXISTS mmi_jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Em andamento', 'Aguardando peças', 'Concluído', 'Cancelado')),
  priority TEXT NOT NULL CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Crítica')),
  due_date DATE NOT NULL,
  component_name TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  vessel TEXT NOT NULL,
  suggestion_ia TEXT,
  can_postpone BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  embedding vector(1536) -- OpenAI embeddings dimension
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS mmi_jobs_embedding_idx ON mmi_jobs USING ivfflat (embedding vector_cosine_ops);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS mmi_jobs_status_idx ON mmi_jobs(status);
CREATE INDEX IF NOT EXISTS mmi_jobs_priority_idx ON mmi_jobs(priority);
CREATE INDEX IF NOT EXISTS mmi_jobs_due_date_idx ON mmi_jobs(due_date);

-- Insert sample data
INSERT INTO mmi_jobs (id, title, description, status, priority, due_date, component_name, asset_name, vessel, suggestion_ia, can_postpone) VALUES
  ('JOB-001', 'Manutenção preventiva do sistema hidráulico', 'Inspeção e manutenção completa do sistema hidráulico principal', 'Pendente', 'Alta', '2025-10-20', 'Sistema Hidráulico Principal', 'Bomba Hidráulica #3', 'Navio Oceanic Explorer', 'Recomenda-se realizar a manutenção durante a próxima parada programada. Histórico indica desgaste acelerado nas últimas 200h de operação.', true),
  ('JOB-002', 'Inspeção de válvulas de segurança', 'Verificação e teste de todas as válvulas de segurança do deck principal', 'Em andamento', 'Crítica', '2025-10-16', 'Sistema de Segurança', 'Válvulas de Alívio - Deck Principal', 'Navio Atlantic Star', 'Atenção: Válvula #2 apresenta leitura fora do padrão. Substituição recomendada antes da próxima operação.', false),
  ('JOB-003', 'Troca de filtros do motor principal', 'Substituição dos filtros de óleo do motor principal', 'Pendente', 'Média', '2025-10-25', 'Motor Principal', 'Filtros de Óleo ME-4500', 'Navio Pacific Voyager', NULL, true),
  ('JOB-004', 'Calibração de sensores de temperatura', 'Calibração completa dos sensores de temperatura da sala de máquinas', 'Aguardando peças', 'Média', '2025-10-22', 'Sistema de Monitoramento', 'Sensores Sala de Máquinas', 'Navio Oceanic Explorer', 'Sensor #7 com drift de +3°C. Calibração urgente recomendada para manter precisão do sistema.', true)
ON CONFLICT (id) DO NOTHING;

-- Create MMI Job History table for learning
CREATE TABLE IF NOT EXISTS mmi_job_history (
  id SERIAL PRIMARY KEY,
  job_id TEXT REFERENCES mmi_jobs(id),
  action TEXT NOT NULL,
  action_details JSONB,
  ai_recommendation TEXT,
  outcome TEXT,
  outcome_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  embedding vector(1536)
);

-- Create index for vector similarity search on history
CREATE INDEX IF NOT EXISTS mmi_job_history_embedding_idx ON mmi_job_history USING ivfflat (embedding vector_cosine_ops);

-- Create function to match similar jobs based on embeddings
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  due_date DATE,
  component_name TEXT,
  asset_name TEXT,
  vessel TEXT,
  suggestion_ia TEXT,
  can_postpone BOOLEAN,
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
    mmi_jobs.due_date,
    mmi_jobs.component_name,
    mmi_jobs.asset_name,
    mmi_jobs.vessel,
    mmi_jobs.suggestion_ia,
    mmi_jobs.can_postpone,
    1 - (mmi_jobs.embedding <=> query_embedding) as similarity
  FROM mmi_jobs
  WHERE mmi_jobs.embedding IS NOT NULL
    AND 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to match similar job history
CREATE OR REPLACE FUNCTION match_mmi_job_history(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id INT,
  job_id TEXT,
  action TEXT,
  action_details JSONB,
  ai_recommendation TEXT,
  outcome TEXT,
  outcome_details JSONB,
  created_at TIMESTAMPTZ,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_job_history.id,
    mmi_job_history.job_id,
    mmi_job_history.action,
    mmi_job_history.action_details,
    mmi_job_history.ai_recommendation,
    mmi_job_history.outcome,
    mmi_job_history.outcome_details,
    mmi_job_history.created_at,
    1 - (mmi_job_history.embedding <=> query_embedding) as similarity
  FROM mmi_job_history
  WHERE mmi_job_history.embedding IS NOT NULL
    AND 1 - (mmi_job_history.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_job_history.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mmi_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mmi_jobs_updated_at_trigger
BEFORE UPDATE ON mmi_jobs
FOR EACH ROW
EXECUTE FUNCTION update_mmi_jobs_updated_at();

-- Add RLS policies for mmi_jobs
ALTER TABLE mmi_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON mmi_jobs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mmi_jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON mmi_jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add RLS policies for mmi_job_history
ALTER TABLE mmi_job_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON mmi_job_history
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mmi_job_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
