-- PATCH 601: Relatórios Automáticos com IA
-- Creates tables for automated intelligent reporting system

-- Table: report_templates
-- Pre-defined report templates
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL CHECK (template_type IN ('INSPECTION', 'TASK', 'RISK', 'CREW_PERFORMANCE', 'MONTHLY_CONSOLIDATED', 'CUSTOM')),
  description TEXT,
  template_structure JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  data_sources JSONB DEFAULT '[]'::jsonb,
  visualization_config JSONB DEFAULT '{}'::jsonb,
  ai_summary_enabled BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: generated_reports
-- Stores generated reports
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES report_templates(id),
  report_title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('INSPECTION', 'TASK', 'RISK', 'CREW_PERFORMANCE', 'MONTHLY_CONSOLIDATED', 'CUSTOM')),
  vessel_id UUID,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  ai_insights JSONB DEFAULT '[]'::jsonb,
  executive_summary TEXT,
  conclusions JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('generating', 'completed', 'failed', 'archived')) DEFAULT 'generating',
  generation_time_ms INTEGER,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: report_exports
-- Tracks exported reports in various formats
CREATE TABLE IF NOT EXISTS report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES generated_reports(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL CHECK (export_format IN ('PDF', 'JSON', 'XLSX', 'CSV', 'HTML')),
  file_path TEXT,
  file_size_bytes BIGINT,
  file_hash TEXT,
  export_options JSONB DEFAULT '{}'::jsonb,
  exported_by UUID REFERENCES auth.users(id),
  exported_at TIMESTAMPTZ DEFAULT now(),
  downloaded_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: report_schedules
-- Automated report scheduling
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES report_templates(id),
  schedule_name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually', 'on_demand')),
  cron_expression TEXT,
  next_execution TIMESTAMPTZ NOT NULL,
  last_execution TIMESTAMPTZ,
  vessel_id UUID,
  recipients JSONB DEFAULT '[]'::jsonb,
  delivery_method TEXT CHECK (delivery_method IN ('email', 'dashboard', 'both')) DEFAULT 'dashboard',
  export_formats JSONB DEFAULT '["PDF"]'::jsonb,
  active BOOLEAN DEFAULT true,
  auto_archive_days INTEGER DEFAULT 90,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: report_generation_log
-- Logs report generation attempts
CREATE TABLE IF NOT EXISTS report_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES generated_reports(id),
  schedule_id UUID REFERENCES report_schedules(id),
  status TEXT NOT NULL CHECK (status IN ('started', 'processing', 'completed', 'failed')),
  execution_time_ms INTEGER,
  error_message TEXT,
  error_details JSONB,
  data_sources_queried JSONB DEFAULT '[]'::jsonb,
  ai_tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: report_dashboards
-- Dashboard configurations for report visualization
CREATE TABLE IF NOT EXISTS report_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_name TEXT NOT NULL,
  dashboard_type TEXT CHECK (dashboard_type IN ('inspection', 'risk', 'performance', 'consolidated', 'custom')),
  layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  widgets JSONB DEFAULT '[]'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  refresh_interval_seconds INTEGER DEFAULT 300,
  visible_to JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_report_templates_type ON report_templates(template_type);
CREATE INDEX idx_report_templates_active ON report_templates(active);

CREATE INDEX idx_generated_reports_template_id ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX idx_generated_reports_vessel_id ON generated_reports(vessel_id);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);
CREATE INDEX idx_generated_reports_generated_at ON generated_reports(generated_at);
CREATE INDEX idx_generated_reports_period ON generated_reports(period_start, period_end);

CREATE INDEX idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX idx_report_exports_format ON report_exports(export_format);
CREATE INDEX idx_report_exports_exported_at ON report_exports(exported_at);

CREATE INDEX idx_report_schedules_template_id ON report_schedules(template_id);
CREATE INDEX idx_report_schedules_type ON report_schedules(schedule_type);
CREATE INDEX idx_report_schedules_next_execution ON report_schedules(next_execution);
CREATE INDEX idx_report_schedules_active ON report_schedules(active);

CREATE INDEX idx_report_generation_log_report_id ON report_generation_log(report_id);
CREATE INDEX idx_report_generation_log_schedule_id ON report_generation_log(schedule_id);
CREATE INDEX idx_report_generation_log_status ON report_generation_log(status);
CREATE INDEX idx_report_generation_log_created_at ON report_generation_log(created_at);

CREATE INDEX idx_report_dashboards_type ON report_dashboards(dashboard_type);
CREATE INDEX idx_report_dashboards_created_by ON report_dashboards(created_by);

-- Enable Row Level Security
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view active report templates"
  ON report_templates FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage report templates"
  ON report_templates FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view reports for their vessels"
  ON generated_reports FOR SELECT
  USING (vessel_id IS NULL OR vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ) OR auth.uid() = generated_by);

CREATE POLICY "Users can generate reports"
  ON generated_reports FOR INSERT
  WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Users can view their report exports"
  ON report_exports FOR SELECT
  USING (report_id IN (
    SELECT id FROM generated_reports WHERE generated_by = auth.uid()
  ) OR auth.uid() = exported_by);

CREATE POLICY "Users can create report exports"
  ON report_exports FOR INSERT
  WITH CHECK (auth.uid() = exported_by);

CREATE POLICY "Users can view report schedules"
  ON report_schedules FOR SELECT
  USING (vessel_id IS NULL OR vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ) OR auth.uid() = created_by);

CREATE POLICY "Users can manage their report schedules"
  ON report_schedules FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view generation logs"
  ON report_generation_log FOR SELECT
  USING (true);

CREATE POLICY "System can write generation logs"
  ON report_generation_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view report dashboards"
  ON report_dashboards FOR SELECT
  USING (auth.uid() = created_by OR auth.uid()::text = ANY(
    SELECT jsonb_array_elements_text(visible_to)
  ));

CREATE POLICY "Users can manage their dashboards"
  ON report_dashboards FOR ALL
  USING (auth.uid() = created_by);

-- Triggers
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_reports_updated_at
  BEFORE UPDATE ON generated_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at
  BEFORE UPDATE ON report_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_dashboards_updated_at
  BEFORE UPDATE ON report_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
