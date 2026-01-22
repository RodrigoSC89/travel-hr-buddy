-- Create communication_messages table for analytics
CREATE TABLE IF NOT EXISTS public.communication_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID,
  sender_id UUID REFERENCES auth.users(id),
  message_type TEXT DEFAULT 'direct',
  priority TEXT DEFAULT 'normal',
  content TEXT,
  read_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_time_seconds INTEGER,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.communication_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages by sender" ON public.communication_messages
  FOR ALL TO authenticated
  USING (sender_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_communication_messages_type ON public.communication_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_communication_messages_created ON public.communication_messages(created_at);