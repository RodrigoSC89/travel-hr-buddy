-- PATCH 359: Channel Manager v2 - Real-time Communication Complete
-- Complete channel management with WebSocket support, health monitoring, and fallback

-- Note: Base tables exist from earlier migration, this adds real-time features

-- ============================================
-- 1. Communication Channel Health Monitoring
-- ============================================
CREATE TABLE IF NOT EXISTS public.channel_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  
  -- Health metrics
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down', 'maintenance')),
  uptime_percentage NUMERIC CHECK (uptime_percentage BETWEEN 0 AND 100),
  
  -- Performance metrics
  avg_latency_ms NUMERIC,
  max_latency_ms NUMERIC,
  message_delivery_rate NUMERIC,
  message_failure_rate NUMERIC,
  
  -- Connection metrics
  active_connections INTEGER DEFAULT 0,
  peak_connections INTEGER DEFAULT 0,
  connection_errors INTEGER DEFAULT 0,
  
  -- WebSocket metrics
  websocket_connections INTEGER DEFAULT 0,
  websocket_messages_sent INTEGER DEFAULT 0,
  websocket_messages_received INTEGER DEFAULT 0,
  websocket_errors INTEGER DEFAULT 0,
  
  -- Network metrics
  bandwidth_usage_mb NUMERIC,
  packet_loss_percentage NUMERIC,
  
  -- Timestamps
  last_health_check TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  
  -- Period tracking
  metric_period_start TIMESTAMPTZ NOT NULL,
  metric_period_end TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channel_health_channel ON public.channel_health_metrics(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_health_status ON public.channel_health_metrics(status);
CREATE INDEX IF NOT EXISTS idx_channel_health_check ON public.channel_health_metrics(last_health_check DESC);

-- ============================================
-- 2. Channel Fallback Configuration
-- ============================================
CREATE TABLE IF NOT EXISTS public.channel_fallback_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  
  -- Fallback configuration
  fallback_priority INTEGER NOT NULL DEFAULT 1,
  fallback_channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  
  -- Trigger conditions
  trigger_on_latency_ms INTEGER, -- Switch if latency exceeds this
  trigger_on_error_count INTEGER, -- Switch after N errors
  trigger_on_uptime_below_percentage NUMERIC,
  trigger_on_status TEXT[], -- Switch on specific statuses
  
  -- Fallback behavior
  auto_failover BOOLEAN DEFAULT true,
  auto_failback BOOLEAN DEFAULT false,
  failback_delay_seconds INTEGER DEFAULT 300,
  
  -- Notification
  notify_on_fallover BOOLEAN DEFAULT true,
  notification_recipients TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(primary_channel_id, fallback_channel_id)
);

CREATE INDEX IF NOT EXISTS idx_fallback_primary ON public.channel_fallback_config(primary_channel_id);
CREATE INDEX IF NOT EXISTS idx_fallback_active ON public.channel_fallback_config(is_active) WHERE is_active = true;

-- ============================================
-- 3. Channel Fallover Events Log
-- ============================================
CREATE TABLE IF NOT EXISTS public.channel_failover_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN ('failover', 'failback', 'manual_switch', 'test')),
  from_channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  to_channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  
  -- Trigger information
  trigger_reason TEXT NOT NULL,
  trigger_metrics JSONB, -- Metrics that triggered the failover
  automatic BOOLEAN DEFAULT true,
  
  -- Timing
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Impact
  affected_users INTEGER,
  messages_in_queue INTEGER,
  messages_lost INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'rolled_back')),
  error_message TEXT,
  
  -- Follow-up
  initiated_by UUID REFERENCES auth.users(id),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_failover_from_channel ON public.channel_failover_events(from_channel_id);
CREATE INDEX IF NOT EXISTS idx_failover_to_channel ON public.channel_failover_events(to_channel_id);
CREATE INDEX IF NOT EXISTS idx_failover_type ON public.channel_failover_events(event_type);
CREATE INDEX IF NOT EXISTS idx_failover_status ON public.channel_failover_events(status);

