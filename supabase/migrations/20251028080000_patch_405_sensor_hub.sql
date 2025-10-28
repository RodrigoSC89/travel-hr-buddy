-- =====================================================
-- PATCH 405 - Sensor Hub System
-- Create sensor management system with IoT integration support
-- =====================================================

-- Create sensors table
CREATE TABLE IF NOT EXISTS public.sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('temperature', 'humidity', 'pressure', 'motion', 'light', 'gas', 'water', 'energy', 'location', 'custom')),
  location TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'offline', 'error', 'maintenance')) DEFAULT 'offline',
  last_reading JSONB,
  last_reading_at TIMESTAMPTZ,
  configuration JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensor_data table for time-series data
CREATE TABLE IF NOT EXISTS public.sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.sensors(id) ON DELETE CASCADE NOT NULL,
  reading JSONB NOT NULL,
  reading_value NUMERIC,
  unit TEXT,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 1),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensor_logs table for events and alerts
CREATE TABLE IF NOT EXISTS public.sensor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.sensors(id) ON DELETE CASCADE NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'alert', 'maintenance')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensor_alerts table for threshold-based alerts
CREATE TABLE IF NOT EXISTS public.sensor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.sensors(id) ON DELETE CASCADE NOT NULL,
  alert_name TEXT NOT NULL,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('above', 'below', 'equals', 'range', 'change')),
  threshold_value NUMERIC,
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  is_active BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '["app"]'::jsonb,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sensors_sensor_type ON public.sensors(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON public.sensors(status);
CREATE INDEX IF NOT EXISTS idx_sensors_is_active ON public.sensors(is_active);
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_id ON public.sensor_data(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_recorded_at ON public.sensor_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_sensor_id ON public.sensor_logs(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_log_type ON public.sensor_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_created_at ON public.sensor_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_sensor_id ON public.sensor_alerts(sensor_id);

-- Enable RLS
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view sensors"
  ON public.sensors
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sensors"
  ON public.sensors
  FOR ALL
  USING (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Users can view sensor data"
  ON public.sensor_data
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert sensor data"
  ON public.sensor_data
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view sensor logs"
  ON public.sensor_logs
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert sensor logs"
  ON public.sensor_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can acknowledge logs"
  ON public.sensor_logs
  FOR UPDATE
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Users can view sensor alerts"
  ON public.sensor_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sensor alerts"
  ON public.sensor_alerts
  FOR ALL
  USING (get_user_role() IN ('admin', 'manager'));

-- =====================================================
-- Functions for Sensor Management
-- =====================================================

-- Function to update sensor status
CREATE OR REPLACE FUNCTION public.update_sensor_status(
  p_sensor_id UUID,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sensors
  SET 
    status = p_status,
    updated_at = now()
  WHERE id = p_sensor_id;
  
  -- Log status change
  INSERT INTO public.sensor_logs (sensor_id, log_type, message, details)
  VALUES (
    p_sensor_id,
    'info',
    format('Sensor status changed to %s', p_status),
    jsonb_build_object('new_status', p_status)
  );
  
  RETURN true;
END;
$$;

-- Function to record sensor reading
CREATE OR REPLACE FUNCTION public.record_sensor_reading(
  p_sensor_id UUID,
  p_reading JSONB,
  p_reading_value NUMERIC DEFAULT NULL,
  p_unit TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reading_id UUID;
BEGIN
  -- Insert sensor data
  INSERT INTO public.sensor_data (sensor_id, reading, reading_value, unit)
  VALUES (p_sensor_id, p_reading, p_reading_value, p_unit)
  RETURNING id INTO reading_id;
  
  -- Update sensor last reading
  UPDATE public.sensors
  SET 
    last_reading = p_reading,
    last_reading_at = now(),
    status = 'active',
    updated_at = now()
  WHERE id = p_sensor_id;
  
  -- Check alerts
  PERFORM public.check_sensor_alerts(p_sensor_id, p_reading_value);
  
  RETURN reading_id;
END;
$$;

-- Function to check sensor alerts
CREATE OR REPLACE FUNCTION public.check_sensor_alerts(
  p_sensor_id UUID,
  p_value NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_record RECORD;
  should_trigger BOOLEAN;
BEGIN
  FOR alert_record IN 
    SELECT * FROM public.sensor_alerts
    WHERE sensor_id = p_sensor_id AND is_active = true
  LOOP
    should_trigger := false;
    
    CASE alert_record.condition_type
      WHEN 'above' THEN
        should_trigger := p_value > alert_record.threshold_value;
      WHEN 'below' THEN
        should_trigger := p_value < alert_record.threshold_value;
      WHEN 'equals' THEN
        should_trigger := p_value = alert_record.threshold_value;
      WHEN 'range' THEN
        should_trigger := p_value < alert_record.threshold_min OR p_value > alert_record.threshold_max;
    END CASE;
    
    IF should_trigger THEN
      -- Update alert trigger count
      UPDATE public.sensor_alerts
      SET 
        last_triggered_at = now(),
        trigger_count = trigger_count + 1
      WHERE id = alert_record.id;
      
      -- Create alert log
      INSERT INTO public.sensor_logs (sensor_id, log_type, message, details)
      VALUES (
        p_sensor_id,
        'alert',
        format('Alert triggered: %s', alert_record.alert_name),
        jsonb_build_object(
          'alert_id', alert_record.id,
          'value', p_value,
          'condition', alert_record.condition_type,
          'threshold', alert_record.threshold_value
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- =====================================================
-- Sample Sensors
-- =====================================================

-- Insert sample sensors
INSERT INTO public.sensors (name, sensor_type, location, description, status)
VALUES
  ('Main Server Room - Temperature', 'temperature', 'Server Room A', 'Temperature monitoring for server room', 'active'),
  ('Warehouse Humidity', 'humidity', 'Warehouse 1', 'Humidity sensor for storage area', 'active'),
  ('Main Entrance Motion', 'motion', 'Main Entrance', 'Motion detection for security', 'active'),
  ('Office Air Quality', 'gas', 'Office Floor 3', 'Air quality monitoring', 'offline')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.sensors IS 'IoT sensors registry and configuration';
COMMENT ON TABLE public.sensor_data IS 'Time-series data from sensors';
COMMENT ON TABLE public.sensor_logs IS 'Events, alerts, and maintenance logs for sensors';
COMMENT ON TABLE public.sensor_alerts IS 'Threshold-based alerts for sensor readings';
COMMENT ON FUNCTION public.update_sensor_status IS 'Updates sensor status and logs the change';
COMMENT ON FUNCTION public.record_sensor_reading IS 'Records a sensor reading and checks alerts';
COMMENT ON FUNCTION public.check_sensor_alerts IS 'Checks if sensor reading triggers any alerts';
