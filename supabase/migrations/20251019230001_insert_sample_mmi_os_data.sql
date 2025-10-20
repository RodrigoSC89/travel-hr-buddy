-- Insert sample MMI Work Orders (OS) data for Etapa 5 testing
-- Inserts realistic maintenance work orders with different status states

-- Insert sample work orders with the new Etapa 5 status values
INSERT INTO public.mmi_os (
  job_id,
  status,
  descricao,
  notes,
  created_at
) 
SELECT 
  (SELECT id FROM mmi_jobs LIMIT 1),  -- Link to first available job
  status,
  descricao,
  notes,
  created_at
FROM (
  VALUES
    (
      'pendente',
      'Manutenção preventiva do motor principal - Troca de óleo e filtros',
      'OS programada para próxima semana',
      NOW() - INTERVAL '2 days'
    ),
    (
      'executado',
      'Inspeção do sistema hidráulico da grua de bordo',
      'Inspeção concluída sem anomalias',
      NOW() - INTERVAL '5 days'
    ),
    (
      'atrasado',
      'Reparo do sistema de navegação GPS - Falha intermitente',
      'Aguardando peça de reposição há 3 dias',
      NOW() - INTERVAL '7 days'
    ),
    (
      'pendente',
      'Calibração dos sensores de temperatura da sala de máquinas',
      'Calibração semestral obrigatória',
      NOW() - INTERVAL '1 day'
    ),
    (
      'executado',
      'Substituição das bombas de incêndio auxiliares',
      'Substituição completa realizada com sucesso',
      NOW() - INTERVAL '10 days'
    )
) AS sample_data(status, descricao, notes, created_at)
WHERE EXISTS (SELECT 1 FROM mmi_jobs LIMIT 1); -- Only insert if at least one job exists

-- Add comment
COMMENT ON TABLE public.mmi_os IS 'Sample data inserted for Etapa 5 testing with pendente, executado, and atrasado statuses';
