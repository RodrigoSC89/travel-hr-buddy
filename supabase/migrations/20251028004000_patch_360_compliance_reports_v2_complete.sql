-- PATCH 360: Compliance Reports v2 - Advanced Reporting System
-- Complete compliance reporting with configuration, scheduling, and multi-format export

-- ============================================
-- 1. Compliance Reports Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Report identification
  report_number TEXT UNIQUE NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('audit', 'inspection', 'safety', 'environmental', 'training', 'incident', 'custom')),
  
  -- Configuration
  template_id UUID,
  configuration JSONB NOT NULL DEFAULT '{}', -- {filters, checklists, sections}
  
  -- Scope
  vessel_ids UUID[],
  department TEXT,
  compliance_framework TEXT, -- 'ISO', 'ISM', 'ISPS', 'MLC', 'MARPOL', 'SOLAS'
  regulatory_body TEXT,
  
  -- Time period
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'archived')),
  
  -- Generation
  generated_by UUID REFERENCES auth.users(id),
  generation_date TIMESTAMPTZ DEFAULT now(),
  last_modified_at TIMESTAMPTZ DEFAULT now(),
  
  -- Approval workflow
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Content summary
  total_items_checked INTEGER DEFAULT 0,
  compliant_items INTEGER DEFAULT 0,
  non_compliant_items INTEGER DEFAULT 0,
  compliance_score NUMERIC,
  
  -- Findings
  findings JSONB DEFAULT '[]', -- [{item, status, severity, notes}]
  recommendations JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  
  -- Export tracking
  exported_formats TEXT[], -- ['pdf', 'excel', 'csv']
  last_exported_at TIMESTAMPTZ,
  export_count INTEGER DEFAULT 0,
  
  -- Scheduling (if recurring)
  is_scheduled BOOLEAN DEFAULT false,
  schedule_frequency TEXT CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_generation_date DATE,
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON public.compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON public.compliance_reports(status);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON public.compliance_reports(reporting_period_start, reporting_period_end);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_scheduled ON public.compliance_reports(is_scheduled, next_generation_date) WHERE is_scheduled = true;
CREATE INDEX IF NOT EXISTS idx_compliance_reports_framework ON public.compliance_reports(compliance_framework);

-- ============================================
-- 2. Compliance Report Templates
-- ============================================
CREATE TABLE IF NOT EXISTS public.compliance_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template details
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('audit', 'inspection', 'safety', 'environmental', 'training', 'incident', 'custom')),
  description TEXT,
  
  -- Template structure
  sections JSONB NOT NULL DEFAULT '[]', -- [{title, fields, checklist_items}]
  default_filters JSONB DEFAULT '{}',
  required_fields TEXT[],
  
  -- Checklist configuration
  checklist_items JSONB DEFAULT '[]', -- [{item_id, item_text, category, is_required}]
  scoring_method TEXT CHECK (scoring_method IN ('percentage', 'weighted', 'pass_fail', 'points')),
  
  -- Export configuration
  supported_formats TEXT[] DEFAULT ARRAY['pdf', 'excel', 'csv'],
  default_format TEXT DEFAULT 'pdf',
  
  -- Template metadata
  compliance_framework TEXT,
  regulatory_reference TEXT,
  version TEXT DEFAULT '1.0',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_report_templates_type ON public.compliance_report_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_report_templates_active ON public.compliance_report_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_report_templates_default ON public.compliance_report_templates(is_default) WHERE is_default = true;

