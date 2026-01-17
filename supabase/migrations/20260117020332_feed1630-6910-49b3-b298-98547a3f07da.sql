-- Create audit_chat_sessions table for cross-device sync
CREATE TABLE public.audit_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('peotram', 'peodp')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own chat sessions"
ON public.audit_chat_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
ON public.audit_chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
ON public.audit_chat_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
ON public.audit_chat_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_audit_chat_sessions_user_id ON public.audit_chat_sessions(user_id);
CREATE INDEX idx_audit_chat_sessions_module ON public.audit_chat_sessions(module);
CREATE INDEX idx_audit_chat_sessions_updated_at ON public.audit_chat_sessions(updated_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_audit_chat_sessions_updated_at
BEFORE UPDATE ON public.audit_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();