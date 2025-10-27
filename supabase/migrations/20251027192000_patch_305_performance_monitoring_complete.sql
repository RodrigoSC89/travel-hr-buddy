-- PATCH 305: Performance Monitoring v1
-- Creates tables for performance monitoring with threshold-based alerts

-- 1. Create performance_metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metric identification
  system_name TEXT NOT NULL, -- 'engine', 'navigation', 'power', 'hvac', 'sensors'
  metric_name TEXT NOT NULL, -- 'temperature', 'pressure', 'speed', 'efficiency'
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL,
  
  -- Thresholds
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  
  -- Status
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  
  -- Metadata
  source TEXT, -- 'sensor', 'system', 'manual'
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create performance_alerts table
CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES public.performance_metrics(id) ON DELETE SET NULL,
  
  -- Alert details
  system_name TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'threshold_exceeded', 'anomaly_detected', 'system_failure'
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create performance_thresholds table (configurable)
CREATE TABLE IF NOT EXISTS public.performance_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  
  -- Threshold values
  warning_min NUMERIC,
  warning_max NUMERIC,
  critical_min NUMERIC,
  critical_max NUMERIC,
  
  -- Config
  is_active BOOLEAN DEFAULT true,
  notify_on_breach BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(system_name, metric_name)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_system ON public.performance_metrics(system_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created ON public.performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_status ON public.performance_metrics(status);

CREATE INDEX IF NOT EXISTS idx_performance_alerts_system ON public.performance_alerts(system_name);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON public.performance_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON public.performance_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_performance_thresholds_system ON public.performance_thresholds(system_name, metric_name);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view performance metrics"
  ON public.performance_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert metrics"
  ON public.performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for performance_alerts
CREATE POLICY "Users can view performance alerts"
  ON public.performance_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update alerts they resolved"
  ON public.performance_alerts FOR UPDATE
  TO authenticated
  USING (resolved_by = auth.uid() OR resolved_by IS NULL);

-- RLS Policies for performance_thresholds
CREATE POLICY "Users can view performance thresholds"
  ON public.performance_thresholds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage thresholds"
  ON public.performance_thresholds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Update triggers
CREATE TRIGGER update_performance_thresholds_updated_at
  BEFORE UPDATE ON public.performance_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check thresholds and create alerts
CREATE OR REPLACE FUNCTION public.check_performance_threshold()
RETURNS TRIGGER AS $$
DECLARE
  v_threshold RECORD;
  v_alert_severity TEXT := 'info';
  v_alert_message TEXT;
BEGIN
  -- Get threshold configuration
  SELECT * INTO v_threshold
  FROM public.performance_thresholds
  WHERE system_name = NEW.system_name
    AND metric_name = NEW.metric_name
    AND is_active = true;
  
  IF v_threshold IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check critical thresholds
  IF (v_threshold.critical_min IS NOT NULL AND NEW.metric_value < v_threshold.critical_min) OR
     (v_threshold.critical_max IS NOT NULL AND NEW.metric_value > v_threshold.critical_max) THEN
    v_alert_severity := 'critical';
    v_alert_message := 'Critical threshold breached for ' || NEW.metric_name || ' in ' || NEW.system_name || 
                       ': ' || NEW.metric_value || ' ' || NEW.metric_unit;
    NEW.status := 'critical';
  -- Check warning thresholds
  ELSIF (v_threshold.warning_min IS NOT NULL AND NEW.metric_value < v_threshold.warning_min) OR
        (v_threshold.warning_max IS NOT NULL AND NEW.metric_value > v_threshold.warning_max) THEN
    v_alert_severity := 'warning';
    v_alert_message := 'Warning threshold breached for ' || NEW.metric_name || ' in ' || NEW.system_name || 
                       ': ' || NEW.metric_value || ' ' || NEW.metric_unit;
    NEW.status := 'warning';
  ELSE
    NEW.status := 'normal';
    RETURN NEW;
  END IF;
  
  -- Create alert if threshold breached and notifications enabled
  IF v_threshold.notify_on_breach THEN
    INSERT INTO public.performance_alerts (
      metric_id,
      system_name,
      alert_type,
      severity,
      message
    ) VALUES (
      NEW.id,
      NEW.system_name,
      'threshold_exceeded',
      v_alert_severity,
      v_alert_message
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_performance_threshold_trigger
  BEFORE INSERT ON public.performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.check_performance_threshold();

-- Insert default thresholds
INSERT INTO public.performance_thresholds (system_name, metric_name, warning_min, warning_max, critical_min, critical_max)
VALUES
  ('engine', 'temperature', 50, 90, 30, 110),
  ('engine', 'pressure', 2.0, 8.0, 1.0, 10.0),
  ('engine', 'rpm', 500, 3000, 100, 3500),
  ('power', 'voltage', 200, 260, 180, 280),
  ('navigation', 'speed', 0, 25, -1, 30),
  ('hvac', 'cabin_temp', 18, 28, 10, 35)
ON CONFLICT (system_name, metric_name) DO NOTHING;

-- View for performance statistics
CREATE OR REPLACE VIEW public.performance_statistics AS
SELECT
  system_name,
  COUNT(*) as metric_count,
  COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
  AVG(metric_value) as avg_value
FROM public.performance_metrics
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY system_name;
