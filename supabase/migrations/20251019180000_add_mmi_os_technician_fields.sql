-- Add technician fields to mmi_os table for execution tracking
-- These fields allow technicians to record actual execution dates and add technical comments

-- Add executed_at field to record actual execution date/time
ALTER TABLE mmi_os
ADD COLUMN IF NOT EXISTS executed_at timestamp with time zone;

-- Add technician_comment field for operational or technical notes
ALTER TABLE mmi_os
ADD COLUMN IF NOT EXISTS technician_comment text;

-- Add index on executed_at for faster filtering and reporting
CREATE INDEX IF NOT EXISTS idx_mmi_os_executed_at ON mmi_os(executed_at DESC);

-- Add comment to table for documentation
COMMENT ON COLUMN mmi_os.executed_at IS 'Actual date and time when the work was executed by the technician';
COMMENT ON COLUMN mmi_os.technician_comment IS 'Technical or operational comments added by the technician';
