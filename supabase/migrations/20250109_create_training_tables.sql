-- ============================================
-- CRIAÇÃO DE TABELAS: Training AI & Drill System
-- Data: 2025-01-09
-- Propósito: Criar tabelas faltantes para módulo de treinamento
-- ============================================

-- ============================================
-- 1. NONCOMPLIANCE_EXPLANATIONS
-- Armazena explicações de não conformidades
-- ============================================
CREATE TABLE IF NOT EXISTS public.noncompliance_explanations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    noncompliance_id uuid NOT NULL,
    crew_member_id uuid REFERENCES crew_members(id) ON DELETE SET NULL,
    explanation text NOT NULL,
    ai_analysis jsonb,
    severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_noncompliance_explanations_org ON public.noncompliance_explanations(organization_id);
CREATE INDEX idx_noncompliance_explanations_crew ON public.noncompliance_explanations(crew_member_id);
CREATE INDEX idx_noncompliance_explanations_status ON public.noncompliance_explanations(status);

-- RLS Policies
ALTER TABLE public.noncompliance_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "noncompliance_explanations_select" ON public.noncompliance_explanations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = noncompliance_explanations.organization_id
        )
    );

CREATE POLICY "noncompliance_explanations_insert" ON public.noncompliance_explanations
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = noncompliance_explanations.organization_id
        )
    );

CREATE POLICY "noncompliance_explanations_update" ON public.noncompliance_explanations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = noncompliance_explanations.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- 2. CREW_TRAINING_QUIZZES
-- Armazena questionários de treinamento
-- ============================================
CREATE TABLE IF NOT EXISTS public.crew_training_quizzes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    category text,
    difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    questions jsonb NOT NULL, -- Array de perguntas com opções
    passing_score integer DEFAULT 70,
    time_limit_minutes integer,
    ai_generated boolean DEFAULT false,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_crew_training_quizzes_org ON public.crew_training_quizzes(organization_id);
CREATE INDEX idx_crew_training_quizzes_category ON public.crew_training_quizzes(category);

-- RLS Policies
ALTER TABLE public.crew_training_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_training_quizzes_select" ON public.crew_training_quizzes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_training_quizzes.organization_id
        )
    );

CREATE POLICY "crew_training_quizzes_insert" ON public.crew_training_quizzes
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_training_quizzes.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "crew_training_quizzes_update" ON public.crew_training_quizzes
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_training_quizzes.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- 3. CREW_TRAINING_RESULTS
-- Armazena resultados de quizzes
-- ============================================
CREATE TABLE IF NOT EXISTS public.crew_training_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quiz_id uuid NOT NULL REFERENCES crew_training_quizzes(id) ON DELETE CASCADE,
    crew_member_id uuid NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    answers jsonb NOT NULL, -- Respostas do crew member
    score integer NOT NULL,
    passed boolean NOT NULL,
    time_taken_minutes integer,
    completed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_crew_training_results_org ON public.crew_training_results(organization_id);
CREATE INDEX idx_crew_training_results_quiz ON public.crew_training_results(quiz_id);
CREATE INDEX idx_crew_training_results_crew ON public.crew_training_results(crew_member_id);

-- RLS Policies
ALTER TABLE public.crew_training_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_training_results_select" ON public.crew_training_results
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_training_results.organization_id
        )
    );

CREATE POLICY "crew_training_results_insert" ON public.crew_training_results
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_training_results.organization_id
        )
    );

-- ============================================
-- 4. CREW_LEARNING_PROGRESS
-- Rastreia progresso de aprendizado
-- ============================================
CREATE TABLE IF NOT EXISTS public.crew_learning_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    crew_member_id uuid NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    topic text NOT NULL,
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_modules jsonb DEFAULT '[]',
    current_level text CHECK (current_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    total_time_minutes integer DEFAULT 0,
    last_activity_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, crew_member_id, topic)
);

-- Indexes
CREATE INDEX idx_crew_learning_progress_org ON public.crew_learning_progress(organization_id);
CREATE INDEX idx_crew_learning_progress_crew ON public.crew_learning_progress(crew_member_id);

-- RLS Policies
ALTER TABLE public.crew_learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_learning_progress_select" ON public.crew_learning_progress
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_learning_progress.organization_id
        )
    );

CREATE POLICY "crew_learning_progress_insert" ON public.crew_learning_progress
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_learning_progress.organization_id
        )
    );

CREATE POLICY "crew_learning_progress_update" ON public.crew_learning_progress
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = crew_learning_progress.organization_id
        )
    );

