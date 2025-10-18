-- Create cron_jobs table for tracking scheduled tasks and automated jobs
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  schedule TEXT NOT NULL, -- Cron expression (e.g., "0 7 * * *")
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('OK', 'FAILED', 'RUNNING', 'PENDING')),
  log_url TEXT,
  execution_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  average_duration_ms INT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cron_job_executions table for tracking individual job runs
CREATE TABLE IF NOT EXISTS cron_job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES cron_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'RUNNING' CHECK (status IN ('OK', 'FAILED', 'RUNNING', 'PENDING')),
  duration_ms INT,
  error_message TEXT,
  log_output TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for cron_jobs
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read cron_jobs"
  ON cron_jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update cron_jobs"
  ON cron_jobs
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add RLS policies for cron_job_executions
ALTER TABLE cron_job_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read cron_job_executions"
  ON cron_job_executions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert cron_job_executions"
  ON cron_job_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cron_jobs_status ON cron_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_enabled ON cron_jobs(enabled);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON cron_jobs(next_run);
CREATE INDEX IF NOT EXISTS idx_cron_job_executions_job_id ON cron_job_executions(job_id);
CREATE INDEX IF NOT EXISTS idx_cron_job_executions_status ON cron_job_executions(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_executions_started_at ON cron_job_executions(started_at DESC);

-- Create updated_at trigger for cron_jobs
CREATE OR REPLACE FUNCTION update_cron_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cron_jobs_updated_at
  BEFORE UPDATE ON cron_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_cron_jobs_updated_at();

-- Function to update job statistics after execution
CREATE OR REPLACE FUNCTION update_cron_job_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'OK' OR NEW.status = 'FAILED' THEN
    UPDATE cron_jobs
    SET 
      execution_count = execution_count + 1,
      success_count = CASE WHEN NEW.status = 'OK' THEN success_count + 1 ELSE success_count END,
      failure_count = CASE WHEN NEW.status = 'FAILED' THEN failure_count + 1 ELSE failure_count END,
      last_run = NEW.completed_at,
      status = NEW.status,
      average_duration_ms = (
        SELECT AVG(duration_ms)::INT
        FROM cron_job_executions
        WHERE job_id = NEW.job_id
          AND status = 'OK'
          AND duration_ms IS NOT NULL
      )
    WHERE id = NEW.job_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cron_job_executions_update_stats
  AFTER INSERT OR UPDATE ON cron_job_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_cron_job_stats();

-- Function to get cron job statistics
CREATE OR REPLACE FUNCTION get_cron_job_stats()
RETURNS TABLE (
  total_jobs BIGINT,
  running_jobs BIGINT,
  failed_jobs BIGINT,
  success_rate NUMERIC,
  avg_execution_time_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_jobs,
    COUNT(*) FILTER (WHERE status = 'RUNNING')::BIGINT as running_jobs,
    COUNT(*) FILTER (WHERE status = 'FAILED')::BIGINT as failed_jobs,
    CASE 
      WHEN SUM(execution_count) > 0 
      THEN ROUND((SUM(success_count)::NUMERIC / SUM(execution_count)::NUMERIC) * 100, 2)
      ELSE 0
    END as success_rate,
    ROUND(AVG(average_duration_ms)::NUMERIC, 2) as avg_execution_time_ms
  FROM cron_jobs
  WHERE enabled = true;
END;
$$ LANGUAGE plpgsql;

-- Insert sample cron jobs
INSERT INTO cron_jobs (name, description, schedule) VALUES
  ('forecast-job', 'Daily forecast generation for predictive maintenance', '0 7 * * *'),
  ('validate-sgso', 'Weekly SGSO compliance validation', '0 6 * * 1'),
  ('email-dp-alerts', 'Daily DP alerts email notification', '0 12 * * *'),
  ('daily-restore-report', 'Daily restore operations report generation', '0 8 * * *'),
  ('backup-database', 'Daily database backup', '0 2 * * *')
ON CONFLICT (name) DO NOTHING;
