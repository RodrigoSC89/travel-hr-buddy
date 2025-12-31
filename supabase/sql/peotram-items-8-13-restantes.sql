-- =====================================================
-- PEOTRAM 2024 - ITENS RESTANTES ELEMENTOS 8-13
-- 24 itens adicionais
-- =====================================================

-- INSERIR ITENS RESTANTES ELEMENTOS 8-10
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, evidence_required, norm_reference, criticality_level)
SELECT e.id, i.item_number, i.item_name, i.description, i.requirement, i.evidence_required, i.norm_reference, i.criticality_level
FROM public.peotram_elements_2024 e
CROSS JOIN (VALUES
  (8, '8.1.3', 'Qualificação técnica', 'Análise qualificação fornecedores críticos', 'Relatórios técnicos', ARRAY['Relatórios', 'Critérios'], 'ISM Code', 'major'),
  (8, '8.1.4', 'Contratos SMS', 'Cláusulas SMS em contratos', 'Contratos assinados', ARRAY['Contratos', 'Cláusulas'], 'ISM Code', 'major'),
  (8, '8.1.5', 'Monitoramento desempenho', 'KPIs fornecedores', 'Dashboard', ARRAY['Indicadores', 'Relatórios'], 'ISM Code', 'minor'),
  (9, '9.3.3', 'Certificação STCW', 'Certificados conforme STCW', 'Matriz certificações', ARRAY['Certificados', 'Matriz'], 'STCW', 'critical'),
  (9, '9.3.4', 'Avaliação médica periódica', 'ASO e exames complementares', 'Cronograma exames', ARRAY['ASO', 'Laudos'], 'NR-7', 'major'),
  (9, '9.4.2', 'Treinamento emergência', 'Drills e exercícios práticos', 'Registros participação', ARRAY['Listas presença', 'Relatórios'], 'SOLAS', 'critical'),
  (9, '9.5.1', 'Avaliação competências', 'Matriz competências tripulação', 'Avaliações periódicas', ARRAY['Matriz', 'Avaliações'], 'ISM Code', 'major'),
  (10, '10.1.2', 'Comunicação interna', 'Canais comunicação bordo-terra', 'Procedimento comunicação', ARRAY['Procedimento', 'Registros'], 'ISM Code', 'major'),
  (10, '10.2.1', 'Reuniões SMS', 'Reuniões periódicas segurança', 'Atas reuniões', ARRAY['Atas', 'Listas presença'], 'ISM Code', 'major'),
  (10, '10.2.2', 'Alertas segurança', 'Sistema alertas e comunicados', 'Registros alertas', ARRAY['Comunicados', 'Confirmações'], 'ISM Code', 'major'),
  (10, '10.4.1', 'Feedback tripulação', 'Sistema sugestões e feedback', 'Registros feedback', ARRAY['Formulários', 'Respostas'], 'ISM Code', 'minor')
) AS i(elem_num, item_number, item_name, description, requirement, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = i.elem_num
ON CONFLICT DO NOTHING;

-- INSERIR ITENS RESTANTES ELEMENTOS 11-13
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, evidence_required, norm_reference, criticality_level)
SELECT e.id, i.item_number, i.item_name, i.description, i.requirement, i.evidence_required, i.norm_reference, i.criticality_level
FROM public.peotram_elements_2024 e
CROSS JOIN (VALUES
  (11, '11.1.3', 'Plano abandono', 'Procedimento abandono embarcação', 'Plano completo', ARRAY['Plano', 'Exercícios'], 'SOLAS III', 'critical'),
  (11, '11.1.4', 'Plano combate incêndio', 'Procedimentos combate incêndio', 'Plano fire fighting', ARRAY['Plano', 'Exercícios'], 'SOLAS II', 'critical'),
  (11, '11.1.5', 'Plano derrame óleo', 'SOPEP atualizado', 'Plano SOPEP', ARRAY['SOPEP', 'Equipamentos'], 'MARPOL', 'critical'),
  (11, '11.2.2', 'Exercícios noturnos', 'Drills em condições adversas', 'Registros drills', ARRAY['Relatórios', 'Fotos'], 'SOLAS', 'major'),
  (11, '11.3.2', 'Equipamentos salvatagem', 'Inspeção equipamentos LSA', 'Checklist inspeção', ARRAY['Checklists', 'Certificados'], 'SOLAS III', 'critical'),
  (12, '12.1.2', 'Classificação incidentes', 'Critérios classificação acidentes', 'Matriz classificação', ARRAY['Matriz', 'Procedimento'], 'ISM Code 9', 'major'),
  (12, '12.1.4', 'Comunicação autoridades', 'Notificação DPC e órgãos', 'Registros notificação', ARRAY['Protocolos', 'Comunicados'], 'NORMAM', 'critical'),
  (12, '12.2.2', 'Lições aprendidas', 'Divulgação lições aprendidas', 'Comunicados fleet', ARRAY['Comunicados', 'Treinamentos'], 'ISM Code 9', 'major'),
  (12, '12.2.3', 'Estatísticas acidentes', 'Análise estatística incidentes', 'Relatórios periódicos', ARRAY['Dashboard', 'Relatórios'], 'ISM Code', 'minor'),
  (13, '13.1.2', 'Inspeções terceiros', 'Auditorias Class e Flag State', 'Relatórios auditorias', ARRAY['Relatórios', 'CAPs'], 'Class Rules', 'critical'),
  (13, '13.2.2', 'Auditorias externas', 'Auditorias certificação ISM/ISPS', 'Certificados DOC/SMC', ARRAY['Certificados', 'Relatórios'], 'ISM Code', 'critical'),
  (13, '13.3.2', 'Benchmarking', 'Comparação indicadores setor', 'Relatórios comparativos', ARRAY['Relatórios', 'Gráficos'], 'IMCA', 'minor'),
  (13, '13.4.2', 'Revisão anual SMS', 'Análise crítica direção', 'Ata análise crítica', ARRAY['Ata', 'Plano ação'], 'ISM Code 12', 'major')
) AS i(elem_num, item_number, item_name, description, requirement, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = i.elem_num
ON CONFLICT DO NOTHING;

-- VERIFICAR TOTAIS
SELECT 
  e.element_number,
  e.element_name,
  COUNT(i.id) as items_count
FROM public.peotram_elements_2024 e
LEFT JOIN public.peotram_items_2024 i ON e.id = i.element_id
GROUP BY e.id, e.element_number, e.element_name
ORDER BY e.element_number;
