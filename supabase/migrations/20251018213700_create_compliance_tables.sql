-- ===========================
-- LIVE COMPLIANCE MODULE (ETAPA 33)
-- AI-Powered Maritime Compliance Automation
-- ===========================

-- ===========================
-- 1. compliance_non_conformities
-- Tracks detected compliance issues from various data sources
-- ===========================
CREATE TABLE IF NOT EXISTS public.compliance_non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('dp_incident', 'safety_log', 'forecast', 'manual_report', 'audit_finding')),
  source_id TEXT, -- Reference to original incident/log ID
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  applicable_norms JSONB, -- Array of applicable regulations with clauses: [{norm: "IMCA", clause: "M182", description: "..."}]
  vessel_id TEXT, -- Optional vessel reference
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================
-- 2. compliance_corrective_actions
-- AI-generated action plans for resolving non-conformities
-- ===========================
CREATE TABLE IF NOT EXISTS public.compliance_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID NOT NULL REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  action_plan JSONB NOT NULL, -- {steps: [], resources: [], timeline: "", responsibilities: ""}
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_evidence TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================
-- 3. compliance_evidence
-- Certifiable audit trail documentation
-- ===========================
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID NOT NULL REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'photo', 'log_entry', 'certificate', 'report', 'email')),
  file_url TEXT,
  description TEXT NOT NULL,
  norm_reference TEXT, -- Which norm/clause this evidence addresses
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  collected_by UUID REFERENCES auth.users(id),
  metadata JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================
-- 4. compliance_training_assignments
-- Reactive training assignments based on incidents
-- ===========================
CREATE TABLE IF NOT EXISTS public.compliance_training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID NOT NULL REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  vessel_id TEXT NOT NULL,
  crew_member_id UUID REFERENCES auth.users(id),
  training_module TEXT NOT NULL,
  training_description TEXT,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================
-- 5. compliance_score_history
-- Historical tracking of compliance scores over time
-- ===========================
CREATE TABLE IF NOT EXISTS public.compliance_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  open_non_conformities INTEGER DEFAULT 0,
  resolved_non_conformities INTEGER DEFAULT 0,
  overdue_actions INTEGER DEFAULT 0,
  automation_rate NUMERIC(5,2), -- Percentage of automated processing
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB, -- Additional breakdown metrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================
-- Create indexes for performance
-- ===========================
CREATE INDEX IF NOT EXISTS idx_compliance_nc_status ON public.compliance_non_conformities(status);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_severity ON public.compliance_non_conformities(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_source ON public.compliance_non_conformities(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_vessel ON public.compliance_non_conformities(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_detected ON public.compliance_non_conformities(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_actions_nc ON public.compliance_corrective_actions(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_actions_status ON public.compliance_corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_compliance_actions_due ON public.compliance_corrective_actions(due_date);

CREATE INDEX IF NOT EXISTS idx_compliance_evidence_nc ON public.compliance_evidence(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_type ON public.compliance_evidence(evidence_type);

CREATE INDEX IF NOT EXISTS idx_compliance_training_nc ON public.compliance_training_assignments(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_vessel ON public.compliance_training_assignments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_status ON public.compliance_training_assignments(status);

CREATE INDEX IF NOT EXISTS idx_compliance_score_period ON public.compliance_score_history(period_start DESC);

-- ===========================
-- Enable Row Level Security
-- ===========================
ALTER TABLE public.compliance_non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_score_history ENABLE ROW LEVEL SECURITY;

-- ===========================
-- RLS Policies: Allow authenticated users to read all compliance data
-- ===========================
CREATE POLICY "Allow authenticated users to read non_conformities"
  ON public.compliance_non_conformities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read corrective_actions"
  ON public.compliance_corrective_actions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read evidence"
  ON public.compliance_evidence
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read training_assignments"
  ON public.compliance_training_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read score_history"
  ON public.compliance_score_history
  FOR SELECT
  TO authenticated
  USING (true);

-- ===========================
-- RLS Policies: Allow service role to manage all data (for automation)
-- ===========================
CREATE POLICY "Allow service role to manage non_conformities"
  ON public.compliance_non_conformities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage corrective_actions"
  ON public.compliance_corrective_actions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage evidence"
  ON public.compliance_evidence
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage training_assignments"
  ON public.compliance_training_assignments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage score_history"
  ON public.compliance_score_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ===========================
-- Create trigger function for updated_at
-- ===========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- Create triggers for updated_at timestamps
-- ===========================
CREATE TRIGGER update_compliance_non_conformities_updated_at
  BEFORE UPDATE ON public.compliance_non_conformities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_corrective_actions_updated_at
  BEFORE UPDATE ON public.compliance_corrective_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_training_assignments_updated_at
  BEFORE UPDATE ON public.compliance_training_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================
-- Comments for documentation
-- ===========================
COMMENT ON TABLE public.compliance_non_conformities IS 'Live Compliance Module - Detected compliance issues from various data sources';
COMMENT ON TABLE public.compliance_corrective_actions IS 'Live Compliance Module - AI-generated corrective action plans';
COMMENT ON TABLE public.compliance_evidence IS 'Live Compliance Module - Certifiable audit trail documentation';
COMMENT ON TABLE public.compliance_training_assignments IS 'Live Compliance Module - Reactive training assignments based on incidents';
COMMENT ON TABLE public.compliance_score_history IS 'Live Compliance Module - Historical compliance score tracking';
