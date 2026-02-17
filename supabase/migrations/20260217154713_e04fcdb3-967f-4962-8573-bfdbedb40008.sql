
-- Comments and assignments for evidence collaboration
CREATE TABLE public.audit_evidence_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  pack_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT,
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'comment' CHECK (comment_type IN ('comment', 'review', 'approval', 'rejection')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_evidence_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  pack_id UUID NOT NULL,
  assigned_to UUID NOT NULL,
  assigned_to_name TEXT,
  assigned_by UUID NOT NULL,
  assigned_by_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interview simulator sessions
CREATE TABLE public.audit_interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID,
  framework TEXT NOT NULL,
  user_id UUID NOT NULL,
  session_type TEXT DEFAULT 'full' CHECK (session_type IN ('full', 'element', 'quick')),
  target_element_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  partial_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  interview_log JSONB DEFAULT '[]'::jsonb,
  ai_final_assessment TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.audit_evidence_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_evidence_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_interview_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users can CRUD their org data)
CREATE POLICY "Authenticated users can manage comments" ON public.audit_evidence_comments
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage assignments" ON public.audit_evidence_assignments
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their interview sessions" ON public.audit_interview_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view interview sessions" ON public.audit_interview_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_evidence_comments_item ON public.audit_evidence_comments(item_id);
CREATE INDEX idx_evidence_comments_pack ON public.audit_evidence_comments(pack_id);
CREATE INDEX idx_evidence_assignments_item ON public.audit_evidence_assignments(item_id);
CREATE INDEX idx_evidence_assignments_pack ON public.audit_evidence_assignments(pack_id);
CREATE INDEX idx_interview_sessions_pack ON public.audit_interview_sessions(pack_id);
CREATE INDEX idx_interview_sessions_user ON public.audit_interview_sessions(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_evidence_assignments_updated_at
  BEFORE UPDATE ON public.audit_evidence_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
