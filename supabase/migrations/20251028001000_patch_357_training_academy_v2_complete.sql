-- PATCH 357: Training Academy v2 - Complete Management System
-- Complete training management with course catalog, progress tracking, and HR dashboard

-- Note: Core tables already exist from PATCH 325, this adds management and UI support

-- ============================================
-- 1. Course Catalog Views and Management
-- ============================================

-- Create view for course catalog with aggregated data
CREATE OR REPLACE VIEW public.course_catalog_view AS
SELECT 
  c.id,
  c.title,
  c.description,
  c.category,
  c.difficulty_level,
  c.estimated_duration_hours,
  c.is_published,
  c.created_at,
  COUNT(DISTINCT ce.user_id) as enrolled_count,
  COUNT(DISTINCT CASE WHEN ce.enrollment_status = 'completed' THEN ce.user_id END) as completed_count,
  AVG(ce.average_score) as avg_course_score,
  COUNT(DISTINCT l.id) as lesson_count,
  json_build_object(
    'total_enrollments', COUNT(DISTINCT ce.user_id),
    'completion_rate', 
      CASE WHEN COUNT(DISTINCT ce.user_id) > 0 
      THEN ROUND((COUNT(DISTINCT CASE WHEN ce.enrollment_status = 'completed' THEN ce.user_id END)::numeric / COUNT(DISTINCT ce.user_id)) * 100, 2)
      ELSE 0 END,
    'average_progress', ROUND(AVG(ce.overall_progress_percentage), 2)
  ) as statistics
FROM public.courses c
LEFT JOIN public.course_enrollments ce ON c.id = ce.course_id
LEFT JOIN public.lessons l ON c.id = l.course_id
GROUP BY c.id, c.title, c.description, c.category, c.difficulty_level, 
         c.estimated_duration_hours, c.is_published, c.created_at;

-- ============================================
-- 2. Training Paths/Learning Tracks
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Path details
  path_name TEXT NOT NULL,
  description TEXT,
  path_type TEXT CHECK (path_type IN ('onboarding', 'role_specific', 'compliance', 'professional_development')),
  
  -- Prerequisites
  required_role TEXT,
  department TEXT,
  min_experience_years INTEGER,
  
  -- Structure
  course_sequence JSONB NOT NULL DEFAULT '[]', -- [{course_id, order, is_required}]
  estimated_total_hours NUMERIC,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Metadata
  icon_name TEXT,
  color_code TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_training_paths_active ON public.training_paths(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_training_paths_type ON public.training_paths(path_type);

-- ============================================
-- 3. User Training Path Progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_training_path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_path_id UUID NOT NULL REFERENCES public.training_paths(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_course_index INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  overall_progress_percentage NUMERIC DEFAULT 0 CHECK (overall_progress_percentage BETWEEN 0 AND 100),
  
  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_completion_date DATE,
  
  -- Performance
  average_score NUMERIC,
  total_time_spent_minutes INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, training_path_id)
);

CREATE INDEX IF NOT EXISTS idx_user_training_path_user ON public.user_training_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_training_path_status ON public.user_training_path_progress(status);

-- ============================================
-- 4. HR Dashboard KPIs
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_hr_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  kpi_date DATE NOT NULL,
  kpi_period TEXT NOT NULL CHECK (kpi_period IN ('daily', 'weekly', 'monthly', 'quarterly')),
  
  -- Enrollment metrics
  total_enrollments INTEGER DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  active_learners INTEGER DEFAULT 0,
  
  -- Completion metrics
  courses_completed INTEGER DEFAULT 0,
  certifications_issued INTEGER DEFAULT 0,
  completion_rate NUMERIC,
  avg_completion_time_days NUMERIC,
  
  -- Performance metrics
  avg_course_score NUMERIC,
  avg_quiz_score NUMERIC,
  pass_rate NUMERIC,
  
  -- Engagement metrics
  avg_time_spent_minutes NUMERIC,
  total_lessons_completed INTEGER DEFAULT 0,
  total_materials_accessed INTEGER DEFAULT 0,
  
  -- By category
  enrollments_by_category JSONB DEFAULT '{}',
  completions_by_category JSONB DEFAULT '{}',
  
  -- Top performers
  top_learners JSONB DEFAULT '[]', -- [{user_id, courses_completed, avg_score}]
  popular_courses JSONB DEFAULT '[]', -- [{course_id, enrollment_count}]
  
  -- Intervention needed
  at_risk_learners INTEGER DEFAULT 0, -- Not progressing
  overdue_completions INTEGER DEFAULT 0,
  low_performers INTEGER DEFAULT 0, -- Below passing scores
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(kpi_date, kpi_period)
);

