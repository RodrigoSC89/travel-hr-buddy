-- =============================================
-- COMPLIANCE ONE MODULE - ISO 37301 BASED
-- =============================================

-- Regras e regulamentos
CREATE TABLE IF NOT EXISTS public.compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  legal_reference TEXT,
  jurisdiction TEXT DEFAULT 'BR',
  effective_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'expired')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Riscos e controles
CREATE TABLE IF NOT EXISTS public.compliance_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  probability INT CHECK (probability BETWEEN 1 AND 5),
  impact INT CHECK (impact BETWEEN 1 AND 5),
  risk_score INT GENERATED ALWAYS AS (probability * impact) STORED,
  associated_rule_id UUID REFERENCES public.compliance_rules(id) ON DELETE SET NULL,
  mitigation TEXT,
  control_measures JSONB DEFAULT '[]',
  owner_id UUID,
  department TEXT,
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated', 'accepted', 'closed')),
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Evidências
CREATE TABLE IF NOT EXISTS public.compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INT,
  file_hash TEXT,
  related_rule_id UUID REFERENCES public.compliance_rules(id) ON DELETE SET NULL,
  related_risk_id UUID REFERENCES public.compliance_risks(id) ON DELETE SET NULL,
  uploader_id UUID,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'invalid', 'expired', 'archived')),
  validity_start DATE,
  validity_end DATE,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Denúncias
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_number TEXT UNIQUE,
  reporter_email TEXT,
  reporter_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  title TEXT,
  description TEXT NOT NULL,
  category TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed', 'escalated')),
  assigned_to UUID,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Due diligence / terceiros
CREATE TABLE IF NOT EXISTS public.compliance_thirdparties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT,
  document_number TEXT,
  document_type TEXT DEFAULT 'CNPJ',
  country TEXT DEFAULT 'BR',
  risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN risk_score >= 80 THEN 'critical'
      WHEN risk_score >= 60 THEN 'high'
      WHEN risk_score >= 40 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,
  last_check_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,
  check_results JSONB DEFAULT '{}',
  sanctions_hit BOOLEAN DEFAULT false,
  pep_hit BOOLEAN DEFAULT false,
  adverse_media BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending_review', 'approved', 'rejected')),
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflows de compliance
CREATE TABLE IF NOT EXISTS public.compliance_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT,
  trigger_type TEXT DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'scheduled', 'event', 'condition')),
  trigger_config JSONB DEFAULT '{}',
  steps JSONB DEFAULT '[]',
  current_step INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  assigned_to UUID,
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recomendações da IA
CREATE TABLE IF NOT EXISTS public.compliance_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID,
  recommendation TEXT NOT NULL,
  reasoning TEXT,
  confidence DECIMAL(5,2) CHECK (confidence BETWEEN 0 AND 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  action_type TEXT,
  suggested_action JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'expired')),
  applied_by UUID,
  applied_at TIMESTAMPTZ,
  dismissed_reason TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trilha de auditoria
CREATE TABLE IF NOT EXISTS public.compliance_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID,
  actor_name TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_thirdparties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_rules
CREATE POLICY "Users can view compliance rules in their org" ON public.compliance_rules
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage compliance rules in their org" ON public.compliance_rules
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies for compliance_risks
CREATE POLICY "Users can view compliance risks in their org" ON public.compliance_risks
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage compliance risks in their org" ON public.compliance_risks
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies for compliance_evidences
CREATE POLICY "Users can view compliance evidences in their org" ON public.compliance_evidences
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage compliance evidences in their org" ON public.compliance_evidences
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies for compliance_reports
CREATE POLICY "Users can view compliance reports in their org" ON public.compliance_reports
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage compliance reports in their org" ON public.compliance_reports
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies for compliance_thirdparties
CREATE POLICY "Users can view compliance thirdparties in their org" ON public.compliance_thirdparties
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage compliance thirdparties in their org" ON public.compliance_thirdparties
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies for compliance_workflows
CREATE POLICY "Users can view compliance workflows in their org" ON public.compliance_workflows
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage compliance workflows in their org" ON public.compliance_workflows
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies for compliance_ai_recommendations
CREATE POLICY "Users can view compliance ai recommendations in their org" ON public.compliance_ai_recommendations
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage compliance ai recommendations in their org" ON public.compliance_ai_recommendations
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies for compliance_audit_trail
CREATE POLICY "Users can view compliance audit trail in their org" ON public.compliance_audit_trail
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "System can insert audit trail" ON public.compliance_audit_trail
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_rules_org ON public.compliance_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_status ON public.compliance_rules(status);
CREATE INDEX IF NOT EXISTS idx_compliance_risks_org ON public.compliance_risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_risks_score ON public.compliance_risks(risk_score);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_org ON public.compliance_evidences(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_org ON public.compliance_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON public.compliance_reports(status);
CREATE INDEX IF NOT EXISTS idx_compliance_thirdparties_org ON public.compliance_thirdparties(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_workflows_org ON public.compliance_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ai_recommendations_org ON public.compliance_ai_recommendations(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_trail_org ON public.compliance_audit_trail(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_trail_entity ON public.compliance_audit_trail(entity_type, entity_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_compliance_rules_updated_at
  BEFORE UPDATE ON public.compliance_rules
  FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_risks_updated_at
  BEFORE UPDATE ON public.compliance_risks
  FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_evidences_updated_at
  BEFORE UPDATE ON public.compliance_evidences
  FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_reports_updated_at
  BEFORE UPDATE ON public.compliance_reports
  FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_thirdparties_updated_at
  BEFORE UPDATE ON public.compliance_thirdparties
  FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_workflows_updated_at
  BEFORE UPDATE ON public.compliance_workflows
  FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();