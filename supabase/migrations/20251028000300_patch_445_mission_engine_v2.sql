-- PATCH 445: Mission Engine v2 Enhancement
-- Create mission_events table for tracking mission execution history

CREATE TABLE IF NOT EXISTS mission_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  mission_code TEXT,
  mission_name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'mission_created',
    'mission_planned',
    'mission_started',
    'mission_paused',
    'mission_resumed',
    'mission_completed',
    'mission_failed',
    'mission_cancelled',
    'state_transition',
    'waypoint_reached',
    'objective_completed',
    'error_occurred',
    'manual_intervention'
  )),
  from_state TEXT CHECK (from_state IN ('idle', 'planned', 'in-progress', 'paused', 'completed', 'failed', 'cancelled')),
  to_state TEXT CHECK (to_state IN ('idle', 'planned', 'in-progress', 'paused', 'completed', 'failed', 'cancelled')),
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  triggered_by TEXT, -- user_id or 'system'
  module_source TEXT, -- e.g., 'navigation_copilot', 'underwater_drone', 'forecast'
  coordinates JSONB, -- {latitude, longitude}
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mission_events_mission_id ON mission_events(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_events_timestamp ON mission_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mission_events_event_type ON mission_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mission_events_state ON mission_events(to_state);

-- Create mission_state_history table for FSM state tracking
CREATE TABLE IF NOT EXISTS mission_state_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('idle', 'planned', 'in-progress', 'paused', 'completed', 'failed', 'cancelled')),
  previous_state TEXT CHECK (previous_state IN ('idle', 'planned', 'in-progress', 'paused', 'completed', 'failed', 'cancelled')),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transition_reason TEXT,
  automated BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for state history
CREATE INDEX IF NOT EXISTS idx_mission_state_history_mission_id ON mission_state_history(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_state_history_state ON mission_state_history(state);
CREATE INDEX IF NOT EXISTS idx_mission_state_history_entered ON mission_state_history(entered_at DESC);

-- Create mission_integrations table for tracking module integrations
CREATE TABLE IF NOT EXISTS mission_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  module_name TEXT NOT NULL CHECK (module_name IN (
    'navigation_copilot',
    'underwater_drone',
    'forecast',
    'satellite_tracker',
    'ocean_sonar',
    'sensors_hub',
    'satcom'
  )),
  integration_status TEXT NOT NULL CHECK (integration_status IN ('connected', 'disconnected', 'error', 'degraded')),
  last_sync TIMESTAMPTZ,
  sync_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  health_score NUMERIC CHECK (health_score >= 0 AND health_score <= 100),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mission_id, module_name)
);