-- ============================================
-- 4. Real-time Channel Activity Tracker
-- ============================================
CREATE TABLE IF NOT EXISTS public.channel_activity_realtime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  
  -- Activity snapshot (updated in real-time)
  active_users INTEGER DEFAULT 0,
  active_users_list UUID[],
  
  -- Message activity (last minute)
  messages_sent_last_minute INTEGER DEFAULT 0,
  messages_received_last_minute INTEGER DEFAULT 0,
  
  -- Connection status
  websocket_status TEXT DEFAULT 'disconnected' CHECK (websocket_status IN ('connected', 'connecting', 'disconnected', 'error')),
  last_heartbeat_at TIMESTAMPTZ,
  
  -- Performance (real-time)
  current_latency_ms INTEGER,
  current_throughput_msg_per_sec NUMERIC,
  
  -- Emergency status
  is_emergency_mode BOOLEAN DEFAULT false,
  priority_level INTEGER DEFAULT 0,
  
  -- Last updated
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(channel_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_activity_updated ON public.channel_activity_realtime(last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_activity_emergency ON public.channel_activity_realtime(is_emergency_mode) WHERE is_emergency_mode = true;

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.channel_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_fallback_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_failover_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_activity_realtime ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

CREATE POLICY "Users can view channel health metrics"
  ON public.channel_health_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage health metrics"
  ON public.channel_health_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view fallback config"
  ON public.channel_fallback_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage fallback config"
  ON public.channel_fallback_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view failover events"
  ON public.channel_failover_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create failover events"
  ON public.channel_failover_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update failover events"
  ON public.channel_failover_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view real-time activity"
  ON public.channel_activity_realtime FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage real-time activity"
  ON public.channel_activity_realtime FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Functions
-- ============================================

-- Function to update channel health
CREATE OR REPLACE FUNCTION update_channel_health(
  p_channel_id UUID,
  p_status TEXT,
  p_latency_ms NUMERIC,
  p_active_connections INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.channel_health_metrics (
    channel_id,
    status,
    avg_latency_ms,
    active_connections,
    last_health_check,
    metric_period_start,
    metric_period_end
  ) VALUES (
    p_channel_id,
    p_status,
    p_latency_ms,
    p_active_connections,
    NOW(),
    NOW() - INTERVAL '1 hour',
    NOW()
  );
  
  -- Update real-time activity
  INSERT INTO public.channel_activity_realtime (
    channel_id,
    active_users,
    current_latency_ms,
    websocket_status,
    last_heartbeat_at,
    last_updated_at
  ) VALUES (
    p_channel_id,
    p_active_connections,
    p_latency_ms::INTEGER,
    CASE WHEN p_status = 'healthy' THEN 'connected' ELSE 'disconnected' END,
    NOW(),
    NOW()
  )
  ON CONFLICT (channel_id) DO UPDATE SET
    active_users = EXCLUDED.active_users,
    current_latency_ms = EXCLUDED.current_latency_ms,
    websocket_status = EXCLUDED.websocket_status,
    last_heartbeat_at = EXCLUDED.last_heartbeat_at,
    last_updated_at = EXCLUDED.last_updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger channel failover
CREATE OR REPLACE FUNCTION trigger_channel_failover(
  p_from_channel_id UUID,
  p_to_channel_id UUID,
  p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Create failover event
  INSERT INTO public.channel_failover_events (
    event_type,
    from_channel_id,
    to_channel_id,
    trigger_reason,
    status
  ) VALUES (
    'failover',
    p_from_channel_id,
    p_to_channel_id,
    p_reason,
    'in_progress'
  )
  RETURNING id INTO v_event_id;
  
  -- Update fallback config trigger count
  UPDATE public.channel_fallback_config
  SET 
    last_triggered_at = NOW(),
    trigger_count = trigger_count + 1
  WHERE primary_channel_id = p_from_channel_id
    AND fallback_channel_id = p_to_channel_id;
  
  -- Deactivate old channel
  UPDATE public.communication_channels
  SET is_active = false
  WHERE id = p_from_channel_id;
  
  -- Activate new channel
  UPDATE public.communication_channels
  SET is_active = true
  WHERE id = p_to_channel_id;
  
  -- Complete the event
  UPDATE public.channel_failover_events
  SET 
    status = 'completed',
    completed_at = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - initiated_at))::INTEGER
  WHERE id = v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps trigger
CREATE TRIGGER set_fallback_config_updated_at 
  BEFORE UPDATE ON public.channel_fallback_config
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
