# 🧪 PATCH 263 – Training Academy Validation

## 📋 Objective
Validar fluxo completo de cursos, progresso e certificação.

---

## ✅ Validation Checklist

### 1️⃣ Course Management
- [ ] Cursos podem ser criados com conteúdo persistente?
- [ ] Lições são adicionadas e organizadas corretamente?
- [ ] Conteúdo suporta texto, vídeo, e quizzes?
- [ ] Pré-requisitos são respeitados?
- [ ] Cursos podem ser publicados/despublicados?

### 2️⃣ Progress Tracking
- [ ] O progresso do usuário é salvo corretamente?
- [ ] Lições completadas são marcadas?
- [ ] Percentual de conclusão é preciso?
- [ ] Progresso persiste após logout?
- [ ] Retomada funciona do ponto correto?

### 3️⃣ Certification
- [ ] Certificado é emitido automaticamente após conclusão?
- [ ] Certificado inclui dados corretos (nome, data, curso)?
- [ ] Certificados são persistentes e verificáveis?
- [ ] PDF pode ser baixado?
- [ ] Certificados aparecem no perfil do usuário?

### 4️⃣ Profile Integration
- [ ] Histórico de cursos é visível no perfil?
- [ ] Certificados são listados corretamente?
- [ ] Skills adquiridas aparecem no perfil?
- [ ] Badges são atribuídos por conquistas?
- [ ] Progresso total é calculado corretamente?

### 5️⃣ Mobile Experience
- [ ] Interface funciona em mobile?
- [ ] Vídeos são reproduzidos corretamente?
- [ ] Navegação é fluída em telas pequenas?
- [ ] Progresso sincroniza entre dispositivos?
- [ ] Modo offline é suportado (futuro)?

---

## 🗄️ Required Database Schema

### Table: `training_courses`
```sql
CREATE TABLE IF NOT EXISTS public.training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  duration_hours DECIMAL(5,2),
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  prerequisites UUID[] DEFAULT ARRAY[]::UUID[],
  skills_gained TEXT[],
  is_published BOOLEAN DEFAULT false,
  enrollment_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_courses_published ON public.training_courses(is_published);
CREATE INDEX idx_courses_category ON public.training_courses(category);
CREATE INDEX idx_courses_difficulty ON public.training_courses(difficulty_level);

ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are viewable by all authenticated users"
  ON public.training_courses FOR SELECT
  USING (is_published = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Instructors can view their own courses"
  ON public.training_courses FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() = instructor_id);

CREATE POLICY "Instructors can create courses"
  ON public.training_courses FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Instructors can update their courses"
  ON public.training_courses FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = instructor_id);
```

### Table: `training_lessons`
```sql
CREATE TABLE IF NOT EXISTS public.training_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment', 'interactive')),
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  passing_score INTEGER CHECK (passing_score >= 0 AND passing_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, order_index)
);

CREATE INDEX idx_lessons_course ON public.training_lessons(course_id);

ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lessons of enrolled courses"
  ON public.training_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_courses tc
      WHERE tc.id = training_lessons.course_id
      AND (tc.is_published = true OR tc.created_by = auth.uid())
    )
  );
```

### Table: `training_enrollments`
```sql
CREATE TABLE IF NOT EXISTS public.training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_lesson_id UUID REFERENCES public.training_lessons(id),
  certificate_issued BOOLEAN DEFAULT false,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON public.training_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.training_enrollments(course_id);
CREATE INDEX idx_enrollments_completed ON public.training_enrollments(completed_at);

ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments"
  ON public.training_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
  ON public.training_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
  ON public.training_enrollments FOR UPDATE
  USING (auth.uid() = user_id);
```

