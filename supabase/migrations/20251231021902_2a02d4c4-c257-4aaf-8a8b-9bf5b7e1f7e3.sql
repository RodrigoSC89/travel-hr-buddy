-- PEO-DP: Inserir requisitos Seções 3.3 a 3.7 (30 requisitos restantes)

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

-- SEÇÃO 3.5 - OPERAÇÃO CRÍTICA (6 requisitos)
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

-- SEÇÃO 3.6 - MANUTENÇÃO CRÍTICA (4 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.1', 'Plano Manutenção DP', 'Plano de manutenção de sistemas DP', 'critical', ARRAY['PMP'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.2', 'Manutenção Preventiva', 'Manutenção preventiva executada', 'critical', ARRAY['Ordens serviço'], 'monthly'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.3', 'Spare Parts', 'Gestão de spare parts DP', 'critical', ARRAY['Inventário'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.6', 'Manutenção', '3.6.4', 'Histórico Manutenção', 'Histórico de manutenção documentado', 'critical', ARRAY['Registros históricos'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

-- SEÇÃO 3.7 - TESTES ANUAIS CRÍTICA (5 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.1', 'DP Annual Trials', 'DP Annual Trials realizados', 'critical', ARRAY['Relatório Trials'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.2', 'FMEA Annual Review', 'FMEA revisado anualmente', 'critical', ARRAY['FMEA atualizado'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.3', 'Testes Blackout', 'Testes de blackout realizados', 'critical', ARRAY['Registros blackout'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.4', 'Testes Referência', 'Testes de sistemas de referência', 'critical', ARRAY['Testes DGPS/DGNSS'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.7', 'Testes Anuais', '3.7.5', 'Relatório Annual Trials', 'Relatório de Annual Trials aprovado', 'critical', ARRAY['Relatório aprovado'], 'annual'
FROM public.peo_dp_program WHERE year = 2021 ON CONFLICT DO NOTHING;