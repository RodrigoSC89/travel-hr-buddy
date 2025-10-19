-- Insert sample data for mmi_os table to test Etapa 5 functionality
-- This provides test data for the OS management interface

-- Insert sample work orders with different statuses
INSERT INTO public.mmi_os (id, job_id, forecast_id, descricao, status, created_at)
VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM public.mmi_jobs LIMIT 1), -- Get first job_id if exists
    NULL, -- No forecast_id for first sample
    'Manutenção preventiva do motor principal - verificação de óleo e filtros',
    'pendente',
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.mmi_jobs LIMIT 1 OFFSET 1), -- Get second job_id if exists
    NULL,
    'Substituição de rolamentos do gerador auxiliar',
    'executado',
    NOW() - INTERVAL '5 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.mmi_jobs LIMIT 1 OFFSET 2), -- Get third job_id if exists
    NULL,
    'Inspeção do sistema de refrigeração - bomba d''água marinha',
    'atrasado',
    NOW() - INTERVAL '10 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.mmi_jobs LIMIT 1), 
    NULL,
    'Calibração de sensores de temperatura no sistema de exaustão',
    'pendente',
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.mmi_jobs LIMIT 1), 
    NULL,
    'Limpeza e teste do sistema de combate a incêndio',
    'executado',
    NOW() - INTERVAL '7 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.mmi_os IS 'Work Orders (Ordens de Serviço) for MMI maintenance management';
