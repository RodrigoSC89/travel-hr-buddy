-- Create assistant_logs table for tracking all assistant interactions
CREATE TABLE public.assistant_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  origin TEXT NOT NULL DEFAULT 'assistant' CHECK (origin IN ('assistant', 'api', 'system')),
  action_type TEXT CHECK (action_type IN ('navigation', 'action', 'query', 'info', 'checklist_creation')),
  action_target TEXT,
  execution_time_ms INTEGER,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assistant_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own logs" ON public.assistant_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert their own logs" ON public.assistant_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all logs" ON public.assistant_logs
  FOR SELECT USING (get_user_role() IN ('admin', 'hr_manager'));

-- Create index for better query performance
CREATE INDEX idx_assistant_logs_user_id ON public.assistant_logs(user_id);
CREATE INDEX idx_assistant_logs_created_at ON public.assistant_logs(created_at DESC);
CREATE INDEX idx_assistant_logs_action_type ON public.assistant_logs(action_type);
