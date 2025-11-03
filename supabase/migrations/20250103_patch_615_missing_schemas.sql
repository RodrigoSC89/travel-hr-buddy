-- ===================================================================
-- PATCH 615 - Missing Supabase Schemas
-- Creates tables that are referenced in code but missing from database
-- ===================================================================

-- Table: beta_feedback
-- Purpose: Store feedback from beta users for system improvements
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID,
  module_name TEXT NOT NULL,
  feedback_type TEXT CHECK (feedback_type IN ('bug', 'feature', 'improvement', 'praise', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in_progress', 'resolved', 'wont_fix')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ia_performance_log
-- Purpose: Track AI/ML performance metrics across the system
CREATE TABLE IF NOT EXISTS public.ia_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  ai_module TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  model_name TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  latency_ms INTEGER,
  cost_usd DECIMAL(10, 6),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  prompt_hash TEXT,
  response_quality_score DECIMAL(3, 2),
  user_feedback INTEGER CHECK (user_feedback BETWEEN 1 AND 5),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: watchdog_behavior_alerts
-- Purpose: Store alerts from the system watchdog monitoring unusual behaviors
CREATE TABLE IF NOT EXISTS public.watchdog_behavior_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  source_module TEXT NOT NULL,
  anomaly_detected TEXT,
  threshold_value DECIMAL,
  actual_value DECIMAL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: sgso_audits
-- Purpose: Store SGSO (Safety Management System) audit records
CREATE TABLE IF NOT EXISTS public.sgso_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  vessel_id UUID,
  audit_type TEXT NOT NULL,
  auditor_id UUID REFERENCES auth.users(id),
  audit_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  compliance_score DECIMAL(5, 2),
  findings TEXT[],
  recommendations TEXT[],
  corrective_actions JSONB,
  next_audit_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: templates
-- Purpose: Store reusable document and report templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('document', 'report', 'checklist', 'form', 'email')),
  content JSONB NOT NULL,
  variables TEXT[],
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name, category)
);

-- Table: system_health
-- Purpose: Monitor overall system health metrics
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_unit TEXT,
  status TEXT CHECK (status IN ('healthy', 'warning', 'critical')),
  component_name TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: performance_metrics
-- Purpose: Track general application performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID REFERENCES auth.users(id),
  page_path TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_unit TEXT,
  device_type TEXT,
  browser TEXT,
  connection_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- Row Level Security (RLS) Policies
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_performance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchdog_behavior_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for beta_feedback
CREATE POLICY "Users can view their own feedback"
  ON public.beta_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON public.beta_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.beta_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Policies for ia_performance_log
CREATE POLICY "Admins can view AI performance logs"
  ON public.ia_performance_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "System can insert AI performance logs"
  ON public.ia_performance_log FOR INSERT
  WITH CHECK (true);

-- Policies for watchdog_behavior_alerts
CREATE POLICY "Admins can view watchdog alerts"
  ON public.watchdog_behavior_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "System can create watchdog alerts"
  ON public.watchdog_behavior_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update watchdog alerts"
  ON public.watchdog_behavior_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Policies for sgso_audits
CREATE POLICY "Users can view SGSO audits for their tenant"
  ON public.sgso_audits FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Auditors can create SGSO audits"
  ON public.sgso_audits FOR INSERT
  WITH CHECK (
    auth.uid() = auditor_id AND
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Auditors can update their SGSO audits"
  ON public.sgso_audits FOR UPDATE
  USING (auth.uid() = auditor_id);

-- Policies for templates
CREATE POLICY "Users can view public templates"
  ON public.templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can view templates for their tenant"
  ON public.templates FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = created_by);

-- Policies for system_health
CREATE POLICY "Admins can view system health"
  ON public.system_health FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "System can insert health metrics"
  ON public.system_health FOR INSERT
  WITH CHECK (true);

-- Policies for performance_metrics
CREATE POLICY "Users can view their performance metrics"
  ON public.performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert performance metrics"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all performance metrics"
  ON public.performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ===================================================================
-- Indexes for Performance
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON public.beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_tenant_id ON public.beta_feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON public.beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created_at ON public.beta_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ia_performance_log_tenant_id ON public.ia_performance_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ia_performance_log_ai_module ON public.ia_performance_log(ai_module);
CREATE INDEX IF NOT EXISTS idx_ia_performance_log_created_at ON public.ia_performance_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_tenant_id ON public.watchdog_behavior_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_severity ON public.watchdog_behavior_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_status ON public.watchdog_behavior_alerts(status);
CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_created_at ON public.watchdog_behavior_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sgso_audits_tenant_id ON public.sgso_audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sgso_audits_vessel_id ON public.sgso_audits(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sgso_audits_auditor_id ON public.sgso_audits(auditor_id);
CREATE INDEX IF NOT EXISTS idx_sgso_audits_audit_date ON public.sgso_audits(audit_date DESC);

CREATE INDEX IF NOT EXISTS idx_templates_tenant_id ON public.templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);

CREATE INDEX IF NOT EXISTS idx_system_health_component ON public.system_health(component_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON public.system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_measured_at ON public.system_health(measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant_id ON public.performance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_path ON public.performance_metrics(page_path);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);

-- ===================================================================
-- Helpful Functions
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add update triggers
CREATE TRIGGER set_updated_at_beta_feedback
  BEFORE UPDATE ON public.beta_feedback
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_watchdog_alerts
  BEFORE UPDATE ON public.watchdog_behavior_alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_sgso_audits
  BEFORE UPDATE ON public.sgso_audits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_templates
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===================================================================
-- Comments for Documentation
-- ===================================================================

COMMENT ON TABLE public.beta_feedback IS 'Stores feedback from beta users for continuous improvement';
COMMENT ON TABLE public.ia_performance_log IS 'Tracks AI/ML performance metrics and costs across all modules';
COMMENT ON TABLE public.watchdog_behavior_alerts IS 'System watchdog alerts for anomaly detection and monitoring';
COMMENT ON TABLE public.sgso_audits IS 'Safety Management System (SGSO) audit records for vessels';
COMMENT ON TABLE public.templates IS 'Reusable templates for documents, reports, checklists, and forms';
COMMENT ON TABLE public.system_health IS 'Real-time system health monitoring metrics';
COMMENT ON TABLE public.performance_metrics IS 'Application performance metrics for user experience tracking';
