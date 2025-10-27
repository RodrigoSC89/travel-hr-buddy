-- Create academy_courses table
CREATE TABLE IF NOT EXISTS academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  duration_hours INT DEFAULT 0,
  thumbnail_url TEXT,
  instructor_name TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create academy_modules table
CREATE TABLE IF NOT EXISTS academy_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INT DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create academy_progress table
CREATE TABLE IF NOT EXISTS academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  progress_percentage INT DEFAULT 0,
  score INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id, module_id)
);

-- Create academy_certificates table
CREATE TABLE IF NOT EXISTS academy_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  final_score INT,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_courses_published ON academy_courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category ON academy_courses(category);
CREATE INDEX IF NOT EXISTS idx_modules_course ON academy_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON academy_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_progress_user ON academy_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON academy_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON academy_certificates(user_id);

-- Enable RLS
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published courses"
  ON academy_courses FOR SELECT
  USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Creators can manage their courses"
  ON academy_courses FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view modules for published courses"
  ON academy_modules FOR SELECT
  USING (
    course_id IN (SELECT id FROM academy_courses WHERE is_published = true)
    OR
    course_id IN (SELECT id FROM academy_courses WHERE created_by = auth.uid())
  );

CREATE POLICY "Course creators can manage modules"
  ON academy_modules FOR ALL
  USING (
    course_id IN (SELECT id FROM academy_courses WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can view their own progress"
  ON academy_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON academy_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own certificates"
  ON academy_certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Function to auto-generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.certificate_number = 'CERT-' || 
    TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_certificate_number
  BEFORE INSERT ON academy_certificates
  FOR EACH ROW
  WHEN (NEW.certificate_number IS NULL)
  EXECUTE FUNCTION generate_certificate_number();

-- Function to check course completion and issue certificate
CREATE OR REPLACE FUNCTION check_course_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_modules INT;
  completed_modules INT;
  avg_score NUMERIC;
BEGIN
  -- Count total modules in the course
  SELECT COUNT(*) INTO total_modules
  FROM academy_modules
  WHERE course_id = NEW.course_id;

  -- Count completed modules by the user
  SELECT COUNT(*) INTO completed_modules
  FROM academy_progress
  WHERE user_id = NEW.user_id
    AND course_id = NEW.course_id
    AND is_completed = true;

  -- If all modules completed, issue certificate
  IF completed_modules >= total_modules AND total_modules > 0 THEN
    -- Calculate average score
    SELECT AVG(score) INTO avg_score
    FROM academy_progress
    WHERE user_id = NEW.user_id
      AND course_id = NEW.course_id
      AND score IS NOT NULL;

    -- Issue certificate if not already exists
    INSERT INTO academy_certificates (user_id, course_id, final_score)
    VALUES (NEW.user_id, NEW.course_id, COALESCE(avg_score, 0))
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_and_issue_certificate
  AFTER INSERT OR UPDATE ON academy_progress
  FOR EACH ROW
  WHEN (NEW.is_completed = true)
  EXECUTE FUNCTION check_course_completion();
