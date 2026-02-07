
-- ============================================
-- NAUTI ONE WORLD-CLASS UPGRADE
-- Fleet Pulse + Voyage Simulator + Crew Wellbeing + PSC Prediction
-- ============================================

-- 1. Crew Wellbeing Scores table
CREATE TABLE IF NOT EXISTS public.crew_wellbeing_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  overall_score NUMERIC(4,1) NOT NULL DEFAULT 0,
  rest_hours_score NUMERIC(4,1) DEFAULT 0,
  time_onboard_score NUMERIC(4,1) DEFAULT 0,
  medical_score NUMERIC(4,1) DEFAULT 0,
  performance_score NUMERIC(4,1) DEFAULT 0,
  fatigue_risk_level TEXT DEFAULT 'low' CHECK (fatigue_risk_level IN ('low', 'moderate', 'high', 'critical')),
  burnout_prediction_days INTEGER,
  factors JSONB DEFAULT '{}',
  recommendations TEXT[],
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crew_wellbeing_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read wellbeing scores" ON public.crew_wellbeing_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert wellbeing scores" ON public.crew_wellbeing_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update wellbeing scores" ON public.crew_wellbeing_scores FOR UPDATE TO authenticated USING (true);

-- 2. PSC Inspections tracking
CREATE TABLE IF NOT EXISTS public.psc_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  port_name TEXT NOT NULL,
  country TEXT NOT NULL,
  inspection_date TIMESTAMPTZ,
  inspector_name TEXT,
  detention_risk_score NUMERIC(4,1) DEFAULT 0,
  predicted_deficiencies JSONB DEFAULT '[]',
  actual_deficiencies JSONB DEFAULT '[]',
  was_detained BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  ai_briefing TEXT,
  ai_briefing_generated_at TIMESTAMPTZ,
  preparation_checklist JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.psc_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage PSC inspections" ON public.psc_inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Voyage Simulations
CREATE TABLE IF NOT EXISTS public.voyage_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  simulation_name TEXT NOT NULL,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  base_scenario JSONB DEFAULT '{}',
  scenarios JSONB DEFAULT '[]',
  ai_analysis TEXT,
  recommended_scenario INTEGER,
  estimated_profit NUMERIC(12,2),
  estimated_fuel_cost NUMERIC(12,2),
  estimated_duration_hours NUMERIC(8,1),
  risk_factors JSONB DEFAULT '[]',
  weather_impact JSONB DEFAULT '{}',
  created_by UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.voyage_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage voyage simulations" ON public.voyage_simulations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Fleet Health Scores (aggregated for Fleet Pulse)
CREATE TABLE IF NOT EXISTS public.fleet_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  overall_score NUMERIC(4,1) NOT NULL DEFAULT 0,
  maintenance_score NUMERIC(4,1) DEFAULT 0,
  compliance_score NUMERIC(4,1) DEFAULT 0,
  crew_score NUMERIC(4,1) DEFAULT 0,
  safety_score NUMERIC(4,1) DEFAULT 0,
  next_event_type TEXT,
  next_event_date TIMESTAMPTZ,
  next_event_description TEXT,
  current_activity TEXT DEFAULT 'unknown',
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  alerts JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_health_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage fleet health" ON public.fleet_health_scores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_wellbeing_crew ON public.crew_wellbeing_scores(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_psc_vessel ON public.psc_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_voyage_sim_vessel ON public.voyage_simulations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fleet_health_vessel ON public.fleet_health_scores(vessel_id);
