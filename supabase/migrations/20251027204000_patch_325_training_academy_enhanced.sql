-- PATCH 325: Training Academy v1 - Enhanced Features
-- Adds course materials, quizzes, and employee portal integration

-- 1. Create course_materials table (for videos, PDFs, etc.)
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  -- Material details
  material_type TEXT NOT NULL CHECK (material_type IN ('video', 'pdf', 'audio', 'document', 'presentation', 'link', 'file')),
  material_title TEXT NOT NULL,
  description TEXT,
  
  -- File information
  file_url TEXT,
  file_name TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  storage_path TEXT,
  
  -- Video-specific
  video_duration_seconds INTEGER,
  video_thumbnail_url TEXT,
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Access control
  is_downloadable BOOLEAN DEFAULT true,
  requires_completion_to_access BOOLEAN DEFAULT false,
  
  -- Upload metadata
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create quiz_questions table (for assessments)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  -- Question details
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching')),
  
  -- Options (for multiple choice)
  options JSONB DEFAULT '[]', -- [{text: '', is_correct: false}]
  correct_answer TEXT, -- For true/false, short answer
  correct_answers TEXT[], -- For matching, multiple correct
  
  -- Grading
  points INTEGER DEFAULT 1,
  explanation TEXT, -- Shown after answering
  
  -- Display
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create quiz_attempts table (track user quiz attempts)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  -- Attempt details
  attempt_number INTEGER NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'abandoned')),
  
  -- Answers
  answers JSONB DEFAULT '{}', -- {question_id: {answer: '', is_correct: boolean, points: 0}}
  
  -- Scoring
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  score_percentage NUMERIC,
  passed BOOLEAN,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  time_limit_seconds INTEGER,
  
  -- Feedback
  instructor_feedback TEXT,
  auto_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, lesson_id, attempt_number)
);

-- 4. Create course_enrollments table (track enrollments)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  
  -- Enrollment details
  enrollment_date DATE DEFAULT CURRENT_DATE,
  enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN ('active', 'completed', 'dropped', 'suspended')),
  
  -- Progress tracking
  overall_progress_percentage NUMERIC DEFAULT 0 CHECK (overall_progress_percentage BETWEEN 0 AND 100),
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  
  -- Deadlines
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Performance
  average_score NUMERIC,
  total_time_spent_minutes INTEGER DEFAULT 0,
  
  -- Status tracking
  last_accessed_at TIMESTAMPTZ,
  completion_reminder_sent BOOLEAN DEFAULT false,
  
  -- Enrollment source
  enrollment_type TEXT DEFAULT 'self' CHECK (enrollment_type IN ('self', 'assigned', 'mandatory', 'recommended')),
  enrolled_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, course_id)
);

-- 5. Create training_logs table (audit trail for training activities)
CREATE TABLE IF NOT EXISTS public.training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN ('enrollment', 'lesson_start', 'lesson_complete', 'quiz_attempt', 'certificate_issued', 'progress_update')),
  course_id UUID,
  lesson_id UUID,
  
  -- Log entry
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create employee_portal_sync table (for Employee Portal integration)
CREATE TABLE IF NOT EXISTS public.employee_portal_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('course_progress', 'certification', 'enrollment', 'profile')),
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
  
  -- Data
  data_payload JSONB NOT NULL,
  
  -- Result
  sync_result TEXT,
  error_message TEXT,
  
  -- Timestamps
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_course_materials_course ON public.course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_lesson ON public.course_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_type ON public.course_materials(material_type);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson ON public.quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON public.quiz_questions(order_index);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson ON public.quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON public.quiz_attempts(status);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON public.course_enrollments(enrollment_status);

CREATE INDEX IF NOT EXISTS idx_training_logs_user ON public.training_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_activity ON public.training_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_training_logs_created ON public.training_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_employee_portal_sync_user ON public.employee_portal_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_portal_sync_status ON public.employee_portal_sync(sync_status);
CREATE INDEX IF NOT EXISTS idx_employee_portal_sync_next_retry ON public.employee_portal_sync(next_retry_at) 
  WHERE sync_status = 'failed' AND retry_count < max_retries;

-- Enable RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_portal_sync ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view published course materials"
  ON public.course_materials FOR SELECT
  TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE is_published = true)
    OR uploaded_by = auth.uid()
  );

CREATE POLICY "Instructors can manage course materials"
  ON public.course_materials FOR ALL
  TO authenticated
  USING (uploaded_by = auth.uid() OR true)
  WITH CHECK (uploaded_by = auth.uid() OR true);

CREATE POLICY "Enrolled users can view quiz questions"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE c.is_published = true
    )
  );

CREATE POLICY "Instructors can manage quiz questions"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz attempts"
  ON public.quiz_attempts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their enrollments"
  ON public.course_enrollments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Users can enroll themselves"
  ON public.course_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR true);

CREATE POLICY "Users can update their enrollments"
  ON public.course_enrollments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR true)
  WITH CHECK (true);

CREATE POLICY "Users can view their training logs"
  ON public.training_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR true);

CREATE POLICY "System can insert training logs"
  ON public.training_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their sync records"
  ON public.employee_portal_sync FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage sync records"
  ON public.employee_portal_sync FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to automatically grade quiz attempts
