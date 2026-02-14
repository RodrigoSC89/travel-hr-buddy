
-- Create peotram_audit_responses for checklist persistence
CREATE TABLE IF NOT EXISTS public.peotram_audit_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peotram_audits(id) ON DELETE CASCADE,
  element_id INTEGER NOT NULL,
  subelement_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  score TEXT DEFAULT 'NA',
  observations TEXT DEFAULT '',
  nc_classification TEXT,
  ai_evidence TEXT,
  photos TEXT[] DEFAULT '{}',
  evidence_files TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(audit_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_peotram_responses_audit2 ON public.peotram_audit_responses(audit_id);
CREATE INDEX IF NOT EXISTS idx_peotram_responses_element2 ON public.peotram_audit_responses(element_id);

ALTER TABLE public.peotram_audit_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'peotram_audit_responses' AND policyname = 'peotram_responses_all') THEN
    CREATE POLICY "peotram_responses_all" ON public.peotram_audit_responses FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Add missing columns to existing peotram_audits
ALTER TABLE public.peotram_audits 
  ADD COLUMN IF NOT EXISTS vessel_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cycle TEXT DEFAULT '2025',
  ADD COLUMN IF NOT EXISTS element_scores JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scored_items INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nc_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;
