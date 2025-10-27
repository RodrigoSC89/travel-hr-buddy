-- PATCH 263: Training Academy - Courses, Progress & Certification Tables
-- Creates tables for internal training courses with progress tracking and certifications

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    duration_hours DECIMAL(5,2),
    
    -- Content
    objectives TEXT[],
    prerequisites TEXT[],
    thumbnail_url TEXT,
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    is_mandatory BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Additional fields
    tags TEXT[],
    instructor_name TEXT,
    max_participants INTEGER
);

-- 2. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Content
    content_type TEXT CHECK (content_type IN ('video', 'text', 'quiz', 'interactive', 'document')),
    content_url TEXT,
    content_data JSONB DEFAULT '{}'::jsonb,
    
    -- Duration
    estimated_duration_minutes INTEGER,
    
    -- Requirements
    is_required BOOLEAN DEFAULT true,
    passing_score INTEGER DEFAULT 70,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    
    -- Progress tracking
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    
    -- Time tracking
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    
    -- Attempts
    attempt_number INTEGER DEFAULT 1,
    max_attempts_reached BOOLEAN DEFAULT false,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, lesson_id, attempt_number)
);

-- 4. Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Certificate details
    certificate_number TEXT UNIQUE NOT NULL,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    -- Validation
    is_valid BOOLEAN DEFAULT true,
    validation_code TEXT UNIQUE,
    
    -- Achievement data
    final_score INTEGER CHECK (final_score BETWEEN 0 AND 100),
    completion_time_hours DECIMAL(6,2),
    
    -- Certificate metadata
    certificate_url TEXT,
    certificate_data JSONB DEFAULT '{}'::jsonb,
    
    -- Revocation
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revocation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Course Enrollments Table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped', 'failed')),
    overall_progress INTEGER DEFAULT 0 CHECK (overall_progress BETWEEN 0 AND 100),
    
    -- Deadline
    due_date DATE,
    
    UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Users can view published courses"
    ON public.courses FOR SELECT
    TO authenticated
    USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Instructors can manage courses"
    ON public.courses FOR ALL
    TO authenticated
    USING (created_by = auth.uid());

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons from enrolled courses"
    ON public.lessons FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.course_enrollments 
        WHERE course_id = lessons.course_id 
        AND user_id = auth.uid()
    ));

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
    ON public.user_progress FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
    ON public.user_progress FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for certifications
CREATE POLICY "Users can view their own certifications"
    ON public.certifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "System can manage certifications"
    ON public.certifications FOR ALL
    TO authenticated
    USING (true);

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their own enrollments"
    ON public.course_enrollments FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can enroll in courses"
    ON public.course_enrollments FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_published ON public.courses(is_published);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id, order_index);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_user_progress_status ON public.user_progress(status);
CREATE INDEX idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX idx_certifications_valid ON public.certifications(is_valid) WHERE is_valid = true;
CREATE INDEX idx_certifications_number ON public.certifications(certificate_number);
CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON public.course_enrollments(status);

-- Create update triggers
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
    cert_number TEXT;
BEGIN
    cert_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-issue certificate when course is completed
CREATE OR REPLACE FUNCTION public.check_course_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    avg_score DECIMAL;
    course_hours DECIMAL;
BEGIN
    -- Count lessons in the course
    SELECT COUNT(*) INTO total_lessons
    FROM public.lessons
    WHERE course_id = NEW.course_id AND is_required = true;
    
    -- Count completed lessons by this user
    SELECT COUNT(*) INTO completed_lessons
    FROM public.user_progress
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id
    AND status = 'completed';
    
    -- If all required lessons are completed, issue certificate
    IF completed_lessons = total_lessons AND total_lessons > 0 THEN
        -- Calculate average score
        SELECT AVG(score) INTO avg_score
        FROM public.user_progress
        WHERE user_id = NEW.user_id 
        AND course_id = NEW.course_id
        AND status = 'completed';
        
        -- Get course duration
        SELECT duration_hours INTO course_hours
        FROM public.courses
        WHERE id = NEW.course_id;
        
        -- Check if certificate doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM public.certifications 
            WHERE user_id = NEW.user_id 
            AND course_id = NEW.course_id
        ) THEN
            INSERT INTO public.certifications (
                user_id, 
                course_id, 
                certificate_number,
                validation_code,
                final_score,
                completion_time_hours
            ) VALUES (
                NEW.user_id,
                NEW.course_id,
                public.generate_certificate_number(),
                MD5(RANDOM()::TEXT || NOW()::TEXT),
                ROUND(avg_score),
                course_hours
            );
            
            -- Update enrollment status
            UPDATE public.course_enrollments
            SET status = 'completed',
                completed_at = NOW(),
                overall_progress = 100
            WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_course_completion_trigger
    AFTER INSERT OR UPDATE ON public.user_progress
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION public.check_course_completion();
