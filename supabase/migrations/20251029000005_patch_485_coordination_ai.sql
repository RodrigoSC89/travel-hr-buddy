-- PATCH 485: Ativar Coordination AI v1
-- AI-driven coordination system between modules with priority management

-- Create coordination_logs table
CREATE TABLE IF NOT EXISTS public.coordination_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_module TEXT,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  event_data JSONB NOT NULL,
  ai_decision JSONB,
  decision_reasoning TEXT,
  coordination_actions JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for AI coordination rules
CREATE TABLE IF NOT EXISTS public.coordination_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  description TEXT,
  source_modules TEXT[] NOT NULL,
  target_modules TEXT[] NOT NULL,
  trigger_conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for module status tracking
CREATE TABLE IF NOT EXISTS public.module_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('online', 'offline', 'degraded', 'maintenance')) DEFAULT 'online',
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100) DEFAULT 100,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  active_tasks INTEGER DEFAULT 0,
  pending_events INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for AI coordination decisions
CREATE TABLE IF NOT EXISTS public.ai_coordination_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordination_log_id UUID REFERENCES public.coordination_logs(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  recommended_actions JSONB NOT NULL,
  reasoning TEXT,
  alternative_options JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_coordination_logs_event_type ON public.coordination_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_coordination_logs_source_module ON public.coordination_logs(source_module);
CREATE INDEX IF NOT EXISTS idx_coordination_logs_priority ON public.coordination_logs(priority);
CREATE INDEX IF NOT EXISTS idx_coordination_logs_status ON public.coordination_logs(status);
CREATE INDEX IF NOT EXISTS idx_coordination_logs_created_at ON public.coordination_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_coordination_rules_is_active ON public.coordination_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_coordination_rules_priority ON public.coordination_rules(priority);

CREATE INDEX IF NOT EXISTS idx_module_status_status ON public.module_status(status);
CREATE INDEX IF NOT EXISTS idx_module_status_last_heartbeat ON public.module_status(last_heartbeat);

CREATE INDEX IF NOT EXISTS idx_ai_coordination_decisions_log_id ON public.ai_coordination_decisions(coordination_log_id);

-- Add comments
COMMENT ON TABLE public.coordination_logs IS 'PATCH 485: Event coordination logs with AI decision tracking';
COMMENT ON TABLE public.coordination_rules IS 'PATCH 485: Rules for AI-driven module coordination';
COMMENT ON TABLE public.module_status IS 'PATCH 485: Real-time status tracking for coordinated modules';
COMMENT ON TABLE public.ai_coordination_decisions IS 'PATCH 485: AI decisions for coordination events';

-- Grant permissions
GRANT ALL ON public.coordination_logs TO authenticated;
GRANT ALL ON public.coordination_rules TO authenticated;
GRANT ALL ON public.module_status TO authenticated;
GRANT ALL ON public.ai_coordination_decisions TO authenticated;

-- Insert initial module status entries for key modules
INSERT INTO public.module_status (module_name, status, metadata) VALUES
  ('incident-reports', 'online', '{"description": "Consolidated incident management system"}'::jsonb),
  ('document-templates', 'online', '{"description": "Template editor with PDF rendering"}'::jsonb),
  ('satellite-tracker', 'online', '{"description": "Real-time satellite tracking"}'::jsonb),
  ('price-alerts', 'online', '{"description": "Price monitoring and alerts"}'::jsonb),
  ('bridgelink', 'online', '{"description": "Bridge communication system"}'::jsonb),
  ('watchdog', 'online', '{"description": "System monitoring and alerts"}'::jsonb)
ON CONFLICT (module_name) DO NOTHING;

-- Insert default coordination rules
INSERT INTO public.coordination_rules (
  rule_name, 
  description, 
  source_modules, 
  target_modules, 
  trigger_conditions, 
  actions,
  priority
) VALUES
  (
    'critical_incident_alert',
    'Notify all modules when a critical incident is reported',
    ARRAY['incident-reports'],
    ARRAY['bridgelink', 'watchdog'],
    '{"severity": "critical"}'::jsonb,
    '{"actions": ["send_alert", "escalate", "log_event"]}'::jsonb,
    'critical'
  ),
  (
    'price_alert_triggered',
    'Coordinate when price alerts are triggered',
    ARRAY['price-alerts'],
    ARRAY['document-templates', 'bridgelink'],
    '{"alert_triggered": true}'::jsonb,
    '{"actions": ["generate_report", "notify_user"]}'::jsonb,
    'high'
  ),
  (
    'satellite_position_update',
    'Process satellite position updates',
    ARRAY['satellite-tracker'],
    ARRAY['bridgelink', 'watchdog'],
    '{"position_changed": true}'::jsonb,
    '{"actions": ["update_map", "log_position"]}'::jsonb,
    'medium'
  )
ON CONFLICT (rule_name) DO NOTHING;

-- Function to log coordination event
CREATE OR REPLACE FUNCTION log_coordination_event(
  p_event_type TEXT,
  p_source_module TEXT,
  p_target_module TEXT,
  p_priority TEXT,
  p_event_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.coordination_logs (
    event_type,
    source_module,
    target_module,
    priority,
    event_data
  ) VALUES (
    p_event_type,
    p_source_module,
    p_target_module,
    p_priority,
    p_event_data
  ) RETURNING id INTO v_log_id;
  
  -- Update module status
  UPDATE public.module_status
  SET 
    pending_events = pending_events + 1,
    updated_at = NOW()
  WHERE module_name = p_target_module;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update module heartbeat
CREATE OR REPLACE FUNCTION update_module_heartbeat(
  p_module_name TEXT,
  p_health_score INTEGER DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.module_status (module_name, last_heartbeat, health_score)
  VALUES (p_module_name, NOW(), COALESCE(p_health_score, 100))
  ON CONFLICT (module_name) 
  DO UPDATE SET
    last_heartbeat = NOW(),
    health_score = COALESCE(p_health_score, module_status.health_score),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
