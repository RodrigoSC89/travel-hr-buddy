-- PATCH FINAL: Criar tabelas faltantes para completude do sistema

-- 1. Tabela simulation_exercises (simulações de emergência)
CREATE TABLE IF NOT EXISTS public.simulation_exercises (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    exercise_type TEXT NOT NULL DEFAULT 'emergency_drill',
    scenario TEXT,
    participants JSONB DEFAULT '[]'::jsonb,
    vessel_id UUID REFERENCES public.vessels(id),
    organization_id UUID REFERENCES public.organizations(id),
    status TEXT DEFAULT 'scheduled',
    next_due TIMESTAMP WITH TIME ZONE,
    last_executed TIMESTAMP WITH TIME ZONE,
    frequency_days INTEGER DEFAULT 90,
    results JSONB,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela simulation_event_log (log de eventos de simulação)
CREATE TABLE IF NOT EXISTS public.simulation_event_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    exercise_id UUID REFERENCES public.simulation_exercises(id),
    data JSONB DEFAULT '{}'::jsonb,
    severity TEXT DEFAULT 'info',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela simulation_decision_log (log de decisões de simulação)
CREATE TABLE IF NOT EXISTS public.simulation_decision_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id UUID REFERENCES public.simulation_exercises(id),
    decision_type TEXT NOT NULL,
    decision_data JSONB DEFAULT '{}'::jsonb,
    made_by UUID,
    outcome TEXT,
    score INTEGER,
    feedback TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Tabela fleet_anomalies (anomalias detectadas na frota)
CREATE TABLE IF NOT EXISTS public.fleet_anomalies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id),
    anomaly_type TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    description TEXT,
    sensor_data JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolution_notes TEXT,
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.simulation_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_anomalies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for simulation_exercises
CREATE POLICY "Users can view simulation exercises in their org" 
ON public.simulation_exercises FOR SELECT 
USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can manage simulation exercises in their org" 
ON public.simulation_exercises FOR ALL 
USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS Policies for simulation_event_log
CREATE POLICY "Users can view simulation events" 
ON public.simulation_event_log FOR SELECT 
USING (exercise_id IN (
    SELECT id FROM public.simulation_exercises WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
));

CREATE POLICY "Users can insert simulation events" 
ON public.simulation_event_log FOR INSERT 
WITH CHECK (true);

-- RLS Policies for simulation_decision_log
CREATE POLICY "Users can view simulation decisions" 
ON public.simulation_decision_log FOR SELECT 
USING (exercise_id IN (
    SELECT id FROM public.simulation_exercises WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
));

CREATE POLICY "Users can insert simulation decisions" 
ON public.simulation_decision_log FOR INSERT 
WITH CHECK (true);

-- RLS Policies for fleet_anomalies
CREATE POLICY "Users can view fleet anomalies in their org" 
ON public.fleet_anomalies FOR SELECT 
USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can manage fleet anomalies in their org" 
ON public.fleet_anomalies FOR ALL 
USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_org ON public.simulation_exercises(organization_id);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_vessel ON public.simulation_exercises(vessel_id);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_next_due ON public.simulation_exercises(next_due);
CREATE INDEX IF NOT EXISTS idx_simulation_event_log_exercise ON public.simulation_event_log(exercise_id);
CREATE INDEX IF NOT EXISTS idx_simulation_decision_log_exercise ON public.simulation_decision_log(exercise_id);
CREATE INDEX IF NOT EXISTS idx_fleet_anomalies_vessel ON public.fleet_anomalies(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fleet_anomalies_resolved ON public.fleet_anomalies(resolved);
CREATE INDEX IF NOT EXISTS idx_fleet_anomalies_org ON public.fleet_anomalies(organization_id);