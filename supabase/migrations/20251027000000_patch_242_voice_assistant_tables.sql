-- PATCH 242: Voice Assistant Database Tables
-- Create tables for voice message logging and conversation tracking

-- voice_conversations: Track voice assistant conversation sessions
CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid,
  session_id text NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  message_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'ended', 'interrupted')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- voice_messages: Store individual voice messages and responses
CREATE TABLE IF NOT EXISTS public.voice_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.voice_conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  transcript text,
  audio_duration_ms integer,
  confidence_score decimal(3, 2),
  language text DEFAULT 'en-US',
  command_detected text,
  action_taken text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user ON public.voice_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_session ON public.voice_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_status ON public.voice_conversations(status);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_start_time ON public.voice_conversations(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_voice_messages_conversation ON public.voice_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_user ON public.voice_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_role ON public.voice_messages(role);
CREATE INDEX IF NOT EXISTS idx_voice_messages_created_at ON public.voice_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_conversations
CREATE POLICY "Users can view their own voice conversations"
  ON public.voice_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice conversations"
  ON public.voice_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice conversations"
  ON public.voice_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for voice_messages
CREATE POLICY "Users can view their own voice messages"
  ON public.voice_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice messages"
  ON public.voice_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Updated at trigger for voice_conversations
CREATE OR REPLACE FUNCTION update_voice_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_voice_conversations_updated_at_trigger
  BEFORE UPDATE ON public.voice_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_conversations_updated_at();

-- Function to end a conversation
CREATE OR REPLACE FUNCTION end_voice_conversation(conversation_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.voice_conversations
  SET 
    end_time = now(),
    status = 'ended',
    updated_at = now()
  WHERE id = conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
