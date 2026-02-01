-- Create missing tables: ai_strategies, language_usage_stats, translation_logs

-- ai_strategies
CREATE TABLE IF NOT EXISTS public.ai_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    impact_score NUMERIC,
    confidence NUMERIC,
    recommendations JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- language_usage_stats
CREATE TABLE IF NOT EXISTS public.language_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language_code TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(language_code, user_id)
);

-- translation_logs
CREATE TABLE IF NOT EXISTS public.translation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT,
    translation_engine TEXT DEFAULT 'system',
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    processing_time_ms INTEGER,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_logs ENABLE ROW LEVEL SECURITY;

-- Policies for ai_strategies
CREATE POLICY "Auth view ai_strategies" ON public.ai_strategies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ai_strategies" ON public.ai_strategies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update ai_strategies" ON public.ai_strategies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete ai_strategies" ON public.ai_strategies FOR DELETE TO authenticated USING (true);

-- Policies for language_usage_stats
CREATE POLICY "User view lang stats" ON public.language_usage_stats FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "User insert lang stats" ON public.language_usage_stats FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "User update lang stats" ON public.language_usage_stats FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Policies for translation_logs
CREATE POLICY "User view translation" ON public.translation_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "User insert translation" ON public.translation_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_strategies_status ON public.ai_strategies(status);
CREATE INDEX IF NOT EXISTS idx_language_stats_user ON public.language_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_logs_user ON public.translation_logs(user_id);

-- Triggers
DROP TRIGGER IF EXISTS update_ai_strategies_updated_at ON public.ai_strategies;
CREATE TRIGGER update_ai_strategies_updated_at BEFORE UPDATE ON public.ai_strategies FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_language_usage_stats_updated_at ON public.language_usage_stats;
CREATE TRIGGER update_language_usage_stats_updated_at BEFORE UPDATE ON public.language_usage_stats FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();