CREATE INDEX IF NOT EXISTS idx_training_kpis_date ON public.training_hr_kpis(kpi_date DESC);
CREATE INDEX IF NOT EXISTS idx_training_kpis_period ON public.training_hr_kpis(kpi_period);

-- ============================================
-- 5. Training Feedback/Reviews
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  -- Ratings
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  content_quality_rating INTEGER CHECK (content_quality_rating BETWEEN 1 AND 5),
  instructor_rating INTEGER CHECK (instructor_rating BETWEEN 1 AND 5),
  material_quality_rating INTEGER CHECK (material_quality_rating BETWEEN 1 AND 5),
  
  -- Feedback text
  feedback_text TEXT,
  suggestions TEXT,
  
  -- Sentiment
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  
  -- Visibility
  is_public BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_training_feedback_course ON public.training_feedback(course_id);
CREATE INDEX IF NOT EXISTS idx_training_feedback_rating ON public.training_feedback(overall_rating DESC);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.training_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_training_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_hr_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

CREATE POLICY "Users can view active training paths"
  ON public.training_paths FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage training paths"
  ON public.training_paths FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their training path progress"
  ON public.user_training_path_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Users can update their training path progress"
  ON public.user_training_path_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR true)
  WITH CHECK (user_id = auth.uid() OR true);

CREATE POLICY "Users can view training KPIs"
  ON public.training_hr_kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage training KPIs"
  ON public.training_hr_kpis FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view public feedback"
  ON public.training_feedback FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can submit their feedback"
  ON public.training_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their feedback"
  ON public.training_feedback FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- Functions
-- ============================================

-- Function to calculate training HR KPIs
CREATE OR REPLACE FUNCTION calculate_training_hr_kpis(p_date DATE, p_period TEXT)
RETURNS VOID AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_stats RECORD;
BEGIN
  -- Determine time range
  CASE p_period
    WHEN 'daily' THEN
      v_start_date := p_date::TIMESTAMPTZ;
      v_end_date := (p_date + INTERVAL '1 day')::TIMESTAMPTZ;
    WHEN 'weekly' THEN
      v_start_date := DATE_TRUNC('week', p_date::TIMESTAMPTZ);
      v_end_date := v_start_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      v_start_date := DATE_TRUNC('month', p_date::TIMESTAMPTZ);
      v_end_date := v_start_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      v_start_date := DATE_TRUNC('quarter', p_date::TIMESTAMPTZ);
      v_end_date := v_start_date + INTERVAL '3 months';
  END CASE;
  
  -- Calculate statistics
  SELECT
    COUNT(*) as total_enroll,
    COUNT(*) FILTER (WHERE enrollment_date >= v_start_date::DATE) as new_enroll,
    COUNT(*) FILTER (WHERE enrollment_status = 'active') as active_count,
    COUNT(*) FILTER (WHERE enrollment_status = 'completed') as completed_count,
    AVG(overall_progress_percentage) as avg_progress,
    AVG(average_score) as avg_score
  INTO v_stats
  FROM public.course_enrollments
  WHERE enrollment_date <= v_end_date::DATE;
  
  -- Count certifications issued
  DECLARE
    v_certs_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_certs_count
    FROM public.certifications
    WHERE issued_at >= v_start_date AND issued_at < v_end_date;
  END;
  
  -- Insert or update KPIs
  INSERT INTO public.training_hr_kpis (
    kpi_date,
    kpi_period,
    total_enrollments,
    new_enrollments,
    active_learners,
    courses_completed,
    certifications_issued,
    avg_course_score
  ) VALUES (
    p_date,
    p_period,
    v_stats.total_enroll,
    v_stats.new_enroll,
    v_stats.active_count,
    v_stats.completed_count,
    v_certs_count,
    v_stats.avg_score
  )
  ON CONFLICT (kpi_date, kpi_period) DO UPDATE SET
    total_enrollments = EXCLUDED.total_enrollments,
    new_enrollments = EXCLUDED.new_enrollments,
    active_learners = EXCLUDED.active_learners,
    courses_completed = EXCLUDED.courses_completed,
    certifications_issued = EXCLUDED.certifications_issued,
    avg_course_score = EXCLUDED.avg_course_score;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps triggers
CREATE TRIGGER set_training_paths_updated_at 
  BEFORE UPDATE ON public.training_paths
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_user_training_path_progress_updated_at 
  BEFORE UPDATE ON public.user_training_path_progress
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
