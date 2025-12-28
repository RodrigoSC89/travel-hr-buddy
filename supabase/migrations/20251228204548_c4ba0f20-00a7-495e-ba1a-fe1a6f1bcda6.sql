-- PATCH 661.1: Sensor tables
CREATE TABLE IF NOT EXISTS public.sensor_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sensor_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  message TEXT NOT NULL,
  value NUMERIC,
  threshold NUMERIC,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.iot_sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  location JSONB,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sensor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sensor_logs_select" ON public.sensor_logs FOR SELECT USING (true);
CREATE POLICY "sensor_logs_insert" ON public.sensor_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "sensor_alerts_select" ON public.sensor_alerts FOR SELECT USING (true);
CREATE POLICY "sensor_alerts_all" ON public.sensor_alerts FOR ALL USING (true);
CREATE POLICY "iot_sensor_data_select" ON public.iot_sensor_data FOR SELECT USING (true);
CREATE POLICY "iot_sensor_data_insert" ON public.iot_sensor_data FOR INSERT WITH CHECK (true);

CREATE INDEX idx_sensor_logs_sensor_id ON public.sensor_logs(sensor_id);
CREATE INDEX idx_sensor_alerts_sensor_id ON public.sensor_alerts(sensor_id);
CREATE INDEX idx_iot_sensor_data_sensor_id ON public.iot_sensor_data(sensor_id);