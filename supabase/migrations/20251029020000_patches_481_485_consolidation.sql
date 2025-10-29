-- =====================================================
-- PATCHES 481-485: Consolidation and Feature Completion
-- =====================================================
-- PATCH 481: Consolidate incidents
-- PATCH 482: Finalize Template Editor
-- PATCH 483: Activate Satellite Tracker
-- PATCH 484: Finalize Price Alerts
-- PATCH 485: Activate Coordination AI
--
-- Dependencies:
-- - patch_363_satellite_tracker.sql (satellite functions)
-- - patch_440_ai_coordination_logs.sql (coordination logs table)
-- - price_history table (from earlier migration)
-- =====================================================

-- =====================================================
-- PATCH 481: Incident Reports Consolidation
-- =====================================================

-- Add AI analysis columns to incident_reports if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'incident_reports' AND column_name = 'ai_analysis') THEN
    ALTER TABLE public.incident_reports ADD COLUMN ai_analysis JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'incident_reports' AND column_name = 'replay_status') THEN
    ALTER TABLE public.incident_reports ADD COLUMN replay_status TEXT CHECK (replay_status IN ('pending', 'in_progress', 'completed', 'failed'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'incident_reports' AND column_name = 'incident_number') THEN
    ALTER TABLE public.incident_reports ADD COLUMN incident_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'incident_reports' AND column_name = 'category') THEN
    ALTER TABLE public.incident_reports ADD COLUMN category TEXT;
  END IF;
END $$;

-- Create unified view for backward compatibility
CREATE OR REPLACE VIEW public.incidents_unified AS
SELECT 
  id,
  COALESCE(incident_number, code) as incident_number,
  title,
  description,
  COALESCE(category, type) as category,
  severity,
  status,
  reported_by,
  assigned_to,
  reported_at,
  closed_at,
  location,
  metadata,
  ai_analysis,
  replay_status,
  created_at,
  updated_at
FROM public.incident_reports;

COMMENT ON VIEW public.incidents_unified IS 'Unified view for incident data with backward compatibility';

-- =====================================================
-- PATCH 482: Template Editor Tables
-- =====================================================

-- Template placeholders table
CREATE TABLE IF NOT EXISTS public.template_placeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  placeholder_key TEXT NOT NULL,
  placeholder_label TEXT NOT NULL,
  placeholder_type TEXT NOT NULL CHECK (placeholder_type IN ('text', 'number', 'date', 'boolean', 'select', 'textarea')),
  default_value TEXT,
  options JSONB DEFAULT '[]'::jsonb, -- For select type
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_template_placeholders_template_id ON public.template_placeholders(template_id);
CREATE INDEX IF NOT EXISTS idx_template_placeholders_key ON public.template_placeholders(placeholder_key);

-- Rendered documents table
CREATE TABLE IF NOT EXISTS public.rendered_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  rendered_content TEXT NOT NULL,
  pdf_url TEXT, -- Path in workspace_files storage
  pdf_settings JSONB DEFAULT '{}'::jsonb, -- orientation, pageSize, margins
  placeholder_values JSONB DEFAULT '{}'::jsonb,
  intelligence_metadata JSONB DEFAULT '{}'::jsonb, -- AI-generated insights
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rendered_documents_template_id ON public.rendered_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_rendered_documents_user_id ON public.rendered_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_rendered_documents_status ON public.rendered_documents(status);
CREATE INDEX IF NOT EXISTS idx_rendered_documents_created_at ON public.rendered_documents(created_at DESC);

-- Enable RLS
ALTER TABLE public.template_placeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendered_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_placeholders
CREATE POLICY "Everyone can view template placeholders"
  ON public.template_placeholders FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage template placeholders"
  ON public.template_placeholders FOR ALL
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for rendered_documents
CREATE POLICY "Users can view their own rendered documents"
  ON public.rendered_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own rendered documents"
  ON public.rendered_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rendered documents"
  ON public.rendered_documents FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own rendered documents"
  ON public.rendered_documents FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- PATCH 483: Satellite Tracker Enhancements
-- =====================================================

-- Add coordinate validation constraints if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'satellite_positions_latitude_check'
  ) THEN
    ALTER TABLE public.satellite_positions 
    ADD CONSTRAINT satellite_positions_latitude_check 
    CHECK (latitude >= -90 AND latitude <= 90);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'satellite_positions_longitude_check'
  ) THEN
    ALTER TABLE public.satellite_positions 
    ADD CONSTRAINT satellite_positions_longitude_check 
    CHECK (longitude >= -180 AND longitude <= 180);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'satellite_positions_altitude_check'
  ) THEN
    ALTER TABLE public.satellite_positions 
    ADD CONSTRAINT satellite_positions_altitude_check 
    CHECK (altitude >= 0);
  END IF;
