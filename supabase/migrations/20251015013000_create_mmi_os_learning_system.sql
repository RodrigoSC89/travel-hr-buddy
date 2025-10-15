-- ===========================
-- MMI OS LEARNING SYSTEM
-- Sistema de aprendizado de IA para Ordens de Serviço resolvidas
-- Permite que a IA sugira ações baseadas em histórico de resoluções efetivas
-- ===========================

-- Create mmi_jobs table (base para OS)
CREATE TABLE IF NOT EXISTS public.mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL, -- Ex: 'JOB-001'
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date DATE NOT NULL,
  component_name TEXT NOT NULL,
  asset_name TEXT,
  vessel_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mmi_os_resolvidas table (histórico de OS resolvidas para aprendizado IA)
CREATE TABLE IF NOT EXISTS public.mmi_os_resolvidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE CASCADE,
  os_id TEXT NOT NULL UNIQUE, -- Ex: 'OS-123456'
  componente TEXT NOT NULL,
  descricao_tecnica TEXT NOT NULL,
  acao_realizada TEXT NOT NULL,
  resolvido_em TIMESTAMP WITH TIME ZONE,
  duracao_execucao INTERVAL,
  efetiva BOOLEAN, -- NULL = não avaliado, TRUE = efetiva, FALSE = inefetiva
  causa_confirmada TEXT,
  evidencia_url TEXT,
  tecnico_responsavel TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mmi_os_resolvidas ENABLE ROW LEVEL SECURITY;

-- RLS Policies para mmi_jobs
CREATE POLICY "Allow read access to authenticated users on mmi_jobs"
  ON public.mmi_jobs 
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert access to authenticated users on mmi_jobs"
  ON public.mmi_jobs 
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access to authenticated users on mmi_jobs"
  ON public.mmi_jobs 
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies para mmi_os_resolvidas
CREATE POLICY "Allow read access to authenticated users on mmi_os_resolvidas"
  ON public.mmi_os_resolvidas 
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert access to authenticated users on mmi_os_resolvidas"
  ON public.mmi_os_resolvidas 
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access to authenticated users on mmi_os_resolvidas"
  ON public.mmi_os_resolvidas 
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Índices para busca eficiente
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_job_id ON public.mmi_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_component ON public.mmi_jobs(component_name);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_vessel ON public.mmi_jobs(vessel_name);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_status ON public.mmi_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_priority ON public.mmi_jobs(priority);

CREATE INDEX IF NOT EXISTS idx_os_resolvidas_componente ON public.mmi_os_resolvidas(componente);
CREATE INDEX IF NOT EXISTS idx_os_resolvidas_os_id ON public.mmi_os_resolvidas(os_id);
CREATE INDEX IF NOT EXISTS idx_os_resolvidas_efetiva ON public.mmi_os_resolvidas(efetiva) WHERE efetiva IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_os_resolvidas_resolvido_em ON public.mmi_os_resolvidas(resolvido_em DESC);
CREATE INDEX IF NOT EXISTS idx_os_resolvidas_job_id ON public.mmi_os_resolvidas(job_id);

-- View resumida para IA - somente OS efetivas avaliadas
CREATE OR REPLACE VIEW public.mmi_os_ia_feed AS
SELECT
  r.id,
  r.job_id,
  r.os_id,
  r.componente,
  r.descricao_tecnica,
  r.acao_realizada,
  r.causa_confirmada,
  r.efetiva,
  r.resolvido_em,
  r.duracao_execucao,
  EXTRACT(EPOCH FROM r.duracao_execucao)/3600 as duracao_horas, -- Duração em horas
  j.vessel_name,
  j.asset_name,
  j.priority
FROM public.mmi_os_resolvidas r
LEFT JOIN public.mmi_jobs j ON r.job_id = j.id
WHERE r.efetiva IS NOT NULL -- Apenas OS já avaliadas
ORDER BY r.resolvido_em DESC;

