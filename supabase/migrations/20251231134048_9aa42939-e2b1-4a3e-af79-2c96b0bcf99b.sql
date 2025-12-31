-- Criar tabela de requisitos PEO-DP 2021
CREATE TABLE IF NOT EXISTS public.peodp_requirements_2021 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_number INTEGER NOT NULL,
  element_name TEXT NOT NULL,
  requirement_code TEXT NOT NULL,
  requirement_text TEXT NOT NULL,
  category TEXT,
  criticality TEXT DEFAULT 'medium',
  evidence_required TEXT[],
  verification_method TEXT,
  reference_document TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_peodp_requirements_element ON public.peodp_requirements_2021(element_number);
CREATE INDEX IF NOT EXISTS idx_peodp_requirements_criticality ON public.peodp_requirements_2021(criticality);

-- Habilitar RLS
ALTER TABLE public.peodp_requirements_2021 ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (requisitos são documentação pública)
CREATE POLICY "Anyone can read peodp requirements" ON public.peodp_requirements_2021
  FOR SELECT USING (true);

-- Inserir requisitos base dos 6 elementos PEO-DP
INSERT INTO public.peodp_requirements_2021 (element_number, element_name, requirement_code, requirement_text, category, criticality, evidence_required, verification_method) VALUES
-- Elemento 1: Sistema de Gestão de DP
(1, 'Sistema de Gestão de DP', 'PEO-DP-1.1', 'Estabelecer e manter sistema de gestão de DP documentado', 'Documentação', 'high', ARRAY['Manual DP', 'Procedimentos', 'Registros'], 'Análise documental'),
(1, 'Sistema de Gestão de DP', 'PEO-DP-1.2', 'Definir política de DP aprovada pela alta direção', 'Política', 'high', ARRAY['Política assinada', 'Comunicação'], 'Verificação de aprovação'),
(1, 'Sistema de Gestão de DP', 'PEO-DP-1.3', 'Estabelecer objetivos mensuráveis de DP', 'Objetivos', 'medium', ARRAY['Lista de objetivos', 'Indicadores'], 'Análise de metas'),
(1, 'Sistema de Gestão de DP', 'PEO-DP-1.4', 'Manter registros de operações DP', 'Registros', 'high', ARRAY['Logs operacionais', 'Relatórios'], 'Auditoria de registros'),

-- Elemento 2: Competência e Treinamento
(2, 'Competência e Treinamento', 'PEO-DP-2.1', 'Definir requisitos de competência para operadores DP', 'Competência', 'critical', ARRAY['Matriz de competência', 'Certificações'], 'Verificação de qualificações'),
(2, 'Competência e Treinamento', 'PEO-DP-2.2', 'Manter programa de treinamento contínuo', 'Treinamento', 'high', ARRAY['Plano de treinamento', 'Registros de participação'], 'Análise de programa'),
(2, 'Competência e Treinamento', 'PEO-DP-2.3', 'Realizar avaliações periódicas de competência', 'Avaliação', 'high', ARRAY['Resultados de avaliação', 'Ações corretivas'], 'Revisão de avaliações'),
(2, 'Competência e Treinamento', 'PEO-DP-2.4', 'Certificar operadores conforme IMCA/Nautical Institute', 'Certificação', 'critical', ARRAY['Certificados válidos', 'Renovações'], 'Verificação de certificados'),

-- Elemento 3: Planejamento de Operações
(3, 'Planejamento de Operações', 'PEO-DP-3.1', 'Realizar análise de risco pré-operacional (FMEA)', 'Risco', 'critical', ARRAY['FMEA documentada', 'Assinaturas'], 'Análise de FMEA'),
(3, 'Planejamento de Operações', 'PEO-DP-3.2', 'Definir critérios de aceitação ambiental', 'Ambiente', 'high', ARRAY['Limites operacionais', 'Previsões metocean'], 'Verificação de limites'),
(3, 'Planejamento de Operações', 'PEO-DP-3.3', 'Estabelecer procedimentos de contingência', 'Contingência', 'critical', ARRAY['Planos de contingência', 'Simulados'], 'Teste de procedimentos'),
(3, 'Planejamento de Operações', 'PEO-DP-3.4', 'Conduzir briefings pré-operacionais', 'Comunicação', 'high', ARRAY['Checklists de briefing', 'Registros'], 'Observação de briefings'),

-- Elemento 4: Execução de Operações
(4, 'Execução de Operações', 'PEO-DP-4.1', 'Monitorar continuamente sistemas DP durante operações', 'Monitoramento', 'critical', ARRAY['Logs de monitoramento', 'Alarmes'], 'Observação operacional'),
(4, 'Execução de Operações', 'PEO-DP-4.2', 'Manter comunicação efetiva com todas as partes', 'Comunicação', 'high', ARRAY['Protocolos de comunicação', 'Registros'], 'Verificação de protocolos'),
(4, 'Execução de Operações', 'PEO-DP-4.3', 'Aplicar procedimentos de watchkeeping', 'Vigilância', 'critical', ARRAY['Escalas de turno', 'Logs de troca'], 'Análise de turnos'),
(4, 'Execução de Operações', 'PEO-DP-4.4', 'Documentar todas as anomalias e incidentes', 'Documentação', 'high', ARRAY['Relatórios de incidente', 'Ações'], 'Revisão de relatórios'),

-- Elemento 5: Manutenção e Testes
(5, 'Manutenção e Testes', 'PEO-DP-5.1', 'Implementar programa de manutenção preventiva', 'Manutenção', 'high', ARRAY['Plano de manutenção', 'Registros'], 'Auditoria de manutenção'),
(5, 'Manutenção e Testes', 'PEO-DP-5.2', 'Realizar testes periódicos de sistemas DP', 'Testes', 'critical', ARRAY['Protocolos de teste', 'Resultados'], 'Verificação de testes'),
(5, 'Manutenção e Testes', 'PEO-DP-5.3', 'Conduzir Annual DP Trials', 'Trials', 'critical', ARRAY['Relatório de trials', 'Certificado'], 'Análise de trials'),
(5, 'Manutenção e Testes', 'PEO-DP-5.4', 'Manter inventário de spare parts críticos', 'Sobressalentes', 'high', ARRAY['Lista de spares', 'Níveis mínimos'], 'Verificação de estoque'),

-- Elemento 6: Melhoria Contínua
(6, 'Melhoria Contínua', 'PEO-DP-6.1', 'Realizar auditorias internas periódicas', 'Auditoria', 'high', ARRAY['Plano de auditoria', 'Relatórios'], 'Análise de auditorias'),
(6, 'Melhoria Contínua', 'PEO-DP-6.2', 'Investigar incidentes e near misses', 'Investigação', 'critical', ARRAY['Relatórios de investigação', 'RCA'], 'Revisão de investigações'),
(6, 'Melhoria Contínua', 'PEO-DP-6.3', 'Implementar ações corretivas efetivas', 'Correção', 'high', ARRAY['Plano de ação', 'Verificação eficácia'], 'Acompanhamento de ações'),
(6, 'Melhoria Contínua', 'PEO-DP-6.4', 'Revisar sistema de gestão periodicamente', 'Revisão', 'high', ARRAY['Atas de revisão', 'Decisões'], 'Análise de revisões')
ON CONFLICT DO NOTHING;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_peodp_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_peodp_requirements_timestamp ON public.peodp_requirements_2021;
CREATE TRIGGER update_peodp_requirements_timestamp
  BEFORE UPDATE ON public.peodp_requirements_2021
  FOR EACH ROW
  EXECUTE FUNCTION update_peodp_requirements_updated_at();