-- =====================================================
-- PEO-DP PETROBRAS 2021 - TODOS OS 54 REQUISITOS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- SEÇÃO 3.1 - REGRAS GERAIS (7 requisitos) - Já inseridos
-- Verificar se existem
SELECT COUNT(*) as total_31 FROM public.peo_dp_requirements WHERE section = '3.1';

-- SEÇÃO 3.2 - GESTÃO (24 requisitos) - CRÍTICA
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
SELECT id, '3.2', 'Gestão', '3.2.6', 'Implementação Contínua', 'Processo de melhoria contínua implementado', 'critical', ARRAY['Registros'], 'continuous'
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
SELECT id, '3.2', 'Gestão', '3.2.12', 'Melhoria Contínua', 'Processo de melhoria contínua', 'critical', ARRAY['Indicadores'], 'continuous'
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
SELECT id, '3.2', 'Gestão', '3.2.18', 'Listas de Verificação Passadiço', 'Listas de verificação de passadiço', 'critical', ARRAY['Checklists'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.19', 'Listas Praça de Máquinas', 'Listas de verificação praça de máquinas', 'critical', ARRAY['Checklists máquinas'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.20', 'Listas Gerais', 'Listas de verificação gerais', 'critical', ARRAY['Checklists gerais'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.2', 'Gestão', '3.2.21', 'Documentos a Entregar', 'Documentos obrigatórios a entregar', 'critical', ARRAY['Lista documentos'], 'annual'
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

-- SEÇÃO 3.3 - TREINAMENTOS (9 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.1', 'Levantamento Lacunas', 'Levantamento de lacunas em treinamentos', 'normal', ARRAY['Análise lacunas'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.2', 'Plano de Treinamento', 'Plano de treinamento DP documentado', 'normal', ARRAY['Plano treinamento'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.3', 'Qualificação DPO', 'Qualificação de operadores DP', 'normal', ARRAY['Certificados DPO'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.4', 'Treinamento em Simulador', 'Treinamento em simulador DP', 'normal', ARRAY['Registros simulador'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.5', 'Familiarização', 'Familiarização específica do equipamento', 'normal', ARRAY['Registros familiarização'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.6', 'Reciclagem', 'Treinamentos de reciclagem', 'normal', ARRAY['Registros reciclagem'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.7', 'Avaliação de Competência', 'Avaliação de competência DP', 'normal', ARRAY['Avaliações'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.8', 'Registros de Treinamento', 'Registros de treinamento atualizados', 'normal', ARRAY['Matriz treinamento'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.3', 'Treinamentos', '3.3.9', 'Feedback de Treinamento', 'Coleta de feedback de treinamentos', 'normal', ARRAY['Avaliações reação'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

-- SEÇÃO 3.4 - PROCEDIMENTOS (6 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.4', 'Procedimentos', '3.4.1', 'DPOM', 'DP Operations Manual atualizado', 'normal', ARRAY['DPOM'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.4', 'Procedimentos', '3.4.2', 'ASOG', 'Activity Specific Operating Guidelines', 'normal', ARRAY['ASOG'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.4', 'Procedimentos', '3.4.3', 'CAM', 'Critical Activity Mode definido', 'normal', ARRAY['CAM procedimento'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.4', 'Procedimentos', '3.4.4', 'TAM', 'Task Appropriate Mode definido', 'normal', ARRAY['TAM procedimento'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.4', 'Procedimentos', '3.4.5', 'Controle Documentos', 'Controle de documentos DP', 'normal', ARRAY['Lista mestra'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.4', 'Procedimentos', '3.4.6', 'Revisão Periódica', 'Revisão periódica de procedimentos', 'normal', ARRAY['Histórico revisões'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

-- SEÇÃO 3.5 - OPERAÇÃO (6 requisitos) - CRÍTICA
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.5', 'Operação', '3.5.1', 'Watch Keeping', 'Sistema de watch keeping DP', 'critical', ARRAY['Escala serviço'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.5', 'Operação', '3.5.2', 'Handover', 'Procedimento de handover', 'critical', ARRAY['Checklists handover'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.5', 'Operação', '3.5.3', 'Comunicação DP', 'Comunicação durante operações DP', 'critical', ARRAY['Registros comunicação'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.5', 'Operação', '3.5.4', 'Monitoramento Ambiental', 'Monitoramento condições ambientais', 'critical', ARRAY['Dados metocean'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.5', 'Operação', '3.5.5', 'Registro Operacional', 'Registro de operações DP', 'critical', ARRAY['DP Logbook'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.5', 'Operação', '3.5.6', 'Resposta a Alarmes', 'Resposta a alarmes e eventos', 'critical', ARRAY['Registros alarmes'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

-- SEÇÃO 3.6 - MANUTENÇÃO (4 requisitos) - CRÍTICA
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.1', 'Plano Manutenção DP', 'Plano de manutenção sistemas DP', 'critical', ARRAY['PMS DP'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.2', 'Manutenção Preventiva', 'Manutenção preventiva de sistemas DP', 'critical', ARRAY['Ordens manutenção'], 'monthly'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.3', 'Peças Sobressalentes', 'Estoque de peças sobressalentes DP', 'critical', ARRAY['Inventário'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.4', 'Gestão de Defeitos', 'Gestão de defeitos sistemas DP', 'critical', ARRAY['Log defeitos'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

-- SEÇÃO 3.7 - TESTES ANUAIS (5 requisitos) - CRÍTICA
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.1', 'DP Annual Trials', 'DP trials anuais realizados', 'critical', ARRAY['Relatório trials'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.2', 'FMEA Review', 'Revisão anual do FMEA', 'critical', ARRAY['FMEA atualizado'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.3', 'Capability Plot', 'Capability plot atualizado', 'critical', ARRAY['Capability plot'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.4', 'Validação Sistemas', 'Validação de sistemas DP', 'critical', ARRAY['Relatório validação'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.5', 'Certificação Classe', 'Certificação de classe DP válida', 'critical', ARRAY['Certificado DP'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

-- Verificar total por seção
SELECT section, section_name, COUNT(*) as total_requisitos 
FROM public.peo_dp_requirements 
GROUP BY section, section_name
ORDER BY section;
