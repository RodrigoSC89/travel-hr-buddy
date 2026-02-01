-- ============================================================
-- PATCH 871.2: CREATE MISSING TABLES FOR TYPE-SAFE MODULES
-- ============================================================

-- 1. VOYAGE_PLANS - Para planejamento de viagens
CREATE TABLE IF NOT EXISTS public.voyage_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    voyage_number VARCHAR(50),
    origin_port VARCHAR(255) NOT NULL,
    destination_port VARCHAR(255) NOT NULL,
    departure_date TIMESTAMP WITH TIME ZONE,
    arrival_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    cargo_type VARCHAR(100),
    cargo_quantity DECIMAL(15,2),
    estimated_fuel_consumption DECIMAL(15,2),
    actual_fuel_consumption DECIMAL(15,2),
    distance_nm DECIMAL(10,2),
    weather_conditions JSONB DEFAULT '{}',
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. ROUTE_WAYPOINTS - Pontos de rota das viagens
CREATE TABLE IF NOT EXISTS public.route_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voyage_plan_id UUID REFERENCES public.voyage_plans(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    waypoint_name VARCHAR(255),
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(11,6) NOT NULL,
    eta TIMESTAMP WITH TIME ZONE,
    ata TIMESTAMP WITH TIME ZONE,
    speed_knots DECIMAL(5,2),
    heading DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. FUEL_RECORDS - Registros de combustível
CREATE TABLE IF NOT EXISTS public.fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    voyage_id UUID REFERENCES public.voyage_plans(id) ON DELETE SET NULL,
    record_date DATE NOT NULL,
    fuel_type VARCHAR(50) NOT NULL CHECK (fuel_type IN ('MGO', 'HFO', 'VLSFO', 'LNG', 'MDO', 'LSMGO')),
    quantity_mt DECIMAL(10,3) NOT NULL,
    quantity_liters DECIMAL(12,2),
    price_per_mt DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    bunkering_port VARCHAR(255),
    supplier VARCHAR(255),
    bunker_delivery_note VARCHAR(100),
    sulfur_content DECIMAL(4,2),
    density DECIMAL(6,4),
    viscosity DECIMAL(6,2),
    rob_before DECIMAL(10,3),
    rob_after DECIMAL(10,3),
    consumption_type VARCHAR(50) CHECK (consumption_type IN ('main_engine', 'auxiliary', 'boiler', 'incinerator')),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. FUEL_OPTIMIZATION_RUNS - Otimizações de combustível
CREATE TABLE IF NOT EXISTS public.fuel_optimization_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    voyage_id UUID REFERENCES public.voyage_plans(id) ON DELETE SET NULL,
    run_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    optimization_type VARCHAR(50) CHECK (optimization_type IN ('speed', 'route', 'trim', 'weather_routing', 'combined')),
    baseline_consumption DECIMAL(10,3),
    optimized_consumption DECIMAL(10,3),
    savings_mt DECIMAL(10,3),
    savings_percentage DECIMAL(5,2),
    savings_usd DECIMAL(12,2),
    recommendations JSONB DEFAULT '[]',
    parameters_used JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed', 'applied')),
    applied_at TIMESTAMP WITH TIME ZONE,
    applied_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. ROUTE_CONSUMPTION - Consumo por segmento de rota
CREATE TABLE IF NOT EXISTS public.route_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voyage_id UUID REFERENCES public.voyage_plans(id) ON DELETE CASCADE,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    segment_start VARCHAR(255),
    segment_end VARCHAR(255),
    distance_nm DECIMAL(10,2),
    duration_hours DECIMAL(8,2),
    avg_speed_knots DECIMAL(5,2),
    fuel_consumed_mt DECIMAL(10,3),
    fuel_type VARCHAR(50),
    weather_factor DECIMAL(4,2) DEFAULT 1.0,
    sea_state INTEGER CHECK (sea_state BETWEEN 0 AND 9),
    wind_speed_knots DECIMAL(5,2),
    current_factor DECIMAL(4,2),
    efficiency_score DECIMAL(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. FUEL_CONSUMPTION (complementar ao existente se não existir)
CREATE TABLE IF NOT EXISTS public.fuel_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    voyage_id UUID REFERENCES public.voyage_plans(id) ON DELETE SET NULL,
    consumption_date DATE NOT NULL,
    fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('MGO', 'HFO', 'VLSFO', 'LNG')),
    quantity_liters DECIMAL(12,2) NOT NULL,
    cost_usd DECIMAL(12,2),
    distance_nm DECIMAL(10,2),
    avg_speed_knots DECIMAL(5,2),
    weather_conditions VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_voyage_plans_vessel ON public.voyage_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_voyage_plans_org ON public.voyage_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_voyage_plans_status ON public.voyage_plans(status);
CREATE INDEX IF NOT EXISTS idx_voyage_plans_dates ON public.voyage_plans(departure_date, arrival_date);

CREATE INDEX IF NOT EXISTS idx_route_waypoints_voyage ON public.route_waypoints(voyage_plan_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_sequence ON public.route_waypoints(voyage_plan_id, sequence_order);

CREATE INDEX IF NOT EXISTS idx_fuel_records_vessel ON public.fuel_records(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_records_org ON public.fuel_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_fuel_records_date ON public.fuel_records(record_date);
CREATE INDEX IF NOT EXISTS idx_fuel_records_type ON public.fuel_records(fuel_type);

CREATE INDEX IF NOT EXISTS idx_fuel_optimization_vessel ON public.fuel_optimization_runs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_optimization_voyage ON public.fuel_optimization_runs(voyage_id);

CREATE INDEX IF NOT EXISTS idx_route_consumption_voyage ON public.route_consumption(voyage_id);
CREATE INDEX IF NOT EXISTS idx_route_consumption_vessel ON public.route_consumption(vessel_id);

CREATE INDEX IF NOT EXISTS idx_fuel_consumption_vessel ON public.fuel_consumption(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_date ON public.fuel_consumption(consumption_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.voyage_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_optimization_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_consumption ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Voyage Plans
CREATE POLICY "Users can view voyage_plans in their org" ON public.voyage_plans
    FOR SELECT USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can insert voyage_plans in their org" ON public.voyage_plans
    FOR INSERT WITH CHECK (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can update voyage_plans in their org" ON public.voyage_plans
    FOR UPDATE USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can delete voyage_plans in their org" ON public.voyage_plans
    FOR DELETE USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

-- RLS Policies - Route Waypoints (via voyage_plans)
CREATE POLICY "Users can manage route_waypoints via voyage" ON public.route_waypoints
    FOR ALL USING (
        voyage_plan_id IN (
            SELECT id FROM public.voyage_plans 
            WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        )
        OR public.has_global_access(auth.uid())
    );

-- RLS Policies - Fuel Records
CREATE POLICY "Users can view fuel_records in their org" ON public.fuel_records
    FOR SELECT USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can insert fuel_records in their org" ON public.fuel_records
    FOR INSERT WITH CHECK (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can update fuel_records in their org" ON public.fuel_records
    FOR UPDATE USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can delete fuel_records in their org" ON public.fuel_records
    FOR DELETE USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

-- RLS Policies - Fuel Optimization Runs
CREATE POLICY "Users can manage fuel_optimization_runs in their org" ON public.fuel_optimization_runs
    FOR ALL USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

-- RLS Policies - Route Consumption (via voyage/vessel)
CREATE POLICY "Users can manage route_consumption" ON public.route_consumption
    FOR ALL USING (
        vessel_id IN (SELECT public.get_user_vessel_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

-- RLS Policies - Fuel Consumption
CREATE POLICY "Users can view fuel_consumption in their org" ON public.fuel_consumption
    FOR SELECT USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can insert fuel_consumption in their org" ON public.fuel_consumption
    FOR INSERT WITH CHECK (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can update fuel_consumption in their org" ON public.fuel_consumption
    FOR UPDATE USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

CREATE POLICY "Users can delete fuel_consumption in their org" ON public.fuel_consumption
    FOR DELETE USING (
        organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_global_access(auth.uid())
    );

-- ============================================================
-- TRIGGERS FOR updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_voyage_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_voyage_plans_updated_at
    BEFORE UPDATE ON public.voyage_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_voyage_tables_updated_at();

CREATE TRIGGER update_fuel_records_updated_at
    BEFORE UPDATE ON public.fuel_records
    FOR EACH ROW EXECUTE FUNCTION public.update_voyage_tables_updated_at();

CREATE TRIGGER update_fuel_consumption_updated_at
    BEFORE UPDATE ON public.fuel_consumption
    FOR EACH ROW EXECUTE FUNCTION public.update_voyage_tables_updated_at();