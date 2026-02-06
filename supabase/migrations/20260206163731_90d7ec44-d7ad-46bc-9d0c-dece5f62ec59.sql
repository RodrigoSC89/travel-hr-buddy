
-- Fix voyage_plans status constraint to include maritime-standard statuses
ALTER TABLE voyage_plans DROP CONSTRAINT voyage_plans_status_check;
ALTER TABLE voyage_plans ADD CONSTRAINT voyage_plans_status_check 
CHECK (status::text = ANY (ARRAY['planned', 'in_progress', 'in_transit', 'completed', 'cancelled', 'delayed', 'berthed']::text[]));
