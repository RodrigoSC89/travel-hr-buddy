-- Add unique constraint on link column for dp_incidents table
-- This allows upsert operations to avoid duplicate incidents from the same source link

ALTER TABLE public.dp_incidents 
ADD CONSTRAINT dp_incidents_link_unique UNIQUE (link);

-- Create index on link for better performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_link ON public.dp_incidents(link);

COMMENT ON CONSTRAINT dp_incidents_link_unique ON public.dp_incidents 
IS 'Ensures each incident link is unique to prevent duplicate entries from crawlers';
