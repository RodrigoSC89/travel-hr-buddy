-- ============================================================================
-- PATCH 866: Create Missing Tables for @ts-nocheck Elimination
-- Creates sonar_readings, sonar_ai_predictions tables and extends ai_documents
-- ============================================================================

-- ============================================================================
-- 1. sonar_readings - Required by sonarPersistenceService.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sonar_readings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID,
    user_id UUID NOT NULL,
    location JSONB NOT NULL DEFAULT '{}',
    depth NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    terrain_type TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    temperature NUMERIC,
    pressure NUMERIC,
    visibility NUMERIC,
    reading_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sonar_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can only access their own readings
CREATE POLICY "sonar_readings_user_access" ON public.sonar_readings
    FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sonar_readings_user_id ON public.sonar_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_sonar_readings_mission_id ON public.sonar_readings(mission_id);
CREATE INDEX IF NOT EXISTS idx_sonar_readings_created_at ON public.sonar_readings(created_at DESC);

-- ============================================================================
-- 2. sonar_ai_predictions - Required by sonarPersistenceService.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sonar_ai_predictions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reading_id UUID REFERENCES public.sonar_readings(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    prediction_type TEXT NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 0,
    location JSONB NOT NULL DEFAULT '{}',
    depth_range JSONB,
    description TEXT,
    detected_objects JSONB,
    safe_route_recommendation JSONB,
    warnings TEXT[],
    ai_model TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sonar_ai_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can only access their own predictions
CREATE POLICY "sonar_ai_predictions_user_access" ON public.sonar_ai_predictions
    FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sonar_ai_predictions_user_id ON public.sonar_ai_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_predictions_reading_id ON public.sonar_ai_predictions(reading_id);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_predictions_created_at ON public.sonar_ai_predictions(created_at DESC);

-- ============================================================================
-- 3. Extend ai_documents with missing columns for ai.tsx page
-- ============================================================================
DO $$
BEGIN
    -- Add title column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'title') THEN
        ALTER TABLE public.ai_documents ADD COLUMN title TEXT;
    END IF;
    
    -- Add description column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'description') THEN
        ALTER TABLE public.ai_documents ADD COLUMN description TEXT;
    END IF;
    
    -- Add file_url column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'file_url') THEN
        ALTER TABLE public.ai_documents ADD COLUMN file_url TEXT;
    END IF;
    
    -- Add ocr_text column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'ocr_text') THEN
        ALTER TABLE public.ai_documents ADD COLUMN ocr_text TEXT;
    END IF;
    
    -- Add extracted_keywords column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'extracted_keywords') THEN
        ALTER TABLE public.ai_documents ADD COLUMN extracted_keywords JSONB DEFAULT '[]';
    END IF;
    
    -- Add category column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'category') THEN
        ALTER TABLE public.ai_documents ADD COLUMN category TEXT;
    END IF;
    
    -- Add confidence_score column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'confidence_score') THEN
        ALTER TABLE public.ai_documents ADD COLUMN confidence_score NUMERIC;
    END IF;
    
    -- Add ocr_completed_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'ocr_completed_at') THEN
        ALTER TABLE public.ai_documents ADD COLUMN ocr_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add file_size_bytes column if not exists (more precise than file_size)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_documents' AND column_name = 'file_size_bytes') THEN
        ALTER TABLE public.ai_documents ADD COLUMN file_size_bytes INTEGER;
    END IF;
END $$;

-- ============================================================================
-- 4. document_keywords table - Required by ai.tsx for keyword storage
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_keywords (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.ai_documents(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    relevance_score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_keywords ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "document_keywords_authenticated" ON public.document_keywords
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Index
CREATE INDEX IF NOT EXISTS idx_document_keywords_document_id ON public.document_keywords(document_id);

-- ============================================================================
-- 5. Create RPC function for document analysis logging
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_document_analysis(
    p_document_id UUID,
    p_analysis_type TEXT,
    p_status TEXT,
    p_results JSONB DEFAULT NULL,
    p_error TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.ai_audit_logs (
        user_id,
        user_input,
        module_name,
        interaction_type,
        ai_response,
        created_at
    ) VALUES (
        auth.uid(),
        p_analysis_type || ' - ' || p_status,
        'document_analysis',
        p_analysis_type,
        COALESCE(p_results::TEXT, p_error, 'No details'),
        now()
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;