END $$;

-- Add TLE data column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'satellite_positions' AND column_name = 'tle_data') THEN
    ALTER TABLE public.satellite_positions ADD COLUMN tle_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

COMMENT ON TABLE public.satellite_positions IS 'Real-time satellite positions with TLE data and coordinate validation (lat: -90 to 90, lon: -180 to 180, alt: >= 0)';

-- =====================================================
-- PATCH 484: Price Alerts Enhancements
-- =====================================================

-- Ensure price_alert_notifications table exists with multi-channel support
CREATE TABLE IF NOT EXISTS public.price_alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_id UUID REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  current_price NUMERIC(10,2) NOT NULL,
  target_price NUMERIC(10,2) NOT NULL,
  price_difference NUMERIC(10,2),
  notification_channels TEXT[] DEFAULT ARRAY['in_app']::TEXT[], -- in_app, email, sms, push
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_alert_notifications_user_id ON public.price_alert_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alert_notifications_alert_id ON public.price_alert_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_price_alert_notifications_is_read ON public.price_alert_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_price_alert_notifications_sent_at ON public.price_alert_notifications(sent_at DESC);

-- Enable RLS
ALTER TABLE public.price_alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own price alert notifications"
  ON public.price_alert_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create price alert notifications"
  ON public.price_alert_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own price alert notifications"
  ON public.price_alert_notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Function to record price check (trigger function)
CREATE OR REPLACE FUNCTION public.record_price_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log price check in price_history if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'price_history') THEN
    INSERT INTO public.price_history (
      alert_id,
      price,
      checked_at
    ) VALUES (
      NEW.id,
      NEW.current_price,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for price checks on price_alerts updates
DROP TRIGGER IF EXISTS trigger_record_price_check ON public.price_alerts;
CREATE TRIGGER trigger_record_price_check
  AFTER UPDATE OF current_price ON public.price_alerts
  FOR EACH ROW
  WHEN (NEW.current_price IS DISTINCT FROM OLD.current_price)
  EXECUTE FUNCTION public.record_price_check();

COMMENT ON FUNCTION public.record_price_check IS 'Automatically records price checks when current_price is updated';

-- =====================================================
-- PATCH 485: Coordination AI System
-- =====================================================

-- Coordination rules table
CREATE TABLE IF NOT EXISTS public.coordination_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('priority', 'conflict_resolution', 'escalation', 'routing', 'fallback')),
  source_modules TEXT[] NOT NULL, -- Modules this rule applies to
  target_modules TEXT[], -- Modules that can be targeted
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- Rule conditions
  actions JSONB NOT NULL DEFAULT '{}'::jsonb, -- Actions to take
  priority INTEGER DEFAULT 0, -- Higher priority rules evaluated first
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coordination_rules_rule_type ON public.coordination_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_coordination_rules_is_active ON public.coordination_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_coordination_rules_priority ON public.coordination_rules(priority DESC);

-- Module status table
CREATE TABLE IF NOT EXISTS public.module_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL UNIQUE,
  module_type TEXT NOT NULL CHECK (module_type IN ('core', 'ai', 'service', 'integration')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'error')),
  health_score NUMERIC(5,2) DEFAULT 100.00 CHECK (health_score >= 0 AND health_score <= 100),
  last_heartbeat TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  capabilities JSONB DEFAULT '{}'::jsonb, -- What the module can do
  dependencies TEXT[], -- Other modules this depends on
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_module_status_module_name ON public.module_status(module_name);
CREATE INDEX IF NOT EXISTS idx_module_status_status ON public.module_status(status);
CREATE INDEX IF NOT EXISTS idx_module_status_last_heartbeat ON public.module_status(last_heartbeat DESC);

-- AI coordination decisions table
CREATE TABLE IF NOT EXISTS public.ai_coordination_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_modules TEXT[],
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  decision_type TEXT NOT NULL CHECK (decision_type IN ('route', 'escalate', 'fallback', 'coordinate', 'resolve')),
  decision_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  evaluation_score NUMERIC(5,2), -- AI confidence score
  rules_applied TEXT[], -- Rule IDs that were applied
  actions_taken JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  result JSONB DEFAULT '{}'::jsonb,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_coordination_decisions_decision_id ON public.ai_coordination_decisions(decision_id);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_decisions_source_module ON public.ai_coordination_decisions(source_module);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_decisions_priority ON public.ai_coordination_decisions(priority);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_decisions_status ON public.ai_coordination_decisions(status);
