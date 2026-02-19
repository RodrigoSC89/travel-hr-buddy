
-- LVS Aceitação Petrobras - Persistence Tables

-- 1. LVS Acceptance Sessions
CREATE TABLE public.lvs_acceptance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID,
  title TEXT NOT NULL DEFAULT 'LVS Aceitação RSV',
  et_reference TEXT NOT NULL DEFAULT 'ET-3000.00-1500-91C-PLL-017',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  overall_score NUMERIC(5,2) DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  approved_items INTEGER DEFAULT 0,
  pending_items INTEGER DEFAULT 0,
  rejected_items INTEGER DEFAULT 0,
  target_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lvs_acceptance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.lvs_acceptance_sessions
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create sessions" ON public.lvs_acceptance_sessions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own sessions" ON public.lvs_acceptance_sessions
  FOR UPDATE USING (auth.uid() = created_by);

-- 2. LVS Item Status
CREATE TABLE public.lvs_item_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.lvs_acceptance_sessions(id) ON DELETE CASCADE,
  item_ref TEXT NOT NULL,
  item_question TEXT,
  section_code TEXT,
  et_ref TEXT,
  status TEXT NOT NULL DEFAULT 'not_verified' CHECK (status IN ('approved', 'pending', 'rejected', 'not_applicable', 'not_verified')),
  observations TEXT DEFAULT '',
  pendency TEXT DEFAULT '',
  deadline DATE,
  has_photo BOOLEAN DEFAULT false,
  photo_urls JSONB DEFAULT '[]',
  evidence_documents JSONB DEFAULT '[]',
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, item_ref)
);

ALTER TABLE public.lvs_item_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view item status via session" ON public.lvs_item_status
  FOR SELECT USING (session_id IN (
    SELECT id FROM public.lvs_acceptance_sessions WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can insert item status" ON public.lvs_item_status
  FOR INSERT WITH CHECK (session_id IN (
    SELECT id FROM public.lvs_acceptance_sessions WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can update item status" ON public.lvs_item_status
  FOR UPDATE USING (session_id IN (
    SELECT id FROM public.lvs_acceptance_sessions WHERE created_by = auth.uid()
  ));

-- 3. LVS Action Plans
CREATE TABLE public.lvs_action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.lvs_acceptance_sessions(id) ON DELETE CASCADE,
  created_by UUID,
  title TEXT NOT NULL,
  scope TEXT DEFAULT 'all',
  priority TEXT DEFAULT 'critical_first',
  gap_count INTEGER DEFAULT 0,
  estimated_days INTEGER DEFAULT 0,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_execution', 'completed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lvs_action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own action plans" ON public.lvs_action_plans
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create action plans" ON public.lvs_action_plans
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own action plans" ON public.lvs_action_plans
  FOR UPDATE USING (auth.uid() = created_by);

-- 4. LVS Document Analyses
CREATE TABLE public.lvs_document_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.lvs_acceptance_sessions(id) ON DELETE CASCADE,
  created_by UUID,
  document_name TEXT NOT NULL,
  document_type TEXT,
  mapped_items INTEGER DEFAULT 0,
  gaps_found INTEGER DEFAULT 0,
  confidence NUMERIC(5,2) DEFAULT 0,
  ai_response TEXT,
  matched_refs JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lvs_document_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON public.lvs_document_analyses
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create analyses" ON public.lvs_document_analyses
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Triggers
CREATE TRIGGER update_lvs_sessions_updated_at
  BEFORE UPDATE ON public.lvs_acceptance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lvs_item_status_updated_at
  BEFORE UPDATE ON public.lvs_item_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lvs_action_plans_updated_at
  BEFORE UPDATE ON public.lvs_action_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_lvs_item_status_session ON public.lvs_item_status(session_id);
CREATE INDEX idx_lvs_item_status_ref ON public.lvs_item_status(item_ref);
CREATE INDEX idx_lvs_action_plans_session ON public.lvs_action_plans(session_id);
CREATE INDEX idx_lvs_doc_analyses_session ON public.lvs_document_analyses(session_id);