-- View de estatísticas por componente (para análise da IA)
CREATE OR REPLACE VIEW public.mmi_os_stats_by_component AS
SELECT
  componente,
  COUNT(*) as total_ocorrencias,
  COUNT(*) FILTER (WHERE efetiva = true) as resolucoes_efetivas,
  COUNT(*) FILTER (WHERE efetiva = false) as resolucoes_inefetivas,
  ROUND(
    (COUNT(*) FILTER (WHERE efetiva = true)::numeric / NULLIF(COUNT(*), 0) * 100), 
    2
  ) as taxa_eficacia_pct,
  AVG(EXTRACT(EPOCH FROM duracao_execucao)/3600) FILTER (WHERE efetiva = true) as media_duracao_horas_efetivas,
  MIN(EXTRACT(EPOCH FROM duracao_execucao)/3600) FILTER (WHERE efetiva = true) as min_duracao_horas,
  MAX(EXTRACT(EPOCH FROM duracao_execucao)/3600) FILTER (WHERE efetiva = true) as max_duracao_horas,
  array_agg(DISTINCT acao_realizada) FILTER (WHERE efetiva = true) as acoes_efetivas_unicas
FROM public.mmi_os_resolvidas
WHERE efetiva IS NOT NULL
GROUP BY componente
ORDER BY total_ocorrencias DESC, taxa_eficacia_pct DESC;

