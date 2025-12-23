-- Create risk operations tables for RiskOps AI module

-- 1. Risk Assessments - core risk data
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  module_type TEXT NOT NULL CHECK (module_type IN ('PSC', 'MLC', 'LSA_FFA', 'OVID', 'DRILL', 'GENERAL')),
  risk_type TEXT NOT NULL CHECK (risk_type IN ('compliance', 'human', 'technical', 'operational', 'environmental')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_title TEXT NOT NULL,
  risk_description TEXT,
  affected_areas TEXT[] DEFAULT '{}',
  mitigation_actions JSONB DEFAULT '[]',
  ai_classification JSONB DEFAULT '{}',
  linked_findings TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mitigating', 'resolved', 'accepted')),
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Risk Trends - historical trend data
CREATE TABLE IF NOT EXISTS public.risk_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  module_type TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  average_risk_score NUMERIC(5,2),
  critical_risks_count INTEGER DEFAULT 0,
  high_risks_count INTEGER DEFAULT 0,
  medium_risks_count INTEGER DEFAULT 0,
  low_risks_count INTEGER DEFAULT 0,
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'worsening')),
  key_issues JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Risk Heatmap Data - visualization data
CREATE TABLE IF NOT EXISTS public.risk_heatmap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  region TEXT,
  module_type TEXT NOT NULL,
  risk_intensity NUMERIC(5,2) NOT NULL CHECK (risk_intensity >= 0 AND risk_intensity <= 100),
  risk_count INTEGER DEFAULT 0,
  period_date DATE DEFAULT CURRENT_DATE,
  coordinates JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vessel_id, module_type, period_date)
);

-- 4. Risk Alerts - watchdog alerts
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  risk_assessment_id UUID REFERENCES public.risk_assessments(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_exceeded', 'pattern_detected', 'anomaly', 'deadline_approaching', 'regulatory_change')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT,
  action_required BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Incident Types - categorization
CREATE TABLE IF NOT EXISTS public.incident_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  default_severity TEXT CHECK (default_severity IN ('low', 'medium', 'high', 'critical')),
  requires_investigation BOOLEAN DEFAULT false,
  requires_immediate_action BOOLEAN DEFAULT false,
  auto_notify_roles TEXT[],
  response_sla_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Incident Comments - timeline
CREATE TABLE IF NOT EXISTS public.incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'note' CHECK (comment_type IN ('note', 'update', 'resolution', 'escalation', 'follow_up')),
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Authenticated users can view risk_assessments" ON public.risk_assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert risk_assessments" ON public.risk_assessments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update risk_assessments" ON public.risk_assessments FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view risk_trends" ON public.risk_trends FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert risk_trends" ON public.risk_trends FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view risk_heatmap_data" ON public.risk_heatmap_data FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage risk_heatmap_data" ON public.risk_heatmap_data FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view risk_alerts" ON public.risk_alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage risk_alerts" ON public.risk_alerts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view incident_types" ON public.incident_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage incident_types" ON public.incident_types FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view incident_comments" ON public.incident_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert incident_comments" ON public.incident_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_assessments_vessel ON public.risk_assessments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status ON public.risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON public.risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_trends_vessel ON public.risk_trends(vessel_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_vessel ON public.risk_alerts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON public.risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident ON public.incident_comments(incident_id);

-- Insert default incident types
INSERT INTO public.incident_types (type_name, category, description, default_severity, requires_investigation) VALUES
('Collision', 'safety', 'Collision or near-miss incident', 'critical', true),
('Grounding', 'safety', 'Vessel grounding incident', 'critical', true),
('Fire', 'safety', 'Fire or explosion on board', 'critical', true),
('Oil Spill', 'environmental', 'Oil or chemical spill', 'high', true),
('Equipment Failure', 'operational', 'Critical equipment malfunction', 'medium', false),
('Medical Emergency', 'safety', 'Crew medical emergency', 'high', true),
('Security Breach', 'security', 'Security incident or breach', 'high', true),
('Weather Damage', 'operational', 'Damage from severe weather', 'medium', false)
ON CONFLICT (type_name) DO NOTHING;