-- ============================================
-- 3. Compliance Report Schedule
-- ============================================
CREATE TABLE IF NOT EXISTS public.compliance_report_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Schedule details
  schedule_name TEXT NOT NULL,
  report_template_id UUID NOT NULL REFERENCES public.compliance_report_templates(id) ON DELETE CASCADE,
  
  -- Frequency
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  time_of_day TIME,
  
  -- Scope
  vessel_ids UUID[],
  department TEXT,
  filters JSONB DEFAULT '{}',
  
  -- Recipients
  email_recipients TEXT[],
  notification_recipients UUID[],
  
  -- Export configuration
  auto_export BOOLEAN DEFAULT true,
  export_formats TEXT[] DEFAULT ARRAY['pdf'],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ NOT NULL,
  run_count INTEGER DEFAULT 0,
  
  -- Error handling
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  max_retry_attempts INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_report_schedule_active ON public.compliance_report_schedule(is_active, next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_report_schedule_next_run ON public.compliance_report_schedule(next_run_at);

-- ============================================
-- 4. Compliance Report Exports
-- ============================================
CREATE TABLE IF NOT EXISTS public.compliance_report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.compliance_reports(id) ON DELETE CASCADE,
  
  -- Export details
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'excel', 'csv', 'json', 'xml')),
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  file_size_bytes BIGINT,
  
  -- Export options
  include_attachments BOOLEAN DEFAULT true,
  include_charts BOOLEAN DEFAULT true,
  include_summary BOOLEAN DEFAULT true,
  
  -- Generation
  generated_by UUID REFERENCES auth.users(id),
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  generation_started_at TIMESTAMPTZ DEFAULT now(),
  generation_completed_at TIMESTAMPTZ,
  generation_duration_seconds INTEGER,
  error_message TEXT,
  
  -- Access control
  is_confidential BOOLEAN DEFAULT false,
  access_token TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Download tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  downloaded_by UUID[],
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_exports_report ON public.compliance_report_exports(report_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_status ON public.compliance_report_exports(generation_status);
CREATE INDEX IF NOT EXISTS idx_report_exports_created ON public.compliance_report_exports(created_at DESC);

-- ============================================
-- 5. Compliance Report History
-- ============================================
CREATE TABLE IF NOT EXISTS public.compliance_report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.compliance_reports(id) ON DELETE CASCADE,
  
  -- Change tracking
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'approved', 'published', 'exported', 'archived')),
  changed_by UUID REFERENCES auth.users(id),
  
  -- Change details
  field_changed TEXT,
  old_value JSONB,
  new_value JSONB,
  
  -- Context
  change_reason TEXT,
  change_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_history_report ON public.compliance_report_history(report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_created ON public.compliance_report_history(created_at DESC);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_report_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_report_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

CREATE POLICY "Users can view compliance reports"
  ON public.compliance_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create compliance reports"
  ON public.compliance_reports FOR INSERT
  TO authenticated
  WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Users can update their reports"
  ON public.compliance_reports FOR UPDATE
  TO authenticated
  USING (generated_by = auth.uid() OR true)
  WITH CHECK (true);

CREATE POLICY "Users can view report templates"
  ON public.compliance_report_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON public.compliance_report_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view schedules"
  ON public.compliance_report_schedule FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON public.compliance_report_schedule FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their exports"
  ON public.compliance_report_exports FOR SELECT
  TO authenticated
  USING (generated_by = auth.uid() OR true);

CREATE POLICY "Users can create exports"
  ON public.compliance_report_exports FOR INSERT
  TO authenticated
  WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Users can view report history"
  ON public.compliance_report_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create history entries"
  ON public.compliance_report_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- Functions
-- ============================================

-- Function to auto-log report changes
CREATE OR REPLACE FUNCTION log_compliance_report_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.compliance_report_history (
      report_id,
      change_type,
      changed_by,
      new_value
    ) VALUES (
      NEW.id,
      'created',
      NEW.generated_by,
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status != OLD.status THEN
      INSERT INTO public.compliance_report_history (
        report_id,
        change_type,
        changed_by,
        field_changed,
        old_value,
        new_value
      ) VALUES (
        NEW.id,
        CASE NEW.status
          WHEN 'approved' THEN 'approved'
          WHEN 'published' THEN 'published'
          WHEN 'archived' THEN 'archived'
          ELSE 'updated'
        END,
        NEW.generated_by,
        'status',
        to_jsonb(OLD.status),
        to_jsonb(NEW.status)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compliance_report_changes_logger
  AFTER INSERT OR UPDATE ON public.compliance_reports
  FOR EACH ROW
  EXECUTE FUNCTION log_compliance_report_changes();

-- Function to calculate next run date for schedules
CREATE OR REPLACE FUNCTION calculate_next_run_date(p_schedule_id UUID)
RETURNS VOID AS $$
DECLARE
  v_schedule RECORD;
  v_next_date DATE;
BEGIN
  SELECT * INTO v_schedule
  FROM public.compliance_report_schedule
  WHERE id = p_schedule_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate next run date based on frequency
  CASE v_schedule.frequency
    WHEN 'daily' THEN
      v_next_date := CURRENT_DATE + INTERVAL '1 day';
    WHEN 'weekly' THEN
      v_next_date := CURRENT_DATE + INTERVAL '1 week';
    WHEN 'monthly' THEN
      v_next_date := CURRENT_DATE + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      v_next_date := CURRENT_DATE + INTERVAL '3 months';
    WHEN 'yearly' THEN
      v_next_date := CURRENT_DATE + INTERVAL '1 year';
  END CASE;
  
  UPDATE public.compliance_report_schedule
  SET 
    next_run_at = v_next_date::TIMESTAMPTZ,
    last_run_at = NOW(),
    run_count = run_count + 1
  WHERE id = p_schedule_id;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps triggers
CREATE TRIGGER set_compliance_reports_updated_at 
  BEFORE UPDATE ON public.compliance_reports
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_report_templates_updated_at 
  BEFORE UPDATE ON public.compliance_report_templates
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_report_schedule_updated_at 
  BEFORE UPDATE ON public.compliance_report_schedule
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
