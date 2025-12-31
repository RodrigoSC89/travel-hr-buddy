-- =====================================================
-- PEOTRAM 2024 - ITENS ELEMENTOS 6-13 (70+ itens)
-- Execute no SQL Editor do Supabase
-- =====================================================

-- ELEMENTO 6 - Integridade Mecânica (IMG) - CRÍTICO - 8 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.1', 'Programa de Manutenção Preventiva', 'Programa de manutenção preventiva implementado', 'ISM Code 10', 'critical', ARRAY['Plano manutenção']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.2', 'Inspeções Equipamentos Críticos', 'Inspeções realizadas conforme cronograma', 'SOLAS II-1', 'critical', ARRAY['Relatórios inspeção']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.3', 'Gestão Peças Sobressalentes', 'Sistema de gestão de peças críticas', 'ISM Code 10.3', 'major', ARRAY['Inventário']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.4', 'Certificados Equipamentos', 'Certificados válidos e atualizados', 'Class Rules', 'critical', ARRAY['Certificados']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.5', 'Manutenção Corretiva', 'Procedimentos documentados', 'ISM Code 10', 'major', ARRAY['Ordens serviço']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.6', 'Qualificação Fornecedores', 'Fornecedores qualificados', 'NR-34', 'minor', ARRAY['Lista fornecedores']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.7', 'Calibração Instrumentos', 'Controle calibração instrumentos', 'Class Rules', 'major', ARRAY['Certificados calibração']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '6.8', 'Gestão Modificações MOC', 'Gestão modificações equipamentos', 'ISM Code 10.4', 'critical', ARRAY['MOC registros']
FROM public.peotram_elements_2024 WHERE element_number = 6 ON CONFLICT DO NOTHING;

-- ELEMENTO 7 - Gestão de Contratadas (GC) - 6 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '7.1', 'Qualificação de Contratadas', 'Processo de qualificação de empresas', 'NR-34', 'major', ARRAY['Critérios qualificação']
FROM public.peotram_elements_2024 WHERE element_number = 7 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '7.2', 'Contratos com Requisitos SMS', 'Contratos incluem requisitos SMS', 'NR-34/37', 'major', ARRAY['Contratos']
FROM public.peotram_elements_2024 WHERE element_number = 7 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '7.3', 'Monitoramento de Contratadas', 'Monitoramento desempenho contratadas', 'ISM Code', 'minor', ARRAY['Relatórios desempenho']
FROM public.peotram_elements_2024 WHERE element_number = 7 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '7.4', 'Integração de Terceiros', 'Programa integração terceiros', 'NR-34', 'major', ARRAY['Registros integração']
FROM public.peotram_elements_2024 WHERE element_number = 7 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '7.5', 'Fiscalização de Serviços', 'Fiscalização serviços contratados', 'NR-37', 'minor', ARRAY['Check fiscalização']
FROM public.peotram_elements_2024 WHERE element_number = 7 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '7.6', 'Avaliação Final Contratadas', 'Avaliação final desempenho', 'Petrobras', 'minor', ARRAY['Avaliação']
FROM public.peotram_elements_2024 WHERE element_number = 7 ON CONFLICT DO NOTHING;

-- ELEMENTO 8 - Gestão de Operações (GO) - 8 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.1', 'Procedimentos Operacionais', 'Procedimentos operacionais documentados', 'ISM Code 7', 'critical', ARRAY['POPs']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.2', 'Análise de Riscos Operacionais', 'Análise de riscos antes das operações', 'ISM Code 7.1', 'critical', ARRAY['APR', 'PT']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.3', 'Permissão de Trabalho', 'Sistema de permissão de trabalho', 'NR-34', 'critical', ARRAY['PT emitidas']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.4', 'Controle de Operações Críticas', 'Controle de operações de alto risco', 'SOLAS', 'critical', ARRAY['Checklists operacionais']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.5', 'Comunicação Operacional', 'Comunicação efetiva durante operações', 'ISM Code 6', 'major', ARRAY['Registros comunicação']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.6', 'Troca de Turno Segura', 'Procedimento de troca de turno', 'STCW', 'major', ARRAY['Registros handover']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.7', 'Monitoramento Condições', 'Monitoramento de condições metocean', 'MARPOL', 'major', ARRAY['Registros meteorológicos']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '8.8', 'Registro de Operações', 'Registro detalhado de operações', 'ISM Code 9', 'minor', ARRAY['Logbooks']
FROM public.peotram_elements_2024 WHERE element_number = 8 ON CONFLICT DO NOTHING;

