-- ============================================================================
-- TABELA: mmi_maintenance_jobs (tabela base para MMI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mmi_maintenance_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    component_id TEXT,
    component_name TEXT,
    job_type TEXT DEFAULT 'corrective',
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    vessel_id UUID REFERENCES public.vessels(id),
    organization_id UUID REFERENCES public.organizations(id),
    scheduled_date DATE,
    completed_date DATE,
    estimated_hours NUMERIC,
    actual_hours NUMERIC,
    embedding vector(1536),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_maintenance_jobs
CREATE INDEX IF NOT EXISTS idx_mmi_maintenance_jobs_status ON public.mmi_maintenance_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_maintenance_jobs_vessel ON public.mmi_maintenance_jobs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mmi_maintenance_jobs_org ON public.mmi_maintenance_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_mmi_maintenance_jobs_created ON public.mmi_maintenance_jobs(created_at DESC);

-- RLS para mmi_maintenance_jobs
ALTER TABLE public.mmi_maintenance_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance jobs" ON public.mmi_maintenance_jobs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert maintenance jobs" ON public.mmi_maintenance_jobs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update maintenance jobs" ON public.mmi_maintenance_jobs
    FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- TABELA: mmi_os_resolvidas
-- Armazena OS resolvidas para aprendizado do MMI Copilot
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mmi_os_resolvidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.mmi_maintenance_jobs(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    componente_id TEXT,
    componente_nome TEXT,
    acao_tomada TEXT NOT NULL,
    resultado TEXT,
    tempo_resolucao_horas NUMERIC,
    custo_estimado NUMERIC,
    tecnico_responsavel TEXT,
    resolvido_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolvido_por UUID REFERENCES auth.users(id),
    embedding vector(1536),
    tags TEXT[],
    criticidade TEXT DEFAULT 'media',
    origem TEXT DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_os_resolvidas
CREATE INDEX IF NOT EXISTS idx_mmi_os_resolvidas_job_id ON public.mmi_os_resolvidas(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_os_resolvidas_componente_id ON public.mmi_os_resolvidas(componente_id);
CREATE INDEX IF NOT EXISTS idx_mmi_os_resolvidas_resolvido_em ON public.mmi_os_resolvidas(resolvido_em DESC);

-- RLS para mmi_os_resolvidas
ALTER TABLE public.mmi_os_resolvidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view OS resolvidas" ON public.mmi_os_resolvidas
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert OS resolvidas" ON public.mmi_os_resolvidas
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update OS resolvidas" ON public.mmi_os_resolvidas
    FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- TABELA: forecast_history
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forecast_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL,
    forecast_type TEXT NOT NULL,
    prediction_date DATE NOT NULL,
    target_date DATE NOT NULL,
    predicted_value NUMERIC NOT NULL,
    actual_value NUMERIC,
    confidence_level NUMERIC,
    accuracy_score NUMERIC,
    model_used TEXT,
    parameters JSONB DEFAULT '{}',
    context_data JSONB DEFAULT '{}',
    organization_id UUID REFERENCES public.organizations(id),
    vessel_id UUID REFERENCES public.vessels(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    validated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_forecast_history_module ON public.forecast_history(module_name);
CREATE INDEX IF NOT EXISTS idx_forecast_history_dates ON public.forecast_history(prediction_date, target_date);

ALTER TABLE public.forecast_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view forecasts" ON public.forecast_history
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert forecasts" ON public.forecast_history
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- TABELA: ia_performance_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ia_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    cpu_usage_percent NUMERIC,
    memory_used_mb NUMERIC,
    tokens_used INTEGER,
    model_used TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ia_performance_log_module ON public.ia_performance_log(module_name);
CREATE INDEX IF NOT EXISTS idx_ia_performance_log_created ON public.ia_performance_log(created_at DESC);

ALTER TABLE public.ia_performance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view IA performance" ON public.ia_performance_log
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert IA performance" ON public.ia_performance_log
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- TABELA: ia_suggestions_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ia_suggestions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_type TEXT NOT NULL,
    suggestion_text TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    confidence_score NUMERIC,
    accepted BOOLEAN DEFAULT false,
    accepted_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    category TEXT,
    impact_level TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ia_suggestions_log_type ON public.ia_suggestions_log(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ia_suggestions_log_created ON public.ia_suggestions_log(created_at DESC);

ALTER TABLE public.ia_suggestions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view IA suggestions" ON public.ia_suggestions_log
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert IA suggestions" ON public.ia_suggestions_log
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update IA suggestions" ON public.ia_suggestions_log
    FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- TABELA: ia_adoption_metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ia_adoption_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    module_name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_interactions INTEGER DEFAULT 0,
    accepted_suggestions INTEGER DEFAULT 0,
    rejected_suggestions INTEGER DEFAULT 0,
    avg_response_time_ms NUMERIC,
    user_satisfaction_score NUMERIC,
    feature_usage JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ia_adoption_metrics_org ON public.ia_adoption_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_ia_adoption_metrics_module ON public.ia_adoption_metrics(module_name);

ALTER TABLE public.ia_adoption_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view adoption metrics" ON public.ia_adoption_metrics
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert adoption metrics" ON public.ia_adoption_metrics
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- FUNÇÃO: match_os_resolvidas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.match_os_resolvidas(
    query_embedding vector(1536),
    match_threshold double precision DEFAULT 0.75,
    match_count integer DEFAULT 5
)
RETURNS TABLE(
    id uuid,
    titulo text,
    descricao text,
    acao_tomada text,
    resultado text,
    componente_nome text,
    similarity double precision
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        os.id,
        os.titulo,
        os.descricao,
        os.acao_tomada,
        os.resultado,
        os.componente_nome,
        1 - (os.embedding <=> query_embedding) as similarity
    FROM mmi_os_resolvidas os
    WHERE os.embedding IS NOT NULL
      AND 1 - (os.embedding <=> query_embedding) > match_threshold
    ORDER BY os.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- FUNÇÃO: calculate_ia_adoption_score
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_ia_adoption_score(org_uuid uuid)
RETURNS NUMERIC
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT COALESCE(
        ROUND(
            (SUM(accepted_suggestions)::NUMERIC / NULLIF(SUM(total_interactions), 0)) * 100,
            2
        ),
        0
    )
    FROM public.ia_adoption_metrics
    WHERE organization_id = org_uuid
      AND period_end >= CURRENT_DATE - INTERVAL '30 days';
$$;