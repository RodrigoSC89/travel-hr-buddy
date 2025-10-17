-- ===========================
-- AUDITORIAS IMCA - Add fields for ListaAuditoriasIMCA component
-- ===========================

-- Add new fields to auditorias_imca table
ALTER TABLE public.auditorias_imca 
  ADD COLUMN IF NOT EXISTS navio TEXT,
  ADD COLUMN IF NOT EXISTS norma TEXT,
  ADD COLUMN IF NOT EXISTS item_auditado TEXT,
  ADD COLUMN IF NOT EXISTS resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação', 'N/A')),
  ADD COLUMN IF NOT EXISTS comentarios TEXT,
  ADD COLUMN IF NOT EXISTS data DATE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_norma ON public.auditorias_imca(norma);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_data ON public.auditorias_imca(data DESC);

-- Add column comments
COMMENT ON COLUMN public.auditorias_imca.navio IS 'Nome da embarcação auditada';
COMMENT ON COLUMN public.auditorias_imca.norma IS 'Norma IMCA aplicada (ex: IMCA M 182)';
COMMENT ON COLUMN public.auditorias_imca.item_auditado IS 'Item ou procedimento auditado';
COMMENT ON COLUMN public.auditorias_imca.resultado IS 'Resultado da auditoria: Conforme, Não Conforme, Observação, N/A';
COMMENT ON COLUMN public.auditorias_imca.comentarios IS 'Comentários e observações adicionais';
COMMENT ON COLUMN public.auditorias_imca.data IS 'Data de realização da auditoria';

-- Insert sample data for testing
INSERT INTO public.auditorias_imca (
  user_id,
  title,
  navio,
  data,
  norma,
  item_auditado,
  resultado,
  comentarios,
  status
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria IMCA - MV Atlantic Star',
    'MV Atlantic Star',
    '2024-01-15',
    'IMCA M 103',
    'Safety Procedures',
    'Não Conforme',
    'Procedimentos de segurança não estão atualizados conforme última revisão da norma',
    'completed'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria IMCA - MV Pacific Dream',
    'MV Pacific Dream',
    '2024-01-20',
    'IMCA M 182',
    'Equipment Maintenance',
    'Conforme',
    'Todos os equipamentos em conformidade com os requisitos da norma',
    'completed'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria IMCA - MV Atlantic Star',
    'MV Atlantic Star',
    '2024-02-10',
    'IMCA M 202',
    'Personnel Training',
    'Observação',
    'Equipe adequadamente treinada, mas falta registro formal de alguns treinamentos',
    'completed'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria IMCA - SS Indian Ocean',
    'SS Indian Ocean',
    '2024-02-15',
    'IMCA M 220',
    'Emergency Response',
    'Conforme',
    'Procedimentos de emergência bem estabelecidos e testados',
    'completed'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria IMCA - MV Pacific Dream',
    'MV Pacific Dream',
    '2024-03-01',
    'IMCA D 016',
    'Diving Operations',
    'Não Conforme',
    'Equipamentos de mergulho sem manutenção adequada documentada',
    'completed'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria IMCA - SS Indian Ocean',
    'SS Indian Ocean',
    '2024-03-10',
    'IMCA R 008',
    'ROV Operations',
    'Conforme',
    'Operações de ROV seguindo todos os protocolos estabelecidos',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;