-- ELEMENTO 9 - Gestão de Mudanças (GM) - 5 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '9.1', 'Procedimento MOC', 'Procedimento de gestão de mudanças', 'ISM Code 10.4', 'major', ARRAY['Procedimento MOC']
FROM public.peotram_elements_2024 WHERE element_number = 9 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '9.2', 'Avaliação de Impacto', 'Avaliação de impacto de mudanças', 'ISM Code', 'major', ARRAY['Análises de impacto']
FROM public.peotram_elements_2024 WHERE element_number = 9 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '9.3', 'Aprovação de Mudanças', 'Processo de aprovação de mudanças', 'Class Rules', 'major', ARRAY['Aprovações']
FROM public.peotram_elements_2024 WHERE element_number = 9 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '9.4', 'Comunicação de Mudanças', 'Comunicação de mudanças às partes', 'ISM Code 6', 'minor', ARRAY['Comunicados']
FROM public.peotram_elements_2024 WHERE element_number = 9 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '9.5', 'Registro de Mudanças', 'Registro histórico de mudanças', 'ISM Code', 'minor', ARRAY['Log mudanças']
FROM public.peotram_elements_2024 WHERE element_number = 9 ON CONFLICT DO NOTHING;

-- ELEMENTO 10 - Tratamento de Anomalias (TA) - 6 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '10.1', 'Sistema de Reporte de Anomalias', 'Sistema para reportar anomalias', 'ISM Code 9', 'major', ARRAY['Sistema de reporte']
FROM public.peotram_elements_2024 WHERE element_number = 10 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '10.2', 'Investigação de Incidentes', 'Processo de investigação de incidentes', 'ISM Code 9.1', 'critical', ARRAY['Relatórios investigação']
FROM public.peotram_elements_2024 WHERE element_number = 10 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '10.3', 'Análise de Causa Raiz', 'Análise de causa raiz de anomalias', 'ISM Code 9.2', 'critical', ARRAY['ACR documentadas']
FROM public.peotram_elements_2024 WHERE element_number = 10 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '10.4', 'Ações Corretivas', 'Implementação de ações corretivas', 'ISM Code 9.2', 'major', ARRAY['Planos de ação']
FROM public.peotram_elements_2024 WHERE element_number = 10 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '10.5', 'Lições Aprendidas', 'Disseminação de lições aprendidas', 'ISM Code', 'minor', ARRAY['Boletins LA']
FROM public.peotram_elements_2024 WHERE element_number = 10 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '10.6', 'Acompanhamento de Ações', 'Acompanhamento efetividade ações', 'ISM Code 9.2', 'minor', ARRAY['Verificações efetividade']
FROM public.peotram_elements_2024 WHERE element_number = 10 ON CONFLICT DO NOTHING;

-- ELEMENTO 11 - Preparação e Resposta a Emergências (PRE) - CRÍTICO - 10 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.1', 'Plano de Emergência', 'Plano de emergência documentado', 'SOLAS III', 'critical', ARRAY['Plano emergência']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.2', 'Identificação de Cenários', 'Identificação de cenários de emergência', 'ISM Code 8', 'critical', ARRAY['Matriz cenários']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.3', 'Equipamentos de Emergência', 'Equipamentos de emergência disponíveis', 'SOLAS III/LSA', 'critical', ARRAY['Inspeções equipamentos']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.4', 'Simulados de Emergência', 'Simulados realizados conforme cronograma', 'SOLAS III/19', 'critical', ARRAY['Registros simulados']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.5', 'Treinamento de Emergência', 'Tripulação treinada em emergências', 'STCW', 'critical', ARRAY['Registros treinamento']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.6', 'Comunicação de Emergência', 'Sistema de comunicação de emergência', 'SOLAS IV', 'critical', ARRAY['Testes comunicação']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.7', 'Avaliação Pós-Simulado', 'Avaliação após simulados realizados', 'ISM Code 8.3', 'major', ARRAY['Relatórios avaliação']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.8', 'Plano de Contingência', 'Planos de contingência específicos', 'MARPOL', 'major', ARRAY['Planos contingência']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.9', 'Coordenação com Autoridades', 'Coordenação com autoridades externas', 'SOLAS V', 'major', ARRAY['Contatos autoridades']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '11.10', 'Revisão Periódica Planos', 'Revisão periódica dos planos', 'ISM Code 8', 'minor', ARRAY['Registros revisão']
FROM public.peotram_elements_2024 WHERE element_number = 11 ON CONFLICT DO NOTHING;

