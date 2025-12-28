-- PATCH 661.9: Create copilot_sessions table
CREATE TABLE IF NOT EXISTS public.copilot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_name TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  messages JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.copilot_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "copilot_sessions_policy" ON public.copilot_sessions FOR ALL USING (true);