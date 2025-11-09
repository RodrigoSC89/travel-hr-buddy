-- ============================================
-- CRIAÇÃO DE TABELAS: Smart Drills System
-- Data: 2025-01-09
-- Propósito: Criar tabelas para sistema de treinamento e simulações
-- ============================================

-- ============================================
-- 1. SMART_DRILLS
-- Simulações inteligentes de emergência
-- ============================================
CREATE TABLE IF NOT EXISTS public.smart_drills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    drill_type text NOT NULL CHECK (drill_type IN (
        'fire', 'abandon_ship', 'man_overboard', 'oil_spill', 
        'collision', 'medical', 'security', 'dp_failure', 'other'
    )),
    difficulty text CHECK (difficulty IN ('basic', 'intermediate', 'advanced', 'expert')),
    scenario jsonb, -- Cenário detalhado AI-generated
    objectives jsonb, -- Array de objetivos de aprendizado
    evaluation_criteria jsonb, -- Critérios de avaliação
    duration_minutes integer,
    participants_required integer,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'scheduled')),
    scheduled_date timestamptz,
    completion_rate numeric(5,2),
    average_score numeric(5,2),
    total_executions integer DEFAULT 0,
    ai_generated boolean DEFAULT false,
    ai_model_version text,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_smart_drills_org ON public.smart_drills(organization_id);
CREATE INDEX idx_smart_drills_vessel ON public.smart_drills(vessel_id);
CREATE INDEX idx_smart_drills_type ON public.smart_drills(drill_type);
CREATE INDEX idx_smart_drills_status ON public.smart_drills(status);
CREATE INDEX idx_smart_drills_scheduled ON public.smart_drills(scheduled_date) WHERE scheduled_date IS NOT NULL;

-- RLS Policies
ALTER TABLE public.smart_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smart_drills_select" ON public.smart_drills
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drills.organization_id
        )
    );

CREATE POLICY "smart_drills_insert" ON public.smart_drills
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drills.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "smart_drills_update" ON public.smart_drills
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drills.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "smart_drills_delete" ON public.smart_drills
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = smart_drills.organization_id
            AND role = 'admin'
        )
    );

-- ============================================
-- 2. DRILL_RESPONSES
-- Respostas dos participantes durante simulações
-- ============================================
CREATE TABLE IF NOT EXISTS public.drill_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    drill_id uuid NOT NULL REFERENCES smart_drills(id) ON DELETE CASCADE,
    crew_member_id uuid REFERENCES crew_members(id) ON DELETE SET NULL,
    execution_session_id uuid, -- Reference to execution session
    response_data jsonb NOT NULL, -- Respostas estruturadas
    decision_points jsonb, -- Decisões críticas tomadas
    time_taken_seconds integer,
    correctness_score numeric(5,2), -- 0-100
    response_quality text CHECK (response_quality IN ('poor', 'fair', 'good', 'excellent')),
    ai_feedback jsonb, -- Feedback automático da AI
    submitted_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_drill_responses_org ON public.drill_responses(organization_id);
CREATE INDEX idx_drill_responses_drill ON public.drill_responses(drill_id);
CREATE INDEX idx_drill_responses_crew ON public.drill_responses(crew_member_id);
CREATE INDEX idx_drill_responses_session ON public.drill_responses(execution_session_id);
CREATE INDEX idx_drill_responses_submitted ON public.drill_responses(submitted_at DESC);

-- RLS Policies
ALTER TABLE public.drill_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drill_responses_select" ON public.drill_responses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_responses.organization_id
        )
    );

CREATE POLICY "drill_responses_insert" ON public.drill_responses
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_responses.organization_id
        )
    );

CREATE POLICY "drill_responses_update" ON public.drill_responses
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_responses.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- 3. DRILL_EVALUATIONS
-- Avaliações finais das simulações
-- ============================================
CREATE TABLE IF NOT EXISTS public.drill_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    drill_id uuid NOT NULL REFERENCES smart_drills(id) ON DELETE CASCADE,
    execution_session_id uuid UNIQUE NOT NULL, -- ID único da execução
    overall_score numeric(5,2) NOT NULL, -- Score geral 0-100
    performance_metrics jsonb, -- Métricas detalhadas
    strengths jsonb, -- Pontos fortes identificados
    weaknesses jsonb, -- Pontos de melhoria
    recommendations jsonb, -- Recomendações AI
    participants_count integer,
    duration_actual_minutes integer,
    completion_rate numeric(5,2),
    ai_generated boolean DEFAULT true,
    evaluator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    evaluated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_drill_evaluations_org ON public.drill_evaluations(organization_id);
CREATE INDEX idx_drill_evaluations_drill ON public.drill_evaluations(drill_id);
CREATE INDEX idx_drill_evaluations_session ON public.drill_evaluations(execution_session_id);
CREATE INDEX idx_drill_evaluations_evaluated ON public.drill_evaluations(evaluated_at DESC);

-- RLS Policies
ALTER TABLE public.drill_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drill_evaluations_select" ON public.drill_evaluations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_evaluations.organization_id
        )
    );

