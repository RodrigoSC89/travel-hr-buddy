-- =====================================================
-- PEO-DP 2021 - INSERÇÃO DOS 54 REQUISITOS
-- Execute APÓS peo-dp-petrobras-2021-schema.sql
-- =====================================================

-- SEÇÃO 3.1 - REGRAS GERAIS (7 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT p.id, '3.1', 'REGRAS GERAIS', v.num, v.title, v.desc, v.crit, v.evid::text[], v.freq
FROM public.peo_dp_program p, (VALUES
  ('3.1.1', 'Divisão de Requisitos', 'Requisitos divididos em: Gestão, Treinamentos, Procedimentos, Operação, Manutenção, Testes anuais', 'normal', ARRAY['Plano de Ação'], 'annual'),
  ('3.1.2', 'Plano de Ação', 'Elaborar Plano de Ação baseado nos requisitos mínimos do Programa', 'high', ARRAY['Plano de Ação documentado'], 'annual'),
  ('3.1.3', 'Entrega Anual', 'Entregar Plano de Ação no primeiro dia útil de cada ano', 'high', ARRAY['Protocolo entrega'], 'annual'),
  ('3.1.4', 'Revisão Anual', 'Revisar Plano de Ação anualmente', 'high', ARRAY['Registro revisão'], 'annual'),
  ('3.1.5', 'Aceitação do Plano', 'Plano deve atender requisitos mínimos para ser aceito', 'critical', ARRAY['Aprovação PETROBRAS'], 'annual'),
  ('3.1.6', 'Penalidades', 'Não aceitação por segunda vez resulta em medidas contratuais', 'critical', ARRAY['Comunicação gerente'], 'on_demand'),
  ('3.1.7', 'Cópia do Programa', 'PETROBRAS entrega cópia do Programa e anexos', 'normal', ARRAY['Protocolo recebimento'], 'on_demand')
) AS v(num, title, desc, crit, evid, freq)
WHERE p.year = 2021
ON CONFLICT (program_id, requirement_number) DO NOTHING;

-- SEÇÃO 3.2 - GESTÃO (24 requisitos - CRÍTICA)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT p.id, '3.2', 'GESTÃO', v.num, v.title, v.desc, v.crit, v.evid::text[], v.freq
FROM public.peo_dp_program p, (VALUES
  ('3.2.1', 'Gestão de Riscos Alinhada', 'Gestão de riscos alinhada com objetivos, estratégias e cultura da organização', 'critical', ARRAY['Política SMS', 'Documentação'], 'continuous'),
  ('3.2.2', 'Estudos de Riscos', 'Entregar cópia atualizada do estudo de riscos quando solicitado', 'critical', ARRAY['Estudo FMEA', 'Bow-tie'], 'on_demand'),
  ('3.2.3', 'Aprovação Alta Direção', 'Plano de Ação aprovado pela mais alta direção', 'critical', ARRAY['Assinatura diretoria'], 'annual'),
  ('3.2.4', 'Revisão Anual', 'Revisar anualmente o Plano de Ação', 'high', ARRAY['Registro revisão'], 'annual'),
  ('3.2.5', 'Integração SGI', 'Plano de Ação faz parte do Sistema de Gestão Integrado', 'high', ARRAY['Evidência SGI'], 'continuous'),
  ('3.2.6', 'Implementação Contínua', 'Implantar, implementar e gerir continuamente o Plano de Ação', 'high', ARRAY['Registros melhoria'], 'continuous'),
  ('3.2.7', 'Fatores Humanos', 'Descrever integração de Fatores Humanos na cultura de segurança', 'critical', ARRAY['Política FH', 'Treinamentos'], 'continuous'),
  ('3.2.8', 'Alocação de Recursos', 'Assegurar recursos necessários para gerenciar riscos', 'high', ARRAY['Orçamento', 'Alocações'], 'annual'),
  ('3.2.9', 'Sistema de Consequências', 'Sistema de consequências para violações e reconhecimento', 'high', ARRAY['Procedimento', 'Registros'], 'continuous'),
  ('3.2.10', 'Atualização Contínua', 'Plano de Ação constantemente atualizado com validação da alta administração', 'high', ARRAY['Registro atualizações'], 'continuous'),
  ('3.2.11', 'Treinamentos Contínuos', 'Garantir realização contínua de treinamentos sobre riscos identificados', 'high', ARRAY['Registros treinamento'], 'continuous'),
  ('3.2.12', 'Melhoria Contínua', 'Adotar, controlar e implementar melhoria contínua nas barreiras', 'high', ARRAY['Plano melhoria'], 'continuous'),
  ('3.2.13', 'Inspeção Sistemas Críticos', 'Implementar plano de inspeção dos Sistemas e Equipamentos Críticos', 'critical', ARRAY['Plano inspeção', 'Anexo G'], 'continuous'),
  ('3.2.14', 'Análise Crítica Mensal', 'Realizar mensalmente análise crítica de cada embarcação', 'critical', ARRAY['Relatório mensal'], 'monthly'),
  ('3.2.15', 'Solicitar Análises', 'PETROBRAS pode solicitar análises a qualquer tempo', 'high', ARRAY['Análises disponíveis'], 'on_demand'),
  ('3.2.16', 'Abrangência de Ações', 'Assegurar abrangência das ações através de procedimento', 'high', ARRAY['Procedimento abrangência'], 'continuous'),
  ('3.2.17', 'Indicador IPCLV', 'Implementar Índice de Preenchimento Correto das Listas de Verificação - Meta 100%', 'critical', ARRAY['Listas verificação', 'Cálculo IPCLV', 'Anexo B'], 'monthly'),
  ('3.2.18', 'Listas de Verificação', 'Listas preenchidas antes da entrada na zona de 500m', 'critical', ARRAY['Listas passadiço', 'Listas máquinas'], 'per_operation'),
  ('3.2.19', 'Apuração Mensal IPCLV', 'Apurar mensalmente o indicador IPCLV', 'high', ARRAY['Relatório IPCLV mensal'], 'monthly'),
  ('3.2.20', 'Sorteio Embarcações', 'PETROBRAS sorteia até 10 embarcações por mês para avaliação', 'high', ARRAY['Lista embarcações sorteadas'], 'monthly'),
  ('3.2.21', 'Documentos a Entregar', 'Entregar documentos até 8º dia útil do mês subsequente', 'critical', ARRAY['Listas verificação', 'Compilações DP', 'PMS'], 'monthly'),
  ('3.2.22', 'Apuração Indicador', 'Apurar indicador no Anexo B e entregar até 8º dia útil', 'high', ARRAY['Anexo B preenchido'], 'monthly'),
  ('3.2.23', 'Drift/Drive/Excursion', 'Rastrear eventos de Drift off, Drive off e Large Excursion', 'critical', ARRAY['Anexo C', 'Análise eventos'], 'monthly'),
  ('3.2.24', 'Company DP Authority', 'Nomear formalmente responsável pela implementação (IMCA M 117)', 'critical', ARRAY['Carta nomeação'], 'continuous')
) AS v(num, title, desc, crit, evid, freq)
WHERE p.year = 2021
ON CONFLICT (program_id, requirement_number) DO NOTHING;

-- SEÇÃO 3.3 - TREINAMENTOS (9 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT p.id, '3.3', 'TREINAMENTOS', v.num, v.title, v.desc, v.crit, v.evid::text[], v.freq
FROM public.peo_dp_program p, (VALUES
  ('3.3.1', 'Lacunas em Treinamentos', 'Descrever levantamento de lacunas em treinamentos', 'high', ARRAY['Matriz competências', 'Gap analysis'], 'annual'),
  ('3.3.2', 'Treinamentos Análise de Riscos', 'Descrever treinamentos em Análises de Riscos DP', 'high', ARRAY['Registros treinamento'], 'continuous'),
  ('3.3.3', 'Treinamentos Bow-tie', 'Descrever treinamentos em Bow-ties ou ferramentas equivalentes', 'high', ARRAY['Registros treinamento Bow-tie'], 'continuous'),
  ('3.3.4', 'Treinamento Líderes', 'Treinamento para Líderes incluindo Fatores Humanos', 'high', ARRAY['Programa treinamento'], 'continuous'),
  ('3.3.5', 'Recuperação Blackout', 'Manter oficiais atualizados em procedimentos de blackout', 'critical', ARRAY['Treinamento blackout'], 'continuous'),
  ('3.3.6', 'Manual Sistema DP', 'Manter cópia do Manual do Sistema DP a bordo', 'high', ARRAY['Manual DP atualizado'], 'continuous'),
  ('3.3.7', 'Familiarização DP', 'Descrever familiarização do Oficial com sistema DP de bordo', 'high', ARRAY['Checklist familiarização'], 'per_embarque'),
  ('3.3.8', 'Avaliação Desempenho', 'Avaliar desempenho dos Oficiais na operação DP', 'high', ARRAY['Avaliações', 'Critérios recertificação'], 'continuous'),
  ('3.3.9', 'Padrão PP-2LEP-00002', 'Assegurar conteúdo do subitem 3.5.2 no programa de treinamentos', 'high', ARRAY['Programa treinamento'], 'continuous')
) AS v(num, title, desc, crit, evid, freq)
WHERE p.year = 2021
ON CONFLICT (program_id, requirement_number) DO NOTHING;

-- SEÇÃO 3.4 - PROCEDIMENTOS (6 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT p.id, '3.4', 'PROCEDIMENTOS', v.num, v.title, v.desc, v.crit, v.evid::text[], v.freq
FROM public.peo_dp_program p, (VALUES
  ('3.4.1', 'Análise de Desvios', 'Procedimento para análise e tratamento de desvios, incidentes e acidentes', 'critical', ARRAY['Procedimento', 'Registros análise'], 'continuous'),
  ('3.4.2', 'Elaboração Bow-tie', 'Descrever elaboração e atualização constante dos bow-tie', 'high', ARRAY['Bow-ties atualizados'], 'continuous'),
  ('3.4.3', 'Riscos Turret/NT', 'Reforçar conhecimento sobre riscos em unidades Turret e NT Ancorados', 'high', ARRAY['Procedimento operacional'], 'continuous'),
  ('3.4.4', 'Manual de Operações', 'Manual especifica melhor configuração de sistemas de referência DP', 'high', ARRAY['Manual operações'], 'per_vessel'),
  ('3.4.5', 'Relative Heading Control', 'Orientação para habilitar função Relative Heading Control', 'high', ARRAY['Manual operações'], 'per_vessel'),
  ('3.4.6', 'Testes Pré-operacionais', 'Assegurar realização de todos os testes previstos na lista', 'critical', ARRAY['Lista verificação', 'Registros testes'], 'per_operation')
) AS v(num, title, desc, crit, evid, freq)
WHERE p.year = 2021
ON CONFLICT (program_id, requirement_number) DO NOTHING;

-- SEÇÃO 3.5 - OPERAÇÃO (7 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT p.id, '3.5', 'OPERAÇÃO', v.num, v.title, v.desc, v.crit, v.evid::text[], v.freq
FROM public.peo_dp_program p, (VALUES
  ('3.5.1', 'Identificação Problemas', 'Identificação e tratamento de problemas no sistema de geração e distribuição de energia', 'critical', ARRAY['Procedimento', 'Registros'], 'continuous'),
  ('3.5.2', 'Normas Aplicáveis', 'Atender NORMAM, Classificadora, PETROBRAS, IMO, IMCA, OCIMF, MTS', 'critical', ARRAY['Lista normas', 'Evidências conformidade'], 'continuous'),
  ('3.5.3', 'Lista Verificação CCM', 'Manter nos CCM cópia da lista de verificação pré-operacional', 'high', ARRAY['Lista CCM'], 'per_vessel'),
  ('3.5.4', 'FMEA Atualizado', 'Manter FMEA atualizado a bordo e conhecido pelos Oficiais', 'critical', ARRAY['FMEA atualizado'], 'continuous'),
  ('3.5.5', 'Referência UTC', 'Utilizar referência UTC para sincronização dos controladores', 'high', ARRAY['Configuração UTC'], 'continuous'),
  ('3.5.6', 'Exercícios Blackout', 'Exercícios simulados de recuperação de blackout a cada 6 meses', 'critical', ARRAY['Registros exercícios'], 'semiannual'),
  ('3.5.7', 'Configuração FMEA/ASOG', 'Manter configuração do sistema DP conforme FMEA e ASOG durante operação', 'critical', ARRAY['FMEA', 'ASOG'], 'per_operation')
) AS v(num, title, desc, crit, evid, freq)
WHERE p.year = 2021
ON CONFLICT (program_id, requirement_number) DO NOTHING;

-- SEÇÃO 3.6 - MANUTENÇÃO (4 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT p.id, '3.6', 'MANUTENÇÃO', v.num, v.title, v.desc, v.crit, v.evid::text[], v.freq
FROM public.peo_dp_program p, (VALUES
  ('3.6.1', 'Plano Manutenção Anual', 'Assegurar Plano de Manutenção anual para sistemas críticos aprovado pela alta direção', 'critical', ARRAY['Plano manutenção', 'Aprovação diretoria'], 'annual'),
  ('3.6.2', 'Cópia Plano Manutenção', 'Entregar cópia atualizada quando solicitado pela PETROBRAS', 'high', ARRAY['Plano manutenção'], 'on_demand'),
  ('3.6.3', 'Software/Hardware Atualizado', 'Assegurar softwares e hardwares do Sistema DP atualizados', 'critical', ARRAY['Registros atualização', 'Relatório testes anuais'], 'continuous'),
  ('3.6.4', 'Planos Equipamentos Críticos', 'Ter Planos de Manutenção de sistemas e equipamentos críticos', 'critical', ARRAY['Planos manutenção'], 'per_vessel')
) AS v(num, title, desc, crit, evid, freq)
WHERE p.year = 2021
ON CONFLICT (program_id, requirement_number) DO NOTHING;

-- SEÇÃO 3.7 - TESTES ANUAIS DE DP (5 requisitos)
INSERT INTO public.peo_dp_requirements (program_id, section, section_name, requirement_number, requirement_title, requirement_description, criticality_level, evidence_required, frequency)
SELECT p.id, '3.7', 'TESTES ANUAIS DE DP', v.num, v.title, v.desc, v.crit, v.evid::text[], v.freq
FROM public.peo_dp_program p, (VALUES
  ('3.7.1', 'Profissionais Qualificados', 'Testes anuais realizados por profissionais com competência comprovada', 'critical', ARRAY['Certificados profissionais', 'Relatório testes'], 'annual'),
  ('3.7.2', 'Escopo Baseado FMEA', 'Escopo de testes baseado no estudo FMEA e cumprido integralmente', 'critical', ARRAY['FMEA', 'Relatório testes'], 'annual'),
  ('3.7.3', 'Cronograma Testes', 'Entregar cronograma de testes para 5 anos ou até próxima docagem', 'high', ARRAY['Cronograma testes'], 'annual'),
  ('3.7.4', 'Relatórios Testes Anuais', 'Entregar relatórios dos testes anuais DP de todas embarcações', 'critical', ARRAY['Relatórios testes'], 'annual'),
  ('3.7.5', 'CAMO/ASOG/FMEA', 'Entregar versão mais atual do CAMO, ASOG e FMEA quando solicitado', 'critical', ARRAY['CAMO', 'ASOG', 'FMEA'], 'on_demand')
) AS v(num, title, desc, crit, evid, freq)
WHERE p.year = 2021
ON CONFLICT (program_id, requirement_number) DO NOTHING;

-- VERIFICAR INSERÇÃO
SELECT section, section_name, COUNT(*) as total_requisitos 
FROM public.peo_dp_requirements 
GROUP BY section, section_name 
ORDER BY section;
