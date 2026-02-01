-- ============================================
-- PATCH 871.4b: Add missing table and columns
-- ============================================

-- 1. Document Entities table (missing)
CREATE TABLE IF NOT EXISTS public.document_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    entity_value TEXT NOT NULL,
    confidence NUMERIC DEFAULT 0.8,
    position_start INTEGER,
    position_end INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_entities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_entities' AND policyname = 'Document entities for authenticated') THEN
        CREATE POLICY "Document entities for authenticated" ON public.document_entities 
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_document_entities_document ON public.document_entities(document_id);
CREATE INDEX IF NOT EXISTS idx_document_entities_type ON public.document_entities(entity_type);

-- 2. Add missing columns to performance_metrics for PerformanceSnapshot interface
ALTER TABLE public.performance_metrics ADD COLUMN IF NOT EXISTS cpu_usage NUMERIC;
ALTER TABLE public.performance_metrics ADD COLUMN IF NOT EXISTS fps INTEGER;
ALTER TABLE public.performance_metrics ADD COLUMN IF NOT EXISTS slow_components JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.performance_metrics ADD COLUMN IF NOT EXISTS page_load_time NUMERIC;