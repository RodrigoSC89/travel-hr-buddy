-- Add comments column to checklist_items table to support PR #197 features
-- This enables threaded comments on checklist items with user attribution and timestamps

ALTER TABLE public.checklist_items
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance when querying comments
CREATE INDEX IF NOT EXISTS idx_checklist_items_comments ON public.checklist_items USING GIN (comments);

-- Comment: The comments column stores an array of comment objects with this structure:
-- [
--   {
--     "user": "admin",
--     "text": "This is a comment",
--     "created_at": "2025-10-11T01:23:45.678Z"
--   }
-- ]