### Table: `training_progress`
```sql
CREATE TABLE IF NOT EXISTS public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.training_lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'passed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  attempts INTEGER DEFAULT 0,
  last_position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_progress_enrollment ON public.training_progress(enrollment_id);
CREATE INDEX idx_progress_user ON public.training_progress(user_id);

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress"
  ON public.training_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

### Table: `training_certificates`
```sql
CREATE TABLE IF NOT EXISTS public.training_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_certificates_user ON public.training_certificates(user_id);
CREATE INDEX idx_certificates_course ON public.training_certificates(course_id);
CREATE INDEX idx_certificates_verification ON public.training_certificates(verification_code);

ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates"
  ON public.training_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can verify certificates"
  ON public.training_certificates FOR SELECT
  USING (verification_code IS NOT NULL);
```

### Table: `training_quiz_questions`
```sql
CREATE TABLE IF NOT EXISTS public.training_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.training_lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay')),
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_quiz_questions_lesson ON public.training_quiz_questions(lesson_id);

ALTER TABLE public.training_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quiz questions for enrolled courses"
  ON public.training_quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_lessons tl
      JOIN public.training_courses tc ON tc.id = tl.course_id
      JOIN public.training_enrollments te ON te.course_id = tc.id
      WHERE tl.id = training_quiz_questions.lesson_id
      AND te.user_id = auth.uid()
    )
  );
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Basic module structure may exist

### ⚠️ Partial
- Course listing may be static
- Progress tracking may be incomplete

### ❌ Missing
- Course creation interface
- Lesson content management
- Progress tracking system
- Certificate generation
- Quiz system
- Video player integration

---

## 🧪 Test Scenarios

### Scenario 1: Create Course
1. Login as instructor
2. Navigate to Training Academy admin
3. Click "Create Course"
4. Fill in: Title, Description, Category, Difficulty
5. Add 3 lessons (video, text, quiz)
6. Publish course
7. **Expected**: Course visible in catalog, lessons in order

### Scenario 2: Enroll and Progress
1. Browse course catalog
2. Click course → "Enroll"
3. Start first lesson
4. Complete lesson
5. **Expected**:
   - Enrollment created
   - Progress updated to ~33%
   - Next lesson unlocked

### Scenario 3: Complete Quiz
1. Reach quiz lesson
2. Answer all questions
3. Submit quiz
4. **Expected**:
   - Score calculated
   - Pass/fail status shown
   - Progress updated
   - Certificate issued if last lesson

### Scenario 4: Issue Certificate
1. Complete all required lessons
2. Pass final quiz
3. **Expected**:
   - Certificate automatically generated
   - Certificate number unique
   - PDF available for download
   - Certificate appears in profile

### Scenario 5: Certificate Verification
1. Copy verification code from certificate
2. Go to verification page
3. Enter code
4. **Expected**: Certificate details shown (name, course, date)

### Scenario 6: Mobile Experience
1. Open on mobile device
2. Enroll in course
3. Watch video lesson
4. **Expected**:
   - Responsive layout
   - Video plays in mobile player
   - Progress saved
   - Easy navigation

---

## 📊 Course Categories

| Category | Description | Status |
|----------|-------------|--------|
| **Safety** | Safety protocols, emergency procedures | ⚠️ |
| **Technical** | Equipment operation, maintenance | ⚠️ |
| **Leadership** | Management, communication skills | ⚠️ |
| **Operations** | Standard operating procedures | ⚠️ |
| **Compliance** | Regulations, certifications | ⚠️ |

---

## 🚀 Next Steps

1. **Course Management**
   - Create course builder UI
   - Implement lesson editor
   - Add media upload (videos, images)
   - Support prerequisites

2. **Progress System**
   - Track lesson completion
   - Calculate progress percentage
   - Save video playback position
   - Sync across devices

3. **Quiz Engine**
   - Create question types
   - Implement scoring
   - Add explanations
   - Support retakes

4. **Certificate System**
   - Generate unique certificate numbers
   - Create PDF templates
   - Implement verification API
   - Add to user profile

5. **Testing**
   - Test full enrollment flow
   - Validate progress tracking
   - Test certificate generation
   - Verify mobile experience

---

**Status**: 🔴 Not Implemented  
**Priority**: 🟠 Medium-High  
**Estimated Completion**: 12-16 hours
