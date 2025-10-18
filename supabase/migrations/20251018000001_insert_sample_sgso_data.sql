-- ===========================
-- Sample SGSO Action Plans Data
-- Demonstrates different status states, risk levels, and incident categories
-- ===========================

-- First, add sample sgso_category and sgso_risk_level to existing incidents
UPDATE public.dp_incidents 
SET 
  sgso_category = 'Equipamento',
  sgso_risk_level = 'Crítico'
WHERE title = 'Loss of Position Due to Gyro Drift';

UPDATE public.dp_incidents 
SET 
  sgso_category = 'Sistema',
  sgso_risk_level = 'Alto'
WHERE title = 'Thruster Control Software Failure During ROV Ops';

UPDATE public.dp_incidents 
SET 
  sgso_category = 'Energia',
  sgso_risk_level = 'Médio'
WHERE title = 'Power Management System Malfunction';

-- Insert sample action plans
-- Sample 1: Open action plan for critical incident
INSERT INTO public.sgso_action_plans (
  incident_id,
  vessel_id,
  correction_action,
  prevention_action,
  recommendation_action,
  status,
  approved_by,
  approved_at
)
SELECT 
  id,
  vessel,
  'Immediate gyro recalibration and replacement of faulty sensor. Emergency position recovery protocols activated.',
  'Implement automated gyro drift detection system with real-time alerts. Establish daily sensor verification checklist.',
  'Upgrade to redundant gyro system with automatic failover. Conduct quarterly calibration audits.',
  'aberto',
  NULL,
  NULL
FROM public.dp_incidents
WHERE title = 'Loss of Position Due to Gyro Drift'
LIMIT 1;

-- Sample 2: In progress action plan with approval
INSERT INTO public.sgso_action_plans (
  incident_id,
  vessel_id,
  correction_action,
  prevention_action,
  recommendation_action,
  status,
  approved_by,
  approved_at
)
SELECT 
  id,
  vessel,
  'Software patch applied to thruster control system. System rebooted and tested under operational conditions.',
  'Implement software version control and testing protocol before deployment. Add redundancy check during critical operations.',
  'Establish pre-ROV deployment checklist including thruster system verification. Schedule preventive maintenance.',
  'em_andamento',
  'João Silva - Safety Manager',
  NOW() - INTERVAL '3 days'
FROM public.dp_incidents
WHERE title = 'Thruster Control Software Failure During ROV Ops'
LIMIT 1;

-- Sample 3: Resolved action plan with approval
INSERT INTO public.sgso_action_plans (
  incident_id,
  vessel_id,
  correction_action,
  prevention_action,
  recommendation_action,
  status,
  approved_by,
  approved_at
)
SELECT 
  id,
  vessel,
  'PMS configuration corrected and load shedding parameters recalibrated. System tested under various load conditions.',
  'Establish monthly PMS configuration review. Create backup configuration with automatic validation.',
  'Train all engineers on PMS configuration and emergency procedures. Document configuration standards.',
  'resolvido',
  'Maria Santos - Technical Director',
  NOW() - INTERVAL '10 days'
FROM public.dp_incidents
WHERE title = 'Power Management System Malfunction'
LIMIT 1;