-- Função para buscar OS similares (para uso da IA)
CREATE OR REPLACE FUNCTION public.get_similar_os_resolutions(
  p_componente TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  os_id TEXT,
  componente TEXT,
  descricao_tecnica TEXT,
  acao_realizada TEXT,
  causa_confirmada TEXT,
  efetiva BOOLEAN,
  duracao_horas NUMERIC,
  resolvido_em TIMESTAMP WITH TIME ZONE,
  vessel_name TEXT,
  taxa_eficacia_componente NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.os_id,
    r.componente,
    r.descricao_tecnica,
    r.acao_realizada,
    r.causa_confirmada,
    r.efetiva,
    ROUND(EXTRACT(EPOCH FROM r.duracao_execucao)/3600::numeric, 2) as duracao_horas,
    r.resolvido_em,
    j.vessel_name,
    s.taxa_eficacia_pct as taxa_eficacia_componente
  FROM public.mmi_os_resolvidas r
  LEFT JOIN public.mmi_jobs j ON r.job_id = j.id
  LEFT JOIN public.mmi_os_stats_by_component s ON r.componente = s.componente
  WHERE 
    r.componente ILIKE '%' || p_componente || '%'
    AND r.efetiva = true
  ORDER BY 
    r.resolvido_em DESC,
    s.taxa_eficacia_pct DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add table comments
COMMENT ON TABLE public.mmi_jobs IS 'Tabela base de jobs de manutenção MMI (Manutenção e Melhoria Industrial)';
COMMENT ON TABLE public.mmi_os_resolvidas IS 'Histórico de Ordens de Serviço resolvidas para aprendizado da IA Copilot';
COMMENT ON VIEW public.mmi_os_ia_feed IS 'Feed otimizado para consulta da IA Copilot - apenas OS avaliadas';
COMMENT ON VIEW public.mmi_os_stats_by_component IS 'Estatísticas agregadas por componente para análise de eficácia';
COMMENT ON FUNCTION public.get_similar_os_resolutions IS 'Busca OS resolvidas similares por componente para sugestões da IA';

-- Add column comments para mmi_jobs
COMMENT ON COLUMN public.mmi_jobs.id IS 'UUID único do job';
COMMENT ON COLUMN public.mmi_jobs.job_id IS 'Identificador externo do job (ex: JOB-001)';
COMMENT ON COLUMN public.mmi_jobs.title IS 'Título/descrição do job de manutenção';
COMMENT ON COLUMN public.mmi_jobs.status IS 'Status atual do job (Pendente, Em andamento, Concluído, etc)';
COMMENT ON COLUMN public.mmi_jobs.priority IS 'Prioridade (Baixa, Média, Alta, Crítica)';
COMMENT ON COLUMN public.mmi_jobs.component_name IS 'Nome do componente que requer manutenção';
COMMENT ON COLUMN public.mmi_jobs.vessel_name IS 'Nome da embarcação/navio';

-- Add column comments para mmi_os_resolvidas
COMMENT ON COLUMN public.mmi_os_resolvidas.id IS 'UUID único da OS resolvida';
COMMENT ON COLUMN public.mmi_os_resolvidas.job_id IS 'Referência ao job original que gerou a OS';
COMMENT ON COLUMN public.mmi_os_resolvidas.os_id IS 'Identificador único da Ordem de Serviço (ex: OS-123456)';
COMMENT ON COLUMN public.mmi_os_resolvidas.componente IS 'Componente que foi trabalhado (para busca da IA)';
COMMENT ON COLUMN public.mmi_os_resolvidas.descricao_tecnica IS 'Descrição técnica detalhada do problema';
COMMENT ON COLUMN public.mmi_os_resolvidas.acao_realizada IS 'Ação/procedimento realizado para resolver o problema';
COMMENT ON COLUMN public.mmi_os_resolvidas.efetiva IS 'Indica se a ação foi efetiva (NULL=não avaliado, TRUE=efetiva, FALSE=inefetiva)';
COMMENT ON COLUMN public.mmi_os_resolvidas.causa_confirmada IS 'Causa raiz confirmada do problema';
COMMENT ON COLUMN public.mmi_os_resolvidas.duracao_execucao IS 'Tempo total de execução da ação';
COMMENT ON COLUMN public.mmi_os_resolvidas.evidencia_url IS 'Link para evidências/fotos/documentos da resolução';

-- Insert sample data para demonstração
INSERT INTO public.mmi_jobs (job_id, title, status, priority, due_date, component_name, asset_name, vessel_name, description)
VALUES 
  ('JOB-001', 'Manutenção preventiva do sistema hidráulico', 'Concluído', 'Alta', '2025-10-20', 'Sistema Hidráulico Principal', 'Bomba Hidráulica #3', 'Navio Oceanic Explorer', 'Manutenção preventiva programada'),
  ('JOB-002', 'Inspeção de válvulas de segurança', 'Concluído', 'Crítica', '2025-10-16', 'Sistema de Segurança', 'Válvulas de Alívio - Deck Principal', 'Navio Atlantic Star', 'Inspeção obrigatória de segurança'),
  ('JOB-003', 'Troca de filtros do motor principal', 'Concluído', 'Média', '2025-10-25', 'Motor Principal', 'Filtros de Óleo ME-4500', 'Navio Pacific Voyager', 'Troca periódica de filtros'),
  ('JOB-004', 'Reparo em válvula de controle hidráulico', 'Concluído', 'Alta', '2025-09-15', 'Válvula de Controle Hidráulico', 'Válvula Proporcional V-450', 'Navio Atlantic Star', 'Falha em válvula de controle')
ON CONFLICT (job_id) DO NOTHING;

-- Insert sample OS resolvidas (histórico para IA aprender)
INSERT INTO public.mmi_os_resolvidas (
  job_id, 
  os_id, 
  componente, 
  descricao_tecnica, 
  acao_realizada, 
  resolvido_em, 
  duracao_execucao, 
  efetiva, 
  causa_confirmada,
  tecnico_responsavel
)
SELECT 
  j.id,
  'OS-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  j.component_name,
  CASE 
    WHEN j.job_id = 'JOB-001' THEN 'Vazamento na junta da bomba hidráulica principal. Pressão caindo de 180 bar para 120 bar em operação contínua.'
    WHEN j.job_id = 'JOB-002' THEN 'Válvula de alívio #2 com leitura de pressão 15% acima do setpoint. Risco de falha no sistema de segurança.'
    WHEN j.job_id = 'JOB-003' THEN 'Filtros de óleo do motor principal com saturação em 85%. Necessária troca preventiva.'
    WHEN j.job_id = 'JOB-004' THEN 'Válvula proporcional não responde corretamente aos comandos. Falha intermitente no controle de posição.'
  END,
  CASE 
    WHEN j.job_id = 'JOB-001' THEN 'Substituição completa da junta de vedação e verificação de alinhamento do eixo. Teste de pressão realizado com sucesso.'
    WHEN j.job_id = 'JOB-002' THEN 'Substituição da válvula de alívio #2 e recalibração completa do sistema de segurança. Testes funcionais OK.'
    WHEN j.job_id = 'JOB-003' THEN 'Troca dos 3 filtros de óleo e análise laboratorial do óleo descartado. Nível de contaminação dentro do esperado.'
    WHEN j.job_id = 'JOB-004' THEN 'Substituição da válvula proporcional e recalibração da linha hidráulica. Limpeza do circuito de controle.'
  END,
  CASE 
    WHEN j.job_id = 'JOB-001' THEN NOW() - INTERVAL '45 days'
    WHEN j.job_id = 'JOB-002' THEN NOW() - INTERVAL '30 days'
    WHEN j.job_id = 'JOB-003' THEN NOW() - INTERVAL '20 days'
    WHEN j.job_id = 'JOB-004' THEN NOW() - INTERVAL '60 days'
  END,
  CASE 
    WHEN j.job_id = 'JOB-001' THEN INTERVAL '2 hours 30 minutes'
    WHEN j.job_id = 'JOB-002' THEN INTERVAL '3 hours 20 minutes'
    WHEN j.job_id = 'JOB-003' THEN INTERVAL '1 hour 45 minutes'
    WHEN j.job_id = 'JOB-004' THEN INTERVAL '4 hours 15 minutes'
  END,
  true, -- Todas marcadas como efetivas
  CASE 
    WHEN j.job_id = 'JOB-001' THEN 'Desgaste natural da junta após 2500 horas de operação'
    WHEN j.job_id = 'JOB-002' THEN 'Falha no mecanismo interno da válvula devido a fadiga do material'
    WHEN j.job_id = 'JOB-003' THEN 'Saturação normal dos filtros conforme programação de manutenção'
    WHEN j.job_id = 'JOB-004' THEN 'Contaminação no óleo hidráulico causando travamento do spool da válvula'
  END,
  CASE 
    WHEN j.job_id = 'JOB-001' THEN 'Técnico João Silva'
    WHEN j.job_id = 'JOB-002' THEN 'Técnico Maria Santos'
    WHEN j.job_id = 'JOB-003' THEN 'Técnico Pedro Oliveira'
    WHEN j.job_id = 'JOB-004' THEN 'Técnico Maria Santos'
  END
FROM public.mmi_jobs j
WHERE j.job_id IN ('JOB-001', 'JOB-002', 'JOB-003', 'JOB-004')
ON CONFLICT (os_id) DO NOTHING;

-- Adicionar mais registros de OS similares para enriquecer o dataset de aprendizado
INSERT INTO public.mmi_os_resolvidas (
  os_id, 
  componente, 
  descricao_tecnica, 
  acao_realizada, 
  resolvido_em, 
  duracao_execucao, 
  efetiva, 
  causa_confirmada,
  tecnico_responsavel
)
VALUES 
  (
    'OS-000005',
    'Válvula de Controle Hidráulico',
    'Válvula de controle apresentando resposta lenta aos comandos. Delay de 2-3 segundos nas mudanças de posição.',
    'Substituição da válvula e recalibração da linha hidráulica. Verificação de contaminação no óleo.',
    NOW() - INTERVAL '90 days',
    INTERVAL '3 hours 45 minutes',
    true,
    'Desgaste interno do carretel da válvula causado por contaminação',
    'Técnico Carlos Mendes'
  ),
  (
    'OS-000006',
    'Válvula de Controle Hidráulico',
    'Falha completa na válvula de controle. Sistema não responde aos comandos.',
    'Tentativa de limpeza e recalibração - sem sucesso. Substituição da válvula necessária.',
    NOW() - INTERVAL '120 days',
    INTERVAL '5 hours 30 minutes',
    false,
    'Falha eletrônica no solenóide - limpeza não resolveu',
    'Técnico Ana Costa'
  ),
  (
    'OS-000007',
    'Válvula de Controle Hidráulico',
    'Válvula com vazamento externo visível. Perda de óleo hidráulico.',
    'Substituição da válvula e recalibração da linha. Verificação de todos os selos do sistema.',
    NOW() - INTERVAL '150 days',
    INTERVAL '3 hours 15 minutes',
    true,
    'Falha nos O-rings devido a temperatura excessiva',
    'Técnico Maria Santos'
  ),
  (
    'OS-000008',
    'Motor Principal',
    'Queda de pressão no sistema de lubrificação do motor. Pressão abaixo do normal.',
    'Troca de filtros e bomba de óleo auxiliar. Verificação completa do sistema de lubrificação.',
    NOW() - INTERVAL '75 days',
    INTERVAL '6 hours',
    true,
    'Filtros saturados e bomba auxiliar com desgaste',
    'Técnico João Silva'
  )
ON CONFLICT (os_id) DO NOTHING;
