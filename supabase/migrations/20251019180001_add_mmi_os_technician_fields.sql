-- Add technician fields to mmi_os table
-- These fields allow technicians to record execution details and add comments

-- Add executed_at column
ALTER TABLE mmi_os
ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP WITH TIME ZONE;

-- Add technician_comment column
ALTER TABLE mmi_os
ADD COLUMN IF NOT EXISTS technician_comment TEXT;

-- Create index on executed_at for faster filtering and reporting
CREATE INDEX IF NOT EXISTS idx_mmi_os_executed_at ON mmi_os(executed_at DESC);

-- Add comment to table
COMMENT ON COLUMN mmi_os.executed_at IS 'Actual execution date/time recorded by technician';
COMMENT ON COLUMN mmi_os.technician_comment IS 'Technical comments or notes from the technician';
