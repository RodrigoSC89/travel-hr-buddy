-- Create assistant_logs table for tracking AI Assistant interactions
CREATE TABLE IF NOT EXISTS public.assistant_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  origin TEXT NOT NULL DEFAULT 'assistant' CHECK (origin IN ('assistant', 'api', 'function')),
  action_type TEXT CHECK (action_type IN ('navigation', 'action', 'query', 'info', 'checklist_creation')),
  target_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assistant_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own assistant logs" ON public.assistant_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert their own assistant logs" ON public.assistant_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all assistant logs" ON public.assistant_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'hr_manager')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_id ON public.assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON public.assistant_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_action_type ON public.assistant_logs(action_type);
