-- ============================================================================
-- PATCH: Create Wellness & Scenario Simulation Tables
-- Support for wellness-predictor.ts and what-if-simulator.ts
-- ============================================================================

-- 1. Crew Wellness Metrics Table
CREATE TABLE IF NOT EXISTS public.crew_wellness_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  wellness_score NUMERIC(5,2) CHECK (wellness_score >= 0 AND wellness_score <= 100),
  fatigue_index NUMERIC(5,2) CHECK (fatigue_index >= 0 AND fatigue_index <= 100),
  stress_level NUMERIC(5,2) CHECK (stress_level >= 0 AND stress_level <= 100),
  sleep_hours NUMERIC(4,2),
  sleep_quality NUMERIC(5,2) CHECK (sleep_quality >= 0 AND sleep_quality <= 100),
  recovery_score NUMERIC(5,2) CHECK (recovery_score >= 0 AND recovery_score <= 100),
  hours_on_duty NUMERIC(4,2),
  sentiment_score NUMERIC(4,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  heart_rate_avg NUMERIC(5,2),
  heart_rate_variability NUMERIC(5,2),
  step_count INTEGER,
  active_minutes INTEGER,
  breaks_taken INTEGER,
  tasks_completed INTEGER,
  incidents_reported INTEGER DEFAULT 0,
  message_volume INTEGER,
  response_time_avg NUMERIC(6,2),
  alert_count INTEGER DEFAULT 0,
  wearable_source VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for crew_wellness_metrics
CREATE INDEX IF NOT EXISTS idx_crew_wellness_crew_id ON public.crew_wellness_metrics(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_wellness_org_id ON public.crew_wellness_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_wellness_date ON public.crew_wellness_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_crew_wellness_score ON public.crew_wellness_metrics(wellness_score);

-- Enable RLS
ALTER TABLE public.crew_wellness_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view wellness metrics in their organization"
  ON public.crew_wellness_metrics FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert wellness metrics in their organization"
  ON public.crew_wellness_metrics FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update wellness metrics in their organization"
  ON public.crew_wellness_metrics FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()));

-- 2. Wellness Alerts Table
CREATE TABLE IF NOT EXISTS public.wellness_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  recommendation TEXT,
  is_active BOOLEAN DEFAULT true,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for wellness_alerts
CREATE INDEX IF NOT EXISTS idx_wellness_alerts_crew_id ON public.wellness_alerts(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_wellness_alerts_org_id ON public.wellness_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_wellness_alerts_severity ON public.wellness_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_wellness_alerts_active ON public.wellness_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_wellness_alerts_created ON public.wellness_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE public.wellness_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view wellness alerts in their organization"
  ON public.wellness_alerts FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert wellness alerts in their organization"
  ON public.wellness_alerts FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update wellness alerts in their organization"
  ON public.wellness_alerts FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()));

-- 3. Scenario Simulations Table (for logging)
CREATE TABLE IF NOT EXISTS public.scenario_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  scenario_name VARCHAR(255) NOT NULL,
  parameters JSONB NOT NULL DEFAULT '[]',
  impacts JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  risk_score NUMERIC(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
  confidence_level NUMERIC(5,2) CHECK (confidence_level >= 0 AND confidence_level <= 100),
  projected_savings NUMERIC(15,2),
  projected_costs NUMERIC(15,2),
  time_horizon VARCHAR(50),
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for scenario_simulations
CREATE INDEX IF NOT EXISTS idx_scenario_sims_org_id ON public.scenario_simulations(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenario_sims_user_id ON public.scenario_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_sims_created ON public.scenario_simulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenario_sims_risk ON public.scenario_simulations(risk_score);

-- Enable RLS
ALTER TABLE public.scenario_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view simulations in their organization"
  ON public.scenario_simulations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can create simulations"
  ON public.scenario_simulations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Saved Scenarios Table
CREATE TABLE IF NOT EXISTS public.saved_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL DEFAULT '[]',
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for saved_scenarios
CREATE INDEX IF NOT EXISTS idx_saved_scenarios_org_id ON public.saved_scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_saved_scenarios_created_by ON public.saved_scenarios(created_by);
CREATE INDEX IF NOT EXISTS idx_saved_scenarios_template ON public.saved_scenarios(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_saved_scenarios_public ON public.saved_scenarios(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own and public/template scenarios"
  ON public.saved_scenarios FOR SELECT
  USING (
    created_by = auth.uid() 
    OR is_template = true 
    OR is_public = true
    OR organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create scenarios"
  ON public.saved_scenarios FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own scenarios"
  ON public.saved_scenarios FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own scenarios"
  ON public.saved_scenarios FOR DELETE
  USING (created_by = auth.uid());

-- 5. Add embarked_at to crew_rotations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'crew_rotations' 
    AND column_name = 'embarked_at'
  ) THEN
    ALTER TABLE public.crew_rotations ADD COLUMN embarked_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'crew_rotations' 
    AND column_name = 'disembarked_at'
  ) THEN
    ALTER TABLE public.crew_rotations ADD COLUMN disembarked_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 6. Update triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_wellness_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_crew_wellness_metrics_updated_at ON public.crew_wellness_metrics;
CREATE TRIGGER update_crew_wellness_metrics_updated_at
  BEFORE UPDATE ON public.crew_wellness_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_wellness_updated_at();

DROP TRIGGER IF EXISTS update_wellness_alerts_updated_at ON public.wellness_alerts;
CREATE TRIGGER update_wellness_alerts_updated_at
  BEFORE UPDATE ON public.wellness_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_wellness_updated_at();

DROP TRIGGER IF EXISTS update_saved_scenarios_updated_at ON public.saved_scenarios;
CREATE TRIGGER update_saved_scenarios_updated_at
  BEFORE UPDATE ON public.saved_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_wellness_updated_at();