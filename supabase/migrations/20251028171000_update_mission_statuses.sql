-- PATCH 419: Update Mission Control Status Values
-- Add 'in_progress', 'completed', and 'error' statuses for real-time execution

ALTER TABLE missions 
  DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE missions 
  ADD CONSTRAINT valid_status CHECK (
    status IN ('planning', 'active', 'in_progress', 'paused', 'completed', 'error', 'cancelled')
  );

-- Update existing 'active' missions to 'in_progress' for clarity
UPDATE missions 
SET status = 'in_progress' 
WHERE status = 'active';

COMMENT ON TABLE missions IS 'PATCH 383 + PATCH 419: Mission management with real-time execution tracking';
