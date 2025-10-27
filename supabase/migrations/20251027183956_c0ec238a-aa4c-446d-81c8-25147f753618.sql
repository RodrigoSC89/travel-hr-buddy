-- PATCH 276: Integrations Hub Tables
CREATE TABLE IF NOT EXISTS public.integrations_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  oauth_connected BOOLEAN DEFAULT false,
  webhook_url TEXT,
  webhook_secret TEXT,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PATCH 277: SGSO Tables
CREATE TABLE IF NOT EXISTS public.sgso_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL,
  plan_version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  effective_date DATE,
  review_date DATE,
  content JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sgso_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.sgso_plans(id) ON DELETE CASCADE,
  action_title TEXT NOT NULL,
  action_description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  evidence_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PATCH 278: Channel Manager Tables
CREATE TABLE IF NOT EXISTS public.communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  channel_type TEXT DEFAULT 'group',
  is_active BOOLEAN DEFAULT true,
  allowed_roles TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  is_urgent BOOLEAN DEFAULT false,
  read_by UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PATCH 279: Training Academy Tables
CREATE TABLE IF NOT EXISTS public.academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_description TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  duration_hours INTEGER,
  modules JSONB DEFAULT '[]'::jsonb,
  assessments JSONB DEFAULT '[]'::jsonb,
  passing_score INTEGER DEFAULT 70,
  certificate_template TEXT,
  is_published BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_module INTEGER DEFAULT 0,
  completed_modules INTEGER[] DEFAULT '{}',
  progress_percent NUMERIC DEFAULT 0,
  assessment_scores JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'enrolled',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- PATCH 280: Crew Wellbeing Tables
CREATE TABLE IF NOT EXISTS public.crew_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  heart_rate INTEGER,
  blood_pressure TEXT,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  fatigue_level INTEGER CHECK (fatigue_level BETWEEN 1 AND 10),
  notes TEXT,
  anomaly_detected BOOLEAN DEFAULT false,
  anomaly_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Integrations Registry
CREATE POLICY "Users can manage their integrations"
  ON public.integrations_registry FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Org users can view org integrations"
  ON public.integrations_registry FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- RLS Policies: SGSO Plans
CREATE POLICY "Org users can view sgso plans"
  ON public.sgso_plans FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Admins can manage sgso plans"
  ON public.sgso_plans FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager') AND status = 'active'
  ));

-- RLS Policies: SGSO Actions
CREATE POLICY "Users can view sgso actions"
  ON public.sgso_actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sgso_plans p
    WHERE p.id = sgso_actions.plan_id
    AND p.organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  ));

CREATE POLICY "Assigned users can update their actions"
  ON public.sgso_actions FOR UPDATE
  USING (assigned_to = auth.uid());

CREATE POLICY "Admins can manage sgso actions"
  ON public.sgso_actions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.sgso_plans p
    WHERE p.id = sgso_actions.plan_id
    AND p.organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager') AND status = 'active'
    )
  ));

-- RLS Policies: Communication Channels
CREATE POLICY "Org users can view channels"
  ON public.communication_channels FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Admins can manage channels"
  ON public.communication_channels FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager') AND status = 'active'
  ));

-- RLS Policies: Channel Messages
CREATE POLICY "Channel members can view messages"
  ON public.channel_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.communication_channels c
    WHERE c.id = channel_messages.channel_id
    AND c.organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  ));

CREATE POLICY "Users can send messages"
  ON public.channel_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- RLS Policies: Academy Courses
CREATE POLICY "Org users can view published courses"
  ON public.academy_courses FOR SELECT
  USING (is_published = true AND organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Instructors can manage their courses"
  ON public.academy_courses FOR ALL
  USING (instructor_id = auth.uid());

CREATE POLICY "Admins can manage all courses"
  ON public.academy_courses FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager') AND status = 'active'
  ));

-- RLS Policies: Academy Progress
CREATE POLICY "Users can view their progress"
  ON public.academy_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their progress"
  ON public.academy_progress FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can view student progress"
  ON public.academy_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.academy_courses c
    WHERE c.id = academy_progress.course_id AND c.instructor_id = auth.uid()
  ));

-- RLS Policies: Crew Health Metrics
CREATE POLICY "Users can manage their health metrics"
  ON public.crew_health_metrics FOR ALL
  USING (crew_member_id = auth.uid());

CREATE POLICY "HR can view all health metrics"
  ON public.crew_health_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')
  ));

-- Indexes
CREATE INDEX idx_integrations_registry_user ON public.integrations_registry(user_id);
CREATE INDEX idx_integrations_registry_org ON public.integrations_registry(organization_id);
CREATE INDEX idx_sgso_plans_org ON public.sgso_plans(organization_id);
CREATE INDEX idx_sgso_plans_vessel ON public.sgso_plans(vessel_id);
CREATE INDEX idx_sgso_actions_plan ON public.sgso_actions(plan_id);
CREATE INDEX idx_sgso_actions_assigned ON public.sgso_actions(assigned_to);
CREATE INDEX idx_channels_org ON public.communication_channels(organization_id);
CREATE INDEX idx_messages_channel ON public.channel_messages(channel_id);
CREATE INDEX idx_messages_sender ON public.channel_messages(sender_id);
CREATE INDEX idx_courses_org ON public.academy_courses(organization_id);
CREATE INDEX idx_progress_course ON public.academy_progress(course_id);
CREATE INDEX idx_progress_user ON public.academy_progress(user_id);
CREATE INDEX idx_health_crew ON public.crew_health_metrics(crew_member_id);
CREATE INDEX idx_health_date ON public.crew_health_metrics(metric_date);

-- Updated_at triggers
CREATE TRIGGER update_integrations_registry_updated_at
  BEFORE UPDATE ON public.integrations_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sgso_plans_updated_at
  BEFORE UPDATE ON public.sgso_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sgso_actions_updated_at
  BEFORE UPDATE ON public.sgso_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON public.communication_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_courses_updated_at
  BEFORE UPDATE ON public.academy_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_progress_updated_at
  BEFORE UPDATE ON public.academy_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_health_metrics_updated_at
  BEFORE UPDATE ON public.crew_health_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();