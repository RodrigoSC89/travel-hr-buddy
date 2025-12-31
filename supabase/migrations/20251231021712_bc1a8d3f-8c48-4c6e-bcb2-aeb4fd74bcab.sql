-- PEO-DP: Inserir requisitos Seção 3.2 (Gestão) - 24 requisitos CRÍTICOS
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.1', 'Gestão de Riscos Alinhada', 'Gestão de riscos alinhada com objetivos e cultura organizacional', 'critical', ARRAY['Política'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.2', 'Estudos de Riscos', 'Realizar estudos de riscos para operações DP', 'critical', ARRAY['HAZOP', 'FMEA'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.3', 'Aprovação Alta Direção', 'Plano aprovado pela alta direção', 'critical', ARRAY['Assinaturas'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.4', 'Revisão Anual', 'Revisão anual do plano de ação', 'critical', ARRAY['Plano revisado'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.5', 'Integração com SGI', 'Integração do PEO-DP com Sistema de Gestão', 'critical', ARRAY['Procedimentos SGI'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.6', 'Melhoria Contínua', 'Processo de melhoria contínua implementado', 'critical', ARRAY['Registros'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.7', 'Fatores Humanos', 'Considerar fatores humanos nas operações DP', 'critical', ARRAY['Análise fadiga'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.8', 'Alocação de Recursos', 'Recursos adequados alocados para operações DP', 'critical', ARRAY['Orçamento'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.9', 'Sistema de Consequências', 'Sistema de consequências implementado', 'critical', ARRAY['Política consequências'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.10', 'Atualização Contínua', 'Atualização contínua de procedimentos', 'critical', ARRAY['Controle revisões'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.11', 'Treinamentos Contínuos', 'Programa de treinamentos contínuos', 'critical', ARRAY['Plano treinamento'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.12', 'Indicadores Desempenho', 'Indicadores de desempenho DP', 'critical', ARRAY['Indicadores'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.13', 'Inspeção Sistemas Críticos', 'Inspeção de sistemas DP críticos', 'critical', ARRAY['Relatórios inspeção'], 'monthly'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.14', 'Análise Crítica Mensal', 'Análise crítica mensal de cada embarcação', 'critical', ARRAY['Relatório mensal'], 'monthly'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.15', 'Solicitar Análises', 'Solicitar análises quando necessário', 'critical', ARRAY['Solicitações'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.16', 'Abrangência de Ações', 'Abrangência de ações em toda frota', 'critical', ARRAY['Planos'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.17', 'Indicador IPCLV', 'Implementar IPCLV - Meta 100%', 'critical', ARRAY['Cálculo IPCLV'], 'monthly'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.18', 'Listas Verificação Passadiço', 'Listas de verificação de passadiço', 'critical', ARRAY['Checklists'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.19', 'Listas Praça de Máquinas', 'Listas de verificação praça de máquinas', 'critical', ARRAY['Checklists máquinas'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.20', 'Listas Gerais', 'Listas de verificação gerais', 'critical', ARRAY['Checklists gerais'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.21', 'Documentos Obrigatórios', 'Documentos obrigatórios a entregar', 'critical', ARRAY['Lista documentos'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.22', 'Apuração de Indicador', 'Apuração mensal do indicador IPCLV', 'critical', ARRAY['Relatório IPCLV'], 'monthly'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.23', 'Drift Off/Drive Off/Large Excursion', 'Rastreamento de eventos DP', 'critical', ARRAY['Registros eventos'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.24', 'Company DP Authority', 'Designação de Company DP Authority', 'critical', ARRAY['Designação formal'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;