-- Add comments column to checklist_items table
-- This allows storing threaded comments for collaborative checklist management

ALTER TABLE public.checklist_items
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN public.checklist_items.comments IS 'Array of comment objects with structure: [{ user: string, text: string, created_at: timestamp }]';
