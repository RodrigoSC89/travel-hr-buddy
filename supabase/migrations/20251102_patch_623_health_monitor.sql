-- PATCH 623: System Health Monitoring Tables
-- Migration: 20251102_patch_623_health_monitor.sql

-- System Health Logs Table
CREATE TABLE IF NOT EXISTS public.system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_logs_service 
  ON public.system_health_logs(service_name);
  
CREATE INDEX IF NOT EXISTS idx_health_logs_checked_at 
  ON public.system_health_logs(checked_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_health_logs_status 
  ON public.system_health_logs(status);
  
CREATE INDEX IF NOT EXISTS idx_health_logs_tenant 
  ON public.system_health_logs(tenant_id);

-- Health Alert Configuration Table
CREATE TABLE IF NOT EXISTS public.health_alert_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  webhook_url TEXT,
  email_recipients TEXT[],
  slack_channel TEXT,
  threshold_failures INTEGER DEFAULT 2,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_name, tenant_id)
);

-- Index for alert config
CREATE INDEX IF NOT EXISTS idx_health_alert_config_service 
  ON public.health_alert_config(service_name);
  
CREATE INDEX IF NOT EXISTS idx_health_alert_config_tenant 
  ON public.health_alert_config(tenant_id);

-- Row Level Security (RLS)
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alert_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_health_logs
CREATE POLICY "Users can view health logs for their tenant"
  ON public.system_health_logs
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow authenticated users to insert health logs for their own tenant
-- This is safer than allowing all inserts
CREATE POLICY "Authenticated users can insert health logs"
  ON public.system_health_logs
  FOR INSERT
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND
    -- If tenant_id is provided, it must match user's tenant
    (tenant_id IS NULL OR tenant_id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Admins can delete old health logs"
  ON public.system_health_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND tenant_id = system_health_logs.tenant_id
    )
  );

-- RLS Policies for health_alert_config
CREATE POLICY "Users can view alert config for their tenant"
  ON public.health_alert_config
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage alert config"
  ON public.health_alert_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND tenant_id = health_alert_config.tenant_id
    )
  );

-- Function to automatically clean up old health logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_health_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.system_health_logs
  WHERE checked_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Comments for documentation
COMMENT ON TABLE public.system_health_logs IS 
  'PATCH 623: Stores health check results for system monitoring';
  
COMMENT ON TABLE public.health_alert_config IS 
  'PATCH 623: Configuration for health monitoring alerts per service';

COMMENT ON COLUMN public.system_health_logs.service_name IS 
  'Name of the service being monitored (database, storage, api, system, mqtt, onnx, llm)';

COMMENT ON COLUMN public.system_health_logs.status IS 
  'Service status: healthy (<100ms), degraded (100-500ms), down (>500ms or error)';

COMMENT ON FUNCTION cleanup_old_health_logs() IS 
  'Automatically removes health logs older than 90 days';
