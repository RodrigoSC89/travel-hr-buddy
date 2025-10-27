-- ============================================
-- PATCH 271-275: Complete Implementation
-- Using IF NOT EXISTS and DROP IF EXISTS for safety
-- ============================================

-- Voice Conversations
CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  session_id TEXT UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their voice conversations" ON public.voice_conversations;
CREATE POLICY "Users can view their voice conversations"
  ON public.voice_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create voice conversations" ON public.voice_conversations;
CREATE POLICY "Users can create voice conversations"
  ON public.voice_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their voice conversations" ON public.voice_conversations;
CREATE POLICY "Users can update their voice conversations"
  ON public.voice_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Voice Messages
CREATE TABLE IF NOT EXISTS public.voice_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.voice_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  action_type TEXT,
  action_data JSONB,
  duration INTEGER,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their voice messages" ON public.voice_messages;
CREATE POLICY "Users can view their voice messages"
  ON public.voice_messages FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create voice messages" ON public.voice_messages;
CREATE POLICY "Users can create voice messages"
  ON public.voice_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP INDEX IF EXISTS idx_voice_messages_conversation;
CREATE INDEX idx_voice_messages_conversation ON public.voice_messages(conversation_id);

DROP INDEX IF EXISTS idx_voice_messages_created_at;
CREATE INDEX idx_voice_messages_created_at ON public.voice_messages(created_at DESC);

-- Mission Control Logs
CREATE TABLE IF NOT EXISTS public.mission_control_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.mission_control_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view mission logs" ON public.mission_control_logs;
CREATE POLICY "Authenticated users can view mission logs"
  ON public.mission_control_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create mission logs" ON public.mission_control_logs;
CREATE POLICY "Authenticated users can create mission logs"
  ON public.mission_control_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP INDEX IF EXISTS idx_mission_control_logs_mission;
CREATE INDEX idx_mission_control_logs_mission ON public.mission_control_logs(mission_id);

DROP INDEX IF EXISTS idx_mission_control_logs_created;
CREATE INDEX idx_mission_control_logs_created ON public.mission_control_logs(created_at DESC);

-- Satellite Orbits
CREATE TABLE IF NOT EXISTS public.satellite_orbits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norad_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude NUMERIC NOT NULL,
  velocity NUMERIC NOT NULL,
  orbital_period NUMERIC,
  inclination NUMERIC,
  eccentricity NUMERIC,
  tle_line1 TEXT,
  tle_line2 TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.satellite_orbits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view satellite orbits" ON public.satellite_orbits;
CREATE POLICY "Everyone can view satellite orbits"
  ON public.satellite_orbits FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert satellite orbits" ON public.satellite_orbits;
CREATE POLICY "Authenticated users can insert satellite orbits"
  ON public.satellite_orbits FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update satellite orbits" ON public.satellite_orbits;
CREATE POLICY "Authenticated users can update satellite orbits"
  ON public.satellite_orbits FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP INDEX IF EXISTS idx_satellite_orbits_norad;
CREATE INDEX idx_satellite_orbits_norad ON public.satellite_orbits(norad_id);

DROP INDEX IF EXISTS idx_satellite_orbits_updated;
CREATE INDEX idx_satellite_orbits_updated ON public.satellite_orbits(last_updated DESC);

-- Document Templates
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their templates" ON public.document_templates;
CREATE POLICY "Users can view their templates"
  ON public.document_templates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public templates from their org" ON public.document_templates;
CREATE POLICY "Users can view public templates from their org"
  ON public.document_templates FOR SELECT
  USING (
    is_public = true AND
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can create templates" ON public.document_templates;
CREATE POLICY "Users can create templates"
  ON public.document_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their templates" ON public.document_templates;
CREATE POLICY "Users can update their templates"
  ON public.document_templates FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their templates" ON public.document_templates;
CREATE POLICY "Users can delete their templates"
  ON public.document_templates FOR DELETE
  USING (auth.uid() = user_id);

DROP INDEX IF EXISTS idx_document_templates_user;
CREATE INDEX idx_document_templates_user ON public.document_templates(user_id);

DROP INDEX IF EXISTS idx_document_templates_org;
CREATE INDEX idx_document_templates_org ON public.document_templates(organization_id);

DROP INDEX IF EXISTS idx_document_templates_public;
CREATE INDEX idx_document_templates_public ON public.document_templates(is_public);

-- Trigger for document_templates updated_at
DROP TRIGGER IF EXISTS trigger_update_document_templates_updated_at ON public.document_templates;
CREATE TRIGGER trigger_update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();