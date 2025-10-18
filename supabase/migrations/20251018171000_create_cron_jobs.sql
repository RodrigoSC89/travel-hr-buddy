-- ===========================
-- CRON JOBS MONITORING (Stage 30)
-- Sistema de monitoramento de tarefas automáticas
-- ===========================

-- Create cron_jobs table
CREATE TABLE IF NOT EXISTS public.cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  schedule TEXT NOT NULL, -- Cron expression (e.g., "0 7 * * *")
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  average_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cron_job_executions table
CREATE TABLE IF NOT EXISTS public.cron_job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.cron_jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  error_message TEXT,
  logs TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_executions ENABLE ROW LEVEL SECURITY;

-- Policies for cron_jobs
CREATE POLICY "Admins e hr_managers podem gerenciar cron jobs" 
  ON public.cron_jobs
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Usuários autenticados podem ver cron jobs" 
  ON public.cron_jobs
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Policies for cron_job_executions
CREATE POLICY "Admins podem ver execuções" 
  ON public.cron_job_executions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Sistema pode criar execuções" 
  ON public.cron_job_executions
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cron_jobs_name ON public.cron_jobs(name);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_status ON public.cron_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON public.cron_jobs(next_run);

CREATE INDEX IF NOT EXISTS idx_cron_job_executions_job_id ON public.cron_job_executions(job_id);
CREATE INDEX IF NOT EXISTS idx_cron_job_executions_status ON public.cron_job_executions(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_executions_started_at ON public.cron_job_executions(started_at DESC);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_cron_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cron_jobs_updated_at
  BEFORE UPDATE ON public.cron_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_cron_jobs_updated_at();

-- Function to update job statistics after execution
CREATE OR REPLACE FUNCTION update_job_stats_after_execution()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stats when execution is completed or failed
  IF NEW.status IN ('success', 'failed') AND OLD.status = 'running' THEN
    UPDATE public.cron_jobs
    SET 
      execution_count = execution_count + 1,
      success_count = CASE WHEN NEW.status = 'success' THEN success_count + 1 ELSE success_count END,
      error_count = CASE WHEN NEW.status = 'failed' THEN error_count + 1 ELSE error_count END,
      last_run = NEW.completed_at,
      status = CASE WHEN NEW.status = 'failed' THEN 'error' ELSE status END,
      average_duration_ms = (
        SELECT AVG(duration_ms)::INTEGER
        FROM public.cron_job_executions
        WHERE job_id = NEW.job_id 
          AND status = 'success'
          AND duration_ms IS NOT NULL
      )
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_stats_trigger
  AFTER UPDATE ON public.cron_job_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_job_stats_after_execution();

-- Function to get cron job statistics
CREATE OR REPLACE FUNCTION get_cron_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  today_executions INTEGER;
  total_success INTEGER;
  total_executions INTEGER;
BEGIN
  -- Get today's executions
  SELECT COUNT(*) INTO today_executions
  FROM public.cron_job_executions
  WHERE DATE(started_at) = CURRENT_DATE;
  
  -- Get success/total counts
  SELECT 
    COUNT(*) FILTER (WHERE status = 'success'),
    COUNT(*)
  INTO total_success, total_executions
  FROM public.cron_job_executions;
  
  SELECT json_build_object(
    'total_jobs', (SELECT COUNT(*) FROM public.cron_jobs),
    'active_jobs', (SELECT COUNT(*) FROM public.cron_jobs WHERE status = 'active'),
    'inactive_jobs', (SELECT COUNT(*) FROM public.cron_jobs WHERE status = 'inactive'),
    'error_jobs', (SELECT COUNT(*) FROM public.cron_jobs WHERE status = 'error'),
    'total_executions_today', today_executions,
    'success_rate', CASE 
      WHEN total_executions > 0 THEN ROUND((total_success::NUMERIC / total_executions) * 100, 2)
      ELSE 0
    END
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert pre-configured cron jobs
INSERT INTO public.cron_jobs (name, description, schedule, status) VALUES
  ('forecast-job', 'Geração automática de previsões de falha', '0 7 * * *', 'active'),
  ('validate-sgso', 'Validação periódica de conformidade SGSO', '0 6 * * 1', 'active'),
  ('email-dp-alerts', 'Envio de alertas DP por e-mail', '0 12 * * *', 'active'),
  ('restore-reports', 'Geração de relatórios de restauração', '0 2 * * *', 'active'),
  ('database-backup', 'Backup automático do banco de dados', '0 3 * * *', 'active')
ON CONFLICT (name) DO NOTHING;

-- Add table comments
COMMENT ON TABLE public.cron_jobs IS 'Registro de tarefas agendadas (cron jobs) do sistema';
COMMENT ON TABLE public.cron_job_executions IS 'Histórico de execuções de cron jobs';
COMMENT ON COLUMN public.cron_jobs.schedule IS 'Expressão cron para agendamento (ex: "0 7 * * *")';
COMMENT ON COLUMN public.cron_job_executions.metadata IS 'Metadados adicionais da execução em formato JSON';
