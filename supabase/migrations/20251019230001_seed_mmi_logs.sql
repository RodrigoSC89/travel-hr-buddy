-- Seed sample mmi_logs data for testing AI forecasting
-- This provides realistic execution history for the forecast function

-- First, check if we have any mmi_jobs to link to
DO $$
DECLARE
  v_job_id UUID;
  v_job_id_2 UUID;
  v_job_id_3 UUID;
BEGIN
  -- Get the first 3 jobs if they exist
  SELECT id INTO v_job_id FROM public.mmi_jobs ORDER BY created_at LIMIT 1;
  SELECT id INTO v_job_id_2 FROM public.mmi_jobs ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO v_job_id_3 FROM public.mmi_jobs ORDER BY created_at LIMIT 1 OFFSET 2;

  -- Only insert if we have jobs to link to
  IF v_job_id IS NOT NULL THEN
    -- Insert sample logs for first job (regular maintenance pattern)
    INSERT INTO public.mmi_logs (job_id, executado_em, status, observacoes) VALUES
      (v_job_id, NOW() - INTERVAL '3 months', 'executado', 'Manutenção realizada conforme programado'),
      (v_job_id, NOW() - INTERVAL '2 months', 'executado', 'Manutenção realizada conforme programado'),
      (v_job_id, NOW() - INTERVAL '1 month', 'executado', 'Observada pequena variação no sistema');
  END IF;

  IF v_job_id_2 IS NOT NULL THEN
    -- Insert sample logs for second job (irregular pattern with failure)
    INSERT INTO public.mmi_logs (job_id, executado_em, status, observacoes) VALUES
      (v_job_id_2, NOW() - INTERVAL '5 months', 'executado', 'Sistema operando normalmente'),
      (v_job_id_2, NOW() - INTERVAL '3 months', 'falha', 'Falha no sistema durante execução'),
      (v_job_id_2, NOW() - INTERVAL '1 month', 'executado', 'Sistema reparado e funcionando');
  END IF;

  IF v_job_id_3 IS NOT NULL THEN
    -- Insert sample logs for third job (recent pattern)
    INSERT INTO public.mmi_logs (job_id, executado_em, status, observacoes) VALUES
      (v_job_id_3, NOW() - INTERVAL '2 months', 'executado', 'Inspeção rotineira completada'),
      (v_job_id_3, NOW() - INTERVAL '1 month', 'executado', 'Sistema estável, sem anomalias');
  END IF;

END $$;

COMMENT ON TABLE public.mmi_logs IS 'Sample execution history added for AI forecasting testing';
