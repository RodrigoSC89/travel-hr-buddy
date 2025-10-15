-- File: supabase/schema/workflow_ai_extension.sql
-- Extensão do módulo de Workflows com inteligência adaptativa
--
-- Este schema implementa sugestões de IA para o sistema de workflows,
-- permitindo que o Copilot analise atrasos, falhas e logs, e gere
-- recomendações inteligentes para melhorar a execução dos workflows.

-- ============================================================================
-- TABELA: workflow_ai_suggestions
-- ============================================================================
-- Armazena sugestões geradas pela IA para otimização de workflows
CREATE TABLE IF NOT EXISTS public.workflow_ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.smart_workflows(id) ON DELETE CASCADE,
    etapa TEXT,
    tipo_sugestao TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    gerada_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    gerada_por TEXT DEFAULT 'IA',
    criticidade TEXT,
    responsavel_sugerido TEXT,
    origem TEXT -- exemplo: 'MMI', 'Logs', 'Checklists', 'Manual'
);

-- ============================================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================================
-- Otimizam consultas por workflow_id, data de geração e tipo de sugestão
CREATE INDEX IF NOT EXISTS idx_workflow_ai_suggestions_workflow_id 
    ON public.workflow_ai_suggestions(workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_ai_suggestions_gerada_em 
    ON public.workflow_ai_suggestions(gerada_em DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_ai_suggestions_tipo_sugestao 
    ON public.workflow_ai_suggestions(tipo_sugestao);

-- ============================================================================
-- VIEW: workflow_ai_recent
-- ============================================================================
-- Retorna sugestões dos últimos 30 dias para análise rápida
CREATE OR REPLACE VIEW public.workflow_ai_recent AS
SELECT * FROM public.workflow_ai_suggestions
WHERE gerada_em > now() - INTERVAL '30 days'
ORDER BY gerada_em DESC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Habilita RLS para proteger dados sensíveis
ALTER TABLE public.workflow_ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem visualizar sugestões
CREATE POLICY "Authenticated users can view AI suggestions"
    ON public.workflow_ai_suggestions
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Sistema pode inserir sugestões (geradas pela IA)
CREATE POLICY "System can create AI suggestions"
    ON public.workflow_ai_suggestions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política: Usuários autenticados podem atualizar sugestões
CREATE POLICY "Authenticated users can update AI suggestions"
    ON public.workflow_ai_suggestions
    FOR UPDATE
    TO authenticated
    USING (true);

-- Política: Usuários autenticados podem deletar sugestões
CREATE POLICY "Authenticated users can delete AI suggestions"
    ON public.workflow_ai_suggestions
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- DOCUMENTAÇÃO DO PROMPT IA
-- ============================================================================
-- Como usar este schema com Copilot IA:
--
-- ENTRADAS PARA A IA:
-- -------------------
-- 1. Workflow: Nome e contexto do workflow (ex: "Revisão mensal de DP")
-- 2. Logs: Eventos e problemas detectados (ex: "Checklist incompleto - zona de 500m")
-- 3. Falhas recentes: Histórico de problemas similares (ex: "Gerador STBD apresentou falha semelhante em 3 navios")
-- 4. Prazos vencidos: Etapas em atraso (ex: "Etapa 'Verificação de sensores' 2 dias em atraso")
--
-- SAÍDAS ESPERADAS DA IA:
-- ----------------------
-- A IA deve responder com um ou mais dos seguintes tipos de sugestões:
--
-- tipo_sugestao possíveis:
--   - 'Criar tarefa': Nova tarefa sugerida para resolver um problema
--   - 'Ajustar prazo': Recomendação de alteração de deadline
--   - 'Trocar responsável': Sugestão de reatribuição de responsabilidade
--
-- origem possíveis:
--   - 'MMI': Insights do Maritime Management Information
--   - 'Logs': Análise de logs de sistema
--   - 'Checklists': Verificações de checklist
--   - 'Manual': Entrada manual do usuário
--
-- criticidade possíveis:
--   - 'baixa': Sugestão opcional
--   - 'média': Recomendação importante
--   - 'alta': Ação urgente necessária
--   - 'crítica': Requer atenção imediata
--
-- EXEMPLO DE USO:
-- --------------
-- Prompt para a IA:
-- "Analise o workflow 'Revisão mensal de DP' que está com a etapa 
--  'Verificação de sensores' 2 dias em atraso. Os logs mostram 
--  'Checklist incompleto - zona de 500m' e há falhas similares 
--  do Gerador STBD em 3 navios recentemente."
--
-- Resposta esperada da IA (será armazenada nesta tabela):
INSERT INTO public.workflow_ai_suggestions (
    workflow_id,
    etapa,
    tipo_sugestao,
    conteudo,
    criticidade,
    responsavel_sugerido,
    origem
) VALUES (
    'uuid-do-workflow',
    'Verificação de sensores',
    'Criar tarefa',
    'Verificar ASOG conforme item 3.2.1 - Zona de 500m requer inspeção completa devido às falhas recorrentes do Gerador STBD',
    'alta',
    'Oficial de Máquinas BB',
    'MMI'
);

-- As sugestões serão exibidas no Kanban do sistema para ação imediata
-- da equipe, permitindo melhor gestão proativa dos workflows.
