-- Tabela de Sensores IoT
CREATE TABLE IF NOT EXISTS public.iot_sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  equipment_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('vibration', 'temperature', 'pressure', 'rpm', 'flow', 'level')),
  unit TEXT NOT NULL,
  min_threshold NUMERIC NOT NULL DEFAULT 0,
  max_threshold NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Leituras de Sensores IoT
CREATE TABLE IF NOT EXISTS public.iot_sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'offline')),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Alertas de Sensores
CREATE TABLE IF NOT EXISTS public.iot_sensor_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  value_at_alert NUMERIC,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Métricas de Sistema (para health monitor)
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  cpu_usage NUMERIC,
  memory_usage NUMERIC,
  network_status TEXT DEFAULT 'online',
  database_latency_ms INTEGER,
  active_users INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  uptime_seconds BIGINT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dados meteorológicos cache
CREATE TABLE IF NOT EXISTS public.weather_forecast_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_lat NUMERIC NOT NULL,
  location_lon NUMERIC NOT NULL,
  port_id TEXT,
  forecast_type TEXT NOT NULL CHECK (forecast_type IN ('hourly', 'daily', 'marine')),
  forecast_data JSONB NOT NULL,
  source TEXT DEFAULT 'openweather',
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '3 hours'
);

-- Fleet real-time data
CREATE TABLE IF NOT EXISTS public.fleet_realtime_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  position_lat NUMERIC,
  position_lon NUMERIC,
  speed_knots NUMERIC,
  heading_degrees NUMERIC,
  fuel_level_percent NUMERIC,
  engine_hours INTEGER,
  crew_count INTEGER,
  status TEXT DEFAULT 'operational',
  last_communication_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_iot_sensor_readings_sensor_id ON public.iot_sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_readings_recorded_at ON public.iot_sensor_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_alerts_sensor_id ON public.iot_sensor_alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON public.system_health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_realtime_data_vessel_id ON public.fleet_realtime_data(vessel_id);
CREATE INDEX IF NOT EXISTS idx_weather_forecast_cache_location ON public.weather_forecast_cache(location_lat, location_lon);

-- RLS
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecast_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_realtime_data ENABLE ROW LEVEL SECURITY;

-- Policies simples baseadas em auth.uid()
CREATE POLICY "iot_sensors_select" ON public.iot_sensors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "iot_sensors_all" ON public.iot_sensors FOR ALL USING (public.is_admin());

CREATE POLICY "iot_readings_select" ON public.iot_sensor_readings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "iot_readings_insert" ON public.iot_sensor_readings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "iot_alerts_select" ON public.iot_sensor_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "iot_alerts_manage" ON public.iot_sensor_alerts FOR ALL USING (public.is_admin());

CREATE POLICY "health_metrics_select" ON public.system_health_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "health_metrics_insert" ON public.system_health_metrics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "weather_cache_select" ON public.weather_forecast_cache FOR SELECT USING (true);
CREATE POLICY "weather_cache_manage" ON public.weather_forecast_cache FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "fleet_realtime_select" ON public.fleet_realtime_data FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "fleet_realtime_insert" ON public.fleet_realtime_data FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger updated_at
CREATE TRIGGER update_iot_sensors_updated_at
  BEFORE UPDATE ON public.iot_sensors
  FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();