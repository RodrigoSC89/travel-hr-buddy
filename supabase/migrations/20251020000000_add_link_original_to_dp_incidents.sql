-- ===========================
-- Add link_original field to dp_incidents
-- Stores the URL of the original article/report for each incident
-- ===========================

-- Add link_original column to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS link_original TEXT;

-- Add comment for the new column
COMMENT ON COLUMN public.dp_incidents.link_original IS 'URL do artigo ou relatório original do incidente';

-- Create index for faster queries (optional, if we search by URL)
-- CREATE INDEX IF NOT EXISTS idx_dp_incidents_link_original ON public.dp_incidents(link_original);
