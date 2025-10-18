-- Insert sample data for SGSO effectiveness monitoring testing
-- This provides realistic test data for the effectiveness dashboard

-- Update existing incidents with SGSO effectiveness data
-- Only update incidents that don't already have these fields populated

-- Update some incidents with Erro humano category
UPDATE dp_incidents
SET 
  sgso_category = 'Erro humano',
  action_plan_date = created_at + INTERVAL '1 day',
  resolved_at = created_at + INTERVAL '4 days',
  repeated = (RANDOM() < 0.25)
WHERE sgso_category IS NULL 
  AND id IN (
    SELECT id FROM dp_incidents WHERE sgso_category IS NULL LIMIT 12
  );

-- Update some incidents with Falha técnica category
UPDATE dp_incidents
SET 
  sgso_category = 'Falha técnica',
  action_plan_date = created_at + INTERVAL '1 day',
  resolved_at = created_at + INTERVAL '3 days',
  repeated = (RANDOM() < 0.11)
WHERE sgso_category IS NULL 
  AND id IN (
    SELECT id FROM dp_incidents WHERE sgso_category IS NULL LIMIT 9
  );

-- Update some incidents with Comunicação category
UPDATE dp_incidents
SET 
  sgso_category = 'Comunicação',
  action_plan_date = created_at + INTERVAL '1 day',
  resolved_at = created_at + INTERVAL '1 day',
  repeated = false
WHERE sgso_category IS NULL 
  AND id IN (
    SELECT id FROM dp_incidents WHERE sgso_category IS NULL LIMIT 6
  );

-- Update some incidents with Falha organizacional category
UPDATE dp_incidents
SET 
  sgso_category = 'Falha organizacional',
  action_plan_date = created_at + INTERVAL '1 day',
  resolved_at = created_at + INTERVAL '6 days',
  repeated = (RANDOM() < 0.25)
WHERE sgso_category IS NULL 
  AND id IN (
    SELECT id FROM dp_incidents WHERE sgso_category IS NULL LIMIT 8
  );
