-- ============================================
-- CRIAÇÃO DE TABELAS: Starfix & Terrastar Integration
-- Data: 2025-01-09
-- Propósito: Criar tabelas faltantes para módulos Starfix e Terrastar
-- ============================================

-- ============================================
-- STARFIX MODULE (Vessel Inspection & Performance)
-- ============================================

-- 1. STARFIX_VESSELS
-- Armazena informações de embarcações do Starfix
-- ============================================
CREATE TABLE IF NOT EXISTS public.starfix_vessels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
    starfix_vessel_id text UNIQUE NOT NULL, -- ID externo do Starfix
    imo_number text,
    vessel_name text NOT NULL,
    vessel_type text,
    flag_state text,
    build_year integer,
    gross_tonnage numeric(10,2),
    deadweight_tonnage numeric(10,2),
    classification_society text,
    sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
    last_sync_at timestamptz,
    sync_error text,
    raw_data jsonb, -- Dados completos do Starfix
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_starfix_vessels_org ON public.starfix_vessels(organization_id);
CREATE INDEX idx_starfix_vessels_vessel ON public.starfix_vessels(vessel_id);
CREATE INDEX idx_starfix_vessels_starfix_id ON public.starfix_vessels(starfix_vessel_id);
CREATE INDEX idx_starfix_vessels_imo ON public.starfix_vessels(imo_number);

-- RLS Policies
ALTER TABLE public.starfix_vessels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "starfix_vessels_select" ON public.starfix_vessels
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_vessels.organization_id
        )
    );

CREATE POLICY "starfix_vessels_insert" ON public.starfix_vessels
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_vessels.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "starfix_vessels_update" ON public.starfix_vessels
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_vessels.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- 2. STARFIX_INSPECTIONS
-- Armazena inspeções do Starfix
-- ============================================
CREATE TABLE IF NOT EXISTS public.starfix_inspections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    starfix_vessel_id uuid NOT NULL REFERENCES starfix_vessels(id) ON DELETE CASCADE,
    inspection_id text UNIQUE NOT NULL, -- ID externo do Starfix
    inspection_type text NOT NULL CHECK (inspection_type IN ('PSC', 'SIRE', 'CDI', 'internal', 'other')),
    inspection_date date NOT NULL,
    port_name text,
    country_code text,
    authority text,
    findings_count integer DEFAULT 0,
    deficiencies_count integer DEFAULT 0,
    detentions_count integer DEFAULT 0,
    findings jsonb, -- Array de findings
    status text CHECK (status IN ('passed', 'deficiencies', 'detained')),
    follow_up_required boolean DEFAULT false,
    sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
    last_sync_at timestamptz,
    raw_data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_starfix_inspections_org ON public.starfix_inspections(organization_id);
CREATE INDEX idx_starfix_inspections_vessel ON public.starfix_inspections(starfix_vessel_id);
CREATE INDEX idx_starfix_inspections_date ON public.starfix_inspections(inspection_date DESC);
CREATE INDEX idx_starfix_inspections_type ON public.starfix_inspections(inspection_type);

-- RLS Policies
ALTER TABLE public.starfix_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "starfix_inspections_select" ON public.starfix_inspections
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_inspections.organization_id
        )
    );

CREATE POLICY "starfix_inspections_insert" ON public.starfix_inspections
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_inspections.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "starfix_inspections_update" ON public.starfix_inspections
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_inspections.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- 3. STARFIX_PERFORMANCE_METRICS
-- Métricas de performance do Starfix
-- ============================================
CREATE TABLE IF NOT EXISTS public.starfix_performance_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    starfix_vessel_id uuid NOT NULL REFERENCES starfix_vessels(id) ON DELETE CASCADE,
    metric_date date NOT NULL,
    psc_detention_rate numeric(5,2), -- Taxa de detenção PSC
    sire_viq_score numeric(5,2), -- Score VIQ do SIRE
    deficiency_ratio numeric(5,2), -- Ratio de deficiências
    inspection_frequency integer, -- Frequência de inspeções no período
    avg_deficiencies_per_inspection numeric(5,2),
    risk_rating text CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')),
    performance_trend text CHECK (performance_trend IN ('improving', 'stable', 'declining')),
    benchmark_comparison jsonb, -- Comparação com benchmarks da indústria
    sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
    last_sync_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(starfix_vessel_id, metric_date)
);

