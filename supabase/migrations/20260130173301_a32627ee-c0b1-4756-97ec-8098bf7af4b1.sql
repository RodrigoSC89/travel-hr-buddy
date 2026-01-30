-- =====================================================
-- NAUTI ONE v4.0 - TABELAS FALTANTES
-- =====================================================

-- 1. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  max_users INTEGER,
  max_vessels INTEGER,
  description TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SENSOR READINGS (time series)
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.vessel_sensors(id) ON DELETE CASCADE NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  value DECIMAL NOT NULL,
  quality TEXT DEFAULT 'good',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor ON public.sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_time ON public.sensor_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_org ON public.sensor_readings(organization_id);

-- RLS for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view plans" ON public.subscription_plans FOR SELECT USING (is_active = true);

-- RLS for sensor_readings
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members can view readings" ON public.sensor_readings;
CREATE POLICY "Org members can view readings" ON public.sensor_readings 
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "System can insert readings" ON public.sensor_readings;
CREATE POLICY "System can insert readings" ON public.sensor_readings 
  FOR INSERT WITH CHECK (true);

-- Triggers
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();