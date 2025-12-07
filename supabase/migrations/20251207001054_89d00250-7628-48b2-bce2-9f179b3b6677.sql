-- ============================================
-- MENTOR DP - Dynamic Positioning Mentor Module
-- Complete AI-powered mentoring system for DP
-- ============================================

-- Table for DP Mentor sessions and interactions
CREATE TABLE IF NOT EXISTS public.dp_mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  session_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'academy', 'simulation', 'quiz', 'proficiency'
  topic TEXT,
  difficulty_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
  messages JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  performance_score NUMERIC(5,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for DP Academy progress tracking
CREATE TABLE IF NOT EXISTS public.dp_academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'fundamentals', 'sensors', 'thrusters', 'redundancy', 'operations', 'emergency'
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  progress_percent NUMERIC(5,2) DEFAULT 0,
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  average_score NUMERIC(5,2) DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_lesson_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for DP Simulations
CREATE TABLE IF NOT EXISTS public.dp_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  scenario_name TEXT NOT NULL,
  scenario_type TEXT NOT NULL, -- 'sensor_failure', 'thruster_failure', 'power_loss', 'weather', 'multi_failure'
  difficulty TEXT DEFAULT 'medium',
  initial_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  failure_events JSONB DEFAULT '[]'::jsonb,
  user_decisions JSONB DEFAULT '[]'::jsonb,
  ai_evaluation JSONB,
  performance_score NUMERIC(5,2),
  time_to_resolve_seconds INTEGER,
  passed BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Table for DP Quizzes and Assessments
CREATE TABLE IF NOT EXISTS public.dp_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  quiz_type TEXT NOT NULL, -- 'knowledge', 'troubleshooting', 'scenario', 'certification_prep'
  topic TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  correct_count INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  score NUMERIC(5,2),
  time_limit_minutes INTEGER,
  time_spent_minutes INTEGER,
  passed BOOLEAN,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Table for Intelligent Logbook
CREATE TABLE IF NOT EXISTS public.dp_logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  entry_type TEXT NOT NULL, -- 'question', 'learning', 'simulation', 'insight', 'note'
  title TEXT NOT NULL,
  content TEXT,
  ai_response TEXT,
  tags TEXT[] DEFAULT '{}',
  related_topics TEXT[] DEFAULT '{}',
  importance TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  bookmarked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for Q&A Repository
CREATE TABLE IF NOT EXISTS public.dp_qa_repository (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  regulatory_references TEXT[] DEFAULT '{}',
  related_documents TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'intermediate',
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for Proficiency Assessment
CREATE TABLE IF NOT EXISTS public.dp_proficiency_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  assessment_type TEXT NOT NULL, -- 'initial', 'progress', 'certification', 'annual_review'
  overall_level TEXT NOT NULL, -- 'novice', 'beginner', 'intermediate', 'advanced', 'expert'
  category_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  strengths TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  recommended_training JSONB DEFAULT '[]'::jsonb,
  next_assessment_date DATE,
  assessor_notes TEXT,
  ai_evaluation JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.dp_mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dp_academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dp_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dp_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dp_logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dp_qa_repository ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dp_proficiency_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dp_mentor_sessions
CREATE POLICY "Users can view own sessions" ON public.dp_mentor_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.dp_mentor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.dp_mentor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for dp_academy_progress
CREATE POLICY "Users can view own progress" ON public.dp_academy_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.dp_academy_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.dp_academy_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for dp_simulations
CREATE POLICY "Users can view own simulations" ON public.dp_simulations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulations" ON public.dp_simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulations" ON public.dp_simulations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for dp_quizzes
CREATE POLICY "Users can view own quizzes" ON public.dp_quizzes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quizzes" ON public.dp_quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quizzes" ON public.dp_quizzes
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for dp_logbook_entries
CREATE POLICY "Users can view own logbook entries" ON public.dp_logbook_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logbook entries" ON public.dp_logbook_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logbook entries" ON public.dp_logbook_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logbook entries" ON public.dp_logbook_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dp_qa_repository (shared across organization)
CREATE POLICY "Users can view Q&A in their org" ON public.dp_qa_repository
  FOR SELECT USING (
    organization_id IS NULL OR 
    public.user_belongs_to_organization(organization_id)
  );
CREATE POLICY "Users can insert Q&A" ON public.dp_qa_repository
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies for dp_proficiency_assessments
CREATE POLICY "Users can view own assessments" ON public.dp_proficiency_assessments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.dp_proficiency_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dp_mentor_sessions_user ON public.dp_mentor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dp_academy_progress_user ON public.dp_academy_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_dp_simulations_user ON public.dp_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_dp_quizzes_user ON public.dp_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_dp_logbook_entries_user ON public.dp_logbook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_dp_qa_repository_category ON public.dp_qa_repository(category);

-- Trigger for updated_at
CREATE TRIGGER update_dp_mentor_sessions_updated_at
  BEFORE UPDATE ON public.dp_mentor_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_dp_academy_progress_updated_at
  BEFORE UPDATE ON public.dp_academy_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_dp_logbook_entries_updated_at
  BEFORE UPDATE ON public.dp_logbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_dp_qa_repository_updated_at
  BEFORE UPDATE ON public.dp_qa_repository
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();