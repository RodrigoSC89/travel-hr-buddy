-- ===========================
-- Add SGSO Classification Fields to DP Incidents
-- Adds sgso_category and sgso_root_cause for complete SGSO integration
-- ===========================

-- Add sgso_category column to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT;

-- Add sgso_root_cause column to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_root_cause TEXT;

-- Add comments for new columns
COMMENT ON COLUMN public.dp_incidents.sgso_category IS 'Categoria SGSO do incidente (Falha de sistema, Erro humano, etc)';
COMMENT ON COLUMN public.dp_incidents.sgso_root_cause IS 'Causa raiz identificada dentro do framework SGSO';

-- Create index for performance on sgso_category queries
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_category ON public.dp_incidents(sgso_category);

-- Update existing sample data with SGSO classifications
UPDATE public.dp_incidents SET 
  sgso_category = 'Falha de sistema',
  sgso_root_cause = 'Drift não compensado do sensor giroscópio',
  sgso_risk_level = 'crítico'
WHERE title LIKE '%Loss of Position Due to Gyro Drift%';

UPDATE public.dp_incidents SET 
  sgso_category = 'Falha de sistema',
  sgso_root_cause = 'Reinicialização inesperada de software',
  sgso_risk_level = 'crítico'
WHERE title LIKE '%Thruster Control Software Failure%';

UPDATE public.dp_incidents SET 
  sgso_category = 'Fator externo (clima, mar, etc)',
  sgso_root_cause = 'Perda múltipla de referências DGPS',
  sgso_risk_level = 'alto'
WHERE title LIKE '%Reference System Failure in Heavy Weather%';

UPDATE public.dp_incidents SET 
  sgso_category = 'Erro humano',
  sgso_root_cause = 'Erro de configuração do PMS',
  sgso_risk_level = 'moderado'
WHERE title LIKE '%Power Management System Malfunction%';

UPDATE public.dp_incidents SET 
  sgso_category = 'Ausência de manutenção preventiva',
  sgso_root_cause = 'Desgaste nas pás do propulsor',
  sgso_risk_level = 'baixo'
WHERE title LIKE '%Minor Thruster Performance Degradation%';

UPDATE public.dp_incidents SET 
  sgso_category = 'Ausência de manutenção preventiva',
  sgso_root_cause = 'Deriva de calibração do sensor',
  sgso_risk_level = 'moderado'
WHERE title LIKE '%Wind Sensor Calibration Error%';