-- Indexes
CREATE INDEX idx_starfix_performance_org ON public.starfix_performance_metrics(organization_id);
CREATE INDEX idx_starfix_performance_vessel ON public.starfix_performance_metrics(starfix_vessel_id);
CREATE INDEX idx_starfix_performance_date ON public.starfix_performance_metrics(metric_date DESC);
CREATE INDEX idx_starfix_performance_risk ON public.starfix_performance_metrics(risk_rating);

-- RLS Policies
ALTER TABLE public.starfix_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "starfix_performance_metrics_select" ON public.starfix_performance_metrics
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_performance_metrics.organization_id
        )
    );

CREATE POLICY "starfix_performance_metrics_insert" ON public.starfix_performance_metrics
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_performance_metrics.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "starfix_performance_metrics_update" ON public.starfix_performance_metrics
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = starfix_performance_metrics.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- TERRASTAR MODULE (GNSS Corrections)
-- ============================================

-- 4. TERRASTAR_CORRECTIONS
-- Armazena dados de correções GNSS do Terrastar
-- ============================================
CREATE TABLE IF NOT EXISTS public.terrastar_corrections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
    correction_type text NOT NULL CHECK (correction_type IN ('L-Band', 'IP', 'SBAS', 'PPP')),
    service_level text CHECK (service_level IN ('basic', 'professional', 'premium')),
    position_data jsonb NOT NULL, -- Lat, Lon, Altitude
    accuracy_horizontal numeric(10,3), -- Metros
    accuracy_vertical numeric(10,3), -- Metros
    satellite_count integer,
    correction_age_seconds numeric(10,2),
    signal_strength integer, -- dB
    status text CHECK (status IN ('active', 'degraded', 'unavailable')),
    quality_indicators jsonb, -- HDOP, VDOP, PDOP, etc
    recorded_at timestamptz NOT NULL,
    sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_terrastar_corrections_org ON public.terrastar_corrections(organization_id);
CREATE INDEX idx_terrastar_corrections_vessel ON public.terrastar_corrections(vessel_id);
CREATE INDEX idx_terrastar_corrections_recorded ON public.terrastar_corrections(recorded_at DESC);
CREATE INDEX idx_terrastar_corrections_type ON public.terrastar_corrections(correction_type);

-- RLS Policies
ALTER TABLE public.terrastar_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terrastar_corrections_select" ON public.terrastar_corrections
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = terrastar_corrections.organization_id
        )
    );

CREATE POLICY "terrastar_corrections_insert" ON public.terrastar_corrections
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = terrastar_corrections.organization_id
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- 5. TERRASTAR_ALERT_SUBSCRIPTIONS
-- Gerencia assinaturas de alertas Terrastar
-- ============================================
CREATE TABLE IF NOT EXISTS public.terrastar_alert_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    alert_types jsonb NOT NULL, -- Array de tipos de alerta
    thresholds jsonb, -- Thresholds customizados
    notification_channels jsonb DEFAULT '["email"]', -- email, sms, push
    is_active boolean DEFAULT true,
    last_alert_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, vessel_id, user_id)
);

-- Indexes
CREATE INDEX idx_terrastar_subscriptions_org ON public.terrastar_alert_subscriptions(organization_id);
CREATE INDEX idx_terrastar_subscriptions_vessel ON public.terrastar_alert_subscriptions(vessel_id);
CREATE INDEX idx_terrastar_subscriptions_user ON public.terrastar_alert_subscriptions(user_id);
CREATE INDEX idx_terrastar_subscriptions_active ON public.terrastar_alert_subscriptions(is_active);

