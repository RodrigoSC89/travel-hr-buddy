-- PATCH 262: Crew Wellbeing - Health & Psychological Support Tables
-- Creates tables for health check-ins and psychological support

-- 1. Health Check-ins Table
CREATE TABLE IF NOT EXISTS public.health_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Health metrics
    sleep_hours DECIMAL(3,1),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
    nutrition_rating INTEGER CHECK (nutrition_rating BETWEEN 1 AND 5),
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    
    -- Additional metrics
    exercise_minutes INTEGER,
    water_intake_liters DECIMAL(3,1),
    
    -- Notes and concerns
    notes TEXT,
    concerns TEXT[],
    
    -- Risk assessment
    risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    requires_attention BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Psychological Support Requests Table
CREATE TABLE IF NOT EXISTS public.psychological_support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request details
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Support type
    support_type TEXT CHECK (support_type IN ('chat', 'call', 'video', 'in_person')),
    preferred_time TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Privacy
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Follow-up
    requires_followup BOOLEAN DEFAULT false,
    followup_date DATE,
    
    -- Notes
    counselor_notes TEXT,
    outcome_summary TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Wellbeing Alerts Table
CREATE TABLE IF NOT EXISTS public.wellbeing_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    alert_type TEXT NOT NULL CHECK (alert_type IN ('health_risk', 'mental_health', 'fatigue', 'stress', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    
    triggered_by TEXT, -- Source that triggered the alert
    trigger_data JSONB DEFAULT '{}'::jsonb,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellbeing_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_checkins
CREATE POLICY "Users can view their own health_checkins"
    ON public.health_checkins FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own health_checkins"
    ON public.health_checkins FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own health_checkins"
    ON public.health_checkins FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for psychological_support_requests
CREATE POLICY "Users can view their own support_requests"
    ON public.psychological_support_requests FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can create support_requests"
    ON public.psychological_support_requests FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own support_requests"
    ON public.psychological_support_requests FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR assigned_to = auth.uid());

-- RLS Policies for wellbeing_alerts
CREATE POLICY "Users can view their own wellbeing_alerts"
    ON public.wellbeing_alerts FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "System can manage wellbeing_alerts"
    ON public.wellbeing_alerts FOR ALL
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX idx_health_checkins_user_id ON public.health_checkins(user_id);
CREATE INDEX idx_health_checkins_date ON public.health_checkins(checkin_date DESC);
CREATE INDEX idx_health_checkins_risk ON public.health_checkins(risk_level) WHERE requires_attention = true;

CREATE INDEX idx_support_requests_user_id ON public.psychological_support_requests(user_id);
CREATE INDEX idx_support_requests_status ON public.psychological_support_requests(status);
CREATE INDEX idx_support_requests_urgency ON public.psychological_support_requests(urgency_level);
CREATE INDEX idx_support_requests_assigned ON public.psychological_support_requests(assigned_to);

CREATE INDEX idx_wellbeing_alerts_user_id ON public.wellbeing_alerts(user_id);
CREATE INDEX idx_wellbeing_alerts_status ON public.wellbeing_alerts(status);
CREATE INDEX idx_wellbeing_alerts_severity ON public.wellbeing_alerts(severity);
CREATE INDEX idx_wellbeing_alerts_created_at ON public.wellbeing_alerts(created_at DESC);

-- Create update triggers
CREATE TRIGGER update_health_checkins_updated_at
    BEFORE UPDATE ON public.health_checkins
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_requests_updated_at
    BEFORE UPDATE ON public.psychological_support_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate wellbeing alerts based on health check-ins
CREATE OR REPLACE FUNCTION public.assess_health_checkin()
RETURNS TRIGGER AS $$
DECLARE
    risk_score INTEGER := 0;
    alert_message TEXT;
BEGIN
    -- Calculate risk score
    IF NEW.sleep_hours < 5 THEN risk_score := risk_score + 2; END IF;
    IF NEW.sleep_quality <= 2 THEN risk_score := risk_score + 1; END IF;
    IF NEW.mood_rating <= 2 THEN risk_score := risk_score + 2; END IF;
    IF NEW.stress_level >= 4 THEN risk_score := risk_score + 2; END IF;
    IF NEW.energy_level <= 2 THEN risk_score := risk_score + 1; END IF;
    
    -- Set risk level
    IF risk_score >= 5 THEN
        NEW.risk_level := 'critical';
        NEW.requires_attention := true;
        alert_message := 'Critical wellbeing risk detected - immediate attention required';
        
        INSERT INTO public.wellbeing_alerts (user_id, alert_type, severity, message, triggered_by)
        VALUES (NEW.user_id, 'health_risk', 'critical', alert_message, 'health_checkin');
    ELSIF risk_score >= 3 THEN
        NEW.risk_level := 'high';
        NEW.requires_attention := true;
        alert_message := 'High wellbeing risk detected - attention recommended';
        
        INSERT INTO public.wellbeing_alerts (user_id, alert_type, severity, message, triggered_by)
        VALUES (NEW.user_id, 'health_risk', 'warning', alert_message, 'health_checkin');
    ELSIF risk_score >= 1 THEN
        NEW.risk_level := 'moderate';
    ELSE
        NEW.risk_level := 'low';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER assess_health_checkin_trigger
    BEFORE INSERT OR UPDATE ON public.health_checkins
    FOR EACH ROW
    EXECUTE FUNCTION public.assess_health_checkin();
