-- Create assistant_logs table to store all assistant interactions
CREATE TABLE IF NOT EXISTS public.assistant_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    question TEXT NOT NULL,
    answer TEXT,
    action TEXT,
    target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_id ON public.assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON public.assistant_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_email ON public.assistant_logs(user_email);

-- Enable Row Level Security
ALTER TABLE public.assistant_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all assistant logs"
ON public.assistant_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own assistant logs"
ON public.assistant_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: All authenticated users can insert logs (for assistant to log queries)
CREATE POLICY "Authenticated users can insert assistant logs"
ON public.assistant_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.assistant_logs IS 'Stores all AI assistant interactions for history tracking and analytics';
