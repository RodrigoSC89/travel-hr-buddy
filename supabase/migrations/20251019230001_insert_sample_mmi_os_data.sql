-- Insert sample work orders for Etapa 5 testing
-- These work orders demonstrate the three status states: pendente, executado, atrasado

-- Insert sample data (only if mmi_os table is empty or for testing)
INSERT INTO public.mmi_os (id, descricao, status, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'Manutenção preventiva do gerador principal - verificação de filtros e óleo',
    'pendente',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    gen_random_uuid(),
    'Inspeção do sistema hidráulico - verificar vazamentos e pressão',
    'executado',
    now() - interval '5 days',
    now() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    'Troca de rolamentos da bomba de água - urgente',
    'atrasado',
    now() - interval '10 days',
    now() - interval '10 days'
  ),
  (
    gen_random_uuid(),
    'Calibração dos sensores de temperatura do motor',
    'pendente',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    'Reparo do sistema de ar condicionado da praça de máquinas',
    'executado',
    now() - interval '7 days',
    now() - interval '3 days'
  )
ON CONFLICT (id) DO NOTHING;
