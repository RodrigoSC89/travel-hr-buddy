-- =====================================================
-- PEOTRAM 2024 - SQL DE INSERÇÃO DOS ITENS (PARTE 2)
-- Elementos 7-13 (~40 itens)
-- =====================================================

-- INSERIR ITENS DOS ELEMENTOS 7-13
INSERT INTO public.peotram_items_2024 (
  element_id, item_number, item_name, description, 
  requirement, evidence_required, norm_reference, criticality_level
)
SELECT 
  e.id,
  i.item_number, i.item_name, i.description,
  i.requirement, i.evidence_required, i.norm_reference, i.criticality_level
FROM public.peotram_elements_2024 e
CROSS JOIN (VALUES
  -- ELEMENTO 7 - Gestão de Mudanças (5 itens)
  (7, '7.1.1', 'Procedimento MOC', 'Gestão de mudanças', 'Aprovações', ARRAY['Procedimento', 'Registros'], 'ISM Code', 'major'),
  (7, '7.1.2', 'Avaliação risco mudança', 'Avaliação para mudanças', 'Registros', ARRAY['Análises', 'Aprovações'], 'NR-37', 'major'),
  (7, '7.1.5', 'GM pessoas', 'Função, área, embarcação', 'Procedimento', ARRAY['Procedimento', 'Registros'], 'ISM Code', 'major'),
  (7, '7.1.7', 'Modificação equipamento', 'Equipamento crítico', 'Lista modificações', ARRAY['Lista', 'Aprovações'], 'Class', 'critical'),
  (7, '7.1.12', 'Software GM', 'Software de gestão', 'Registros', ARRAY['Sistema', 'Registros'], 'ISM Code', 'minor'),
  
  -- ELEMENTO 8 - Aquisição (4 itens)
  (8, '8.1.1', 'Auditorias fornecedores', 'Auditorias realizadas', 'Relatórios', ARRAY['Relatórios', 'Plano'], 'ISM Code', 'major'),
  (8, '8.1.2', 'Pré-qualificação', 'Fornecedores qualificados', 'Relação', ARRAY['Lista', 'Critérios'], 'ISM Code', 'major'),
  (8, '8.1.7', 'Avaliação SMS', 'Requisitos SMS', 'Avaliações', ARRAY['Avaliações', 'Certificações'], 'IMCA', 'major'),
  (8, '8.1.10', 'Matriz terceiros', 'Responsabilidades', 'Contratos', ARRAY['Contratos', 'Bridge Documents'], 'ISM Code', 'major'),
  
  -- ELEMENTO 9 - RH (5 itens)
  (9, '9.3.2', 'Qualificação DP', 'IMCA e IMO', 'Certificados', ARRAY['Certificados', 'Log Book'], 'IMCA 117', 'critical'),
  (9, '9.3.5', 'Suporte psicológico', 'ASO e avaliação', 'Procedimentos', ARRAY['ASO', 'Procedimentos'], 'NR-7', 'major'),
  (9, '9.4.1', 'Treinamento simuladores', 'SIAGRA, SINDIMAR', 'Registros', ARRAY['Certificados', 'Registros'], 'STCW', 'major'),
  (9, '9.6.1', 'Programa FH', 'Fatores Humanos', 'Programa', ARRAY['Programa', 'Registros'], 'STCW', 'major'),
  (9, '9.6.2', 'CRM', 'Crew Resource Management', 'Certificado', ARRAY['Certificados CRM', 'Anotação'], 'STCW', 'major'),
  
  -- ELEMENTO 10 - Informação (3 itens)
  (10, '10.1.1', 'NR-1 digital', 'Informação digital', 'Registros 1.6', ARRAY['Sistema', 'Registros'], 'NR-1', 'major'),
  (10, '10.3.1', 'NA DÚVIDA PARE', 'Sistemática', 'Fluxo', ARRAY['Procedimento', 'Comunicados'], 'ISM Code', 'major'),
  (10, '10.3.2', 'Ouvidoria', 'SAC', 'Procedimento', ARRAY['Procedimento', 'Registros'], 'ISM Code', 'minor'),
  
  -- ELEMENTO 11 - Emergências (6 itens)
  (11, '11.1.1', 'Planos emergência', 'Baseados em riscos', 'Planos completos', ARRAY['Planos', 'Análises'], 'ISM Code 8', 'critical'),
  (11, '11.1.2', 'Modelo ICS', 'Implementado', 'Plano alinhado', ARRAY['Plano', 'Organograma'], 'ICS', 'critical'),
  (11, '11.1.6', 'Cenários críticos', 'Todos cenários', 'Planos específicos', ARRAY['Planos', 'Exercícios'], 'SOLAS', 'critical'),
  (11, '11.1.7', 'Telemedicina', 'Medicina remota 24h', 'Contrato', ARRAY['Contrato', 'Procedimento'], 'STCW', 'major'),
  (11, '11.2.1', 'Exercícios simulados', 'Cronograma', 'Registros', ARRAY['Cronograma', 'Relatórios'], 'SOLAS', 'critical'),
  (11, '11.3.1', 'Bote resgate', '5 minutos', 'Constatação', ARRAY['Registro tempo', 'Verificação'], 'SOLAS III', 'critical'),
  
  -- ELEMENTO 12 - Acidentes (5 itens)
  (12, '12.1.1', 'Sistemática investigação', 'Registro e investigação', 'Procedimento', ARRAY['Procedimento', 'Registros'], 'ISM Code 9', 'critical'),
  (12, '12.1.3', 'Comissões investigação', 'Qualificadas', 'Listagem', ARRAY['Lista', 'Certificados'], 'ISM Code 9', 'major'),
  (12, '12.1.5', 'Técnicas investigação', 'IOGP 621', 'Árvore eventos', ARRAY['Relatórios', 'Metodologia'], 'IOGP 621', 'major'),
  (12, '12.1.6', 'Abrangência acidentes', 'Análise e divulgação', 'Comunicados', ARRAY['Análises', 'Comunicados'], 'ISM Code 9', 'major'),
  (12, '12.2.1', 'Eficácia ações', 'Avaliação', 'Registros', ARRAY['Registros', 'Evidências'], 'ISM Code 9', 'major'),
  
  -- ELEMENTO 13 - Melhoria (5 itens)
  (13, '13.1.1', 'Inspeções frota', 'Internas', 'Cronograma', ARRAY['Cronograma', 'Relatórios'], 'ISM Code 12', 'major'),
  (13, '13.2.1', 'Auditorias internas', 'Periódicas', 'Relatórios', ARRAY['Relatórios', 'Plano'], 'ISM Code 12', 'major'),
  (13, '13.3.1', 'Indicadores proativos', 'Reativos e proativos', 'Programas', ARRAY['Dashboard', 'Relatórios'], 'ISM Code', 'major'),
  (13, '13.4.1', 'Planos análise crítica', 'Planos de ação', 'Acompanhamento', ARRAY['Atas', 'Planos'], 'ISM Code 12', 'major'),
  (13, '13.5.1', 'Análise crítica FH', 'Fatores Humanos', 'Melhorias', ARRAY['Programa', 'Resultados'], 'STCW', 'minor')
) AS i(elem_num, item_number, item_name, description, requirement, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = i.elem_num
ON CONFLICT DO NOTHING;

-- VERIFICAR TOTAIS
SELECT 
  e.element_number,
  e.element_name,
  e.element_sigla,
  e.is_critical,
  COUNT(i.id) as items_count
FROM public.peotram_elements_2024 e
LEFT JOIN public.peotram_items_2024 i ON e.id = i.element_id
GROUP BY e.id, e.element_number, e.element_name, e.element_sigla, e.is_critical
ORDER BY e.element_number;
