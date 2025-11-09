-- ============================================
-- CRIAÇÃO DE TABELAS: AI Training System
-- Data: 2025-01-09
-- Propósito: Criar tabelas para sistema de treinamento com IA
-- ============================================

-- ============================================
-- 1. AI_TRAINING_SESSIONS
-- Sessões de treinamento com IA
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_training_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    crew_member_id uuid REFERENCES crew_members(id) ON DELETE SET NULL,
    session_type text NOT NULL CHECK (session_type IN (
        'interactive_tutorial', 'quiz', 'simulation', 'assessment', 
        'adaptive_learning', 'microlearning', 'scenario_based'
    )),
    topic text NOT NULL,
    difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    learning_objectives jsonb, -- Array de objetivos
    content jsonb NOT NULL, -- Conteúdo da sessão
    ai_model_used text, -- Modelo AI utilizado (GPT-4, etc)
    personalization_data jsonb, -- Dados de personalização
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    duration_minutes integer,
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'paused')),
    final_score numeric(5,2), -- 0-100
    performance_metrics jsonb, -- Métricas detalhadas
    ai_feedback jsonb, -- Feedback da IA
    next_recommended_topic text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_training_sessions_org ON public.ai_training_sessions(organization_id);
CREATE INDEX idx_ai_training_sessions_crew ON public.ai_training_sessions(crew_member_id);
CREATE INDEX idx_ai_training_sessions_type ON public.ai_training_sessions(session_type);
CREATE INDEX idx_ai_training_sessions_status ON public.ai_training_sessions(status);
CREATE INDEX idx_ai_training_sessions_started ON public.ai_training_sessions(started_at DESC);

-- RLS Policies
ALTER TABLE public.ai_training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_training_sessions_select" ON public.ai_training_sessions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = ai_training_sessions.organization_id
        )
    );

CREATE POLICY "ai_training_sessions_insert" ON public.ai_training_sessions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = ai_training_sessions.organization_id
        )
    );

CREATE POLICY "ai_training_sessions_update" ON public.ai_training_sessions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = ai_training_sessions.organization_id
        )
    );

-- ============================================
-- 2. AI_TRAINING_HISTORY
-- Histórico de interações de treinamento
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_training_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id uuid REFERENCES ai_training_sessions(id) ON DELETE CASCADE,
    crew_member_id uuid REFERENCES crew_members(id) ON DELETE SET NULL,
    interaction_type text NOT NULL CHECK (interaction_type IN (
        'question_answered', 'content_viewed', 'quiz_completed', 
        'feedback_received', 'milestone_reached', 'hint_requested',
        'assessment_taken', 'resource_accessed'
    )),
    interaction_data jsonb NOT NULL, -- Dados da interação
    ai_response jsonb, -- Resposta da IA
    correctness boolean, -- Se aplicável
    time_spent_seconds integer,
    difficulty_at_time text,
    performance_score numeric(5,2),
    occurred_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_training_history_org ON public.ai_training_history(organization_id);
CREATE INDEX idx_ai_training_history_session ON public.ai_training_history(session_id);
CREATE INDEX idx_ai_training_history_crew ON public.ai_training_history(crew_member_id);
CREATE INDEX idx_ai_training_history_type ON public.ai_training_history(interaction_type);
CREATE INDEX idx_ai_training_history_occurred ON public.ai_training_history(occurred_at DESC);

-- RLS Policies
ALTER TABLE public.ai_training_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_training_history_select" ON public.ai_training_history
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = ai_training_history.organization_id
        )
    );

CREATE POLICY "ai_training_history_insert" ON public.ai_training_history
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = ai_training_history.organization_id
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- 3. TRAINING_LEARNING_PATHS
-- Caminhos de aprendizado personalizados
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_learning_paths (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    crew_member_id uuid REFERENCES crew_members(id) ON DELETE CASCADE,
    path_name text NOT NULL,
    path_description text,
    target_role text, -- Cargo alvo (e.g., 'DPO', 'Captain')
    competency_level_target text CHECK (competency_level_target IN ('basic', 'intermediate', 'advanced', 'expert')),
    learning_modules jsonb NOT NULL, -- Array de módulos ordenados
    prerequisites jsonb, -- Pré-requisitos
    estimated_duration_hours integer,
    current_module_index integer DEFAULT 0,
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    modules_completed jsonb DEFAULT '[]',
    skills_acquired jsonb DEFAULT '[]',
    assessment_scores jsonb DEFAULT '{}',
    ai_recommended boolean DEFAULT false,
    customization_notes text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    started_at timestamptz,
    completed_at timestamptz,
    last_activity_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, crew_member_id, path_name)
);

-- Indexes
CREATE INDEX idx_training_learning_paths_org ON public.training_learning_paths(organization_id);
CREATE INDEX idx_training_learning_paths_crew ON public.training_learning_paths(crew_member_id);
CREATE INDEX idx_training_learning_paths_status ON public.training_learning_paths(status);
CREATE INDEX idx_training_learning_paths_progress ON public.training_learning_paths(progress_percentage);

-- RLS Policies
ALTER TABLE public.training_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_learning_paths_select" ON public.training_learning_paths
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = training_learning_paths.organization_id
        )
    );

