-- PATCH 479: Sonar AI Enhanced Tables
-- Stores sonar events and risk assessments

-- Sonar Events Table
CREATE TABLE IF NOT EXISTS public.sonar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('detection', 'anomaly', 'hazard', 'echo', 'noise')),
  detection_type TEXT CHECK (detection_type IN ('object', 'vessel', 'underwater_obstacle', 'marine_life', 'debris', 'unknown')),
  confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  distance_meters DECIMAL(10,2),
  depth_meters DECIMAL(10,2),
  bearing_degrees DECIMAL(5,2) CHECK (bearing_degrees BETWEEN 0 AND 360),
  frequency_khz DECIMAL(8,2),
  amplitude_db DECIMAL(6,2),
  classification TEXT,
  ai_model_version TEXT,
  raw_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Sonar Risks Table
CREATE TABLE IF NOT EXISTS public.sonar_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.sonar_events(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_type TEXT NOT NULL CHECK (risk_type IN ('collision', 'grounding', 'obstruction', 'navigation_hazard', 'equipment_anomaly', 'environmental')),
  risk_score DECIMAL(5,2) CHECK (risk_score BETWEEN 0 AND 100),
  description TEXT NOT NULL,
  recommended_action TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'immediate')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'mitigated', 'resolved', 'false_positive')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_sonar_events_vessel_id ON public.sonar_events(vessel_id);
CREATE INDEX idx_sonar_events_event_type ON public.sonar_events(event_type);
CREATE INDEX idx_sonar_events_detected_at ON public.sonar_events(detected_at DESC);
CREATE INDEX idx_sonar_events_classification ON public.sonar_events(classification);
CREATE INDEX idx_sonar_risks_vessel_id ON public.sonar_risks(vessel_id);
CREATE INDEX idx_sonar_risks_risk_level ON public.sonar_risks(risk_level);
CREATE INDEX idx_sonar_risks_status ON public.sonar_risks(status);
CREATE INDEX idx_sonar_risks_event_id ON public.sonar_risks(event_id);

-- Enable RLS
ALTER TABLE public.sonar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sonar_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sonar_events
CREATE POLICY "Users can view sonar events"
  ON public.sonar_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sonar events"
  ON public.sonar_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sonar events"
  ON public.sonar_events FOR UPDATE
  USING (auth.role() = 'authenticated');

-- RLS Policies for sonar_risks
CREATE POLICY "Users can view sonar risks"
  ON public.sonar_risks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sonar risks"
  ON public.sonar_risks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sonar risks"
  ON public.sonar_risks FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.sonar_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.sonar_risks TO authenticated;

-- Comments
COMMENT ON TABLE public.sonar_events IS 'PATCH 479: Stores sonar detection events with AI classification';
COMMENT ON TABLE public.sonar_risks IS 'PATCH 479: Stores risk assessments derived from sonar events';
