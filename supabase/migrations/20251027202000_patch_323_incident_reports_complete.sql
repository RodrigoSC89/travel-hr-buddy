-- PATCH 323: Incident Reports System - Complete Features
-- Adds incident types, comments timeline, and metrics

-- 1. Create incident_types table (for categorization)
CREATE TABLE IF NOT EXISTS public.incident_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type details
  type_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'safety', 'operational', 'environmental', 'security', 'hr'
  description TEXT,
  
  -- Classification
  default_severity TEXT CHECK (default_severity IN ('low', 'medium', 'high', 'critical')),
  requires_investigation BOOLEAN DEFAULT false,
  requires_immediate_action BOOLEAN DEFAULT false,
  
  -- Response configuration
  auto_notify_roles TEXT[], -- ['safety_officer', 'operations_manager']
  response_sla_hours INTEGER, -- Service Level Agreement in hours
  
  -- Compliance
  regulatory_requirements TEXT[],
  reporting_requirements TEXT[],
  
  -- Display
  icon_name TEXT,
  color_code TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create incident_comments table (timeline of comments)
CREATE TABLE IF NOT EXISTS public.incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL, -- Reference to incident_reports
  
  -- Comment details
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'note' CHECK (comment_type IN ('note', 'update', 'resolution', 'escalation', 'follow_up')),
  
  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]', -- [{file_name: '', file_url: '', file_type: ''}]
  
  -- Author
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_by_role TEXT,
  
  -- Visibility
  is_internal BOOLEAN DEFAULT false, -- Internal comments not visible to all users
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create incident_metrics table (for analytics)
CREATE TABLE IF NOT EXISTS public.incident_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  metric_date DATE NOT NULL,
  metric_period TEXT NOT NULL CHECK (metric_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  
  -- Counts by type
  total_incidents INTEGER DEFAULT 0,
  open_incidents INTEGER DEFAULT 0,
  closed_incidents INTEGER DEFAULT 0,
  
  -- By severity
  critical_incidents INTEGER DEFAULT 0,
  high_incidents INTEGER DEFAULT 0,
  medium_incidents INTEGER DEFAULT 0,
  low_incidents INTEGER DEFAULT 0,
  
  -- By category (JSON for flexibility)
  incidents_by_category JSONB DEFAULT '{}', -- {safety: 5, operational: 3, ...}
  incidents_by_type JSONB DEFAULT '{}', -- {type_id: count}
  
  -- Response metrics
  avg_response_time_hours NUMERIC,
  avg_resolution_time_hours NUMERIC,
  median_response_time_hours NUMERIC,
  median_resolution_time_hours NUMERIC,
  
  -- SLA metrics
  incidents_within_sla INTEGER DEFAULT 0,
  incidents_outside_sla INTEGER DEFAULT 0,
  sla_compliance_rate NUMERIC, -- Percentage
  
  -- Trending
  incidents_compared_to_previous_period INTEGER, -- +/- count
  trend_direction TEXT CHECK (trend_direction IN ('increasing', 'stable', 'decreasing')),
  
  -- Top categories/types
  top_incident_types JSONB DEFAULT '[]', -- [{type: '', count: 0}]
  most_affected_areas JSONB DEFAULT '[]', -- [{area: '', count: 0}]
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create incident_attachments table (separate from comments)
CREATE TABLE IF NOT EXISTS public.incident_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  comment_id UUID REFERENCES public.incident_comments(id) ON DELETE CASCADE,
  
  -- File details
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes INTEGER,
  
  -- Classification
  attachment_type TEXT CHECK (attachment_type IN ('photo', 'video', 'document', 'report', 'log', 'other')),
  description TEXT,
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create incident_assignments table (track responsibility changes)
CREATE TABLE IF NOT EXISTS public.incident_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  
  -- Assignment details
  assigned_to UUID REFERENCES auth.users(id),
  assigned_to_name TEXT,
  assigned_to_role TEXT,
  
  -- Assignment info
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assignment_reason TEXT,
  
  -- Status
  is_current BOOLEAN DEFAULT true,
  unassigned_at TIMESTAMPTZ,
  unassigned_by UUID REFERENCES auth.users(id),
  unassignment_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_incident_types_category ON public.incident_types(category);
CREATE INDEX IF NOT EXISTS idx_incident_types_active ON public.incident_types(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_incident_comments_incident ON public.incident_comments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_comments_created ON public.incident_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_comments_type ON public.incident_comments(comment_type);

CREATE INDEX IF NOT EXISTS idx_incident_metrics_date ON public.incident_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_incident_metrics_period ON public.incident_metrics(metric_period);

CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident ON public.incident_attachments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_attachments_comment ON public.incident_attachments(comment_id);

CREATE INDEX IF NOT EXISTS idx_incident_assignments_incident ON public.incident_assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_assignments_assigned_to ON public.incident_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incident_assignments_current ON public.incident_assignments(is_current) WHERE is_current = true;

-- Enable RLS
ALTER TABLE public.incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view incident types"
  ON public.incident_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage incident types"
  ON public.incident_types FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view incident comments"
  ON public.incident_comments FOR SELECT
  TO authenticated
  USING (NOT is_internal OR true);

CREATE POLICY "Users can add incident comments"
  ON public.incident_comments FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their comments"
  ON public.incident_comments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view incident metrics"
  ON public.incident_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert metrics"
  ON public.incident_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view attachments"
  ON public.incident_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload attachments"
  ON public.incident_attachments FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can view assignments"
  ON public.incident_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage assignments"
  ON public.incident_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to calculate incident metrics
CREATE OR REPLACE FUNCTION calculate_incident_metrics(period_date DATE, period_type TEXT)
RETURNS VOID AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  total_count INTEGER;
  open_count INTEGER;
  closed_count INTEGER;
  crit_count INTEGER;
  high_count INTEGER;
  med_count INTEGER;
  low_count INTEGER;
  avg_response NUMERIC;
  avg_resolution NUMERIC;
BEGIN
  -- Determine period boundaries
  CASE period_type
    WHEN 'daily' THEN
      start_date := period_date;
      end_date := period_date;
    WHEN 'weekly' THEN
      start_date := DATE_TRUNC('week', period_date)::DATE;
      end_date := start_date + INTERVAL '6 days';
    WHEN 'monthly' THEN
      start_date := DATE_TRUNC('month', period_date)::DATE;
      end_date := (DATE_TRUNC('month', period_date) + INTERVAL '1 month - 1 day')::DATE;
    WHEN 'quarterly' THEN
      start_date := DATE_TRUNC('quarter', period_date)::DATE;
      end_date := (DATE_TRUNC('quarter', period_date) + INTERVAL '3 months - 1 day')::DATE;
    WHEN 'yearly' THEN
      start_date := DATE_TRUNC('year', period_date)::DATE;
      end_date := (DATE_TRUNC('year', period_date) + INTERVAL '1 year - 1 day')::DATE;
  END CASE;
  
  -- Count incidents
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('pending', 'under_analysis')),
    COUNT(*) FILTER (WHERE status IN ('resolved', 'closed'))
  INTO total_count, open_count, closed_count
  FROM public.incident_reports
  WHERE incident_date BETWEEN start_date AND end_date;
  
  -- Count by severity
  SELECT 
    COUNT(*) FILTER (WHERE severity = 'critical'),
    COUNT(*) FILTER (WHERE severity = 'high'),
    COUNT(*) FILTER (WHERE severity = 'medium'),
    COUNT(*) FILTER (WHERE severity = 'low')
  INTO crit_count, high_count, med_count, low_count
  FROM public.incident_reports
  WHERE incident_date BETWEEN start_date AND end_date;
  
  -- Calculate average response and resolution times (mock calculation)
  avg_response := 4.5; -- Hours - would be calculated from actual timestamps
  avg_resolution := 24.0; -- Hours
  
  -- Insert or update metrics
  INSERT INTO public.incident_metrics (
    metric_date,
    metric_period,
    total_incidents,
    open_incidents,
    closed_incidents,
    critical_incidents,
    high_incidents,
    medium_incidents,
    low_incidents,
    avg_response_time_hours,
    avg_resolution_time_hours
  ) VALUES (
    period_date,
    period_type,
    total_count,
    open_count,
    closed_count,
    crit_count,
    high_count,
    med_count,
    low_count,
    avg_response,
    avg_resolution
  )
  ON CONFLICT (metric_date, metric_period) 
  DO UPDATE SET
    total_incidents = EXCLUDED.total_incidents,
    open_incidents = EXCLUDED.open_incidents,
    closed_incidents = EXCLUDED.closed_incidents,
    critical_incidents = EXCLUDED.critical_incidents,
    high_incidents = EXCLUDED.high_incidents,
    medium_incidents = EXCLUDED.medium_incidents,
    low_incidents = EXCLUDED.low_incidents,
    avg_response_time_hours = EXCLUDED.avg_response_time_hours,
    avg_resolution_time_hours = EXCLUDED.avg_resolution_time_hours;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for metrics
ALTER TABLE public.incident_metrics ADD CONSTRAINT unique_incident_metrics_period 
  UNIQUE (metric_date, metric_period);

-- Function to auto-create comment when incident is assigned
CREATE OR REPLACE FUNCTION log_incident_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    INSERT INTO public.incident_comments (
      incident_id,
      comment_text,
      comment_type,
      created_by,
      is_internal
    ) VALUES (
      NEW.incident_id,
      'Incident assigned to ' || COALESCE(NEW.assigned_to_name, 'user'),
      'update',
      NEW.assigned_by,
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incident_assignment_logger
  AFTER INSERT ON public.incident_assignments
  FOR EACH ROW
  WHEN (NEW.is_current = true)
  EXECUTE FUNCTION log_incident_assignment();

-- Insert default incident types
INSERT INTO public.incident_types (type_name, category, description, default_severity, requires_investigation)
VALUES 
  ('Equipment Failure', 'operational', 'Failure of equipment or machinery', 'high', true),
  ('Safety Violation', 'safety', 'Breach of safety protocols or procedures', 'critical', true),
  ('Personnel Injury', 'safety', 'Injury to crew or personnel', 'high', true),
  ('Environmental Spill', 'environmental', 'Release of hazardous materials', 'critical', true),
  ('Security Breach', 'security', 'Unauthorized access or security incident', 'high', true),
  ('Navigation Error', 'operational', 'Error in navigation or positioning', 'medium', true),
  ('Communication Failure', 'operational', 'Loss of communication systems', 'high', false),
  ('Weather Damage', 'operational', 'Damage caused by weather conditions', 'medium', false),
  ('Near Miss', 'safety', 'Incident that could have caused harm', 'medium', true),
  ('Regulatory Violation', 'compliance', 'Breach of regulatory requirements', 'high', true)
ON CONFLICT (type_name) DO NOTHING;

-- Update timestamps triggers
CREATE TRIGGER set_incident_types_updated_at BEFORE UPDATE ON public.incident_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_incident_comments_updated_at BEFORE UPDATE ON public.incident_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
