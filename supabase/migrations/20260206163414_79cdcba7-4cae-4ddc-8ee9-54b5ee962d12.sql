
-- Fix fuel_records consumption_type constraint to include real maritime scenarios
ALTER TABLE fuel_records DROP CONSTRAINT fuel_records_consumption_type_check;
ALTER TABLE fuel_records ADD CONSTRAINT fuel_records_consumption_type_check 
CHECK (consumption_type::text = ANY (ARRAY['main_engine', 'auxiliary', 'boiler', 'incinerator', 'bunkering', 'consumption', 'rob_report', 'transfer']::text[]));

-- Check if maintenance_records were inserted (they were before the fuel error)
-- If not, insert them. First check count.