CREATE INDEX IF NOT EXISTS idx_ai_coordination_decisions_created_at ON public.ai_coordination_decisions(created_at DESC);

-- Enable RLS
ALTER TABLE public.coordination_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coordination_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coordination_rules
CREATE POLICY "Everyone can view active coordination rules"
  ON public.coordination_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coordination rules"
  ON public.coordination_rules FOR ALL
  USING (get_user_role() IN ('admin', 'operator'));

-- RLS Policies for module_status
CREATE POLICY "Everyone can view module status"
  ON public.module_status FOR SELECT
  USING (true);

CREATE POLICY "System can update module status"
  ON public.module_status FOR ALL
  USING (true);

-- RLS Policies for ai_coordination_decisions
CREATE POLICY "Everyone can view coordination decisions"
  ON public.ai_coordination_decisions FOR SELECT
  USING (true);

CREATE POLICY "System can manage coordination decisions"
  ON public.ai_coordination_decisions FOR ALL
  USING (true);

-- Insert default coordination rules
INSERT INTO public.coordination_rules (rule_name, rule_type, source_modules, target_modules, conditions, actions, priority)
VALUES
  ('critical_incident_escalation', 'escalation', 
   ARRAY['incident-reports']::TEXT[], ARRAY['bridgelink', 'watchdog']::TEXT[],
   '{"severity": "critical", "status": "open"}'::jsonb,
   '{"notify": ["bridgelink", "watchdog"], "escalate": true}'::jsonb,
   100),
  ('satellite_alert_coordination', 'routing',
   ARRAY['satellite-tracker']::TEXT[], ARRAY['incident-reports', 'watchdog']::TEXT[],
   '{"alert_type": "collision_risk", "severity": "critical"}'::jsonb,
   '{"create_incident": true, "notify_watchdog": true}'::jsonb,
   90),
  ('price_alert_notification', 'routing',
   ARRAY['price-alerts']::TEXT[], ARRAY['bridgelink']::TEXT[],
   '{"target_reached": true, "is_active": true}'::jsonb,
   '{"send_notification": true, "channels": ["in_app", "email"]}'::jsonb,
   50)
ON CONFLICT (rule_name) DO NOTHING;

-- Initialize default module statuses
INSERT INTO public.module_status (module_name, module_type, status, capabilities)
VALUES
  ('incident-reports', 'core', 'active', '{"report": true, "analyze": true, "ai_replay": true}'::jsonb),
  ('document-templates', 'service', 'active', '{"render": true, "pdf_export": true, "placeholders": true}'::jsonb),
  ('satellite-tracker', 'service', 'active', '{"track": true, "predict": true, "alert": true}'::jsonb),
  ('price-alerts', 'service', 'active', '{"monitor": true, "notify": true, "analyze": true}'::jsonb),
  ('bridgelink', 'integration', 'active', '{"notify": true, "communicate": true}'::jsonb),
  ('watchdog', 'ai', 'active', '{"monitor": true, "alert": true, "analyze": true}'::jsonb)
ON CONFLICT (module_name) DO NOTHING;

-- Function to update module heartbeat
CREATE OR REPLACE FUNCTION public.update_module_heartbeat(
  p_module_name TEXT,
  p_health_score NUMERIC DEFAULT 100.00
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.module_status
  SET 
    last_heartbeat = now(),
    health_score = p_health_score,
    status = CASE 
      WHEN p_health_score >= 80 THEN 'active'
      WHEN p_health_score >= 50 THEN 'maintenance'
      ELSE 'error'
    END,
    updated_at = now()
  WHERE module_name = p_module_name;
  
  IF NOT FOUND THEN
    INSERT INTO public.module_status (module_name, module_type, status, health_score, last_heartbeat)
    VALUES (p_module_name, 'service', 'active', p_health_score, now());
  END IF;
END;
$$;

COMMENT ON FUNCTION public.update_module_heartbeat IS 'Updates module heartbeat and health status';

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.template_placeholders IS 'PATCH 482: Template placeholder definitions for dynamic content';
COMMENT ON TABLE public.rendered_documents IS 'PATCH 482: Rendered documents with PDF export and AI metadata';
COMMENT ON TABLE public.price_alert_notifications IS 'PATCH 484: Multi-channel price alert notifications';
COMMENT ON TABLE public.coordination_rules IS 'PATCH 485: AI coordination rules for module orchestration';
COMMENT ON TABLE public.module_status IS 'PATCH 485: Module health and status tracking';
COMMENT ON TABLE public.ai_coordination_decisions IS 'PATCH 485: AI-driven coordination decisions and actions';
