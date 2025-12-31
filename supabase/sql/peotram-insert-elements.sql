-- =====================================================
-- PEOTRAM 2024 - SQL DE INSERÇÃO DOS 13 ELEMENTOS
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- =====================================================

-- 1. INSERIR ESTRUTURA PRINCIPAL
INSERT INTO public.peotram_structures (year, cycle, total_elements, total_items)
VALUES (2024, 'Ciclo 2024', 13, 195)
ON CONFLICT (year, cycle) DO NOTHING;

-- 2. INSERIR OS 13 ELEMENTOS
INSERT INTO public.peotram_elements_2024 (
  structure_id, element_number, element_name, element_sigla, 
  description, weight_percentage, is_critical, importance_level, 
  total_items, documentation_required, norms_referenced
)
SELECT 
  (SELECT id FROM public.peotram_structures WHERE year = 2024 LIMIT 1),
  v.element_number, v.element_name, v.element_sigla,
  v.description, v.weight_percentage, v.is_critical, v.importance_level,
  v.total_items, v.documentation_required::jsonb, v.norms_referenced
FROM (VALUES
  (1, 'Liderança, Gerenciamento e Responsabilidade', 'LGR', 'Compromisso da alta administração com SMS', 8.5, false, 'high', 6, '["Política SMS", "Organograma", "Matriz RACI"]', ARRAY['ISM Code', 'IMCA', 'NR-10']),
  (2, 'Conformidade Legal', 'CL', 'Requisitos legais, NRs e normas marítimas', 7.5, false, 'high', 24, '["Lista requisitos", "Certificados", "Registros"]', ARRAY['NORMAM', 'NR-34', 'NR-12', 'STCW', 'SOLAS']),
  (3, 'Gestão de Riscos', 'GR', 'Identificação e gerenciamento de riscos', 9.0, false, 'high', 14, '["Matriz riscos", "APR/PT", "HAZOP"]', ARRAY['ISM Code 1.2.2', 'NR-37', 'N-2782']),
  (4, 'Operação', 'OP', 'Gestão de operações críticas', 9.5, true, 'critical', 28, '["Procedimentos", "PT", "VCP"]', ARRAY['ISM Code', 'SOLAS', 'NR-37']),
  (5, 'Segurança Técnica e Eficiência Energética', 'ST', 'Navegação, DP e baixo carbono', 7.5, false, 'normal', 14, '["Manuais DP", "ASOG/CAM", "GEE"]', ARRAY['STCW', 'IMCA 103', 'IMCA 117']),
  (6, 'Manutenção e Confiabilidade', 'MN', 'Sistema de manutenção planejado', 9.5, true, 'critical', 24, '["PMS", "Plano manutenção", "Indicadores"]', ARRAY['ISM Code 10', 'SOLAS', 'NORMAM 01']),
  (7, 'Gestão de Mudanças', 'GM', 'Controle de mudanças', 6.0, false, 'normal', 14, '["Procedimento MOC", "Análise risco"]', ARRAY['ISM Code', 'NR-37']),
  (8, 'Aquisição de Bens e Serviços', 'AQ', 'Qualificação de fornecedores', 5.5, false, 'normal', 11, '["Auditorias fornecedores", "Pré-qualificação"]', ARRAY['ISM Code', 'IMCA']),
  (9, 'Gestão de Recursos Humanos', 'RH', 'Treinamentos e fatores humanos', 8.0, false, 'high', 18, '["Certificados STCW", "CRM", "FH"]', ARRAY['STCW', 'IMCA 117']),
  (10, 'Gestão da Informação', 'GI', 'Documentos e comunicação', 5.0, false, 'normal', 7, '["Sistema documental", "Ouvidoria"]', ARRAY['ISM Code 11', 'NR-1']),
  (11, 'Preparação e Resposta a Emergências', 'PE', 'Planos de contingência', 8.5, true, 'critical', 12, '["Planos emergência", "Simulados", "ICS"]', ARRAY['SOLAS III', 'ISM Code 8']),
  (12, 'Análise de Acidentes e Incidentes', 'AI', 'Investigação e NC', 8.0, true, 'critical', 13, '["Procedimento investigação", "IOGP 621"]', ARRAY['ISM Code 9', 'IOGP 621']),
  (13, 'Processo de Melhoria Contínua', 'MC', 'Auditorias e análise crítica', 7.5, false, 'high', 9, '["Programa auditorias", "Indicadores"]', ARRAY['ISM Code 12', 'ISO 9001'])
) AS v(element_number, element_name, element_sigla, description, weight_percentage, is_critical, importance_level, total_items, documentation_required, norms_referenced)
ON CONFLICT (structure_id, element_number) DO UPDATE SET
  element_name = EXCLUDED.element_name,
  element_sigla = EXCLUDED.element_sigla,
  description = EXCLUDED.description,
  weight_percentage = EXCLUDED.weight_percentage,
  is_critical = EXCLUDED.is_critical;

-- Verificar inserção
SELECT element_number, element_name, element_sigla, is_critical FROM public.peotram_elements_2024 ORDER BY element_number;
