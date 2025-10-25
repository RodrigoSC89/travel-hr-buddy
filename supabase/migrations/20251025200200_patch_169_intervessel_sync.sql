-- PATCH 169.0: Intervessel Sync Layer Tables
-- Support for peer-to-peer vessel communication and log replication

-- Create vessel_alerts table for cross-vessel alerts
CREATE TABLE IF NOT EXISTS vessel_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('weather', 'navigation', 'emergency', 'maintenance', 'security', 'custom')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  location jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create vessel_alert_notifications for tracking alert delivery
CREATE TABLE IF NOT EXISTS vessel_alert_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  alert_id uuid REFERENCES vessel_alerts(id) ON DELETE CASCADE NOT NULL,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vessel_id, alert_id)
);

-- Create vessel_trust_relationships for log replication
CREATE TABLE IF NOT EXISTS vessel_trust_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  trusted_vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  trust_level text NOT NULL CHECK (trust_level IN ('full', 'partial', 'read-only')),
  established_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vessel_id, trusted_vessel_id),
  CHECK (vessel_id != trusted_vessel_id)
);

-- Create replicated_logs for inter-vessel log sharing
CREATE TABLE IF NOT EXISTS replicated_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  target_vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  log_type text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  replicated_at timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create sync_messages for MQTT message tracking
CREATE TABLE IF NOT EXISTS sync_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL UNIQUE,
  source_vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  target_vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  message_type text NOT NULL CHECK (message_type IN ('alert', 'log', 'status', 'coordination')),
  payload jsonb NOT NULL,
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
  delivery_method text CHECK (delivery_method IN ('mqtt', 'http', 'both')),
  created_at timestamptz DEFAULT now(),
  delivered_at timestamptz
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_vessel_alerts_source_vessel ON vessel_alerts(source_vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_alerts_type ON vessel_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_vessel_alerts_severity ON vessel_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_vessel_alerts_created_at ON vessel_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vessel_alerts_expires_at ON vessel_alerts(expires_at);

CREATE INDEX IF NOT EXISTS idx_vessel_alert_notifications_vessel ON vessel_alert_notifications(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_alert_notifications_alert ON vessel_alert_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_vessel_alert_notifications_read ON vessel_alert_notifications(read);

CREATE INDEX IF NOT EXISTS idx_vessel_trust_vessel_id ON vessel_trust_relationships(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_trust_trusted_vessel ON vessel_trust_relationships(trusted_vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_trust_level ON vessel_trust_relationships(trust_level);

CREATE INDEX IF NOT EXISTS idx_replicated_logs_source ON replicated_logs(source_vessel_id);
CREATE INDEX IF NOT EXISTS idx_replicated_logs_target ON replicated_logs(target_vessel_id);
CREATE INDEX IF NOT EXISTS idx_replicated_logs_replicated_at ON replicated_logs(replicated_at DESC);
CREATE INDEX IF NOT EXISTS idx_replicated_logs_read ON replicated_logs(read);

CREATE INDEX IF NOT EXISTS idx_sync_messages_source ON sync_messages(source_vessel_id);
CREATE INDEX IF NOT EXISTS idx_sync_messages_target ON sync_messages(target_vessel_id);
CREATE INDEX IF NOT EXISTS idx_sync_messages_status ON sync_messages(delivery_status);
CREATE INDEX IF NOT EXISTS idx_sync_messages_created_at ON sync_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE vessel_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_trust_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE replicated_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for vessel_alerts
CREATE POLICY "Users can read all vessel alerts"
  ON vessel_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create vessel alerts"
  ON vessel_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their vessel alerts"
  ON vessel_alerts FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for vessel_alert_notifications
CREATE POLICY "Users can read their vessel alert notifications"
  ON vessel_alert_notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create vessel alert notifications"
  ON vessel_alert_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their vessel alert notifications"
  ON vessel_alert_notifications FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for vessel_trust_relationships
CREATE POLICY "Users can read vessel trust relationships"
  ON vessel_trust_relationships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create vessel trust relationships"
  ON vessel_trust_relationships FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update vessel trust relationships"
  ON vessel_trust_relationships FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete vessel trust relationships"
  ON vessel_trust_relationships FOR DELETE
  TO authenticated
  USING (true);

-- RLS policies for replicated_logs
CREATE POLICY "Users can read replicated logs"
  ON replicated_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create replicated logs"
  ON replicated_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update replicated logs"
  ON replicated_logs FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for sync_messages
CREATE POLICY "Users can read sync messages"
  ON sync_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create sync messages"
  ON sync_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update sync messages"
  ON sync_messages FOR UPDATE
  TO authenticated
  USING (true);

-- Create function to mark alert as read
CREATE OR REPLACE FUNCTION mark_alert_as_read(p_vessel_id uuid, p_alert_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE vessel_alert_notifications
  SET 
    read = true,
    read_at = now()
  WHERE vessel_id = p_vessel_id 
    AND alert_id = p_alert_id
    AND read = false;
END;
$$ LANGUAGE plpgsql;

-- Create function to get unread alert count
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_vessel_id uuid)
RETURNS integer AS $$
DECLARE
  count integer;
BEGIN
  SELECT COUNT(*) INTO count
  FROM vessel_alert_notifications
  WHERE vessel_id = p_vessel_id AND read = false;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup expired alerts
CREATE OR REPLACE FUNCTION cleanup_expired_alerts()
RETURNS void AS $$
BEGIN
  DELETE FROM vessel_alerts
  WHERE expires_at IS NOT NULL 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to get fleet communication stats
CREATE OR REPLACE FUNCTION get_fleet_communication_stats(p_days integer DEFAULT 7)
RETURNS TABLE (
  total_alerts bigint,
  critical_alerts bigint,
  replicated_logs bigint,
  active_trust_relationships bigint,
  avg_response_time interval
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM vessel_alerts WHERE created_at >= now() - (p_days || ' days')::interval) as total_alerts,
    (SELECT COUNT(*) FROM vessel_alerts WHERE severity = 'critical' AND created_at >= now() - (p_days || ' days')::interval) as critical_alerts,
    (SELECT COUNT(*) FROM replicated_logs WHERE replicated_at >= now() - (p_days || ' days')::interval) as replicated_logs,
    (SELECT COUNT(*) FROM vessel_trust_relationships WHERE (expires_at IS NULL OR expires_at > now())) as active_trust_relationships,
    (SELECT AVG(read_at - van.created_at) FROM vessel_alert_notifications van WHERE van.read = true AND van.created_at >= now() - (p_days || ' days')::interval) as avg_response_time;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE vessel_alerts IS 'PATCH 169.0: Cross-vessel alerts for weather, navigation, emergencies, etc.';
COMMENT ON TABLE vessel_alert_notifications IS 'PATCH 169.0: Tracks alert delivery and read status per vessel';
COMMENT ON TABLE vessel_trust_relationships IS 'PATCH 169.0: Defines trust levels for log replication between vessels';
COMMENT ON TABLE replicated_logs IS 'PATCH 169.0: Logs shared between trusted vessels';
COMMENT ON TABLE sync_messages IS 'PATCH 169.0: Message queue for MQTT and HTTP synchronization';

-- Insert sample trust relationships
INSERT INTO vessel_trust_relationships (vessel_id, trusted_vessel_id, trust_level)
SELECT 
  v1.id,
  v2.id,
  'partial'
FROM vessels v1
CROSS JOIN vessels v2
WHERE v1.id != v2.id
  AND v1.status = 'active'
  AND v2.status = 'active'
LIMIT 3
ON CONFLICT (vessel_id, trusted_vessel_id) DO NOTHING;

-- Insert sample alert
INSERT INTO vessel_alerts (source_vessel_id, alert_type, severity, title, message, location)
SELECT 
  id,
  'weather',
  'warning',
  'Rough Sea Conditions Ahead',
  'Weather forecast indicates 4-meter waves and strong winds in sector 7-G. Recommend course adjustment or speed reduction.',
  last_known_position
FROM vessels
WHERE status = 'active'
LIMIT 1
ON CONFLICT DO NOTHING;
