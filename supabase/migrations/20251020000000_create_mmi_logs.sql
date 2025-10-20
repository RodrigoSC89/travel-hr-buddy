-- ============================================================================
-- MMI Logs Table Migration
-- Version: 1.0.0
-- Description: Create mmi_logs table for tracking job execution history
-- Created: 2025-10-20
-- Purpose: Store execution history for AI-powered maintenance forecasting
-- ============================================================================

-- Create mmi_logs table
CREATE TABLE IF NOT EXISTS public.mmi_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE CASCADE,
  executado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('executado', 'falha', 'adiado', 'cancelado')),
  observacoes TEXT,
  tecnico_responsavel TEXT,
  duracao_minutos INTEGER,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mmi_logs_job_id ON public.mmi_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_logs_executado_em ON public.mmi_logs(executado_em DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_logs_status ON public.mmi_logs(status);

-- Enable RLS
ALTER TABLE public.mmi_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access for forecasting
CREATE POLICY "Allow public read access to mmi_logs"
  ON public.mmi_logs FOR SELECT 
  USING (true);

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert mmi_logs"
  ON public.mmi_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update logs
CREATE POLICY "Allow authenticated users to update mmi_logs"
  ON public.mmi_logs FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.mmi_logs IS 'Execution history logs for maintenance jobs used in AI forecasting';
COMMENT ON COLUMN public.mmi_logs.executado_em IS 'Timestamp when the maintenance job was executed';
COMMENT ON COLUMN public.mmi_logs.status IS 'Execution status: executado, falha, adiado, cancelado';
COMMENT ON COLUMN public.mmi_logs.observacoes IS 'Technical observations and notes from execution';
COMMENT ON COLUMN public.mmi_logs.duracao_minutos IS 'Duration of maintenance execution in minutes';

-- ============================================================================
-- Sample Data for Testing (Optional)
-- ============================================================================

-- Insert sample logs for testing forecast functionality
DO $$
DECLARE
  sample_job_id UUID;
BEGIN
  -- Get a sample job ID if one exists
  SELECT id INTO sample_job_id FROM public.mmi_jobs LIMIT 1;
  
  -- Only insert if we have a job to reference
  IF sample_job_id IS NOT NULL THEN
    INSERT INTO public.mmi_logs (job_id, executado_em, status, observacoes, duracao_minutos)
    VALUES 
      (sample_job_id, NOW() - INTERVAL '90 days', 'executado', 'Manutenção preventiva realizada conforme programado', 120),
      (sample_job_id, NOW() - INTERVAL '60 days', 'executado', 'Substituição de componentes desgastados', 180),
      (sample_job_id, NOW() - INTERVAL '30 days', 'executado', 'Inspeção de rotina sem anomalias detectadas', 90)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample mmi_logs data inserted for testing';
  END IF;
END $$;

-- Grant permissions
GRANT SELECT ON public.mmi_logs TO anon, authenticated;
GRANT INSERT, UPDATE ON public.mmi_logs TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

RAISE NOTICE 'MMI Logs table created successfully for AI forecasting';
