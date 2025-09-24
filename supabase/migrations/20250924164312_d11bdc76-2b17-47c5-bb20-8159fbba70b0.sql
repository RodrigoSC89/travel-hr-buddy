-- Create only the missing tables for Innovation Center features
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('performance', 'cost', 'usage', 'quality', 'security')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    confidence DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
    impact_value TEXT,
    actionable BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed')),
    related_module TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit TEXT NOT NULL,
    target_value DECIMAL(10,2),
    status TEXT NOT NULL CHECK (status IN ('excellent', 'good', 'warning', 'critical')),
    category TEXT NOT NULL CHECK (category IN ('database', 'api', 'ui', 'cache', 'network')),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.optimization_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('database', 'api', 'ui', 'cache', 'network')),
    impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
    effort TEXT NOT NULL CHECK (effort IN ('easy', 'moderate', 'complex')),
    estimated_improvement TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ux_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit TEXT NOT NULL,
    target_value DECIMAL(10,2),
    status TEXT NOT NULL CHECK (status IN ('excellent', 'good', 'needs_improvement', 'critical')),
    category TEXT NOT NULL CHECK (category IN ('navigation', 'performance', 'accessibility', 'mobile')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('productivity', 'collaboration', 'innovation', 'leadership')),
    points INTEGER NOT NULL DEFAULT 0,
    progress INTEGER NOT NULL DEFAULT 0,
    max_progress INTEGER NOT NULL DEFAULT 100,
    unlocked BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.processed_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    summary TEXT,
    key_points TEXT[],
    entities TEXT[],
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    category TEXT,
    original_text TEXT,
    processing_status TEXT NOT NULL DEFAULT 'processing' CHECK (processing_status IN ('processing', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_insights') THEN
        ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own AI insights" 
        ON public.ai_insights FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own AI insights" 
        ON public.ai_insights FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own AI insights" 
        ON public.ai_insights FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics') THEN
        ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Everyone can view performance metrics" 
        ON public.performance_metrics FOR SELECT 
        USING (true);

        CREATE POLICY "Admins can insert performance metrics" 
        ON public.performance_metrics FOR INSERT 
        WITH CHECK (public.get_user_role() IN ('admin', 'hr_manager'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'optimization_actions') THEN
        ALTER TABLE public.optimization_actions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own optimization actions" 
        ON public.optimization_actions FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own optimization actions" 
        ON public.optimization_actions FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own optimization actions" 
        ON public.optimization_actions FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ux_metrics') THEN
        ALTER TABLE public.ux_metrics ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own UX metrics" 
        ON public.ux_metrics FOR SELECT 
        USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can create UX metrics" 
        ON public.ux_metrics FOR INSERT 
        WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements') THEN
        ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own achievements" 
        ON public.user_achievements FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own achievements" 
        ON public.user_achievements FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own achievements" 
        ON public.user_achievements FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'processed_documents') THEN
        ALTER TABLE public.processed_documents ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own processed documents" 
        ON public.processed_documents FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own processed documents" 
        ON public.processed_documents FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own processed documents" 
        ON public.processed_documents FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_category ON public.ai_insights(category);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON public.ai_insights(status);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON public.performance_metrics(category);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON public.performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_optimization_actions_user_id ON public.optimization_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_actions_status ON public.optimization_actions(status);
CREATE INDEX IF NOT EXISTS idx_ux_metrics_user_id ON public.ux_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ux_metrics_category ON public.ux_metrics(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_processed_documents_user_id ON public.processed_documents(user_id);