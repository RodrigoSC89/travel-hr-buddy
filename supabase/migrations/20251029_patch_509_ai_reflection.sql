-- PATCH 509: AI Auto-Reflection and Feedback Loop
-- Self-scoring and continuous learning system for AI

-- Create ai_self_scores table
CREATE TABLE IF NOT EXISTS public.ai_self_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to AI action/memory
    memory_event_id UUID REFERENCES public.ai_memory_events(id) ON DELETE CASCADE,
    
    -- Self-evaluation scores
    accuracy_score NUMERIC(3, 2) CHECK (accuracy_score >= 0 AND accuracy_score <= 1.00), -- 0.00 to 1.00
    utility_score NUMERIC(3, 2) CHECK (utility_score >= 0 AND utility_score <= 1.00),
    relevance_score NUMERIC(3, 2) CHECK (relevance_score >= 0 AND relevance_score <= 1.00),
    confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1.00),
    
    -- Overall composite score
    composite_score NUMERIC(3, 2) GENERATED ALWAYS AS (
        (COALESCE(accuracy_score, 0) + COALESCE(utility_score, 0) + 
         COALESCE(relevance_score, 0) + COALESCE(confidence_score, 0)) / 4.0
    ) STORED,
    
    -- Action context
    action_type TEXT NOT NULL, -- 'generation', 'decision', 'recommendation', 'analysis'
    action_description TEXT,
    
    -- User feedback
    user_feedback TEXT,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    feedback_provided_at TIMESTAMPTZ,
    
    -- Learning adjustments
    adjustments_made JSONB DEFAULT '[]'::jsonb,
    improvement_suggestions TEXT[],
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_self_scores_memory_event ON public.ai_self_scores(memory_event_id);
CREATE INDEX IF NOT EXISTS idx_ai_self_scores_composite ON public.ai_self_scores(composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_self_scores_action_type ON public.ai_self_scores(action_type);
CREATE INDEX IF NOT EXISTS idx_ai_self_scores_created ON public.ai_self_scores(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_self_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their AI scores"
    ON public.ai_self_scores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_memory_events
            WHERE ai_memory_events.id = ai_self_scores.memory_event_id
            AND ai_memory_events.user_id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY "System can insert AI scores"
    ON public.ai_self_scores FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their AI scores feedback"
    ON public.ai_self_scores FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_memory_events
            WHERE ai_memory_events.id = ai_self_scores.memory_event_id
            AND ai_memory_events.user_id = auth.uid()
        )
    );

-- Function to calculate and store self-score
CREATE OR REPLACE FUNCTION public.calculate_ai_self_score(
    p_memory_event_id UUID,
    p_action_type TEXT,
    p_action_description TEXT,
    p_accuracy NUMERIC DEFAULT NULL,
    p_utility NUMERIC DEFAULT NULL,
    p_relevance NUMERIC DEFAULT NULL,
    p_confidence NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_score_id UUID;
BEGIN
    INSERT INTO public.ai_self_scores (
        memory_event_id,
        action_type,
        action_description,
        accuracy_score,
        utility_score,
        relevance_score,
        confidence_score
    ) VALUES (
        p_memory_event_id,
        p_action_type,
        p_action_description,
        COALESCE(p_accuracy, 0.5),
        COALESCE(p_utility, 0.5),
        COALESCE(p_relevance, 0.5),
        COALESCE(p_confidence, 0.5)
    )
    RETURNING id INTO v_score_id;
    
    RETURN v_score_id;
END;
$$;

-- Function to update score with user feedback
CREATE OR REPLACE FUNCTION public.update_ai_score_feedback(
    p_score_id UUID,
    p_user_rating INTEGER,
    p_user_feedback TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.ai_self_scores
    SET 
        user_rating = p_user_rating,
        user_feedback = p_user_feedback,
        feedback_provided_at = NOW(),
        updated_at = NOW()
    WHERE id = p_score_id;
    
    RETURN FOUND;
END;
$$;

-- Function to get learning insights
CREATE OR REPLACE FUNCTION public.get_ai_learning_insights(
    p_user_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    action_type TEXT,
    avg_composite_score NUMERIC,
    avg_accuracy NUMERIC,
    avg_utility NUMERIC,
    avg_user_rating NUMERIC,
    total_actions BIGINT,
    improvement_trend TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    RETURN QUERY
    SELECT 
        s.action_type,
        AVG(s.composite_score) as avg_composite_score,
        AVG(s.accuracy_score) as avg_accuracy,
        AVG(s.utility_score) as avg_utility,
        AVG(s.user_rating::numeric) as avg_user_rating,
        COUNT(*)::BIGINT as total_actions,
        CASE 
            WHEN AVG(s.composite_score) >= 0.8 THEN 'excellent'
            WHEN AVG(s.composite_score) >= 0.6 THEN 'good'
            WHEN AVG(s.composite_score) >= 0.4 THEN 'needs_improvement'
            ELSE 'poor'
        END as improvement_trend
    FROM public.ai_self_scores s
    INNER JOIN public.ai_memory_events m ON s.memory_event_id = m.id
    WHERE 
        m.user_id = v_user_id
        AND s.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY s.action_type
    ORDER BY avg_composite_score DESC;
END;
$$;

-- Function to get improvement suggestions
CREATE OR REPLACE FUNCTION public.get_ai_improvement_suggestions(
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    action_type TEXT,
    suggestion TEXT,
    priority INTEGER,
    based_on_samples BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    RETURN QUERY
    WITH action_stats AS (
        SELECT 
            s.action_type,
            AVG(s.composite_score) as avg_score,
            COUNT(*) as sample_count
        FROM public.ai_self_scores s
        INNER JOIN public.ai_memory_events m ON s.memory_event_id = m.id
        WHERE m.user_id = v_user_id
        GROUP BY s.action_type
    )
    SELECT 
        a.action_type,
        CASE 
            WHEN a.avg_score < 0.5 THEN 'Critical: Review and improve ' || a.action_type || ' logic'
            WHEN a.avg_score < 0.7 THEN 'Moderate: Optimize ' || a.action_type || ' parameters'
            ELSE 'Minor: Fine-tune ' || a.action_type || ' for excellence'
        END as suggestion,
        CASE 
            WHEN a.avg_score < 0.5 THEN 1
            WHEN a.avg_score < 0.7 THEN 2
            ELSE 3
        END as priority,
        a.sample_count as based_on_samples
    FROM action_stats a
    ORDER BY priority ASC, a.avg_score ASC
    LIMIT p_limit;
END;
$$;

-- Function to track learning progress over time
CREATE OR REPLACE FUNCTION public.get_ai_learning_progress(
    p_user_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 90
)
RETURNS TABLE (
    date DATE,
    avg_score NUMERIC,
    actions_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    RETURN QUERY
    SELECT 
        DATE(s.created_at) as date,
        AVG(s.composite_score) as avg_score,
        COUNT(*)::BIGINT as actions_count
    FROM public.ai_self_scores s
    INNER JOIN public.ai_memory_events m ON s.memory_event_id = m.id
    WHERE 
        m.user_id = v_user_id
        AND s.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(s.created_at)
    ORDER BY date DESC;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.ai_self_scores TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_ai_self_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_ai_score_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_learning_insights TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_improvement_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_learning_progress TO authenticated;

COMMENT ON TABLE public.ai_self_scores IS 'PATCH 509: AI self-evaluation scores and feedback loop for continuous learning';