-- ELEMENTO 12 - Comunicação e Consulta (CC) - CRÍTICO - 6 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '12.1', 'Canais de Comunicação', 'Canais de comunicação definidos', 'ISM Code 6', 'critical', ARRAY['Matriz comunicação']
FROM public.peotram_elements_2024 WHERE element_number = 12 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '12.2', 'Comunicação Interna', 'Comunicação interna efetiva', 'ISM Code 6.1', 'major', ARRAY['Registros reuniões']
FROM public.peotram_elements_2024 WHERE element_number = 12 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '12.3', 'Comunicação com Afretador', 'Comunicação com Petrobras/afretador', 'Contrato', 'critical', ARRAY['Relatórios enviados']
FROM public.peotram_elements_2024 WHERE element_number = 12 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '12.4', 'Consulta à Tripulação', 'Consulta à tripulação em SMS', 'MLC 2006', 'major', ARRAY['Atas reuniões']
FROM public.peotram_elements_2024 WHERE element_number = 12 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '12.5', 'Reuniões de Segurança', 'Reuniões de segurança realizadas', 'NR-34', 'major', ARRAY['Atas DDS/DSS']
FROM public.peotram_elements_2024 WHERE element_number = 12 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '12.6', 'Feedback de Comunicação', 'Avaliação efetividade comunicação', 'ISM Code', 'minor', ARRAY['Pesquisas']
FROM public.peotram_elements_2024 WHERE element_number = 12 ON CONFLICT DO NOTHING;

-- ELEMENTO 13 - Auditoria, Análise Crítica e Melhoria Contínua (AAM) - 8 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.1', 'Programa de Auditorias', 'Programa de auditorias internas', 'ISM Code 12', 'major', ARRAY['Cronograma auditorias']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.2', 'Auditores Qualificados', 'Auditores internos qualificados', 'ISM Code 12.1', 'major', ARRAY['Certificados auditores']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.3', 'Relatórios de Auditoria', 'Relatórios de auditoria documentados', 'ISM Code 12.2', 'major', ARRAY['Relatórios auditoria']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.4', 'Não-Conformidades Auditorias', 'Tratamento NCs de auditorias', 'ISM Code 12.3', 'critical', ARRAY['Planos ação NCs']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.5', 'Análise Crítica pela Direção', 'Análise crítica pela alta direção', 'ISM Code 12.4', 'critical', ARRAY['Atas análise crítica']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.6', 'Indicadores de Desempenho', 'Indicadores SMS monitorados', 'ISM Code', 'major', ARRAY['Dashboard indicadores']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.7', 'Metas de Melhoria', 'Metas de melhoria definidas', 'ISM Code', 'minor', ARRAY['Plano melhoria']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, norm_reference, criticality_level, evidence_required)
SELECT id, '13.8', 'Benchmarking', 'Benchmarking com melhores práticas', 'Petrobras', 'minor', ARRAY['Estudos comparativos']
FROM public.peotram_elements_2024 WHERE element_number = 13 ON CONFLICT DO NOTHING;

-- Verificar total inserido
SELECT element_number, COUNT(*) as total_items 
FROM public.peotram_items_2024 i
JOIN public.peotram_elements_2024 e ON i.element_id = e.id
GROUP BY element_number
ORDER BY element_number;
