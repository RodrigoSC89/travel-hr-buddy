-- ============================================================================
-- PATCH 869: Create Missing Tables for @ts-nocheck Elimination
-- Creates integrations table and extends performance_metrics
-- ============================================================================

-- ============================================================================
-- 1. integrations - Required by integrations-hub-enhanced.tsx
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID,
    integration_type TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    connection_status TEXT NOT NULL DEFAULT 'disconnected',
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scopes TEXT[],
    metadata JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_org_access" ON public.integrations
    FOR ALL USING (
        auth.uid() = user_id OR 
        organization_id IN (
            SELECT ou.organization_id FROM organization_users ou WHERE ou.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON public.integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(provider_name);

-- ============================================================================
-- 2. Extend performance_metrics with missing columns
-- ============================================================================
DO $$
BEGIN
    -- Add load_time column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'load_time') THEN
        ALTER TABLE public.performance_metrics ADD COLUMN load_time NUMERIC;
    END IF;
    
    -- Add memory_usage column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'memory_usage') THEN
        ALTER TABLE public.performance_metrics ADD COLUMN memory_usage NUMERIC;
    END IF;
    
    -- Add network_latency column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'network_latency') THEN
        ALTER TABLE public.performance_metrics ADD COLUMN network_latency NUMERIC;
    END IF;
    
    -- Add score column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'score') THEN
        ALTER TABLE public.performance_metrics ADD COLUMN score NUMERIC;
    END IF;
    
    -- Add measured_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'measured_at') THEN
        ALTER TABLE public.performance_metrics ADD COLUMN measured_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- ============================================================================
-- 3. Create ia_performance_log if not exists (for BehavioralEvolutionDashboard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ia_performance_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    precision_score NUMERIC,
    recall_score NUMERIC,
    f1_score NUMERIC,
    accuracy NUMERIC,
    latency_ms NUMERIC,
    tokens_used INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ia_performance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ia_performance_log_read" ON public.ia_performance_log
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "ia_performance_log_insert" ON public.ia_performance_log
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_ia_performance_log_module ON public.ia_performance_log(module_name);
CREATE INDEX IF NOT EXISTS idx_ia_performance_log_created ON public.ia_performance_log(created_at DESC);

-- ============================================================================
-- 4. Add resolved column to watchdog_behavior_alerts if missing
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchdog_behavior_alerts' AND column_name = 'resolved') THEN
        ALTER TABLE public.watchdog_behavior_alerts ADD COLUMN resolved BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Trigger for integrations updated_at
CREATE OR REPLACE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();