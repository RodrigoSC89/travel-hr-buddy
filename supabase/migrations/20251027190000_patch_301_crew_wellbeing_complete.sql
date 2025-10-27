-- PATCH 301: Complete Crew Wellbeing System
-- Adds missing tables: crew_wellbeing_logs, health_checkups, psychological_support_cases

-- 1. Create crew_wellbeing_logs table (historical log of all wellbeing events)
CREATE TABLE IF NOT EXISTS public.crew_wellbeing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'checkin', 'alert', 'support_request', 'assessment'
  event_data JSONB DEFAULT '{}'::jsonb,
  wellbeing_score NUMERIC(3, 1), -- Calculated score 0-10
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create health_checkups table (formal medical checkups)
CREATE TABLE IF NOT EXISTS public.health_checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checkup_date DATE NOT NULL,
  checkup_type TEXT NOT NULL, -- 'routine', 'pre_voyage', 'post_voyage', 'emergency'
  
  -- Vital signs
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  temperature NUMERIC(4, 1),
  weight_kg NUMERIC(5, 2),
  height_cm NUMERIC(5, 2),
  
  -- Medical assessment
  medical_officer TEXT,
  medical_center TEXT,
  diagnosis TEXT,
  medications TEXT[],
  restrictions TEXT[],
  fit_for_duty BOOLEAN DEFAULT true,
  fitness_expiry_date DATE,
  
  -- Results
  lab_results JSONB DEFAULT '{}'::jsonb,
  recommendations TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  -- Attachments
  document_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create psychological_support_cases table (detailed case management)
CREATE TABLE IF NOT EXISTS public.psychological_support_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_number TEXT UNIQUE NOT NULL,
  
  -- Case details
  opened_date DATE NOT NULL DEFAULT CURRENT_DATE,
  case_type TEXT NOT NULL, -- 'stress', 'anxiety', 'depression', 'trauma', 'adjustment', 'other'
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  is_confidential BOOLEAN DEFAULT true,
  
  -- Support details
  counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  counselor_name TEXT,
  support_plan TEXT,
  sessions_planned INT DEFAULT 0,
  sessions_completed INT DEFAULT 0,
  
  -- Progress tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'on_hold', 'completed', 'closed')),
  progress_notes TEXT[],
  improvement_rating INT CHECK (improvement_rating BETWEEN 1 AND 5),
  
  -- Outcomes
  outcome TEXT,
  closed_date DATE,
  referral_needed BOOLEAN DEFAULT false,
  referral_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wellbeing_logs_user ON public.crew_wellbeing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wellbeing_logs_created ON public.crew_wellbeing_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wellbeing_logs_event_type ON public.crew_wellbeing_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_health_checkups_user ON public.health_checkups(user_id);
CREATE INDEX IF NOT EXISTS idx_health_checkups_date ON public.health_checkups(checkup_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_checkups_fit ON public.health_checkups(fit_for_duty);

CREATE INDEX IF NOT EXISTS idx_support_cases_user ON public.psychological_support_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_support_cases_status ON public.psychological_support_cases(status);
CREATE INDEX IF NOT EXISTS idx_support_cases_severity ON public.psychological_support_cases(severity);
CREATE INDEX IF NOT EXISTS idx_support_cases_counselor ON public.psychological_support_cases(counselor_id);

-- Enable RLS
ALTER TABLE public.crew_wellbeing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checkups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_support_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crew_wellbeing_logs
CREATE POLICY "Users can view their own wellbeing logs"
  ON public.crew_wellbeing_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert wellbeing logs"
  ON public.crew_wellbeing_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for health_checkups
CREATE POLICY "Users can view their own health checkups"
  ON public.health_checkups FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Medical officers can view and manage checkups"
  ON public.health_checkups FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for psychological_support_cases
CREATE POLICY "Users can view their own support cases"
  ON public.psychological_support_cases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR counselor_id = auth.uid());

CREATE POLICY "Counselors can manage support cases"
  ON public.psychological_support_cases FOR ALL
  TO authenticated
  USING (counselor_id = auth.uid());

CREATE POLICY "Users can create support cases"
  ON public.psychological_support_cases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update triggers
CREATE TRIGGER update_health_checkups_updated_at
  BEFORE UPDATE ON public.health_checkups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_cases_updated_at
  BEFORE UPDATE ON public.psychological_support_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate wellbeing score
CREATE OR REPLACE FUNCTION public.calculate_wellbeing_score(
  p_user_id UUID,
  p_days INT DEFAULT 7
)
RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC := 5.0;
  v_health_avg NUMERIC;
  v_stress_avg NUMERIC;
  v_mood_avg NUMERIC;
  v_sleep_avg NUMERIC;
  v_alert_count INT;
BEGIN
  -- Get average health metrics from recent check-ins
  SELECT
    AVG(mood_rating),
    AVG(stress_level),
    AVG(sleep_quality),
    AVG(sleep_hours)
  INTO v_mood_avg, v_stress_avg, v_health_avg, v_sleep_avg
  FROM public.health_checkins
  WHERE user_id = p_user_id
    AND checkin_date >= CURRENT_DATE - p_days
    AND checkin_date <= CURRENT_DATE;
  
  -- Count active alerts
  SELECT COUNT(*)
  INTO v_alert_count
  FROM public.wellbeing_alerts
  WHERE user_id = p_user_id
    AND status = 'active'
    AND severity IN ('warning', 'critical');
  
  -- Calculate score (0-10 scale)
  IF v_mood_avg IS NOT NULL THEN
    v_score := (v_mood_avg * 2.0) + -- Mood is most important
               (CASE WHEN v_stress_avg IS NOT NULL THEN (6 - v_stress_avg) ELSE 0 END) + -- Inverse stress
               (CASE WHEN v_health_avg IS NOT NULL THEN v_health_avg ELSE 0 END) +
               (CASE WHEN v_sleep_avg >= 7 THEN 1.0 ELSE 0.0 END); -- Sleep bonus
    
    -- Deduct points for active alerts
    v_score := v_score - (v_alert_count * 0.5);
    
    -- Normalize to 0-10 range
    v_score := GREATEST(0, LEAST(10, v_score));
  END IF;
  
  RETURN ROUND(v_score, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log wellbeing events
CREATE OR REPLACE FUNCTION public.log_wellbeing_event()
RETURNS TRIGGER AS $$
DECLARE
  v_score NUMERIC;
BEGIN
  v_score := public.calculate_wellbeing_score(NEW.user_id, 7);
  
  INSERT INTO public.crew_wellbeing_logs (
    user_id,
    event_type,
    event_data,
    wellbeing_score
  ) VALUES (
    NEW.user_id,
    TG_TABLE_NAME,
    jsonb_build_object('record_id', NEW.id),
    v_score
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to log wellbeing events
CREATE TRIGGER log_health_checkin_event
  AFTER INSERT ON public.health_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.log_wellbeing_event();

CREATE TRIGGER log_wellbeing_alert_event
  AFTER INSERT ON public.wellbeing_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_wellbeing_event();

-- Generate case numbers automatically
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := 'PSY-' || TO_CHAR(NEW.opened_date, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('case_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

CREATE TRIGGER generate_support_case_number
  BEFORE INSERT ON public.psychological_support_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_case_number();
