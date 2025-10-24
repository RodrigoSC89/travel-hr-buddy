-- PATCH 93.0: System Watchdog Events Table
-- Stores monitoring events and health check results

CREATE TABLE IF NOT EXISTS watchdog_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL CHECK (event_type IN ('error', 'warning', 'info', 'success')),
  service_name text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  -- Indexes for efficient querying
  CONSTRAINT watchdog_events_event_id_key UNIQUE (event_id)
);

-- Index for faster queries by service and type
CREATE INDEX IF NOT EXISTS idx_watchdog_events_service ON watchdog_events(service_name);
CREATE INDEX IF NOT EXISTS idx_watchdog_events_type ON watchdog_events(event_type);
CREATE INDEX IF NOT EXISTS idx_watchdog_events_created_at ON watchdog_events(created_at DESC);

-- RLS Policies
ALTER TABLE watchdog_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read events
CREATE POLICY "Authenticated users can read watchdog events"
  ON watchdog_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert events
CREATE POLICY "Service role can insert watchdog events"
  ON watchdog_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert events (for client-side logging)
CREATE POLICY "Authenticated users can insert watchdog events"
  ON watchdog_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE watchdog_events IS 'PATCH 93.0: System monitoring events and health check results';
