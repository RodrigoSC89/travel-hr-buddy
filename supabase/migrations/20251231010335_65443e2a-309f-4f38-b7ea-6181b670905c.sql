-- Inserir elementos 1-4
INSERT INTO public.peotram_elements_2024 (
  structure_id, element_number, element_name, element_sigla, 
  description, weight_percentage, is_critical, importance_level, 
  total_items, documentation_required, norms_referenced
)
VALUES 
  ('09804d8f-df8f-41d9-b121-9618a5103146', 1, 'Liderança, Gerenciamento e Responsabilidade', 'LGR', 'Compromisso da alta administração com SMS', 8.5, false, 'high', 6, '["Política SMS", "Organograma", "Matriz RACI"]', ARRAY['ISM Code', 'IMCA', 'NR-10']),
  ('09804d8f-df8f-41d9-b121-9618a5103146', 2, 'Conformidade Legal', 'CL', 'Requisitos legais, NRs e normas marítimas', 7.5, false, 'high', 24, '["Lista requisitos", "Certificados", "Registros"]', ARRAY['NORMAM', 'NR-34', 'NR-12', 'STCW', 'SOLAS']),
  ('09804d8f-df8f-41d9-b121-9618a5103146', 3, 'Gestão de Riscos', 'GR', 'Identificação e gerenciamento de riscos', 9.0, false, 'high', 14, '["Matriz riscos", "APR/PT", "HAZOP"]', ARRAY['ISM Code 1.2.2', 'NR-37', 'N-2782']),
  ('09804d8f-df8f-41d9-b121-9618a5103146', 4, 'Operação', 'OP', 'Gestão de operações críticas', 9.5, true, 'critical', 28, '["Procedimentos", "PT", "VCP"]', ARRAY['ISM Code', 'SOLAS', 'NR-37'])
ON CONFLICT (structure_id, element_number) DO UPDATE SET
  element_name = EXCLUDED.element_name,
  element_sigla = EXCLUDED.element_sigla;