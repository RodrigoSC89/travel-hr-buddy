-- =====================================================
-- PEOTRAM 2024 - SQL COMPLETO DE INSERÇÃO DE ITENS
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- =====================================================

-- Elemento 4 - Operação (OP) - 15 itens críticos
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Procedimentos Operacionais', 'Procedimentos operacionais críticos documentados', 'Procedimentos atualizados', 'Todos procedimentos revisados', 'Procedimentos desatualizados', ARRAY['Manual operações'], 'ISM Code 7', 'critical'),
  (2, 'Briefings Operacionais', 'Briefings pré-operação realizados', 'Briefing documentado', 'Registros de briefing', 'Sem briefings', ARRAY['Formulário briefing'], 'IMCA', 'major'),
  (3, 'Operações DP', 'Operações em DP conforme ASOG/CAM', 'ASOG implementado', 'Limites operacionais definidos', 'ASOG não seguido', ARRAY['ASOG/CAM'], 'IMCA 103', 'critical'),
  (4, 'Operações Guindastes', 'Operações de içamento seguras', 'Plano de rigging', 'Certificados guindastes válidos', 'Operações inseguras', ARRAY['Plano içamento'], 'IMCA 181', 'critical'),
  (5, 'Operações Mergulho', 'Operações de mergulho conforme IMCA', 'Dive plan aprovado', 'Dive briefing realizado', 'Não conformidades mergulho', ARRAY['Dive plan'], 'IMCA D 014', 'critical'),
  (6, 'Operações ROV', 'Operações ROV conforme procedimentos', 'Checklist ROV', 'Piloto qualificado', 'ROV sem procedimento', ARRAY['Checklist ROV'], 'IMCA R 004', 'major'),
  (7, 'Navegação Segura', 'Procedimentos de navegação implementados', 'Bridge team management', 'Registros de navegação', 'Falhas navegação', ARRAY['Logbook navegação'], 'STCW', 'critical'),
  (8, 'Manuseio Cargas', 'Operações de carga conforme procedimentos', 'Plano de carga', 'Amarração conforme', 'Cargas mal amarradas', ARRAY['Plano carga'], 'SOLAS', 'major'),
  (9, 'Trabalhos Altura', 'Trabalhos em altura com controles', 'PT para altura', 'EPIs adequados', 'Trabalho altura inseguro', ARRAY['PT trabalho altura'], 'NR-35', 'critical'),
  (10, 'Espaços Confinados', 'Entrada em espaços confinados controlada', 'PT espaço confinado', 'Testes atmosfera', 'Entrada sem PT', ARRAY['PT espaço confinado'], 'NR-33', 'critical'),
  (11, 'Trabalhos Quente', 'Trabalhos a quente controlados', 'PT trabalho quente', 'Vigias posicionados', 'Trabalho quente sem PT', ARRAY['PT trabalho quente'], 'NR-34', 'critical'),
  (12, 'Isolamento Energia', 'LOTO implementado', 'Procedimento LOTO', 'Cadeados e etiquetas', 'LOTO não seguido', ARRAY['Procedimento LOTO'], 'NR-10', 'critical'),
  (13, 'Controle Operacional', 'Controles operacionais implementados', 'Checklists operacionais', 'Verificações realizadas', 'Controles falhos', ARRAY['Checklists'], 'ISM Code', 'major'),
  (14, 'VCP Implementado', 'Verificação Comportamental de Procedimentos', 'Programa VCP', 'Observações registradas', 'VCP não realizado', ARRAY['Relatórios VCP'], 'Petrobras', 'major'),
  (15, 'Stop Work Authority', 'Autoridade para parar trabalho', 'Procedimento SWA', 'Casos documentados', 'SWA não implementado', ARRAY['Registros SWA'], 'IMCA', 'critical')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 4
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 5 - Segurança Técnica (ST) - 10 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Sistema DP', 'Sistema DP em conformidade', 'DP trials realizados', 'FMEA atualizado', 'DP não conforme', ARRAY['FMEA DP', 'DP trials'], 'IMCA 103', 'critical'),
  (2, 'ASOG/CAM', 'ASOG/CAM implementado e atualizado', 'Documento aprovado', 'Limites definidos', 'ASOG desatualizado', ARRAY['ASOG/CAM'], 'IMCA 182', 'critical'),
  (3, 'Navegação', 'Equipamentos navegação calibrados', 'Calibrações em dia', 'Registros atualizados', 'Equipamentos não calibrados', ARRAY['Certificados calibração'], 'SOLAS', 'major'),
  (4, 'Comunicações', 'Sistemas comunicação operacionais', 'Testes realizados', 'Redundância disponível', 'Comunicações falhas', ARRAY['Testes comunicação'], 'SOLAS', 'major'),
  (5, 'Gestão Energia', 'Sistema gestão energia eficiente', 'PMS configurado', 'Blackout prevention', 'Falhas energia', ARRAY['Configuração PMS'], 'Class', 'major'),
  (6, 'Eficiência Energética', 'Medidas eficiência implementadas', 'SEEMP atualizado', 'Metas definidas', 'Sem SEEMP', ARRAY['SEEMP'], 'MARPOL', 'minor'),
  (7, 'Emissões GEE', 'Controle emissões gases efeito estufa', 'Inventário GEE', 'Relatórios IMO DCS', 'Sem controle', ARRAY['IMO DCS report'], 'IMO', 'minor'),
  (8, 'Lastro', 'Sistema lastro conforme BWM', 'BWMP implementado', 'Tratamento funcionando', 'BWM não conforme', ARRAY['BWMP', 'Log lastro'], 'BWM Convention', 'major'),
  (9, 'Automação', 'Sistemas automação funcionais', 'Testes realizados', 'Alarmes configurados', 'Automação falha', ARRAY['Teste automação'], 'Class', 'major'),
  (10, 'Cyber Security', 'Segurança cibernética implementada', 'Plano cyber security', 'Atualizações em dia', 'Vulnerabilidades', ARRAY['Cyber security plan'], 'IMO MSC.428(98)', 'major')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 5
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 6 - Manutenção e Confiabilidade (MN) - 12 itens críticos
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'PMS Implementado', 'Sistema manutenção planejada operacional', 'PMS atualizado', 'Jobs executados conforme plano', 'PMS desatualizado', ARRAY['Relatório PMS'], 'ISM Code 10', 'critical'),
  (2, 'Manutenção Crítica', 'Equipamentos críticos com plano específico', 'Lista críticos definida', 'Manutenção em dia', 'Atrasos manutenção crítica', ARRAY['Plano manutenção críticos'], 'Class', 'critical'),
  (3, 'Sobressalentes', 'Estoque sobressalentes críticos adequado', 'Lista mínima definida', 'Estoque conforme', 'Falta sobressalentes', ARRAY['Lista sobressalentes'], 'ISM Code 10.3', 'major'),
  (4, 'Indicadores', 'KPIs manutenção monitorados', 'MTBF/MTTR definidos', 'Tendências analisadas', 'Sem indicadores', ARRAY['Dashboard KPIs'], 'IMCA', 'minor'),
  (5, 'Backlog', 'Backlog de manutenção controlado', 'Meta backlog definida', 'Backlog dentro meta', 'Backlog excessivo', ARRAY['Relatório backlog'], 'ISM Code', 'major'),
  (6, 'Docagem', 'Plano docagem atualizado', 'Próxima docagem planejada', 'Escopo definido', 'Docagem atrasada', ARRAY['Plano docagem'], 'Class', 'major'),
  (7, 'Certificados Classe', 'Certificados de classe válidos', 'Survey em dia', 'Condições atendidas', 'Certificados vencidos', ARRAY['Certificados classe'], 'Class', 'critical'),
  (8, 'Calibração', 'Instrumentos calibrados', 'Plano calibração', 'Certificados válidos', 'Calibrações vencidas', ARRAY['Certificados calibração'], 'ISO 17025', 'major'),
  (9, 'Qualidade Combustível', 'Qualidade combustível monitorada', 'Análises realizadas', 'Parâmetros conformes', 'Combustível fora spec', ARRAY['Análises combustível'], 'ISO 8217', 'major'),
  (10, 'Lubrificantes', 'Análise lubrificantes periódica', 'Programa análise óleo', 'Tendências monitoradas', 'Sem análise óleo', ARRAY['Relatórios análise'], 'IMCA', 'minor'),
  (11, 'Manutenção Corretiva', 'Corretivas analisadas e registradas', 'RCA para falhas críticas', 'Lições aprendidas', 'Falhas repetitivas', ARRAY['Relatórios RCA'], 'ISM Code', 'major'),
  (12, 'CMMS', 'Sistema informatizado funcionando', 'CMMS operacional', 'Dados confiáveis', 'CMMS não utilizado', ARRAY['Print CMMS'], 'Best practice', 'minor')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 6
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 7 - Gestão de Mudanças (GM) - 8 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Procedimento MOC', 'Procedimento de gestão mudanças', 'MOC documentado', 'Processo implementado', 'Sem procedimento MOC', ARRAY['Procedimento MOC'], 'ISM Code', 'major'),
  (2, 'Análise Riscos MOC', 'Análise de riscos em mudanças', 'Riscos avaliados', 'Mitigações definidas', 'Sem análise riscos', ARRAY['Formulário análise'], 'NR-37', 'major'),
  (3, 'Aprovações MOC', 'Níveis de aprovação definidos', 'Matriz aprovação', 'Aprovações registradas', 'Aprovações não seguidas', ARRAY['Registro aprovações'], 'ISM Code', 'major'),
  (4, 'Comunicação Mudanças', 'Comunicação de mudanças efetiva', 'Processo comunicação', 'Partes notificadas', 'Falhas comunicação', ARRAY['Evidência comunicação'], 'ISM Code', 'minor'),
  (5, 'Mudanças Temporárias', 'Controle mudanças temporárias', 'Registro temporários', 'Prazo definido', 'Temporários permanentes', ARRAY['Lista temporários'], 'NR-37', 'major'),
  (6, 'Mudanças Pessoal', 'Gestão mudanças de pessoal', 'Handover documentado', 'Treinamento realizado', 'Handover inadequado', ARRAY['Checklist handover'], 'STCW', 'major'),
  (7, 'Mudanças Documentos', 'Controle revisão documentos', 'Controle versões', 'Distribuição controlada', 'Documentos obsoletos', ARRAY['Lista mestra'], 'ISM Code 11', 'minor'),
  (8, 'Lições Aprendidas MOC', 'Lições de mudanças registradas', 'Banco lições', 'Consulta em novos MOC', 'Sem registro lições', ARRAY['Banco lições'], 'IMCA', 'minor')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 7
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 8 - Aquisição (AQ) - 8 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Qualificação Fornecedores', 'Processo qualificação implementado', 'Critérios definidos', 'Fornecedores qualificados', 'Sem qualificação', ARRAY['Lista qualificados'], 'ISM Code', 'major'),
  (2, 'Auditorias Fornecedores', 'Auditorias em fornecedores críticos', 'Plano auditorias', 'Auditorias realizadas', 'Sem auditorias', ARRAY['Relatórios auditoria'], 'IMCA', 'major'),
  (3, 'Especificações Técnicas', 'Especificações claras para compras', 'Specs documentadas', 'Requisitos definidos', 'Specs inadequadas', ARRAY['Especificações'], 'Best practice', 'minor'),
  (4, 'Recebimento Materiais', 'Inspeção recebimento implementada', 'Checklist inspeção', 'NC registradas', 'Sem inspeção', ARRAY['Checklist recebimento'], 'ISM Code', 'major'),
  (5, 'Certificados Materiais', 'Certificados de materiais verificados', 'Rastreabilidade', 'Certificados arquivados', 'Sem certificados', ARRAY['Certificados materiais'], 'Class', 'major'),
  (6, 'Avaliação Performance', 'Performance fornecedores avaliada', 'KPIs definidos', 'Avaliações periódicas', 'Sem avaliação', ARRAY['Avaliações'], 'IMCA', 'minor'),
  (7, 'Gestão Contratos', 'Contratos gerenciados adequadamente', 'SLAs definidos', 'Compliance monitorado', 'Contratos não gerenciados', ARRAY['Contratos'], 'Best practice', 'minor'),
  (8, 'Peças Genuínas', 'Uso de peças genuínas ou equivalentes aprovadas', 'Política documentada', 'Rastreabilidade', 'Peças não conformes', ARRAY['Política peças'], 'Class', 'major')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 8
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 9 - Gestão RH (RH) - 12 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Matriz STCW', 'Matriz de competências STCW atualizada', 'Matriz implementada', 'Certificados válidos', 'Certificados vencidos', ARRAY['Matriz STCW'], 'STCW', 'critical'),
  (2, 'Treinamentos Obrigatórios', 'Treinamentos obrigatórios em dia', 'Plano treinamento', 'Registros atualizados', 'Treinamentos atrasados', ARRAY['Registros treinamento'], 'STCW', 'critical'),
  (3, 'Familiarização', 'Familiarização bordo realizada', 'Checklist familiarização', 'Registros assinados', 'Sem familiarização', ARRAY['Checklist familiarização'], 'ISM Code 6', 'critical'),
  (4, 'CRM/BRM', 'Treinamento CRM/BRM realizado', 'Programa CRM', 'Tripulação treinada', 'Sem treinamento CRM', ARRAY['Certificados CRM'], 'STCW', 'major'),
  (5, 'Fatores Humanos', 'Programa fatores humanos', 'Treinamento FH', 'Awareness tripulação', 'Sem programa FH', ARRAY['Material FH'], 'IMCA 117', 'major'),
  (6, 'Fadiga', 'Gestão de fadiga implementada', 'Horas descanso controladas', 'Registros conformes', 'Violações descanso', ARRAY['Registros descanso'], 'MLC 2006', 'critical'),
  (7, 'Avaliação Competências', 'Competências avaliadas periodicamente', 'Matriz competências', 'Avaliações documentadas', 'Sem avaliações', ARRAY['Avaliações competência'], 'STCW', 'major'),
  (8, 'Simulador', 'Treinamento simulador realizado', 'Programa simulador', 'DP operators treinados', 'Sem simulador', ARRAY['Certificados simulador'], 'IMCA C 002', 'major'),
  (9, 'Exames Médicos', 'Exames médicos válidos', 'ASO em dia', 'Restrições documentadas', 'ASO vencidos', ARRAY['ASOs'], 'MLC 2006', 'critical'),
  (10, 'Drills', 'Exercícios emergência realizados', 'Plano drills', 'Registros drills', 'Drills atrasados', ARRAY['Registros drills'], 'SOLAS III', 'critical'),
  (11, 'Idioma', 'Comunicação em inglês adequada', 'Avaliação idioma', 'Tripulação qualificada', 'Barreira idioma', ARRAY['Certificados inglês'], 'STCW', 'major'),
  (12, 'Desenvolvimento', 'Plano desenvolvimento pessoal', 'PDI implementado', 'Progressão carreira', 'Sem desenvolvimento', ARRAY['PDIs'], 'Best practice', 'minor')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 9
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 10 - Gestão Informação (GI) - 7 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Controle Documentos', 'Sistema controle documentos implementado', 'Lista mestra', 'Versões controladas', 'Documentos obsoletos', ARRAY['Lista mestra docs'], 'ISM Code 11', 'major'),
  (2, 'Comunicação Interna', 'Canais comunicação definidos', 'Procedimento comunicação', 'Fluxo estabelecido', 'Falhas comunicação', ARRAY['Fluxo comunicação'], 'ISM Code', 'minor'),
  (3, 'Comunicação Externa', 'Comunicação externa controlada', 'Matriz stakeholders', 'Registros comunicação', 'Comunicação inadequada', ARRAY['Registros'], 'Best practice', 'minor'),
  (4, 'Ouvidoria', 'Canal ouvidoria disponível', 'Processo ouvidoria', 'Casos tratados', 'Sem canal ouvidoria', ARRAY['Registros ouvidoria'], 'NR-1', 'minor'),
  (5, 'Retenção Registros', 'Tempo retenção definido', 'Tabela temporalidade', 'Arquivos organizados', 'Retenção inadequada', ARRAY['Tabela temporalidade'], 'ISM Code 11', 'minor'),
  (6, 'Backup Dados', 'Backup dados realizado', 'Procedimento backup', 'Testes restore', 'Sem backup', ARRAY['Logs backup'], 'Best practice', 'major'),
  (7, 'LGPD', 'Conformidade LGPD implementada', 'Política privacidade', 'Dados protegidos', 'Não conformidade LGPD', ARRAY['Política LGPD'], 'LGPD', 'major')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 10
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 11 - Emergências (PE) - 10 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Plano Emergência', 'Plano emergência documentado', 'Plano atualizado', 'Cenários identificados', 'Plano desatualizado', ARRAY['Plano emergência'], 'ISM Code 8', 'critical'),
  (2, 'Muster List', 'Muster list atualizada e afixada', 'Muster list disponível', 'Funções definidas', 'Muster list desatualizada', ARRAY['Muster list'], 'SOLAS III', 'critical'),
  (3, 'Simulados', 'Simulados realizados conforme plano', 'Cronograma simulados', 'Registros disponíveis', 'Simulados atrasados', ARRAY['Registros simulados'], 'SOLAS III', 'critical'),
  (4, 'Equipamentos Emergência', 'Equipamentos emergência operacionais', 'Inspeções realizadas', 'Certificados válidos', 'Equipamentos não conformes', ARRAY['Inspeções equipamentos'], 'SOLAS', 'critical'),
  (5, 'Botes Salva-Vidas', 'Botes e balsas operacionais', 'Manutenção em dia', 'Testes realizados', 'Botes não operacionais', ARRAY['Certificados botes'], 'SOLAS III', 'critical'),
  (6, 'Incêndio', 'Sistema combate incêndio operacional', 'Inspeções em dia', 'Treinamento realizado', 'Sistema não conforme', ARRAY['Inspeções incêndio'], 'SOLAS II-2', 'critical'),
  (7, 'ICS', 'Incident Command System implementado', 'Funções ICS definidas', 'Treinamento ICS', 'ICS não implementado', ARRAY['Organograma ICS'], 'IMCA', 'major'),
  (8, 'Comunicação Emergência', 'Comunicação emergência testada', 'Lista contatos', 'Testes realizados', 'Comunicação falha', ARRAY['Lista contatos emergência'], 'ISM Code 8', 'major'),
  (9, 'SAR', 'Procedimentos SAR conhecidos', 'Contatos SAR', 'Treinamento SAR', 'SAR desconhecido', ARRAY['Procedimento SAR'], 'SOLAS', 'major'),
  (10, 'Oil Spill', 'SOPEP implementado', 'SOPEP disponível', 'Equipamentos prontos', 'SOPEP não implementado', ARRAY['SOPEP'], 'MARPOL', 'critical')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 11
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 12 - Análise Acidentes (AI) - 10 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Procedimento Investigação', 'Procedimento investigação documentado', 'Metodologia definida', 'Investigações realizadas', 'Sem procedimento', ARRAY['Procedimento investigação'], 'ISM Code 9', 'critical'),
  (2, 'Reporte Incidentes', 'Sistema reporte incidentes implementado', 'Canal reporte disponível', 'Reportes incentivados', 'Baixo reporte', ARRAY['Estatísticas reporte'], 'ISM Code 9', 'major'),
  (3, 'Classificação', 'Classificação incidentes padronizada', 'Matriz classificação', 'Classificação consistente', 'Classificação inadequada', ARRAY['Matriz classificação'], 'IOGP 621', 'major'),
  (4, 'RCA', 'Root Cause Analysis realizada', 'Metodologia RCA', 'Causas raiz identificadas', 'RCA superficial', ARRAY['Relatórios RCA'], 'IOGP 621', 'critical'),
  (5, 'Ações Corretivas', 'Ações corretivas implementadas', 'Plano ações', 'Eficácia verificada', 'Ações não implementadas', ARRAY['Plano ações'], 'ISM Code 9', 'critical'),
  (6, 'Prazos', 'Prazos investigação cumpridos', 'Prazos definidos', 'Investigações no prazo', 'Atrasos investigação', ARRAY['Controle prazos'], 'Petrobras', 'major'),
  (7, 'Lições Aprendidas', 'Lições aprendidas compartilhadas', 'Banco lições', 'Divulgação realizada', 'Lições não compartilhadas', ARRAY['Safety alerts'], 'IMCA', 'major'),
  (8, 'Tendências', 'Análise tendências realizada', 'Dashboard estatísticas', 'Tendências identificadas', 'Sem análise tendências', ARRAY['Relatório tendências'], 'ISM Code 9', 'minor'),
  (9, 'Near Miss', 'Near misses reportados e analisados', 'Programa near miss', 'Análises realizadas', 'Near miss não reportados', ARRAY['Estatísticas near miss'], 'IMCA', 'major'),
  (10, 'Indicadores Reativos', 'TRIR, LTIF monitorados', 'KPIs definidos', 'Metas estabelecidas', 'Indicadores altos', ARRAY['Dashboard KPIs'], 'IOGP', 'major')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 12
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Elemento 13 - Melhoria Contínua (MC) - 9 itens
INSERT INTO public.peotram_items_2024 (element_id, item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
SELECT e.id, v.item_number, v.item_name, v.description, v.requirement, v.verification_criteria_compliant, v.verification_criteria_non_compliant, v.evidence_required::text[], v.norm_reference, v.criticality_level
FROM public.peotram_elements_2024 e, (VALUES
  (1, 'Programa Auditorias', 'Programa auditorias internas implementado', 'Plano anual auditorias', 'Auditorias realizadas', 'Auditorias atrasadas', ARRAY['Plano auditorias'], 'ISM Code 12', 'major'),
  (2, 'Auditores Qualificados', 'Auditores internos qualificados', 'Treinamento auditores', 'Competência demonstrada', 'Auditores não qualificados', ARRAY['Certificados auditores'], 'ISO 19011', 'major'),
  (3, 'Não Conformidades', 'NC tratadas adequadamente', 'Procedimento NC', 'NC fechadas no prazo', 'NC abertas excessivas', ARRAY['Registro NC'], 'ISM Code 12', 'major'),
  (4, 'Ações Preventivas', 'Ações preventivas implementadas', 'Processo identificação', 'Ações documentadas', 'Sem ações preventivas', ARRAY['Registro ações'], 'ISM Code', 'minor'),
  (5, 'Análise Crítica', 'Análise crítica pela direção', 'Reuniões periódicas', 'Atas documentadas', 'Sem análise crítica', ARRAY['Atas análise crítica'], 'ISM Code 12', 'major'),
  (6, 'Metas SMS', 'Metas SMS definidas e monitoradas', 'Metas documentadas', 'Progresso monitorado', 'Metas não definidas', ARRAY['Metas SMS'], 'ISM Code', 'major'),
  (7, 'Benchmarking', 'Benchmarking realizado', 'Comparação setor', 'Melhores práticas', 'Sem benchmarking', ARRAY['Relatório benchmark'], 'Best practice', 'minor'),
  (8, 'Inovação SMS', 'Inovações SMS implementadas', 'Programa sugestões', 'Melhorias implementadas', 'Sem inovação', ARRAY['Registro melhorias'], 'Best practice', 'minor'),
  (9, 'Certificações', 'Certificações mantidas', 'ISO 14001, 45001', 'Auditorias externas', 'Certificações perdidas', ARRAY['Certificados ISO'], 'ISO', 'major')
) AS v(item_number, item_name, description, requirement, verification_criteria_compliant, verification_criteria_non_compliant, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = 13
ON CONFLICT (element_id, item_number) DO NOTHING;

-- Verificar inserção
SELECT e.element_number, e.element_sigla, COUNT(i.id) as total_itens 
FROM public.peotram_elements_2024 e 
LEFT JOIN public.peotram_items_2024 i ON e.id = i.element_id 
GROUP BY e.element_number, e.element_sigla 
ORDER BY e.element_number;
