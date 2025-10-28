-- PATCH 442: SATCOM v2 Enhancement
-- Create satcom_failover_logs table for tracking satellite communication failover events

CREATE TABLE IF NOT EXISTS satcom_failover_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'fallback_initiated',
    'fallback_completed',
    'recovery_initiated',
    'recovery_completed',
    'connection_lost',
    'connection_restored',
    'manual_switch',
    'automatic_switch'
  )),
  from_provider TEXT CHECK (from_provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  to_provider TEXT CHECK (to_provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  from_connection_id TEXT,
  to_connection_id TEXT,
  reason TEXT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  latency_ms INTEGER,
  signal_strength NUMERIC,
  bandwidth_kbps INTEGER,
  packet_loss_percent NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_satcom_failover_vessel_id ON satcom_failover_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_satcom_failover_timestamp ON satcom_failover_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_satcom_failover_event_type ON satcom_failover_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_satcom_failover_provider ON satcom_failover_logs(to_provider);

-- Create satcom_connection_status table for real-time status monitoring
CREATE TABLE IF NOT EXISTS satcom_connection_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  connection_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  status TEXT NOT NULL CHECK (status IN ('connected', 'degraded', 'disconnected', 'maintenance')),
  signal_strength NUMERIC NOT NULL CHECK (signal_strength >= 0 AND signal_strength <= 100),
  latency_ms INTEGER,
  bandwidth_kbps INTEGER,
  packet_loss_percent NUMERIC,
  uptime_percent NUMERIC,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT FALSE,
  is_fallback BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vessel_id, connection_id)
);

-- Create indexes for connection status
CREATE INDEX IF NOT EXISTS idx_satcom_status_vessel_id ON satcom_connection_status(vessel_id);
CREATE INDEX IF NOT EXISTS idx_satcom_status_active ON satcom_connection_status(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_satcom_status_provider ON satcom_connection_status(provider);
CREATE INDEX IF NOT EXISTS idx_satcom_status_status ON satcom_connection_status(status);

-- Create satcom_communication_logs table for tracking communications
CREATE TABLE IF NOT EXISTS satcom_communication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  connection_id TEXT,
  provider TEXT CHECK (provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  message_type TEXT NOT NULL CHECK (message_type IN (
    'status_report',
    'command',
    'data_sync',
    'emergency',
    'diagnostic',
    'test'
  )),
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  message_content TEXT,
  message_size_bytes INTEGER,
  transmission_status TEXT NOT NULL CHECK (transmission_status IN (
    'queued',
    'transmitting',
    'completed',
    'failed',
    'retrying'
  )),
  retry_count INTEGER DEFAULT 0,
  latency_ms INTEGER,
  signal_strength NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for communication logs
CREATE INDEX IF NOT EXISTS idx_satcom_comm_vessel_id ON satcom_communication_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_satcom_comm_timestamp ON satcom_communication_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_satcom_comm_type ON satcom_communication_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_satcom_comm_status ON satcom_communication_logs(transmission_status);

-- Enable RLS
ALTER TABLE satcom_failover_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE satcom_connection_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE satcom_communication_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies - Allow authenticated users to read and insert
CREATE POLICY "Allow authenticated users to read failover logs"
  ON satcom_failover_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert failover logs"
  ON satcom_failover_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read connection status"
  ON satcom_connection_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert connection status"
  ON satcom_connection_status FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update connection status"
  ON satcom_connection_status FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read communication logs"
  ON satcom_communication_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert communication logs"
  ON satcom_communication_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to log failover events
CREATE OR REPLACE FUNCTION log_satcom_failover(
  p_vessel_id TEXT,
  p_event_type TEXT,
  p_from_provider TEXT,
  p_to_provider TEXT,
  p_reason TEXT,
  p_success BOOLEAN DEFAULT TRUE,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO satcom_failover_logs (
    vessel_id,
    event_type,
    from_provider,
    to_provider,
    reason,
    success,
    metadata
  ) VALUES (
    p_vessel_id,
    p_event_type,
    p_from_provider,
    p_to_provider,
    p_reason,
    p_success,
    p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update connection status
CREATE OR REPLACE FUNCTION update_satcom_connection_status(
  p_vessel_id TEXT,
  p_connection_id TEXT,
  p_provider TEXT,
  p_status TEXT,
  p_signal_strength NUMERIC,
  p_latency_ms INTEGER DEFAULT NULL,
  p_bandwidth_kbps INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO satcom_connection_status (
    vessel_id,
    connection_id,
    provider,
    status,
    signal_strength,
    latency_ms,
    bandwidth_kbps,
    last_seen,
    updated_at
  ) VALUES (
    p_vessel_id,
    p_connection_id,
    p_provider,
    p_status,
    p_signal_strength,
    p_latency_ms,
    p_bandwidth_kbps,
    NOW(),
    NOW()
  )
  ON CONFLICT (vessel_id, connection_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    signal_strength = EXCLUDED.signal_strength,
    latency_ms = EXCLUDED.latency_ms,
    bandwidth_kbps = EXCLUDED.bandwidth_kbps,
    last_seen = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to log communication
CREATE OR REPLACE FUNCTION log_satcom_communication(
  p_vessel_id TEXT,
  p_provider TEXT,
  p_message_type TEXT,
  p_direction TEXT,
  p_message_content TEXT,
  p_signal_strength NUMERIC DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO satcom_communication_logs (
    vessel_id,
    provider,
    message_type,
    direction,
    message_content,
    transmission_status,
    signal_strength
  ) VALUES (
    p_vessel_id,
    p_provider,
    p_message_type,
    p_direction,
    p_message_content,
    'queued',
    p_signal_strength
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get failover statistics
CREATE OR REPLACE FUNCTION get_satcom_failover_stats(
  p_vessel_id TEXT,
  p_hours INTEGER DEFAULT 24
) RETURNS TABLE (
  total_events INTEGER,
  successful_failovers INTEGER,
  failed_failovers INTEGER,
  avg_recovery_time_seconds NUMERIC,
  most_common_provider TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_events,
    COUNT(*) FILTER (WHERE success = TRUE)::INTEGER as successful_failovers,
    COUNT(*) FILTER (WHERE success = FALSE)::INTEGER as failed_failovers,
    AVG(duration_seconds) as avg_recovery_time_seconds,
    MODE() WITHIN GROUP (ORDER BY to_provider) as most_common_provider
  FROM satcom_failover_logs
  WHERE vessel_id = p_vessel_id
    AND timestamp > NOW() - (p_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE satcom_failover_logs IS 'PATCH 442 - SATCOM failover event tracking and logging';
COMMENT ON TABLE satcom_connection_status IS 'PATCH 442 - Real-time SATCOM connection status';
COMMENT ON TABLE satcom_communication_logs IS 'PATCH 442 - SATCOM communication message logging';