CREATE POLICY "training_learning_paths_insert" ON public.training_learning_paths
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = training_learning_paths.organization_id
        )
    );

CREATE POLICY "training_learning_paths_update" ON public.training_learning_paths
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = training_learning_paths.organization_id
        )
    );

CREATE POLICY "training_learning_paths_delete" ON public.training_learning_paths
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = training_learning_paths.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE TRIGGER update_ai_training_sessions_updated_at
    BEFORE UPDATE ON public.ai_training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_learning_paths_updated_at
    BEFORE UPDATE ON public.training_learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: get_training_stats
-- Retorna estatísticas de treinamento
-- ============================================
CREATE OR REPLACE FUNCTION public.get_training_stats(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_sessions', COUNT(DISTINCT s.id),
        'active_sessions', COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'in_progress'),
        'completed_sessions', COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed'),
        'average_score', ROUND(AVG(s.final_score) FILTER (WHERE s.final_score IS NOT NULL), 2),
        'average_duration_minutes', ROUND(AVG(s.duration_minutes) FILTER (WHERE s.duration_minutes IS NOT NULL), 0),
        'total_crew_trained', COUNT(DISTINCT s.crew_member_id),
        'sessions_by_type', (
            SELECT jsonb_object_agg(session_type, count)
            FROM (
                SELECT session_type, COUNT(*) as count
                FROM ai_training_sessions
                WHERE organization_id = p_organization_id
                GROUP BY session_type
            ) type_counts
        ),
        'total_learning_paths', (
            SELECT COUNT(*) 
            FROM training_learning_paths 
            WHERE organization_id = p_organization_id
        ),
        'active_learning_paths', (
            SELECT COUNT(*) 
            FROM training_learning_paths 
            WHERE organization_id = p_organization_id 
            AND status = 'active'
        ),
        'completed_learning_paths', (
            SELECT COUNT(*) 
            FROM training_learning_paths 
            WHERE organization_id = p_organization_id 
            AND status = 'completed'
        ),
        'average_path_completion', (
            SELECT ROUND(AVG(progress_percentage), 2)
            FROM training_learning_paths
            WHERE organization_id = p_organization_id
            AND status = 'active'
        ),
        'total_interactions', (
            SELECT COUNT(*) 
            FROM ai_training_history 
            WHERE organization_id = p_organization_id
        ),
        'interactions_last_7_days', (
            SELECT COUNT(*) 
            FROM ai_training_history 
            WHERE organization_id = p_organization_id
            AND occurred_at >= NOW() - INTERVAL '7 days'
        )
    ) INTO v_stats
    FROM ai_training_sessions s
    WHERE s.organization_id = p_organization_id;
    
    RETURN v_stats;
END;
$$;

-- ============================================
-- FUNÇÃO: update_learning_path_progress
-- Atualiza progresso do caminho de aprendizado
-- ============================================
CREATE OR REPLACE FUNCTION public.update_learning_path_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_path_id uuid;
    v_total_modules integer;
    v_completed_count integer;
BEGIN
    -- Se a sessão foi completada, atualizar o learning path correspondente
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Buscar learning path ativo do crew member
        SELECT id INTO v_path_id
        FROM training_learning_paths
        WHERE crew_member_id = NEW.crew_member_id
        AND organization_id = NEW.organization_id
        AND status = 'active'
        ORDER BY last_activity_at DESC NULLS LAST
        LIMIT 1;
        
        IF v_path_id IS NOT NULL THEN
            -- Atualizar progresso
            UPDATE training_learning_paths
            SET 
                modules_completed = COALESCE(modules_completed, '[]'::jsonb) || jsonb_build_object(
                    'session_id', NEW.id,
                    'topic', NEW.topic,
                    'completed_at', NEW.completed_at,
                    'score', NEW.final_score
                ),
                last_activity_at = NEW.completed_at,
                updated_at = now()
            WHERE id = v_path_id;
            
            -- Calcular e atualizar percentual de progresso
            SELECT 
                jsonb_array_length(learning_modules),
                jsonb_array_length(modules_completed)
            INTO v_total_modules, v_completed_count
            FROM training_learning_paths
            WHERE id = v_path_id;
            
            IF v_total_modules > 0 THEN
                UPDATE training_learning_paths
                SET progress_percentage = LEAST(100, ROUND((v_completed_count::numeric / v_total_modules) * 100, 0)::integer)
                WHERE id = v_path_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para atualizar progresso de learning paths
CREATE TRIGGER trigger_update_learning_path_progress
    AFTER UPDATE ON ai_training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_learning_path_progress();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE ai_training_sessions IS 'Sessões de treinamento com inteligência artificial';
COMMENT ON TABLE ai_training_history IS 'Histórico detalhado de interações durante treinamentos';
COMMENT ON TABLE training_learning_paths IS 'Caminhos de aprendizado personalizados para crew members';
COMMENT ON FUNCTION get_training_stats IS 'Retorna estatísticas agregadas de treinamento para uma organização';
COMMENT ON FUNCTION update_learning_path_progress IS 'Atualiza automaticamente o progresso dos learning paths quando sessões são completadas';
