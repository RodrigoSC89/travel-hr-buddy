-- =====================================================
-- NAUTI ONE v4.0 - Modular System & Digital Twin Tables
-- Fixed RLS policies using user_organizations table
-- =====================================================

-- Billing subscriptions (links organizations to plans)
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.billing_plans(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Organization modules (tracks which modules each org has access to)
CREATE TABLE IF NOT EXISTS public.organization_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  enabled_at TIMESTAMPTZ DEFAULT now(),
  disabled_at TIMESTAMPTZ,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, module_key)
);

-- Vessel Digital Twin main table
CREATE TABLE IF NOT EXISTS public.vessel_digital_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  model_url TEXT,
  model_version TEXT DEFAULT '1.0',
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'syncing', 'error', 'pending')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vessel components/parts
CREATE TABLE IF NOT EXISTS public.vessel_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  part_number TEXT,
  category TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  warranty_expiry DATE,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'repair', 'replaced', 'decommissioned')),
  location TEXT,
  specifications JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vessel maintenance plans
CREATE TABLE IF NOT EXISTS public.vessel_maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  component_id UUID REFERENCES public.vessel_components(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  interval_days INTEGER,
  interval_hours INTEGER,
  last_performed_at TIMESTAMPTZ,
  next_due_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'overdue', 'in_progress', 'completed', 'skipped')),
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vessel timeline events
CREATE TABLE IF NOT EXISTS public.vessel_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vessel sensor data
CREATE TABLE IF NOT EXISTS public.vessel_sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL,
  sensor_name TEXT,
  value NUMERIC,
  unit TEXT,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'offline')),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Vessel 3D models
CREATE TABLE IF NOT EXISTS public.vessel_3d_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Modular billing configuration
CREATE TABLE IF NOT EXISTS public.modular_billing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  price_per_unit NUMERIC DEFAULT 0,
  unit_type TEXT,
  is_addon BOOLEAN DEFAULT false,
  requires_modules TEXT[] DEFAULT '{}',
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_digital_twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_3d_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modular_billing_config ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_org_ids(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.user_organizations WHERE user_id = user_uuid
$$;

-- RLS Policies for billing_subscriptions
CREATE POLICY "Users can view their org subscriptions" ON public.billing_subscriptions
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- RLS Policies for organization_modules
CREATE POLICY "Users can view their org modules" ON public.organization_modules
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- RLS Policies for vessel_digital_twins
CREATE POLICY "Users can view their org digital twins" ON public.vessel_digital_twins
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Users can manage their org digital twins" ON public.vessel_digital_twins
  FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- RLS Policies for vessel_components
CREATE POLICY "Users can view their org components" ON public.vessel_components
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Users can manage their org components" ON public.vessel_components
  FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- RLS Policies for vessel_maintenance_plans
CREATE POLICY "Users can view their org maintenance plans" ON public.vessel_maintenance_plans
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Users can manage their org maintenance plans" ON public.vessel_maintenance_plans
  FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- RLS Policies for vessel_timeline_events
CREATE POLICY "Users can view their org timeline events" ON public.vessel_timeline_events
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Users can manage their org timeline events" ON public.vessel_timeline_events
  FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- RLS Policies for vessel_sensor_data
CREATE POLICY "Users can view sensor data for their vessels" ON public.vessel_sensor_data
  FOR SELECT USING (
    vessel_id IN (
      SELECT v.id FROM public.vessels v
      WHERE v.organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    )
  );

-- RLS Policies for vessel_3d_models
CREATE POLICY "Users can view their org 3D models" ON public.vessel_3d_models
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Users can manage their org 3D models" ON public.vessel_3d_models
  FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- RLS Policies for modular_billing_config (public read)
CREATE POLICY "Anyone can view billing config" ON public.modular_billing_config
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_org ON public.billing_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON public.billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_organization_modules_org ON public.organization_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_vessel_digital_twins_vessel ON public.vessel_digital_twins(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_components_vessel ON public.vessel_components(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_components_status ON public.vessel_components(status);
CREATE INDEX IF NOT EXISTS idx_vessel_maintenance_plans_vessel ON public.vessel_maintenance_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_maintenance_plans_status ON public.vessel_maintenance_plans(status);
CREATE INDEX IF NOT EXISTS idx_vessel_timeline_events_vessel ON public.vessel_timeline_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_sensor_data_vessel ON public.vessel_sensor_data(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_sensor_data_recorded ON public.vessel_sensor_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vessel_3d_models_vessel ON public.vessel_3d_models(vessel_id);

-- Insert default billing configuration
INSERT INTO public.modular_billing_config (module_key, display_name, description, base_price, is_addon) VALUES
  ('vessel_digital_twin', 'Vessel Digital Twin', '3D visualization, AI assistant, real-time sensors', 299, false),
  ('predictive_maintenance', 'Predictive Maintenance', 'AI-powered maintenance predictions', 199, true),
  ('crew_optimization', 'Crew Optimization', 'AI crew scheduling and optimization', 149, true),
  ('compliance_automation', 'Compliance Automation', 'Automated MLC/STCW compliance', 249, true),
  ('voyage_analytics', 'Voyage Analytics', 'Advanced voyage performance analytics', 179, true)
ON CONFLICT (module_key) DO NOTHING;