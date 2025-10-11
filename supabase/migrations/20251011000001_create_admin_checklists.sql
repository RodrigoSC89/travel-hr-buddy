-- Create admin checklists table for simple checklist management
-- This is separate from operational_checklists which is more complex

CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user TEXT NOT NULL DEFAULT 'admin'
);

-- Enable RLS
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Create policies for checklists
CREATE POLICY "Allow all operations on checklists"
  ON public.checklists
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_checklists_created_at ON public.checklists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checklists_user ON public.checklists(user);
