-- PATCH 386: Weather Dashboard - Weather Alerts Table
-- Migration to create weather_alerts table for real-time weather alert system

CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('wind', 'rain', 'temperature', 'storm', 'fog', 'general')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_alerts_organization ON public.weather_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_active ON public.weather_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_severity ON public.weather_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_type ON public.weather_alerts(alert_type);

-- Enable Row Level Security
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view weather alerts from their organization"
  ON public.weather_alerts
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Admins can manage weather alerts"
  ON public.weather_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = weather_alerts.organization_id
      AND role IN ('admin', 'owner')
      AND status = 'active'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_weather_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weather_alerts_updated_at
  BEFORE UPDATE ON public.weather_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_weather_alerts_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weather_alerts TO authenticated;
GRANT USAGE ON SEQUENCE weather_alerts_id_seq TO authenticated;