-- RLS Policies
ALTER TABLE public.terrastar_alert_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terrastar_alert_subscriptions_select" ON public.terrastar_alert_subscriptions
    FOR SELECT USING (
        auth.uid() = user_id
        OR
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = terrastar_alert_subscriptions.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "terrastar_alert_subscriptions_insert" ON public.terrastar_alert_subscriptions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = terrastar_alert_subscriptions.organization_id
        )
    );

CREATE POLICY "terrastar_alert_subscriptions_update" ON public.terrastar_alert_subscriptions
    FOR UPDATE USING (
        auth.uid() = user_id
        OR
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = terrastar_alert_subscriptions.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "terrastar_alert_subscriptions_delete" ON public.terrastar_alert_subscriptions
    FOR DELETE USING (
        auth.uid() = user_id
        OR
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = terrastar_alert_subscriptions.organization_id
            AND role = 'admin'
        )
    );

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE TRIGGER update_starfix_vessels_updated_at
    BEFORE UPDATE ON public.starfix_vessels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starfix_inspections_updated_at
    BEFORE UPDATE ON public.starfix_inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starfix_performance_metrics_updated_at
    BEFORE UPDATE ON public.starfix_performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terrastar_alert_subscriptions_updated_at
    BEFORE UPDATE ON public.terrastar_alert_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para calcular risk rating baseado em métricas
CREATE OR REPLACE FUNCTION calculate_starfix_risk_rating(
    p_vessel_id uuid,
    p_period_days integer DEFAULT 365
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_detention_rate numeric;
    v_deficiency_ratio numeric;
    v_risk_rating text;
BEGIN
    -- Calcular métricas do período
    SELECT 
        COALESCE(AVG(psc_detention_rate), 0),
        COALESCE(AVG(deficiency_ratio), 0)
    INTO v_detention_rate, v_deficiency_ratio
    FROM starfix_performance_metrics
    WHERE starfix_vessel_id = p_vessel_id
    AND metric_date >= CURRENT_DATE - p_period_days;
    
    -- Determinar risk rating
    IF v_detention_rate > 5 OR v_deficiency_ratio > 3 THEN
        v_risk_rating := 'critical';
    ELSIF v_detention_rate > 2 OR v_deficiency_ratio > 2 THEN
        v_risk_rating := 'high';
    ELSIF v_detention_rate > 0.5 OR v_deficiency_ratio > 1 THEN
        v_risk_rating := 'medium';
    ELSE
        v_risk_rating := 'low';
    END IF;
    
    RETURN v_risk_rating;
END;
$$;

-- Função para verificar qualidade de sinal Terrastar
CREATE OR REPLACE FUNCTION check_terrastar_signal_quality(
    p_vessel_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_latest_correction record;
    v_quality_report jsonb;
BEGIN
    -- Buscar correção mais recente
    SELECT * INTO v_latest_correction
    FROM terrastar_corrections
    WHERE vessel_id = p_vessel_id
    ORDER BY recorded_at DESC
    LIMIT 1;
    
    IF v_latest_correction IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'no_data',
            'message', 'No Terrastar data available'
        );
    END IF;
    
    -- Construir relatório de qualidade
    v_quality_report := jsonb_build_object(
        'status', v_latest_correction.status,
        'accuracy_horizontal', v_latest_correction.accuracy_horizontal,
        'accuracy_vertical', v_latest_correction.accuracy_vertical,
        'satellite_count', v_latest_correction.satellite_count,
        'signal_strength', v_latest_correction.signal_strength,
        'correction_age', v_latest_correction.correction_age_seconds,
        'last_update', v_latest_correction.recorded_at,
        'quality', CASE
            WHEN v_latest_correction.accuracy_horizontal < 0.1 AND 
                 v_latest_correction.satellite_count >= 8 THEN 'excellent'
            WHEN v_latest_correction.accuracy_horizontal < 0.5 AND 
                 v_latest_correction.satellite_count >= 6 THEN 'good'
            WHEN v_latest_correction.accuracy_horizontal < 1.0 THEN 'fair'
            ELSE 'poor'
        END
    );
    
    RETURN v_quality_report;
END;
$$;
