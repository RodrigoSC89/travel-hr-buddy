-- =====================================================
-- PEOTRAM 2024 - SQL DE INSERÇÃO DOS ITENS (PARTE 1)
-- Elementos 1-6 (~60 itens)
-- =====================================================

-- INSERIR ITENS DOS ELEMENTOS 1-6
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
  -- ELEMENTO 1 - Liderança (6 itens)
  (1, '1.1.1', 'Compromisso SMS', 'Alta administração demonstra compromisso em SMS', 'Entrevistas e atribuições', ARRAY['Entrevistas', 'Auditorias'], 'ISM Code 3', 'major'),
  (1, '1.1.2', 'Estrutura organizacional', 'Setores de Operação/Manutenção/RH/SMS estruturados', 'Organograma e matriz', ARRAY['Organograma', 'Matriz RACI'], 'ISM Code 3', 'major'),
  (1, '1.2.1', 'Normas NRs', 'Sistemática para especificações de normas', 'ISM Code, IMCA, NRs', ARRAY['Procedimentos', 'Lista NRs'], 'NR-34', 'major'),
  (1, '1.2.2', 'Responsáveis legais', 'PLH e DPA designados', 'Carta de designação', ARRAY['Carta', 'ART'], 'ISM Code', 'major'),
  (1, '1.2.3', 'Redução GEE', 'Compromisso com redução de emissões', 'Ações e indicadores', ARRAY['Indicadores', 'Plano'], 'ISO 14064', 'minor'),
  (1, '1.3.1', 'Indicadores SMS', 'Indicadores e metas estabelecidos', 'TAR, TOR, TFCA, TG', ARRAY['Dashboard', 'Relatórios'], 'ISM Code', 'major'),
  
  -- ELEMENTO 2 - Conformidade Legal (15 itens)
  (2, '2.1.1', 'Sistema requisitos legais', 'Identificação e atualização de legislação', 'Lista ou Software', ARRAY['Sistema', 'Lista'], 'NORMAM', 'critical'),
  (2, '2.1.2', 'Grupo de inspeção', 'Grupo interno de auditoria', 'Cronograma e relatórios', ARRAY['Cronograma', 'Qualificação'], 'ISM Code', 'major'),
  (2, '2.2.1', 'PLH NR-34', 'Profissional designado NR-34', 'Evidências de designação', ARRAY['Carta', 'ART'], 'NR-34', 'critical'),
  (2, '2.2.2', 'Capacitação NR-34', 'Profissionais capacitados', 'Registros de treinamento', ARRAY['Certificados', 'Lista presença'], 'NR-34', 'major'),
  (2, '2.2.3', 'Documentações NR-34', 'Documentações disponíveis', 'Permissões para Trabalho', ARRAY['PT', 'Registros'], 'NR-34', 'major'),
  (2, '2.2.4', 'Trabalhos a quente', 'Conformes com 34.5', 'Registros', ARRAY['PT quente', 'Registros'], 'NR-34', 'critical'),
  (2, '2.2.5', 'Trabalhos em altura', 'Conformes com 34.6', 'Registros', ARRAY['PT altura', 'Registros'], 'NR-34', 'critical'),
  (2, '2.3.1', 'PLH NR-12', 'PLH designado e atuante', 'ART recolhida', ARRAY['ART', 'Designação'], 'NR-12', 'major'),
  (2, '2.3.2', 'Arranjo físico NR-12', 'Arranjo conforme', 'Relatórios e fotos', ARRAY['Fotos', 'Relatório'], 'NR-12', 'major'),
  (2, '2.6.1', 'STCW 95', 'Implementado', 'Procedimento e registros', ARRAY['Certificados', 'Registros'], 'STCW 95', 'critical'),
  (2, '2.6.2', 'ISM Code', 'DOC e SMC válidos', 'DOC e SMC', ARRAY['DOC', 'SMC'], 'ISM Code', 'critical'),
  (2, '2.6.3', 'SOLAS', 'Certificados válidos', 'Certificados', ARRAY['Certificados', 'Vistorias'], 'SOLAS', 'critical'),
  (2, '2.6.6', 'IMCA 103', 'Embarcações DP', 'Procedimentos DP', ARRAY['Manual DP', 'Registros'], 'IMCA 103', 'major'),
  (2, '2.6.7', 'IMCA 117', 'Pessoal DP qualificado', 'Log Book', ARRAY['Log Book', 'Certificados'], 'IMCA 117', 'major'),
  
  -- ELEMENTO 3 - Gestão de Riscos (6 itens)
  (3, '3.1.1', 'Identificação perigos', 'Processo estruturado', 'Procedimento e relatórios', ARRAY['Procedimento', 'Análises'], 'ISM Code 1.2.2', 'major'),
  (3, '3.1.3', 'Técnicas de risco', 'HAZOP, FMEA, HAZID', 'Estudos e relatórios', ARRAY['Estudos', 'Relatórios'], 'NR-37', 'major'),
  (3, '3.1.4', 'Matriz Tolerabilidade', 'Conforme N-2782', 'Matriz aplicada', ARRAY['Matriz', 'Registros'], 'N-2782', 'major'),
  (3, '3.1.11', 'Cenários de risco', 'Abalroamento, incêndio, naufrágio', 'Cenários abrangentes', ARRAY['Cenários', 'Análises'], 'ISM Code', 'critical'),
  (3, '3.2.1', 'Ações mitigação', 'Barreiras íntegras', 'Verificação em campo', ARRAY['Verificação', 'Registros'], 'NR-37', 'major'),
  (3, '3.2.2', 'Hierarquia controles', 'Eliminação, substituição, engenharia', 'Hierarquia aplicada', ARRAY['Procedimentos', 'Evidências'], 'NR-37', 'major'),
  
  -- ELEMENTO 4 - Operação (10 itens)
  (4, '4.1.1', 'Equipamentos críticos', 'Gestão de equipamentos', 'Lista e análise', ARRAY['Lista', 'Análise'], 'ISM Code', 'critical'),
  (4, '4.1.2', 'VCP', 'Verificação Conformidade Procedimentos', 'Lista padrões críticos', ARRAY['VCP', 'Cronograma'], 'ISM Code', 'major'),
  (4, '4.1.3', 'Operações críticas', 'Atracação, zona 500m, DP', 'Procedimentos', ARRAY['Procedimentos', 'Registros'], 'ISM Code', 'critical'),
  (4, '4.1.4', 'Zona 500 metros', 'Procedimento operacional', 'Diário de bordo', ARRAY['Diário', 'Procedimento'], 'NORMAM', 'critical'),
  (4, '4.1.7', 'Permissões PT', 'PT emitidas conformes', 'NRs aplicáveis', ARRAY['PT', 'Registros'], 'NR-34', 'critical'),
  (4, '4.2.1', 'Transferência pessoas', 'Conforme NR-37', 'Procedimentos', ARRAY['Procedimento', 'Registros'], 'NR-37', 'critical'),
  (4, '4.3.2', 'Granéis poluentes', 'Bandeja e SOPEP', 'Kit SOPEP', ARRAY['SOPEP', 'Equipamentos'], 'MARPOL', 'major'),
  (4, '4.6.5', 'Equipamentos içamento', 'SWL certificado', 'Certificados válidos', ARRAY['Certificados', 'Inspeção'], 'SOLAS', 'critical'),
  (4, '4.6.6', 'Acessórios içamento', 'Eslingas e correntes', 'Certificados', ARRAY['Certificados', 'Inspeção'], 'SOLAS', 'major'),
  (4, '4.6.7', 'Inspeção guindastes', 'Inspeção periódica', 'Registros', ARRAY['Registros', 'Certificados'], 'NR-11', 'major'),
  
  -- ELEMENTO 5 - Segurança Técnica (8 itens)
  (5, '5.1.1', 'Pessoal navegação', 'Qualificado', 'Designação', ARRAY['Certificados', 'Designação'], 'STCW', 'major'),
  (5, '5.1.3', 'BRM', 'Bridge Resource Management', 'STCW', ARRAY['Certificados BRM', 'Registros'], 'STCW', 'major'),
  (5, '5.2.1', 'Departamento DP', 'Estruturado IMCA 117', 'Organograma', ARRAY['Organograma', 'Qualificações'], 'IMCA 117', 'critical'),
  (5, '5.2.2', 'Manual DP', 'Manuais de operações', 'Todas embarcações', ARRAY['Manuais', 'Aprovações'], 'IMCA 103', 'critical'),
  (5, '5.2.4', 'CAM ASOG', 'Por operação', 'Conjunto específico', ARRAY['CAM', 'ASOG'], 'IMCA 103', 'critical'),
  (5, '5.2.8', 'FMEA Trials', 'FMEA e DP Annual Trials', 'Gestão de NC', ARRAY['FMEA', 'Trials'], 'Class', 'critical'),
  (5, '5.3.1', 'GEE ISO 14064', 'Inventário de emissões', 'Verificação', ARRAY['Inventário', 'Verificação'], 'ISO 14064', 'minor'),
  (5, '5.3.4', 'Redução CO2', 'Medidas técnicas', 'Implementação', ARRAY['Procedimentos', 'Resultados'], 'ISO 14064', 'minor'),
  
  -- ELEMENTO 6 - Manutenção (8 itens)
  (6, '6.1.1', 'PMS', 'Sistema manutenção planejado', 'Sistema e inventário', ARRAY['PMS', 'Inventário'], 'ISM Code 10', 'critical'),
  (6, '6.1.2', 'Estrutura manutenção', 'Gestão de Manutenção', 'Organograma', ARRAY['Organograma', 'Processos'], 'ISM Code 10', 'major'),
  (6, '6.1.5', 'Sistema informatizado', 'Software de manutenção', 'Demonstração', ARRAY['Sistema', 'Demonstração'], 'ISM Code 10', 'major'),
  (6, '6.1.7', 'Indicadores manutenção', 'Performance e confiabilidade', 'Metas', ARRAY['Dashboard', 'Relatórios'], 'ISM Code 10', 'major'),
  (6, '6.1.8', 'Plano preventiva', 'Preventiva e corretiva', 'Registros', ARRAY['Plano', 'Registros'], 'NR-12', 'major'),
  (6, '6.1.10', 'Elementos críticos', 'Manutenção NORMAM 01', 'Procedimentos', ARRAY['Procedimentos', 'Registros'], 'NORMAM 01', 'critical'),
  (6, '6.1.12', 'Manutenção DP', 'Sistema DP', 'Plano específico', ARRAY['Plano DP', 'Registros'], 'IMCA', 'critical'),
  (6, '6.1.22', 'Defeitos críticos', 'Comunicação terra-bordo', 'Procedimento', ARRAY['Procedimento', 'Registros'], 'ISM Code', 'critical')
) AS i(elem_num, item_number, item_name, description, requirement, evidence_required, norm_reference, criticality_level)
WHERE e.element_number = i.elem_num
ON CONFLICT DO NOTHING;
