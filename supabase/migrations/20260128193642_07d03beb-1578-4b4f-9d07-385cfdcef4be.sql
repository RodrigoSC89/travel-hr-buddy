-- =============================================
-- NAUTI ONE v4.0 - MODULAR SUBSCRIPTION SYSTEM
-- Phase 1: Plans, Modules, Subscriptions, Vessel Digital Twin
-- (Excluding existing tables: vessel_manuals, vessel_history)
-- =============================================

-- 1. BILLING PLANS TABLE
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly_brl INTEGER NOT NULL DEFAULT 0,
  price_monthly_usd INTEGER NOT NULL DEFAULT 0,
  price_monthly_eur INTEGER NOT NULL DEFAULT 0,
  stripe_price_id_brl TEXT,
  stripe_price_id_usd TEXT,
  stripe_price_id_eur TEXT,
  max_users INTEGER,
  max_vessels INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_enterprise BOOLEAN DEFAULT false,
  trial_days INTEGER DEFAULT 14,
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MODULES CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Package',
  category TEXT NOT NULL,
  is_core BOOLEAN DEFAULT false,
  price_addon_brl INTEGER DEFAULT 0,
  price_addon_usd INTEGER DEFAULT 0,
  stripe_price_id_addon TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  routes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PLAN-MODULE RELATIONSHIP
CREATE TABLE IF NOT EXISTS public.plan_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.billing_plans(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.system_modules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_id, module_id)
);

-- 4. ORGANIZATION SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.billing_plans(id) NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'BRL',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

-- 5. ADDON PURCHASES
CREATE TABLE IF NOT EXISTS public.organization_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.system_modules(id) NOT NULL,
  stripe_subscription_item_id TEXT,
  status TEXT DEFAULT 'active',
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, module_id)
);

-- 6. MODULE USAGE TRACKING
CREATE TABLE IF NOT EXISTS public.module_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.system_modules(id) NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  route TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. VESSEL SPECIFICATIONS
CREATE TABLE IF NOT EXISTS public.vessel_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL UNIQUE,
  gross_tonnage NUMERIC,
  net_tonnage NUMERIC,
  deadweight NUMERIC,
  length_overall NUMERIC,
  beam NUMERIC,
  draft NUMERIC,
  depth NUMERIC,
  build_year INTEGER,
  builder TEXT,
  classification_society TEXT,
  class_notation TEXT,
  hull_material TEXT,
  propulsion_type TEXT,
  main_engine_type TEXT,
  main_engine_power TEXT,
  auxiliary_engines JSONB DEFAULT '[]'::jsonb,
  fuel_capacity NUMERIC,
  fresh_water_capacity NUMERIC,
  ballast_capacity NUMERIC,
  cargo_capacity NUMERIC,
  passenger_capacity INTEGER,
  crew_capacity INTEGER,
  speed_max NUMERIC,
  speed_service NUMERIC,
  speed_economic NUMERIC,
  range_nautical_miles NUMERIC,
  communication_equipment JSONB DEFAULT '[]'::jsonb,
  navigation_equipment JSONB DEFAULT '[]'::jsonb,
  safety_equipment JSONB DEFAULT '[]'::jsonb,
  special_features JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  last_dry_dock DATE,
  next_dry_dock DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. VESSEL PARTS CATALOG
CREATE TABLE IF NOT EXISTS public.vessel_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.vessel_parts(id) ON DELETE SET NULL,
  part_number TEXT NOT NULL,
  name TEXT NOT NULL,
  name_pt TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  location_deck TEXT,
  location_compartment TEXT,
  location_coordinates JSONB,
  installation_date DATE,
  warranty_expires DATE,
  lifespan_years INTEGER,
  replacement_cost NUMERIC,
  criticality TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'operational',
  maintenance_interval_hours INTEGER,
  maintenance_interval_days INTEGER,
  last_maintenance DATE,
  next_maintenance DATE,
  operating_hours NUMERIC DEFAULT 0,
  specifications JSONB DEFAULT '{}'::jsonb,
  spare_parts JSONB DEFAULT '[]'::jsonb,
  related_manuals UUID[],
  qr_code TEXT,
  image_url TEXT,
  model_3d_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. VESSEL PLANS (GA Plans)
CREATE TABLE IF NOT EXISTS public.vessel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  deck_level TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  thumbnail_url TEXT,
  interactive_data JSONB DEFAULT '[]'::jsonb,
  scale TEXT,
  revision TEXT,
  revision_date DATE,
  approved_by TEXT,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. VESSEL SENSORS
CREATE TABLE IF NOT EXISTS public.vessel_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  part_id UUID REFERENCES public.vessel_parts(id) ON DELETE SET NULL,
  sensor_type TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  location TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  min_value NUMERIC,
  max_value NUMERIC,
  warning_threshold_low NUMERIC,
  warning_threshold_high NUMERIC,
  critical_threshold_low NUMERIC,
  critical_threshold_high NUMERIC,
  calibration_date DATE,
  calibration_due DATE,
  is_active BOOLEAN DEFAULT true,
  mqtt_topic TEXT,
  polling_interval_seconds INTEGER DEFAULT 60,
  metadata JSONB DEFAULT '{}'::jsonb,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. SENSOR READINGS
