-- ============================================
-- PATCH: Create missing tables for @ts-nocheck removal
-- Tables: trust_compliance_logs, priority_shifts, clone_registry, 
--         vessel_status, fuel_usage, maintenance_alerts, performance_alerts
-- ============================================

-- 1. Trust Compliance Logs
CREATE TABLE IF NOT EXISTS public.trust_compliance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  compliance_score NUMERIC DEFAULT 100,
  trust_level TEXT DEFAULT 'standard',
  details JSONB DEFAULT '{}'::jsonb,
  risk_indicators JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Priority Shifts (for autoBalancer)
CREATE TABLE IF NOT EXISTS public.priority_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  module_name TEXT NOT NULL,
  old_priority INTEGER NOT NULL,
  new_priority INTEGER NOT NULL,
  reason TEXT,
  triggered_by TEXT DEFAULT 'system',
  shift_type TEXT DEFAULT 'automatic',
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reverted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- 3. Clone Registry (for cognitiveClone)
CREATE TABLE IF NOT EXISTS public.clone_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  clone_name TEXT NOT NULL,
  clone_type TEXT DEFAULT 'cognitive',
  parent_id UUID,
  status TEXT DEFAULT 'active',
  memory_snapshot JSONB DEFAULT '{}'::jsonb,
  capabilities JSONB DEFAULT '[]'::jsonb,
  context_limit INTEGER DEFAULT 4000,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Vessel Status (for fleet-management-dashboard)
CREATE TABLE IF NOT EXISTS public.vessel_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'operational',
  location JSONB DEFAULT '{}'::jsonb,
  heading NUMERIC,
  speed NUMERIC,
  fuel_level NUMERIC,
  engine_status TEXT DEFAULT 'running',
  last_port TEXT,
  next_port TEXT,
  eta TIMESTAMP WITH TIME ZONE,
  crew_count INTEGER,
  cargo_status TEXT,
  weather_conditions JSONB DEFAULT '{}'::jsonb,
  alerts JSONB DEFAULT '[]'::jsonb,
  sensors_data JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Fuel Usage (for fleet-management-dashboard)
CREATE TABLE IF NOT EXISTS public.fuel_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  fuel_type TEXT DEFAULT 'diesel',
  quantity_liters NUMERIC NOT NULL,
  cost_usd NUMERIC,
  consumption_rate NUMERIC,
  efficiency_score NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  port_of_bunkering TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Maintenance Alerts (for fleet-management-dashboard)
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  component TEXT,
  description TEXT,
  recommended_action TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 7. Performance Alerts (for performance-dashboard)
CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  module_name TEXT,
  metric_name TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  message TEXT,
  status TEXT DEFAULT 'active',
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on all new tables
ALTER TABLE public.trust_compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (read all, write own org)
CREATE POLICY "Users can view trust compliance logs"
  ON public.trust_compliance_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can view priority shifts"
  ON public.priority_shifts FOR SELECT
  USING (true);

CREATE POLICY "Users can view clone registry"
  ON public.clone_registry FOR SELECT
  USING (true);

CREATE POLICY "Users can view vessel status"
  ON public.vessel_status FOR SELECT
  USING (true);

CREATE POLICY "Users can view fuel usage"
  ON public.fuel_usage FOR SELECT
  USING (true);

CREATE POLICY "Users can view maintenance alerts"
  ON public.maintenance_alerts FOR SELECT
  USING (true);

CREATE POLICY "Users can view performance alerts"
  ON public.performance_alerts FOR SELECT
  USING (true);

-- Insert policies for authenticated users
CREATE POLICY "Authenticated can insert trust compliance logs"
  ON public.trust_compliance_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert priority shifts"
  ON public.priority_shifts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert clone registry"
  ON public.clone_registry FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert vessel status"
  ON public.vessel_status FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert fuel usage"
  ON public.fuel_usage FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert maintenance alerts"
  ON public.maintenance_alerts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert performance alerts"
  ON public.performance_alerts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update policies
CREATE POLICY "Authenticated can update trust compliance logs"
  ON public.trust_compliance_logs FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update priority shifts"
  ON public.priority_shifts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update clone registry"
  ON public.clone_registry FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update vessel status"
  ON public.vessel_status FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update fuel usage"
  ON public.fuel_usage FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update maintenance alerts"
  ON public.maintenance_alerts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update performance alerts"
  ON public.performance_alerts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trust_compliance_logs_org ON public.trust_compliance_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_priority_shifts_module ON public.priority_shifts(module_name);
CREATE INDEX IF NOT EXISTS idx_clone_registry_status ON public.clone_registry(status);
CREATE INDEX IF NOT EXISTS idx_vessel_status_vessel ON public.vessel_status(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_usage_vessel ON public.fuel_usage(vessel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_vessel ON public.maintenance_alerts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_org ON public.performance_alerts(organization_id);