CREATE POLICY "drill_evaluations_insert" ON public.drill_evaluations
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_evaluations.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "drill_evaluations_update" ON public.drill_evaluations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_evaluations.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- 4. DRILL_CORRECTIVE_ACTIONS
-- Ações corretivas baseadas em avaliações
-- ============================================
CREATE TABLE IF NOT EXISTS public.drill_corrective_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    drill_id uuid REFERENCES smart_drills(id) ON DELETE CASCADE,
    evaluation_id uuid REFERENCES drill_evaluations(id) ON DELETE CASCADE,
    action_title text NOT NULL,
    action_description text NOT NULL,
    priority text CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    category text CHECK (category IN ('training', 'procedure', 'equipment', 'communication', 'documentation')),
    assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
    due_date date,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    completion_notes text,
    evidence_urls jsonb, -- Links para evidências de conclusão
    ai_generated boolean DEFAULT false,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_drill_corrective_org ON public.drill_corrective_actions(organization_id);
CREATE INDEX idx_drill_corrective_drill ON public.drill_corrective_actions(drill_id);
CREATE INDEX idx_drill_corrective_evaluation ON public.drill_corrective_actions(evaluation_id);
CREATE INDEX idx_drill_corrective_status ON public.drill_corrective_actions(status);
CREATE INDEX idx_drill_corrective_assigned ON public.drill_corrective_actions(assigned_to);
CREATE INDEX idx_drill_corrective_priority ON public.drill_corrective_actions(priority);

-- RLS Policies
ALTER TABLE public.drill_corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drill_corrective_actions_select" ON public.drill_corrective_actions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_corrective_actions.organization_id
        )
    );

CREATE POLICY "drill_corrective_actions_insert" ON public.drill_corrective_actions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_corrective_actions.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "drill_corrective_actions_update" ON public.drill_corrective_actions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_corrective_actions.organization_id
        )
        AND (
            auth.uid() = assigned_to
            OR auth.uid() IN (
                SELECT user_id FROM organization_members 
                WHERE organization_id = drill_corrective_actions.organization_id
                AND role IN ('admin', 'manager')
            )
        )
    );

CREATE POLICY "drill_corrective_actions_delete" ON public.drill_corrective_actions
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = drill_corrective_actions.organization_id
            AND role = 'admin'
        )
    );

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE TRIGGER update_smart_drills_updated_at
    BEFORE UPDATE ON public.smart_drills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_evaluations_updated_at
    BEFORE UPDATE ON public.drill_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_corrective_actions_updated_at
    BEFORE UPDATE ON public.drill_corrective_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: get_drill_statistics
-- Retorna estatísticas agregadas de drills
-- ============================================
CREATE OR REPLACE FUNCTION public.get_drill_statistics(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_drills', COUNT(DISTINCT d.id),
        'active_drills', COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'active'),
        'total_executions', COALESCE(SUM(d.total_executions), 0),
        'average_score', ROUND(AVG(d.average_score), 2),
        'completion_rate', ROUND(AVG(d.completion_rate), 2),
        'drills_by_type', (
            SELECT jsonb_object_agg(drill_type, count)
            FROM (
                SELECT drill_type, COUNT(*) as count
                FROM smart_drills
                WHERE organization_id = p_organization_id
                GROUP BY drill_type
            ) type_counts
        ),
        'total_responses', (SELECT COUNT(*) FROM drill_responses WHERE organization_id = p_organization_id),
        'total_evaluations', (SELECT COUNT(*) FROM drill_evaluations WHERE organization_id = p_organization_id),
        'pending_actions', (
            SELECT COUNT(*) 
            FROM drill_corrective_actions 
            WHERE organization_id = p_organization_id 
            AND status IN ('pending', 'in_progress')
        ),
        'critical_actions', (
            SELECT COUNT(*) 
            FROM drill_corrective_actions 
            WHERE organization_id = p_organization_id 
            AND priority = 'critical'
            AND status != 'completed'
        )
    ) INTO v_stats
    FROM smart_drills d
    WHERE d.organization_id = p_organization_id;
    
    RETURN v_stats;
END;
$$;

-- ============================================
-- FUNÇÃO: update_drill_statistics
-- Atualiza estatísticas do drill após execução
-- ============================================
CREATE OR REPLACE FUNCTION public.update_drill_statistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar estatísticas do drill quando nova avaliação é inserida
    UPDATE smart_drills
    SET 
        total_executions = (
            SELECT COUNT(*) 
            FROM drill_evaluations 
            WHERE drill_id = NEW.drill_id
        ),
        average_score = (
            SELECT ROUND(AVG(overall_score), 2)
            FROM drill_evaluations 
            WHERE drill_id = NEW.drill_id
        ),
        completion_rate = (
            SELECT ROUND(AVG(completion_rate), 2)
            FROM drill_evaluations 
            WHERE drill_id = NEW.drill_id
        ),
        updated_at = now()
    WHERE id = NEW.drill_id;
    
    RETURN NEW;
END;
$$;

-- Trigger para atualizar estatísticas
CREATE TRIGGER trigger_update_drill_statistics
    AFTER INSERT ON drill_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_drill_statistics();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE smart_drills IS 'Simulações inteligentes de emergência e treinamento';
COMMENT ON TABLE drill_responses IS 'Respostas dos participantes durante as simulações';
COMMENT ON TABLE drill_evaluations IS 'Avaliações finais das execuções de simulações';
COMMENT ON TABLE drill_corrective_actions IS 'Ações corretivas baseadas nas avaliações de drills';
COMMENT ON FUNCTION get_drill_statistics IS 'Retorna estatísticas agregadas de drills para uma organização';
