-- Elementos 5-9
INSERT INTO public.peotram_elements_2024 (
  structure_id, element_number, element_name, element_sigla, 
  description, weight_percentage, is_critical, importance_level, 
  total_items, documentation_required, norms_referenced
)
VALUES 
  ('09804d8f-df8f-41d9-b121-9618a5103146', 5, 'Segurança Técnica e Eficiência Energética', 'ST', 'Navegação, DP e baixo carbono', 7.5, false, 'normal', 14, '["Manuais DP", "ASOG/CAM", "GEE"]', ARRAY['STCW', 'IMCA 103', 'IMCA 117']),
  ('09804d8f-df8f-41d9-b121-9618a5103146', 6, 'Manutenção e Confiabilidade', 'MN', 'Sistema de manutenção planejado', 9.5, true, 'critical', 24, '["PMS", "Plano manutenção", "Indicadores"]', ARRAY['ISM Code 10', 'SOLAS', 'NORMAM 01']),
  ('09804d8f-df8f-41d9-b121-9618a5103146', 7, 'Gestão de Mudanças', 'GM', 'Controle de mudanças', 6.0, false, 'normal', 14, '["Procedimento MOC", "Análise risco"]', ARRAY['ISM Code', 'NR-37']),
  ('09804d8f-df8f-41d9-b121-9618a5103146', 8, 'Aquisição de Bens e Serviços', 'AQ', 'Qualificação de fornecedores', 5.5, false, 'normal', 11, '["Auditorias fornecedores", "Pré-qualificação"]', ARRAY['ISM Code', 'IMCA']),
  ('09804d8f-df8f-41d9-b121-9618a5103146', 9, 'Gestão de Recursos Humanos', 'RH', 'Treinamentos e fatores humanos', 8.0, false, 'high', 18, '["Certificados STCW", "CRM", "FH"]', ARRAY['STCW', 'IMCA 117'])
ON CONFLICT (structure_id, element_number) DO UPDATE SET
  element_name = EXCLUDED.element_name;