-- ============================================
-- 5. INCIDENT_DRILLS
-- Armazena simulações de incidentes
-- ============================================
CREATE TABLE IF NOT EXISTS public.incident_drills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    drill_type text NOT NULL CHECK (drill_type IN ('fire', 'abandon_ship', 'man_overboard', 'oil_spill', 'collision', 'medical', 'security', 'other')),
    scenario jsonb, -- Detalhes do cenário AI-generated
    difficulty text CHECK (difficulty IN ('basic', 'intermediate', 'advanced', 'expert')),
    expected_duration_minutes integer,
    objectives jsonb, -- Array de objetivos do drill
    evaluation_criteria jsonb, -- Critérios de avaliação
    scheduled_date timestamptz,
    status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    ai_generated boolean DEFAULT false,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_incident_drills_org ON public.incident_drills(organization_id);
CREATE INDEX idx_incident_drills_vessel ON public.incident_drills(vessel_id);
CREATE INDEX idx_incident_drills_type ON public.incident_drills(drill_type);
CREATE INDEX idx_incident_drills_status ON public.incident_drills(status);

-- RLS Policies
ALTER TABLE public.incident_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incident_drills_select" ON public.incident_drills
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = incident_drills.organization_id
        )
    );

CREATE POLICY "incident_drills_insert" ON public.incident_drills
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = incident_drills.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "incident_drills_update" ON public.incident_drills
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = incident_drills.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- 6. SMART_DRILL_SCENARIOS
-- Cenários AI-generated para drills
-- ============================================
CREATE TABLE IF NOT EXISTS public.smart_drill_scenarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    drill_type text NOT NULL,
    scenario_data jsonb NOT NULL,
    difficulty text CHECK (difficulty IN ('basic', 'intermediate', 'advanced', 'expert')),
    context_factors jsonb, -- Fatores contextuais (weather, time, vessel state)
    decision_points jsonb, -- Pontos de decisão críticos
    expected_actions jsonb, -- Ações esperadas
    ai_model_version text,
    usage_count integer DEFAULT 0,
    avg_score numeric(5,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_smart_drill_scenarios_org ON public.smart_drill_scenarios(organization_id);
CREATE INDEX idx_smart_drill_scenarios_type ON public.smart_drill_scenarios(drill_type);

-- RLS Policies
ALTER TABLE public.smart_drill_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smart_drill_scenarios_select" ON public.smart_drill_scenarios
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drill_scenarios.organization_id
        )
    );

CREATE POLICY "smart_drill_scenarios_insert" ON public.smart_drill_scenarios
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drill_scenarios.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- 7. SMART_DRILL_EXECUTIONS
-- Execuções de drills com avaliação AI
-- ============================================
CREATE TABLE IF NOT EXISTS public.smart_drill_executions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    drill_id uuid NOT NULL REFERENCES incident_drills(id) ON DELETE CASCADE,
    scenario_id uuid REFERENCES smart_drill_scenarios(id) ON DELETE SET NULL,
    participants jsonb NOT NULL, -- Array de crew members participantes
    execution_data jsonb, -- Dados coletados durante execução
    ai_evaluation jsonb, -- Avaliação AI do desempenho
    overall_score numeric(5,2),
    strengths jsonb, -- Pontos fortes identificados
    weaknesses jsonb, -- Pontos de melhoria
    recommendations jsonb, -- Recomendações AI
    executed_at timestamptz NOT NULL,
    evaluated_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_smart_drill_executions_org ON public.smart_drill_executions(organization_id);
CREATE INDEX idx_smart_drill_executions_drill ON public.smart_drill_executions(drill_id);
CREATE INDEX idx_smart_drill_executions_scenario ON public.smart_drill_executions(scenario_id);

-- RLS Policies
ALTER TABLE public.smart_drill_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smart_drill_executions_select" ON public.smart_drill_executions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drill_executions.organization_id
        )
    );

CREATE POLICY "smart_drill_executions_insert" ON public.smart_drill_executions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drill_executions.organization_id
        )
    );

CREATE POLICY "smart_drill_executions_update" ON public.smart_drill_executions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drill_executions.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE TRIGGER update_noncompliance_explanations_updated_at
    BEFORE UPDATE ON public.noncompliance_explanations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_training_quizzes_updated_at
    BEFORE UPDATE ON public.crew_training_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_learning_progress_updated_at
    BEFORE UPDATE ON public.crew_learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_drills_updated_at
    BEFORE UPDATE ON public.incident_drills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_drill_scenarios_updated_at
    BEFORE UPDATE ON public.smart_drill_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
