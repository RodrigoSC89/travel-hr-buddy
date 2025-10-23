-- Create nautilus_conversations table for AI command history
CREATE TABLE IF NOT EXISTS public.nautilus_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  messages JSONB NOT NULL,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nautilus_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nautilus_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.nautilus_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.nautilus_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_nautilus_conversations_user ON public.nautilus_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_nautilus_conversations_timestamp ON public.nautilus_conversations(timestamp DESC);