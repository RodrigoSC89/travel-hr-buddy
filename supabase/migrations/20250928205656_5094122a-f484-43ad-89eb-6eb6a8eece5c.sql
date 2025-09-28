-- Inserir dados de exemplo para demonstração do Dossiê do Tripulante

-- Primeiro, inserir alguns dados de embarques de exemplo
INSERT INTO public.crew_embarkations (crew_member_id, vessel_name, vessel_type, vessel_class, dp_operation_type, equipment_operated, embark_date, disembark_date, embark_location, disembark_location, hours_worked, function_role, observations)
SELECT 
  cm.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 4 = 0 THEN 'Petrobras XVIII'
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 4 = 1 THEN 'Normand Cutter'
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 4 = 2 THEN 'Olympic Zeus'
    ELSE 'Skandi Neptune'
  END as vessel_name,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 3 = 0 THEN 'PSV'
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 3 = 1 THEN 'AHTS'
    ELSE 'OSRV'
  END as vessel_type,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 3 = 0 THEN 'DP2'
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 3 = 1 THEN 'DP3'
    ELSE 'DP1'
  END as vessel_class,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY cm.id) % 2 = 0 THEN 'Auto DP'
    ELSE 'Manual DP'
  END as dp_operation_type,
  ARRAY['Guindaste Principal', 'ROV', 'Sistema DP', 'Radar'] as equipment_operated,
  CURRENT_DATE - INTERVAL '6 months' as embark_date,
  CURRENT_DATE - INTERVAL '3 months' as disembark_date,
  'Macaé - RJ' as embark_location,
  'Macaé - RJ' as disembark_location,
  2160 as hours_worked, -- 90 dias * 24 horas
  cm.position as function_role,
  'Embarque realizado sem intercorrências. Boa performance operacional.' as observations
FROM public.crew_members cm
WHERE EXISTS (SELECT 1 FROM public.crew_dossier cd WHERE cd.crew_member_id = cm.id)
LIMIT 10;

-- Inserir dados de certificações de exemplo
INSERT INTO public.crew_certifications (crew_member_id, certification_name, certification_type, issue_date, expiry_date, issuing_authority, certificate_number, status, grade, notes)
SELECT 
  cm.id,
  'STCW Basic Safety Training',
  'STCW',
  CURRENT_DATE - INTERVAL '2 years',
  CURRENT_DATE + INTERVAL '3 years',
  'DPC - Diretoria de Portos e Costas',
  CONCAT('STCW-', LPAD(ROW_NUMBER() OVER (ORDER BY cm.id)::TEXT, 8, '0')),
  'valid',
  9.5,
  'Certificação obrigatória para tripulantes'
FROM public.crew_members cm
WHERE EXISTS (SELECT 1 FROM public.crew_dossier cd WHERE cd.crew_member_id = cm.id)
LIMIT 5;

INSERT INTO public.crew_certifications (crew_member_id, certification_name, certification_type, issue_date, expiry_date, issuing_authority, certificate_number, status, grade, notes)
SELECT 
  cm.id,
  'HUET - Helicopter Underwater Escape Training',
  'HUET',
  CURRENT_DATE - INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '2 years',
  'PETROBRAS Training Center',
  CONCAT('HUET-', LPAD(ROW_NUMBER() OVER (ORDER BY cm.id)::TEXT, 8, '0')),
  'valid',
  8.8,
  'Treinamento de escape de helicóptero'
FROM public.crew_members cm
WHERE EXISTS (SELECT 1 FROM public.crew_dossier cd WHERE cd.crew_member_id = cm.id)
LIMIT 3;

-- Inserir algumas certificações vencendo em breve para demonstrar os alertas
INSERT INTO public.crew_certifications (crew_member_id, certification_name, certification_type, issue_date, expiry_date, issuing_authority, certificate_number, status, grade, notes)
SELECT 
  cm.id,
  'TBS - Tripulante de Brigada de Incêndio',
  'TBS',
  CURRENT_DATE - INTERVAL '11 months',
  CURRENT_DATE + INTERVAL '1 month', -- Vence em 1 mês
  'Corpo de Bombeiros',
  CONCAT('TBS-', LPAD(ROW_NUMBER() OVER (ORDER BY cm.id)::TEXT, 8, '0')),
  'valid',
  9.2,
  'Certificação para combate a incêndio - VENCENDO EM BREVE'
FROM public.crew_members cm
WHERE EXISTS (SELECT 1 FROM public.crew_dossier cd WHERE cd.crew_member_id = cm.id)
LIMIT 2;

-- Inserir dados de avaliações de exemplo
INSERT INTO public.crew_evaluations (crew_member_id, evaluation_period, technical_score, behavioral_score, overall_score, positive_feedback, improvement_areas, incidents, evaluator_name, evaluation_date)
SELECT 
  cm.id,
  '2024-Q4',
  8.5,
  9.0,
  8.8,
  'Excelente conhecimento técnico e boa capacidade de trabalho em equipe. Demonstra iniciativa e responsabilidade.',
  'Melhorar comunicação em situações de emergência.',
  NULL,
  'Cap. João Silva',
  CURRENT_DATE - INTERVAL '1 month'
FROM public.crew_members cm
WHERE EXISTS (SELECT 1 FROM public.crew_dossier cd WHERE cd.crew_member_id = cm.id)
LIMIT 5;

INSERT INTO public.crew_evaluations (crew_member_id, evaluation_period, technical_score, behavioral_score, overall_score, positive_feedback, improvement_areas, incidents, evaluator_name, evaluation_date)
SELECT 
  cm.id,
  '2024-Q3',
  7.8,
  8.5,
  8.2,
  'Bom desempenho operacional. Segue procedimentos de segurança adequadamente.',
  'Aperfeiçoar conhecimentos em DP3.',
  NULL,
  'Eng. Maria Santos',
  CURRENT_DATE - INTERVAL '4 months'
FROM public.crew_members cm
WHERE EXISTS (SELECT 1 FROM public.crew_dossier cd WHERE cd.crew_member_id = cm.id)
LIMIT 3;