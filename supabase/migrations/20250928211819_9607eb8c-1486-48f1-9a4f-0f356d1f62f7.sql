-- Criar tabelas para as funcionalidades avançadas do dossiê

-- Tabela para insights de IA dos tripulantes
CREATE TABLE IF NOT EXISTS public.crew_ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL DEFAULT 'comprehensive',
  insights_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0.0,
  generated_by TEXT NOT NULL DEFAULT 'ai_system',
  recommendations JSONB DEFAULT '[]',
  risk_factors JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  improvement_areas JSONB DEFAULT '[]',
  next_actions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para perfis de gamificação
CREATE TABLE IF NOT EXISTS public.crew_gamification_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  total_experience_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges_earned JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  skill_progression JSONB DEFAULT '{}',
  streaks JSONB DEFAULT '{}',
  leaderboard_rank INTEGER DEFAULT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(crew_member_id)
);

-- Tabela para metas de desenvolvimento
CREATE TABLE IF NOT EXISTS public.crew_development_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'certification', 'skill', 'career', 'safety', 'leadership'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  target_value NUMERIC DEFAULT 100,
  current_progress NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'percentage',
  deadline DATE,
  milestones JSONB DEFAULT '[]',
  progress_history JSONB DEFAULT '[]',
  reward_points INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para comunicação integrada
CREATE TABLE IF NOT EXISTS public.crew_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.crew_members(id),
  recipient_id UUID REFERENCES public.crew_members(id),
  conversation_id UUID,
  message_type TEXT NOT NULL, -- 'text', 'voice', 'file', 'alert'
  content TEXT,
  file_url TEXT,
  voice_duration INTEGER, -- em segundos
  is_read BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para centro de comando operacional
CREATE TABLE IF NOT EXISTS public.operational_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  alert_type TEXT NOT NULL, -- 'certification_expiry', 'performance_issue', 'safety_concern', 'compliance'
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
  affected_crew_member_id UUID REFERENCES public.crew_members(id),
  affected_vessel_id UUID REFERENCES public.vessels(id),
  source_data JSONB DEFAULT '{}',
  action_required TEXT,
  assigned_to UUID REFERENCES public.crew_members(id),
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.crew_members(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para métricas operacionais em tempo real
CREATE TABLE IF NOT EXISTS public.operational_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  metric_type TEXT NOT NULL, -- 'crew_availability', 'certification_compliance', 'performance_average'
  metric_name TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC,
  unit TEXT,
  trend TEXT, -- 'increasing', 'decreasing', 'stable'
  last_calculation TIMESTAMP WITH TIME ZONE DEFAULT now(),
  historical_data JSONB DEFAULT '[]',
  alerts_threshold JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitação de RLS
ALTER TABLE public.crew_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_development_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para crew_ai_insights
CREATE POLICY "HR can manage all AI insights" ON public.crew_ai_insights
  FOR ALL USING (get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role]));

CREATE POLICY "Crew can view their own AI insights" ON public.crew_ai_insights
  FOR SELECT USING (crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  ));

-- Políticas RLS para crew_gamification_profiles
CREATE POLICY "HR can manage all gamification profiles" ON public.crew_gamification_profiles
  FOR ALL USING (get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role]));

CREATE POLICY "Crew can view their own gamification profile" ON public.crew_gamification_profiles
  FOR SELECT USING (crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Crew can update their own gamification profile" ON public.crew_gamification_profiles
  FOR UPDATE USING (crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  ));

-- Políticas RLS para crew_development_goals
CREATE POLICY "HR can manage all development goals" ON public.crew_development_goals
  FOR ALL USING (get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role]));

CREATE POLICY "Crew can manage their own goals" ON public.crew_development_goals
  FOR ALL USING (crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  ));

-- Políticas RLS para crew_communications
CREATE POLICY "Users can view their communications" ON public.crew_communications
  FOR SELECT USING (
    sender_id IN (SELECT id FROM public.crew_members WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM public.crew_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send communications" ON public.crew_communications
  FOR INSERT WITH CHECK (sender_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  ));

-- Políticas RLS para operational_alerts
CREATE POLICY "Organization users can view alerts" ON public.operational_alerts
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "HR can manage alerts" ON public.operational_alerts
  FOR ALL USING (get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role]));

-- Políticas RLS para operational_metrics
CREATE POLICY "Organization users can view metrics" ON public.operational_metrics
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crew_ai_insights_updated_at
  BEFORE UPDATE ON public.crew_ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crew_gamification_profiles_updated_at
  BEFORE UPDATE ON public.crew_gamification_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crew_development_goals_updated_at
  BEFORE UPDATE ON public.crew_development_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operational_alerts_updated_at
  BEFORE UPDATE ON public.operational_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operational_metrics_updated_at
  BEFORE UPDATE ON public.operational_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();