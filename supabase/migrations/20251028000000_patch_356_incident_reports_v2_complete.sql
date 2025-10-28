-- PATCH 356: Incident Reports v2 - Complete Workflow System
-- Full workflow with reporting, triaging, escalation, resolution, and PDF generation

-- ============================================
-- 1. Incident Workflow States Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.incident_workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  
  -- Workflow tracking
  workflow_stage TEXT NOT NULL CHECK (workflow_stage IN (
    'reported', 'triaging', 'under_investigation', 'escalated', 
    'action_required', 'resolved', 'closed', 'reopened'
  )),
  previous_stage TEXT,
  
  -- Assignment tracking
  assigned_team TEXT, -- 'safety', 'operations', 'maintenance', 'hr', 'management'
  escalation_level INTEGER DEFAULT 0 CHECK (escalation_level >= 0 AND escalation_level <= 3),
  
  -- SLA tracking
  sla_deadline TIMESTAMPTZ,
  sla_status TEXT CHECK (sla_status IN ('on_track', 'at_risk', 'overdue')),
  time_in_stage_hours NUMERIC,
  
  -- Action items
  required_actions TEXT[],
  completed_actions TEXT[],
  pending_approvals TEXT[],
  
  -- Metadata
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  stage_completed_at TIMESTAMPTZ,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_workflow_incident ON public.incident_workflow_states(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_workflow_stage ON public.incident_workflow_states(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_incident_workflow_sla ON public.incident_workflow_states(sla_status);

-- ============================================
-- 2. Incident Escalations Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.incident_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  
  -- Escalation details
  escalation_level INTEGER NOT NULL CHECK (escalation_level >= 1 AND escalation_level <= 3),
  escalation_reason TEXT NOT NULL,
  escalation_type TEXT CHECK (escalation_type IN ('severity', 'sla_breach', 'manual', 'automatic')),
  
  -- People notified
  escalated_to UUID REFERENCES auth.users(id),
  escalated_to_role TEXT,
  escalated_by UUID REFERENCES auth.users(id),
  
  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_method TEXT, -- 'email', 'sms', 'push', 'all'
  notification_sent_at TIMESTAMPTZ,
  
  -- Response tracking
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  response_text TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_escalations_incident ON public.incident_escalations(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_escalations_level ON public.incident_escalations(escalation_level);
CREATE INDEX IF NOT EXISTS idx_incident_escalations_active ON public.incident_escalations(is_active) WHERE is_active = true;

-- ============================================
-- 3. Incident Reports Export/PDF Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.incident_reports_export (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  
  -- Export details
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'excel', 'word', 'json')),
  export_format TEXT, -- 'full_report', 'summary', 'investigation', 'legal'
  
  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_url TEXT,
  
  -- Generation details
  generated_by UUID REFERENCES auth.users(id),
  generation_started_at TIMESTAMPTZ DEFAULT now(),
  generation_completed_at TIMESTAMPTZ,
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Content options
  include_attachments BOOLEAN DEFAULT true,
  include_comments BOOLEAN DEFAULT true,
  include_timeline BOOLEAN DEFAULT true,
  include_analytics BOOLEAN DEFAULT false,
  
  -- Access control
  is_confidential BOOLEAN DEFAULT false,
  access_token TEXT,
  expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_export_incident ON public.incident_reports_export(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_export_status ON public.incident_reports_export(generation_status);
CREATE INDEX IF NOT EXISTS idx_incident_export_created ON public.incident_reports_export(created_at DESC);

-- ============================================
-- 4. Incident Dashboard Statistics Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.incident_dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  stat_date DATE NOT NULL,
  stat_period TEXT NOT NULL CHECK (stat_period IN ('hourly', 'daily', 'weekly', 'monthly')),
  
  -- Counts
  total_incidents INTEGER DEFAULT 0,
  new_incidents INTEGER DEFAULT 0,
  open_incidents INTEGER DEFAULT 0,
  escalated_incidents INTEGER DEFAULT 0,
  resolved_incidents INTEGER DEFAULT 0,
  overdue_incidents INTEGER DEFAULT 0,
  
  -- By severity
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  
  -- By category
  safety_incidents INTEGER DEFAULT 0,
  operational_incidents INTEGER DEFAULT 0,
  environmental_incidents INTEGER DEFAULT 0,
  security_incidents INTEGER DEFAULT 0,
  hr_incidents INTEGER DEFAULT 0,
  
  -- Response metrics
  avg_response_time_minutes NUMERIC,
  avg_resolution_time_hours NUMERIC,
  sla_compliance_rate NUMERIC,
  escalation_rate NUMERIC,
  
  -- Trends
  trend_vs_previous_period TEXT CHECK (trend_vs_previous_period IN ('increasing', 'stable', 'decreasing')),
  trend_percentage NUMERIC,
  
  -- Top issues
  top_categories JSONB DEFAULT '[]',
  most_affected_vessels JSONB DEFAULT '[]',
  frequent_reporters JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(stat_date, stat_period)
);

CREATE INDEX IF NOT EXISTS idx_incident_stats_date ON public.incident_dashboard_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_incident_stats_period ON public.incident_dashboard_stats(stat_period);

-- ============================================
-- 5. Compliance Integration Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.incident_compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  
  -- Compliance tracking
  compliance_framework TEXT, -- 'ISO', 'IMO', 'SOLAS', 'MARPOL', 'ISM'
  requirement_reference TEXT,
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending_review', 'not_applicable')),
  
  -- Report details
  reported_to_authority BOOLEAN DEFAULT false,
  authority_name TEXT,
  authority_reference_number TEXT,
  reporting_date TIMESTAMPTZ,
  reporting_deadline TIMESTAMPTZ,
  
  -- Documentation
  compliance_documents JSONB DEFAULT '[]', -- [{doc_name, doc_url, uploaded_at}]
  investigation_required BOOLEAN DEFAULT false,
  investigation_status TEXT,
  
  -- Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_compliance_incident ON public.incident_compliance_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_compliance_framework ON public.incident_compliance_logs(compliance_framework);
CREATE INDEX IF NOT EXISTS idx_incident_compliance_status ON public.incident_compliance_logs(compliance_status);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.incident_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports_export ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_compliance_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Workflow states
CREATE POLICY "Users can view incident workflow states"
  ON public.incident_workflow_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can update workflow states"
  ON public.incident_workflow_states FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Escalations
CREATE POLICY "Users can view escalations"
  ON public.incident_escalations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create escalations"
  ON public.incident_escalations FOR INSERT
  TO authenticated
  WITH CHECK (escalated_by = auth.uid());

CREATE POLICY "Users can update their escalations"
  ON public.incident_escalations FOR UPDATE
  TO authenticated
  USING (escalated_by = auth.uid() OR escalated_to = auth.uid())
  WITH CHECK (true);

-- Exports
CREATE POLICY "Users can view their exports"
  ON public.incident_reports_export FOR SELECT
  TO authenticated
  USING (generated_by = auth.uid() OR true);

CREATE POLICY "Users can create exports"
  ON public.incident_reports_export FOR INSERT
  TO authenticated
  WITH CHECK (generated_by = auth.uid());

-- Dashboard stats
CREATE POLICY "Users can view dashboard stats"
  ON public.incident_dashboard_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage dashboard stats"
  ON public.incident_dashboard_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Compliance logs
CREATE POLICY "Users can view compliance logs"
  ON public.incident_compliance_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage compliance logs"
  ON public.incident_compliance_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Functions
-- ============================================

-- Function to auto-escalate critical incidents
CREATE OR REPLACE FUNCTION auto_escalate_critical_incidents()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' AND (OLD.severity IS NULL OR OLD.severity != 'critical') THEN
    -- Create escalation record
    INSERT INTO public.incident_escalations (
      incident_id,
      escalation_level,
      escalation_reason,
      escalation_type,
      escalated_by
    ) VALUES (
      NEW.id,
      1,
      'Automatic escalation due to critical severity',
      'automatic',
      NEW.reported_by
    );
    
    -- Create workflow state
    INSERT INTO public.incident_workflow_states (
      incident_id,
      workflow_stage,
      escalation_level,
      required_actions,
      changed_by
    ) VALUES (
      NEW.id,
      'escalated',
      1,
      ARRAY['immediate_review', 'assign_investigation_team', 'notify_management'],
      NEW.reported_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-escalation
CREATE TRIGGER trigger_auto_escalate_critical
  AFTER INSERT OR UPDATE ON public.incident_reports
  FOR EACH ROW
  WHEN (NEW.severity = 'critical')
  EXECUTE FUNCTION auto_escalate_critical_incidents();

-- Function to calculate incident statistics
CREATE OR REPLACE FUNCTION calculate_incident_dashboard_stats(p_date DATE, p_period TEXT)
RETURNS VOID AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_stats RECORD;
BEGIN
  -- Determine time range
  CASE p_period
    WHEN 'daily' THEN
      v_start_date := p_date::TIMESTAMPTZ;
      v_end_date := (p_date + INTERVAL '1 day')::TIMESTAMPTZ;
    WHEN 'weekly' THEN
      v_start_date := DATE_TRUNC('week', p_date::TIMESTAMPTZ);
      v_end_date := v_start_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      v_start_date := DATE_TRUNC('month', p_date::TIMESTAMPTZ);
      v_end_date := v_start_date + INTERVAL '1 month';
  END CASE;
  
  -- Calculate statistics
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= v_start_date) as new_count,
    COUNT(*) FILTER (WHERE status IN ('pending', 'under_analysis')) as open_count,
    COUNT(*) FILTER (WHERE id IN (SELECT incident_id FROM public.incident_escalations WHERE is_active = true)) as escalated_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical,
    COUNT(*) FILTER (WHERE severity = 'high') as high,
    COUNT(*) FILTER (WHERE severity = 'medium') as medium,
    COUNT(*) FILTER (WHERE severity = 'low') as low,
    COUNT(*) FILTER (WHERE category = 'safety') as safety,
    COUNT(*) FILTER (WHERE category = 'operational') as operational,
    COUNT(*) FILTER (WHERE category = 'environmental') as environmental,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_hours
  INTO v_stats
  FROM public.incident_reports
  WHERE incident_date >= v_start_date AND incident_date < v_end_date;
  
  -- Insert or update statistics
  INSERT INTO public.incident_dashboard_stats (
    stat_date,
    stat_period,
    total_incidents,
    new_incidents,
    open_incidents,
    escalated_incidents,
    resolved_incidents,
    critical_count,
    high_count,
    medium_count,
    low_count,
    safety_incidents,
    operational_incidents,
    environmental_incidents,
    avg_resolution_time_hours
  ) VALUES (
    p_date,
    p_period,
    v_stats.total,
    v_stats.new_count,
    v_stats.open_count,
    v_stats.escalated_count,
    v_stats.resolved_count,
    v_stats.critical,
    v_stats.high,
    v_stats.medium,
    v_stats.low,
    v_stats.safety,
    v_stats.operational,
    v_stats.environmental,
    v_stats.avg_resolution_hours
  )
  ON CONFLICT (stat_date, stat_period) DO UPDATE SET
    total_incidents = EXCLUDED.total_incidents,
    new_incidents = EXCLUDED.new_incidents,
    open_incidents = EXCLUDED.open_incidents,
    escalated_incidents = EXCLUDED.escalated_incidents,
    resolved_incidents = EXCLUDED.resolved_incidents,
    critical_count = EXCLUDED.critical_count,
    high_count = EXCLUDED.high_count,
    medium_count = EXCLUDED.medium_count,
    low_count = EXCLUDED.low_count,
    safety_incidents = EXCLUDED.safety_incidents,
    operational_incidents = EXCLUDED.operational_incidents,
    environmental_incidents = EXCLUDED.environmental_incidents,
    avg_resolution_time_hours = EXCLUDED.avg_resolution_time_hours;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_incident_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = now();
  END IF;
  
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
DROP TRIGGER IF EXISTS trigger_update_incident_timestamps ON public.incident_reports;
CREATE TRIGGER trigger_update_incident_timestamps
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_timestamps();

-- Update timestamps for compliance logs
CREATE TRIGGER set_incident_compliance_updated_at 
  BEFORE UPDATE ON public.incident_compliance_logs
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
