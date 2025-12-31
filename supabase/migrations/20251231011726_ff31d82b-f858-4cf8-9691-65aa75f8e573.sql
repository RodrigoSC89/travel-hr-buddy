-- Elemento 4 - Operação (OP) - 15 itens críticos
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Procedimentos Operacionais', 'Procedimentos operacionais críticos documentados', 'Procedimentos atualizados', 'Todos procedimentos revisados', 'Procedimentos desatualizados', ARRAY['Manual operações'], 'ISM Code 7', 'critical'),
  (2, 'Briefings Operacionais', 'Briefings pré-operação realizados', 'Briefing documentado', 'Registros de briefing', 'Sem briefings', ARRAY['Formulário briefing'], 'IMCA', 'major'),
  (3, 'Operações DP', 'Operações em DP conforme ASOG/CAM', 'ASOG implementado', 'Limites operacionais definidos', 'ASOG não seguido', ARRAY['ASOG/CAM'], 'IMCA 103', 'critical'),
  (4, 'Operações Guindastes', 'Operações de içamento seguras', 'Plano de rigging', 'Certificados guindastes válidos', 'Operações inseguras', ARRAY['Plano içamento'], 'IMCA 181', 'critical'),
  (5, 'Operações Mergulho', 'Operações de mergulho conforme IMCA', 'Dive plan aprovado', 'Dive briefing realizado', 'Não conformidades mergulho', ARRAY['Dive plan'], 'IMCA D 014', 'critical'),
  (6, 'Operações ROV', 'Operações ROV conforme procedimentos', 'Checklist ROV', 'Piloto qualificado', 'ROV sem procedimento', ARRAY['Checklist ROV'], 'IMCA R 004', 'major'),
  (7, 'Navegação Segura', 'Procedimentos de navegação implementados', 'Bridge team management', 'Registros de navegação', 'Falhas navegação', ARRAY['Logbook navegação'], 'STCW', 'critical'),
  (8, 'Manuseio Cargas', 'Operações de carga conforme procedimentos', 'Plano de carga', 'Amarração conforme', 'Cargas mal amarradas', ARRAY['Plano carga'], 'SOLAS', 'major')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 4
ON CONFLICT (element_id, item_number) DO NOTHING;