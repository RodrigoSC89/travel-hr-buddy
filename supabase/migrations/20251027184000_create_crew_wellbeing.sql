-- Create crew_health_metrics table
CREATE TABLE IF NOT EXISTS crew_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  mood TEXT, -- 'excellent', 'good', 'neutral', 'bad', 'very_bad'
  mood_score INT CHECK (mood_score >= 1 AND mood_score <= 10),
  sleep_hours NUMERIC(4, 2),
  sleep_quality TEXT, -- 'excellent', 'good', 'fair', 'poor'
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  stress_level INT CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create health_anomalies table for tracking detected issues
CREATE TABLE IF NOT EXISTS health_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  metric_id UUID REFERENCES crew_health_metrics(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL, -- 'high_bp', 'low_bp', 'high_hr', 'low_hr', 'poor_sleep', 'high_stress'
  severity TEXT DEFAULT 'warning', -- 'info', 'warning', 'critical'
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_user ON crew_health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded ON crew_health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_anomalies_user ON health_anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_health_anomalies_resolved ON health_anomalies(is_resolved);

-- Enable RLS
ALTER TABLE crew_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_anomalies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crew_health_metrics
CREATE POLICY "Users can view their own health metrics"
  ON crew_health_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics"
  ON crew_health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics"
  ON crew_health_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for health_anomalies
CREATE POLICY "Users can view their own anomalies"
  ON health_anomalies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert anomalies"
  ON health_anomalies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own anomalies"
  ON health_anomalies FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to detect health anomalies
CREATE OR REPLACE FUNCTION detect_health_anomaly()
RETURNS TRIGGER AS $$
DECLARE
  anomaly_found BOOLEAN := false;
BEGIN
  -- Check blood pressure (systolic > 140 or < 90, diastolic > 90 or < 60)
  IF NEW.blood_pressure_systolic IS NOT NULL AND NEW.blood_pressure_diastolic IS NOT NULL THEN
    IF NEW.blood_pressure_systolic > 140 OR NEW.blood_pressure_diastolic > 90 THEN
      INSERT INTO health_anomalies (user_id, metric_id, anomaly_type, severity, description)
      VALUES (
        NEW.user_id,
        NEW.id,
        'high_bp',
        CASE WHEN NEW.blood_pressure_systolic > 160 OR NEW.blood_pressure_diastolic > 100 THEN 'critical' ELSE 'warning' END,
        'High blood pressure detected: ' || NEW.blood_pressure_systolic || '/' || NEW.blood_pressure_diastolic
      );
      anomaly_found := true;
    ELSIF NEW.blood_pressure_systolic < 90 OR NEW.blood_pressure_diastolic < 60 THEN
      INSERT INTO health_anomalies (user_id, metric_id, anomaly_type, severity, description)
      VALUES (
        NEW.user_id,
        NEW.id,
        'low_bp',
        'warning',
        'Low blood pressure detected: ' || NEW.blood_pressure_systolic || '/' || NEW.blood_pressure_diastolic
      );
      anomaly_found := true;
    END IF;
  END IF;

  -- Check heart rate (> 100 or < 60 for resting HR)
  IF NEW.heart_rate IS NOT NULL THEN
    IF NEW.heart_rate > 100 THEN
      INSERT INTO health_anomalies (user_id, metric_id, anomaly_type, severity, description)
      VALUES (
        NEW.user_id,
        NEW.id,
        'high_hr',
        CASE WHEN NEW.heart_rate > 120 THEN 'critical' ELSE 'warning' END,
        'High heart rate detected: ' || NEW.heart_rate || ' bpm'
      );
      anomaly_found := true;
    ELSIF NEW.heart_rate < 50 THEN
      INSERT INTO health_anomalies (user_id, metric_id, anomaly_type, severity, description)
      VALUES (
        NEW.user_id,
        NEW.id,
        'low_hr',
        'warning',
        'Low heart rate detected: ' || NEW.heart_rate || ' bpm'
      );
      anomaly_found := true;
    END IF;
  END IF;

  -- Check sleep (< 5 hours)
  IF NEW.sleep_hours IS NOT NULL AND NEW.sleep_hours < 5 THEN
    INSERT INTO health_anomalies (user_id, metric_id, anomaly_type, severity, description)
    VALUES (
      NEW.user_id,
      NEW.id,
      'poor_sleep',
      CASE WHEN NEW.sleep_hours < 3 THEN 'critical' ELSE 'warning' END,
      'Insufficient sleep detected: ' || NEW.sleep_hours || ' hours'
    );
    anomaly_found := true;
  END IF;

  -- Check stress level (> 7)
  IF NEW.stress_level IS NOT NULL AND NEW.stress_level > 7 THEN
    INSERT INTO health_anomalies (user_id, metric_id, anomaly_type, severity, description)
    VALUES (
      NEW.user_id,
      NEW.id,
      'high_stress',
      CASE WHEN NEW.stress_level >= 9 THEN 'critical' ELSE 'warning' END,
      'High stress level detected: ' || NEW.stress_level || '/10'
    );
    anomaly_found := true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to detect anomalies after insert
CREATE TRIGGER check_health_anomalies
  AFTER INSERT ON crew_health_metrics
  FOR EACH ROW
  EXECUTE FUNCTION detect_health_anomaly();

-- View for health summary statistics
CREATE OR REPLACE VIEW crew_health_summary AS
SELECT
  user_id,
  COUNT(*) as total_records,
  AVG(mood_score) as avg_mood,
  AVG(sleep_hours) as avg_sleep,
  AVG(heart_rate) as avg_heart_rate,
  AVG(stress_level) as avg_stress,
  MAX(recorded_at) as last_recorded
FROM crew_health_metrics
GROUP BY user_id;
