-- PATCH 347: Analytics Core v2 - Real-Time Pipelines
-- Objective: Real-time analytics with streaming dashboards and automatic alerts

-- Analytics Events Table (Real-time event capture)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'user_action', 'api_call', 'error', etc.
  event_category TEXT NOT NULL, -- 'navigation', 'interaction', 'system', 'business'
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB, -- Numeric metrics for aggregation
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  location JSONB, -- Geographic data if available
  metadata JSONB
);

-- Analytics Metrics Table (Pre-aggregated metrics)
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'counter', 'gauge', 'histogram', 'rate'
  value NUMERIC NOT NULL,
  labels JSONB, -- Key-value pairs for filtering
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granularity TEXT NOT NULL DEFAULT 'minute', -- 'second', 'minute', 'hour', 'day'
  metadata JSONB
);

-- Analytics Alerts Table (Threshold-based alerts)
CREATE TABLE IF NOT EXISTS analytics_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  metric_name TEXT NOT NULL,
  condition TEXT NOT NULL, -- 'greater_than', 'less_than', 'equals', 'not_equals'
  threshold NUMERIC NOT NULL,
  timeframe_minutes INTEGER NOT NULL DEFAULT 5, -- Time window for evaluation
  is_enabled BOOLEAN DEFAULT true,
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
  notification_channels JSONB, -- Array of channels: email, slack, etc.
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Alert History Table
CREATE TABLE IF NOT EXISTS analytics_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES analytics_alerts(id) ON DELETE CASCADE,
  metric_value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  severity TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' -- 'active', 'resolved', 'acknowledged'
);

-- Analytics Dashboards Table
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL, -- Dashboard layout and widget configuration
  is_default BOOLEAN DEFAULT false,
  is_realtime BOOLEAN DEFAULT true,
  refresh_interval_seconds INTEGER DEFAULT 30,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Sessions Table (Track user sessions)
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  entry_page TEXT,
  exit_page TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  location JSONB,
  metadata JSONB
);

-- Indexes for performance (critical for real-time queries)
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp_event_type ON analytics_events(timestamp DESC, event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_metrics_timestamp ON analytics_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_metric_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_granularity ON analytics_metrics(granularity);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_is_enabled ON analytics_alerts(is_enabled);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_metric_name ON analytics_alerts(metric_name);

CREATE INDEX IF NOT EXISTS idx_analytics_alert_history_alert_id ON analytics_alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alert_history_triggered_at ON analytics_alert_history(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_alert_history_status ON analytics_alert_history(status);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);

-- Partitioning hint for analytics_events (for future optimization)
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp_brin ON analytics_events USING BRIN(timestamp);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow authenticated users to read analytics)
CREATE POLICY "Authenticated users can view analytics events"
  ON analytics_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view metrics"
  ON analytics_metrics FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own alerts"
  ON analytics_alerts FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view all alerts"
  ON analytics_alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view alert history"
  ON analytics_alert_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own dashboards"
  ON analytics_dashboards FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view all dashboards"
  ON analytics_dashboards FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view sessions"
  ON analytics_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to track event and update session
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_event_type TEXT,
  p_event_category TEXT,
  p_event_name TEXT,
  p_session_id TEXT,
  p_properties JSONB DEFAULT '{}'::jsonb,
  p_metrics JSONB DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Insert event
  INSERT INTO analytics_events (
    event_type, event_category, event_name, user_id, session_id,
    properties, metrics, page_url
  ) VALUES (
    p_event_type, p_event_category, p_event_name, v_user_id, p_session_id,
    p_properties, p_metrics, p_page_url
  ) RETURNING id INTO v_event_id;
  
  -- Update session
  INSERT INTO analytics_sessions (session_id, user_id, last_activity_at, events_count, page_views)
  VALUES (p_session_id, v_user_id, NOW(), 1, CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END)
  ON CONFLICT (session_id) DO UPDATE SET
    last_activity_at = NOW(),
    events_count = analytics_sessions.events_count + 1,
    page_views = analytics_sessions.page_views + CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check alert thresholds