-- Create indexes for integrations
CREATE INDEX IF NOT EXISTS idx_mission_integrations_mission_id ON mission_integrations(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_integrations_module ON mission_integrations(module_name);
CREATE INDEX IF NOT EXISTS idx_mission_integrations_status ON mission_integrations(integration_status);

-- Enable RLS
ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allow authenticated users to read mission events"
  ON mission_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert mission events"
  ON mission_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read mission state history"
  ON mission_state_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert mission state history"
  ON mission_state_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update mission state history"
  ON mission_state_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read mission integrations"
  ON mission_integrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to upsert mission integrations"
  ON mission_integrations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update mission integrations"
  ON mission_integrations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to log mission event
CREATE OR REPLACE FUNCTION log_mission_event(
  p_mission_id UUID,
  p_event_type TEXT,
  p_description TEXT,
  p_from_state TEXT DEFAULT NULL,
  p_to_state TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_triggered_by TEXT DEFAULT 'system',
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO mission_events (
    mission_id,
    event_type,
    description,
    from_state,
    to_state,
    severity,
    triggered_by,
    metadata
  ) VALUES (
    p_mission_id,
    p_event_type,
    p_description,
    p_from_state,
    p_to_state,
    p_severity,
    p_triggered_by,
    p_metadata
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to transition mission state
CREATE OR REPLACE FUNCTION transition_mission_state(
  p_mission_id UUID,
  p_new_state TEXT,
  p_reason TEXT DEFAULT NULL,
  p_automated BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
  current_state_record RECORD;
BEGIN
  -- Get current state
  SELECT * INTO current_state_record
  FROM mission_state_history
  WHERE mission_id = p_mission_id
    AND exited_at IS NULL
  ORDER BY entered_at DESC
  LIMIT 1;
  
  -- Close current state
  IF current_state_record.id IS NOT NULL THEN
    UPDATE mission_state_history
    SET 
      exited_at = NOW(),
      duration_seconds = EXTRACT(EPOCH FROM (NOW() - entered_at))::INTEGER
    WHERE id = current_state_record.id;
  END IF;
  
  -- Insert new state
  INSERT INTO mission_state_history (
    mission_id,
    state,
    previous_state,
    transition_reason,
    automated
  ) VALUES (
    p_mission_id,
    p_new_state,
    current_state_record.state,
    p_reason,
    p_automated
  );
  
  -- Log event
  PERFORM log_mission_event(
    p_mission_id,
    'state_transition',
    'Mission transitioned from ' || COALESCE(current_state_record.state, 'none') || ' to ' || p_new_state,
    current_state_record.state,
    p_new_state,
    'info',
    'system'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update module integration status
CREATE OR REPLACE FUNCTION update_mission_integration(
  p_mission_id UUID,
  p_module_name TEXT,
  p_status TEXT,
  p_health_score NUMERIC DEFAULT NULL,
  p_error TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO mission_integrations (
    mission_id,
    module_name,
    integration_status,
    last_sync,
    sync_count,
    health_score,
    last_error,
    updated_at
  ) VALUES (
    p_mission_id,
    p_module_name,
    p_status,
    NOW(),
    1,
    p_health_score,
    p_error,
    NOW()
  )
  ON CONFLICT (mission_id, module_name)
  DO UPDATE SET
    integration_status = EXCLUDED.integration_status,
    last_sync = NOW(),
    sync_count = mission_integrations.sync_count + 1,
    health_score = COALESCE(EXCLUDED.health_score, mission_integrations.health_score),
    last_error = COALESCE(EXCLUDED.last_error, mission_integrations.last_error),
    error_count = CASE WHEN EXCLUDED.last_error IS NOT NULL THEN mission_integrations.error_count + 1 ELSE mission_integrations.error_count END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get mission statistics
CREATE OR REPLACE FUNCTION get_mission_stats(
  p_hours INTEGER DEFAULT 24
) RETURNS TABLE (
  total_missions INTEGER,
  active_missions INTEGER,
  completed_missions INTEGER,
  failed_missions INTEGER,
  total_events INTEGER,
  critical_events INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT mission_id)::INTEGER as total_missions,
    (SELECT COUNT(DISTINCT mission_id)::INTEGER FROM mission_state_history 
     WHERE state = 'in-progress' AND exited_at IS NULL) as active_missions,
    (SELECT COUNT(DISTINCT mission_id)::INTEGER FROM mission_state_history 
     WHERE state = 'completed' 
     AND entered_at > NOW() - (p_hours || ' hours')::INTERVAL) as completed_missions,
    (SELECT COUNT(DISTINCT mission_id)::INTEGER FROM mission_state_history 
     WHERE state = 'failed' 
     AND entered_at > NOW() - (p_hours || ' hours')::INTERVAL) as failed_missions,
    (SELECT COUNT(*)::INTEGER FROM mission_events 
     WHERE timestamp > NOW() - (p_hours || ' hours')::INTERVAL) as total_events,
    (SELECT COUNT(*)::INTEGER FROM mission_events 
     WHERE severity = 'critical' 
     AND timestamp > NOW() - (p_hours || ' hours')::INTERVAL) as critical_events
  FROM mission_events
  WHERE timestamp > NOW() - (p_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE mission_events IS 'PATCH 445 - Mission execution event tracking and history';
COMMENT ON TABLE mission_state_history IS 'PATCH 445 - FSM state transition history for missions';
COMMENT ON TABLE mission_integrations IS 'PATCH 445 - Mission module integration status tracking';
