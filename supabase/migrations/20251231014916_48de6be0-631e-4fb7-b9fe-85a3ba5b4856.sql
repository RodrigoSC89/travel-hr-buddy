-- Inserir requisitos PEO-DP Seção 3.1 Regras Gerais
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.1', 'Regras Gerais', '3.1.1', 'Divisão de Requisitos', 'Os requisitos devem estar divididos em: Gestão, Treinamentos, Procedimentos, Operação, Manutenção, Testes anuais', 'normal', ARRAY['Plano de Ação', 'Organograma'], 'annual'
FROM public.peo_dp_program WHERE year = 2021;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.1', 'Regras Gerais', '3.1.2', 'Estrutura do Programa', 'Programa estruturado conforme IMCA M 117 e normativas Petrobras', 'normal', ARRAY['Documentação'], 'annual'
FROM public.peo_dp_program WHERE year = 2021;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.1', 'Regras Gerais', '3.1.3', 'Abrangência', 'Aplicável a todas embarcações DP contratadas pela Petrobras', 'normal', ARRAY['Lista de embarcações'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.1', 'Regras Gerais', '3.1.4', 'Responsabilidades', 'Definição clara de responsabilidades empresa/Petrobras', 'normal', ARRAY['Matriz RACI'], 'annual'
FROM public.peo_dp_program WHERE year = 2021;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.1', 'Regras Gerais', '3.1.5', 'Documentação Base', 'Manter documentação conforme requisitos contratuais', 'normal', ARRAY['Contratos', 'Procedimentos'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.1', 'Regras Gerais', '3.1.6', 'Atualização Anual', 'Revisão anual do programa e plano de ação', 'normal', ARRAY['Plano revisado', 'Ata de reunião'], 'annual'
FROM public.peo_dp_program WHERE year = 2021;

INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT id, '3.1', 'Regras Gerais', '3.1.7', 'Comunicação Petrobras', 'Canal de comunicação estabelecido com Petrobras', 'normal', ARRAY['Contatos', 'Registros'], 'continuous'
FROM public.peo_dp_program WHERE year = 2021;