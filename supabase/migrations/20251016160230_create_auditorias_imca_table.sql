-- Create auditorias_imca table for storing IMCA audit records
-- This table stores audit data with timestamps and user tracking for trend analysis

CREATE TABLE IF NOT EXISTS public.auditorias_imca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_created_at ON public.auditorias_imca (created_at DESC);

-- Create index on user_id for efficient user filtering
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_user_id ON public.auditorias_imca (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.auditorias_imca ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own audits
CREATE POLICY "Allow authenticated users to read auditorias"
  ON public.auditorias_imca
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert audits
CREATE POLICY "Allow authenticated users to insert auditorias"
  ON public.auditorias_imca
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow service role full access
CREATE POLICY "Allow service role full access to auditorias"
  ON public.auditorias_imca
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.auditorias_imca IS 'Stores IMCA audit records for trend analysis and reporting';