CREATE OR REPLACE FUNCTION check_analytics_alerts()
RETURNS void AS $$
DECLARE
  v_alert RECORD;
  v_metric_value NUMERIC;
  v_threshold_exceeded BOOLEAN;
BEGIN
  FOR v_alert IN 
    SELECT * FROM analytics_alerts WHERE is_enabled = true
  LOOP
    -- Calculate current metric value based on timeframe
    SELECT COUNT(*)::NUMERIC INTO v_metric_value
    FROM analytics_events
    WHERE event_type = v_alert.metric_name
      AND timestamp >= NOW() - (v_alert.timeframe_minutes || ' minutes')::INTERVAL;
    
    -- Check threshold condition
    v_threshold_exceeded := CASE v_alert.condition
      WHEN 'greater_than' THEN v_metric_value > v_alert.threshold
      WHEN 'less_than' THEN v_metric_value < v_alert.threshold
      WHEN 'equals' THEN v_metric_value = v_alert.threshold
      WHEN 'not_equals' THEN v_metric_value != v_alert.threshold
      ELSE false
    END;
    
    -- Trigger alert if threshold exceeded
    IF v_threshold_exceeded THEN
      INSERT INTO analytics_alert_history (
        alert_id, metric_value, threshold, severity,
        message, status
      ) VALUES (
        v_alert.id, v_metric_value, v_alert.threshold, v_alert.severity,
        format('Alert "%s": metric value %s %s threshold %s',
          v_alert.name, v_metric_value, v_alert.condition, v_alert.threshold),
        'active'
      );
      
      UPDATE analytics_alerts
      SET last_triggered_at = NOW(),
          trigger_count = trigger_count + 1
      WHERE id = v_alert.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to aggregate metrics
CREATE OR REPLACE FUNCTION aggregate_analytics_metrics(
  p_granularity TEXT DEFAULT 'minute'
)
RETURNS void AS $$
BEGIN
  -- Aggregate event counts by type
  INSERT INTO analytics_metrics (metric_name, metric_type, value, timestamp, granularity)
  SELECT 
    event_type,
    'counter',
    COUNT(*),
    DATE_TRUNC(p_granularity, timestamp),
    p_granularity
  FROM analytics_events
  WHERE timestamp >= NOW() - INTERVAL '1 hour'
  GROUP BY event_type, DATE_TRUNC(p_granularity, timestamp)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default dashboard
INSERT INTO analytics_dashboards (name, description, is_default, is_realtime, config) VALUES
  ('Real-Time Overview', 'Real-time system analytics dashboard', true, true, '{
    "widgets": [
      {"type": "line_chart", "title": "Events/Minute", "metric": "event_count", "timeframe": 300},
      {"type": "counter", "title": "Active Users", "metric": "active_users"},
      {"type": "line_chart", "title": "Page Views", "metric": "page_views", "timeframe": 1440},
      {"type": "table", "title": "Recent Alerts", "source": "alert_history", "limit": 10}
    ]
  }'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert default alerts
INSERT INTO analytics_alerts (name, description, metric_name, condition, threshold, timeframe_minutes, severity) VALUES
  ('High Error Rate', 'Alert when error events exceed 10 in 5 minutes', 'error', 'greater_than', 10, 5, 'critical'),
  ('Low Activity', 'Alert when page views drop below 5 in 5 minutes', 'page_view', 'less_than', 5, 5, 'warning'),
  ('High API Usage', 'Alert when API calls exceed 100 in 5 minutes', 'api_call', 'greater_than', 100, 5, 'info')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE analytics_events IS 'PATCH 347: Real-time event stream for analytics';
COMMENT ON TABLE analytics_metrics IS 'PATCH 347: Pre-aggregated metrics for performance';
COMMENT ON TABLE analytics_alerts IS 'PATCH 347: Threshold-based automatic alerts';
COMMENT ON TABLE analytics_alert_history IS 'PATCH 347: Alert trigger history';
COMMENT ON TABLE analytics_dashboards IS 'PATCH 347: Dashboard configurations';
COMMENT ON TABLE analytics_sessions IS 'PATCH 347: User session tracking';