CREATE TABLE IF NOT EXISTS public.vessel_sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.vessel_sensors(id) ON DELETE CASCADE NOT NULL,
  vessel_id UUID NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  status TEXT DEFAULT 'normal',
  latitude NUMERIC,
  longitude NUMERIC,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. VESSEL AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.vessel_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  title TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. VESSEL AI MESSAGES
CREATE TABLE IF NOT EXISTS public.vessel_ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.vessel_ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  tokens_used INTEGER,
  model TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. QR CODE MAPPINGS
CREATE TABLE IF NOT EXISTS public.vessel_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  short_url TEXT,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_plan_modules_plan ON public.plan_modules(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_modules_module ON public.plan_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org ON public.organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON public.organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_org_addons_org ON public.organization_addons(organization_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_org ON public.module_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_created ON public.module_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_vessel_specs_vessel ON public.vessel_specifications(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_parts_vessel ON public.vessel_parts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_parts_parent ON public.vessel_parts(parent_id);
CREATE INDEX IF NOT EXISTS idx_vessel_parts_category ON public.vessel_parts(category);
CREATE INDEX IF NOT EXISTS idx_vessel_parts_criticality ON public.vessel_parts(criticality);
CREATE INDEX IF NOT EXISTS idx_vessel_plans_vessel ON public.vessel_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_sensors_vessel ON public.vessel_sensors(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor ON public.vessel_sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded ON public.vessel_sensor_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_vessel_ai_conv_vessel ON public.vessel_ai_conversations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_ai_msg_conv ON public.vessel_ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_vessel_qr_code ON public.vessel_qr_codes(code);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_qr_codes ENABLE ROW LEVEL SECURITY;

-- Public read for plans and modules
CREATE POLICY "Plans are public" ON public.billing_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Modules are public" ON public.system_modules FOR SELECT USING (is_active = true);
CREATE POLICY "Plan modules are public" ON public.plan_modules FOR SELECT USING (true);

-- Organization-scoped policies
CREATE POLICY "Org subscriptions access" ON public.organization_subscriptions 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Org addons access" ON public.organization_addons 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Module usage insert" ON public.module_usage 
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Module usage select" ON public.module_usage 
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Vessel specs access" ON public.vessel_specifications 
  FOR ALL USING (vessel_id IN (SELECT id FROM public.vessels WHERE organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')));

CREATE POLICY "Vessel parts access" ON public.vessel_parts 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Vessel plans access" ON public.vessel_plans 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Vessel sensors access" ON public.vessel_sensors 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Sensor readings access" ON public.vessel_sensor_readings 
  FOR ALL USING (sensor_id IN (SELECT id FROM public.vessel_sensors WHERE organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')));

CREATE POLICY "Vessel AI conversations access" ON public.vessel_ai_conversations 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Vessel AI messages access" ON public.vessel_ai_messages 
  FOR ALL USING (conversation_id IN (SELECT id FROM public.vessel_ai_conversations WHERE organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')));

CREATE POLICY "Vessel QR codes access" ON public.vessel_qr_codes 
  FOR ALL USING (vessel_id IN (SELECT id FROM public.vessels WHERE organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')));

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_modular_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_billing_plans_updated_at ON public.billing_plans;
CREATE TRIGGER update_billing_plans_updated_at BEFORE UPDATE ON public.billing_plans FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_system_modules_updated_at ON public.system_modules;
CREATE TRIGGER update_system_modules_updated_at BEFORE UPDATE ON public.system_modules FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_org_subscriptions_updated_at ON public.organization_subscriptions;
CREATE TRIGGER update_org_subscriptions_updated_at BEFORE UPDATE ON public.organization_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_vessel_specs_updated_at ON public.vessel_specifications;
CREATE TRIGGER update_vessel_specs_updated_at BEFORE UPDATE ON public.vessel_specifications FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_vessel_parts_updated_at ON public.vessel_parts;
CREATE TRIGGER update_vessel_parts_updated_at BEFORE UPDATE ON public.vessel_parts FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_vessel_plans_updated_at ON public.vessel_plans;
CREATE TRIGGER update_vessel_plans_updated_at BEFORE UPDATE ON public.vessel_plans FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_vessel_sensors_updated_at ON public.vessel_sensors;
CREATE TRIGGER update_vessel_sensors_updated_at BEFORE UPDATE ON public.vessel_sensors FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

DROP TRIGGER IF EXISTS update_vessel_ai_conv_updated_at ON public.vessel_ai_conversations;
CREATE TRIGGER update_vessel_ai_conv_updated_at BEFORE UPDATE ON public.vessel_ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();

-- =============================================
-- HELPER FUNCTION: Check module access
-- =============================================

CREATE OR REPLACE FUNCTION public.has_module_access(p_organization_id UUID, p_module_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM public.system_modules WHERE slug = p_module_slug AND is_core = true) THEN
    RETURN true;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_subscriptions os
    JOIN public.plan_modules pm ON pm.plan_id = os.plan_id
    JOIN public.system_modules sm ON sm.id = pm.module_id
    WHERE os.organization_id = p_organization_id
    AND os.status IN ('active', 'trialing')
    AND sm.slug = p_module_slug
  ) INTO v_has_access;
  
  IF v_has_access THEN RETURN true; END IF;
  
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_addons oa
    JOIN public.system_modules sm ON sm.id = oa.module_id
    WHERE oa.organization_id = p_organization_id
    AND oa.status = 'active'
    AND sm.slug = p_module_slug
  ) INTO v_has_access;
  
  RETURN v_has_access;
END;
$$;