-- PATCH 506: AI Memory Layer (AI-Mem)
-- Create table for persistent AI memory with vector embeddings

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create ai_memory_events table
CREATE TABLE IF NOT EXISTS public.ai_memory_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Context information
    context_type TEXT NOT NULL, -- 'decision', 'query', 'action', 'feedback'
    action TEXT NOT NULL, -- The action taken by AI
    input_text TEXT NOT NULL, -- User input or trigger
    output_text TEXT NOT NULL, -- AI response or result
    
    -- Vector embedding for semantic search
    embedding vector(1536), -- OpenAI ada-002 embeddings are 1536 dimensions
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    relevance_score NUMERIC(3, 2), -- 0.00 to 1.00
    success_indicator BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_memory_user_id ON public.ai_memory_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_context_type ON public.ai_memory_events(context_type);
CREATE INDEX IF NOT EXISTS idx_ai_memory_created_at ON public.ai_memory_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_memory_relevance ON public.ai_memory_events(relevance_score DESC) WHERE deleted_at IS NULL;

-- Create vector index for similarity search
CREATE INDEX IF NOT EXISTS idx_ai_memory_embedding ON public.ai_memory_events 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.ai_memory_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI memory"
    ON public.ai_memory_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI memory"
    ON public.ai_memory_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI memory"
    ON public.ai_memory_events
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all AI memory"
    ON public.ai_memory_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to search similar memories using vector similarity
CREATE OR REPLACE FUNCTION public.search_similar_ai_memories(
    query_embedding vector(1536),
    match_threshold NUMERIC DEFAULT 0.7,
    match_count INTEGER DEFAULT 5,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    context_type TEXT,
    action TEXT,
    input_text TEXT,
    output_text TEXT,
    metadata JSONB,
    similarity NUMERIC,
    relevance_score NUMERIC,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ai_memory_events.id,
        ai_memory_events.context_type,
        ai_memory_events.action,
        ai_memory_events.input_text,
        ai_memory_events.output_text,
        ai_memory_events.metadata,
        1 - (ai_memory_events.embedding <=> query_embedding) AS similarity,
        ai_memory_events.relevance_score,
        ai_memory_events.created_at
    FROM public.ai_memory_events
    WHERE 
        ai_memory_events.deleted_at IS NULL
        AND (p_user_id IS NULL OR ai_memory_events.user_id = p_user_id)
        AND 1 - (ai_memory_events.embedding <=> query_embedding) > match_threshold
    ORDER BY ai_memory_events.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to update access statistics
CREATE OR REPLACE FUNCTION public.update_ai_memory_access(memory_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.ai_memory_events
    SET 
        access_count = access_count + 1,
        accessed_at = NOW()
    WHERE id = memory_id;
END;
$$;

-- Function to cleanup old memories (soft delete)
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_memories(days_old INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE public.ai_memory_events
    SET deleted_at = NOW()
    WHERE 
        deleted_at IS NULL
        AND created_at < NOW() - INTERVAL '1 day' * days_old
        AND relevance_score < 0.5
        AND access_count < 2;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.ai_memory_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_similar_ai_memories TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_ai_memory_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_ai_memories TO authenticated;

COMMENT ON TABLE public.ai_memory_events IS 'PATCH 506: AI Memory Layer for persistent learning and context retrieval';