CREATE OR REPLACE FUNCTION grade_quiz_attempt(attempt_uuid UUID)
RETURNS VOID AS $$
DECLARE
  attempt_record public.quiz_attempts%ROWTYPE;
  question_record RECORD;
  correct_count INTEGER := 0;
  total_points_earned INTEGER := 0;
  total_possible_points INTEGER := 0;
  passing_score INTEGER;
BEGIN
  -- Get attempt details
  SELECT * INTO attempt_record FROM public.quiz_attempts WHERE id = attempt_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get passing score from lesson
  SELECT l.passing_score INTO passing_score
  FROM public.lessons l
  WHERE l.id = attempt_record.lesson_id;
  
  -- Grade each question
  FOR question_record IN 
    SELECT * FROM public.quiz_questions 
    WHERE lesson_id = attempt_record.lesson_id
    ORDER BY order_index
  LOOP
    total_possible_points := total_possible_points + question_record.points;
    
    -- Check if answer is correct (simplified logic)
    IF (attempt_record.answers->question_record.id::TEXT->>'is_correct')::BOOLEAN = true THEN
      correct_count := correct_count + 1;
      total_points_earned := total_points_earned + question_record.points;
    END IF;
  END LOOP;
  
  -- Update attempt with results
  UPDATE public.quiz_attempts
  SET 
    status = 'graded',
    correct_answers = correct_count,
    total_points = total_points_earned,
    score_percentage = CASE 
      WHEN total_possible_points > 0 THEN (total_points_earned::NUMERIC / total_possible_points) * 100
      ELSE 0
    END,
    passed = CASE 
      WHEN total_possible_points > 0 THEN (total_points_earned::NUMERIC / total_possible_points) * 100 >= passing_score
      ELSE false
    END
  WHERE id = attempt_uuid;
  
  -- Log the activity
  INSERT INTO public.training_logs (user_id, activity_type, lesson_id, description)
  VALUES (
    attempt_record.user_id,
    'quiz_attempt',
    attempt_record.lesson_id,
    'Quiz attempt graded: ' || correct_count || ' correct out of ' || attempt_record.total_questions
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check course completion and issue certificate
CREATE OR REPLACE FUNCTION check_course_completion_and_certify(p_user_id UUID, p_course_id UUID)
RETURNS VOID AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  avg_score NUMERIC;
  enrollment_record public.course_enrollments%ROWTYPE;
BEGIN
  -- Get enrollment record
  SELECT * INTO enrollment_record 
  FROM public.course_enrollments 
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Count lessons
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons
  WHERE course_id = p_course_id AND is_required = true;
  
  -- Count completed lessons
  SELECT COUNT(DISTINCT lesson_id) INTO completed_lessons
  FROM public.user_progress
  WHERE user_id = p_user_id 
    AND course_id = p_course_id
    AND status = 'completed';
  
  -- Calculate average score
  SELECT AVG(score) INTO avg_score
  FROM public.user_progress
  WHERE user_id = p_user_id 
    AND course_id = p_course_id
    AND status = 'completed'
    AND score IS NOT NULL;
  
  -- Update enrollment progress
  UPDATE public.course_enrollments
  SET 
    overall_progress_percentage = CASE 
      WHEN total_lessons > 0 THEN (completed_lessons::NUMERIC / total_lessons) * 100
      ELSE 0
    END,
    lessons_completed = completed_lessons,
    total_lessons = total_lessons,
    average_score = avg_score,
    last_accessed_at = NOW()
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  -- If all lessons completed, issue certificate
  IF completed_lessons >= total_lessons AND total_lessons > 0 THEN
    -- Check if certificate already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.certifications 
      WHERE user_id = p_user_id AND course_id = p_course_id
    ) THEN
      -- Issue certificate
      INSERT INTO public.certifications (
        user_id,
        course_id,
        certificate_number,
        final_score,
        is_valid
      ) VALUES (
        p_user_id,
        p_course_id,
        'CERT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
        COALESCE(avg_score, 0),
        true
      );
      
      -- Mark enrollment as completed
      UPDATE public.course_enrollments
      SET 
        enrollment_status = 'completed',
        actual_completion_date = CURRENT_DATE
      WHERE user_id = p_user_id AND course_id = p_course_id;
      
      -- Log certificate issuance
      INSERT INTO public.training_logs (user_id, activity_type, course_id, description)
      VALUES (
        p_user_id,
        'certificate_issued',
        p_course_id,
        'Certificate issued for course completion'
      );
      
      -- Queue sync with Employee Portal
      INSERT INTO public.employee_portal_sync (
        user_id,
        sync_type,
        data_payload
      ) VALUES (
        p_user_id,
        'certification',
        JSONB_BUILD_OBJECT(
          'course_id', p_course_id,
          'completion_date', CURRENT_DATE,
          'score', avg_score
        )
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-check completion after progress update
CREATE OR REPLACE FUNCTION trigger_completion_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    PERFORM check_course_completion_and_certify(NEW.user_id, NEW.course_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_completion_after_progress
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION trigger_completion_check();

-- Update timestamps triggers
CREATE TRIGGER set_course_materials_updated_at BEFORE UPDATE ON public.course_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_course_enrollments_updated_at BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
