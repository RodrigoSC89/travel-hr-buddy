-- Create assistant_logs table for tracking AI assistant queries
CREATE TABLE IF NOT EXISTS public.assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_id ON public.assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON public.assistant_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.assistant_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own logs" 
ON public.assistant_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all logs by role" 
ON public.assistant_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Authenticated users can insert their own logs
CREATE POLICY "Users can insert their own logs" 
ON public.assistant_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update all logs
CREATE POLICY "Admins can update all logs"
ON public.assistant_logs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can delete all logs
CREATE POLICY "Admins can delete all logs"
ON public.assistant_logs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
