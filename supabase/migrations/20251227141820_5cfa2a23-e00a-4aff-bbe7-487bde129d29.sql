-- PATCH: Create iot_sensor_data table for Maritime Command
-- Fixes critical error: "Could not find the table 'public.iot_sensor_data'"

CREATE TABLE IF NOT EXISTS public.iot_sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  value NUMERIC NOT NULL,
  unit TEXT,
  status TEXT DEFAULT 'normal',
  location TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.iot_sensor_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view sensor data"
  ON public.iot_sensor_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sensor data"
  ON public.iot_sensor_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sensor data"
  ON public.iot_sensor_data FOR UPDATE
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX idx_iot_sensor_data_vessel ON public.iot_sensor_data(vessel_id);
CREATE INDEX idx_iot_sensor_data_type ON public.iot_sensor_data(sensor_type);
CREATE INDEX idx_iot_sensor_data_timestamp ON public.iot_sensor_data(timestamp DESC);

-- Trigger for updated_at
CREATE TRIGGER update_iot_sensor_data_updated_at
  BEFORE UPDATE ON public.iot_sensor_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.iot_sensor_data (sensor_id, sensor_type, value, unit, status, location) VALUES
  ('SENS-001', 'temperature', 72.5, '°C', 'normal', 'Engine Room'),
  ('SENS-002', 'pressure', 1.2, 'bar', 'normal', 'Fuel System'),
  ('SENS-003', 'vibration', 0.8, 'mm/s', 'warning', 'Main Engine'),
  ('SENS-004', 'fuel_level', 85.0, '%', 'normal', 'Tank A'),
  ('SENS-005', 'engine_rpm', 1200, 'RPM', 'normal', 'Main Engine');