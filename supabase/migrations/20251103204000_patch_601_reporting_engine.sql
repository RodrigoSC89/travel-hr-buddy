-- PATCH 601: LLM Reporting Engine
-- Creates tables for AI-powered report generation

-- Create report_templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type VARCHAR(50) NOT NULL, -- inspection, risk, tasks, compliance, custom
  template_content JSONB NOT NULL DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  format VARCHAR(20) NOT NULL, -- pdf, json, xlsx
  file_url TEXT,
  parameters JSONB DEFAULT '{}',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  vessel_id UUID,
  module VARCHAR(50),
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- Create report_schedules table
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME,
  recipients JSONB DEFAULT '[]', -- array of email addresses
  format VARCHAR(20) NOT NULL DEFAULT 'pdf',
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_report_templates_active ON report_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_generated_reports_template ON generated_reports(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_at ON generated_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_generated_reports_vessel ON generated_reports(vessel_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_module ON generated_reports(module);
CREATE INDEX IF NOT EXISTS idx_report_schedules_template ON report_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run_at);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for report_templates
CREATE POLICY "Users can view active templates"
  ON report_templates FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'report_manager')
  ));

CREATE POLICY "Report managers can create templates"
  ON report_templates FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'report_manager')
    )
  );

CREATE POLICY "Report managers can update templates"
  ON report_templates FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'report_manager')
    )
  );

-- Create RLS policies for generated_reports
CREATE POLICY "Users can view reports"
  ON generated_reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can generate reports"
  ON generated_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for report_schedules
CREATE POLICY "Users can view schedules"
  ON report_schedules FOR SELECT
  USING (true);

CREATE POLICY "Report managers can create schedules"
  ON report_schedules FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'report_manager')
    )
  );

CREATE POLICY "Report managers can update schedules"
  ON report_schedules FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'report_manager')
    )
  );

-- Create function to calculate next run time
CREATE OR REPLACE FUNCTION calculate_next_run_time(
  p_frequency VARCHAR,
  p_day_of_week INTEGER,
  p_day_of_month INTEGER,
  p_time_of_day TIME
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  next_run TIMESTAMP WITH TIME ZONE;
  current_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  CASE p_frequency
    WHEN 'daily' THEN
      next_run := (current_time::DATE + INTERVAL '1 day' + p_time_of_day)::TIMESTAMP WITH TIME ZONE;
    WHEN 'weekly' THEN
      next_run := (current_time::DATE + ((7 + p_day_of_week - EXTRACT(DOW FROM current_time)::INTEGER) % 7) * INTERVAL '1 day' + p_time_of_day)::TIMESTAMP WITH TIME ZONE;
      IF next_run <= current_time THEN
        next_run := next_run + INTERVAL '7 days';
      END IF;
    WHEN 'monthly' THEN
      next_run := (DATE_TRUNC('month', current_time) + (p_day_of_month - 1) * INTERVAL '1 day' + p_time_of_day)::TIMESTAMP WITH TIME ZONE;
      IF next_run <= current_time THEN
        next_run := (DATE_TRUNC('month', current_time) + INTERVAL '1 month' + (p_day_of_month - 1) * INTERVAL '1 day' + p_time_of_day)::TIMESTAMP WITH TIME ZONE;
      END IF;
    WHEN 'quarterly' THEN
      next_run := (DATE_TRUNC('quarter', current_time) + INTERVAL '3 months' + p_time_of_day)::TIMESTAMP WITH TIME ZONE;
      IF next_run <= current_time THEN
        next_run := next_run + INTERVAL '3 months';
      END IF;
  END CASE;
  
  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set next_run_at on insert
CREATE OR REPLACE FUNCTION set_next_run_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.next_run_at = calculate_next_run_time(
    NEW.frequency,
    NEW.day_of_week,
    NEW.day_of_month,
    NEW.time_of_day
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_report_schedule_next_run
  BEFORE INSERT ON report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION set_next_run_time();

-- Create function to get report statistics
CREATE OR REPLACE FUNCTION get_report_statistics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_reports', COUNT(*),
    'reports_by_type', jsonb_object_agg(
      report_type,
      COUNT(*)
    ),
    'reports_by_format', jsonb_object_agg(
      format,
      COUNT(*)
    ),
    'ai_generated_count', COUNT(*) FILTER (WHERE ai_generated = true),
    'recent_reports', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', title,
          'type', report_type,
          'generated_at', generated_at
        )
      )
      FROM (
        SELECT id, title, report_type, generated_at
        FROM generated_reports
        ORDER BY generated_at DESC
        LIMIT 5
      ) recent
    )
  )
  INTO result
  FROM generated_reports;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE report_templates IS 'PATCH 601: Configurable report templates';
COMMENT ON TABLE generated_reports IS 'PATCH 601: Generated reports with AI-powered content';
COMMENT ON TABLE report_schedules IS 'PATCH 601: Automated report generation schedules';
