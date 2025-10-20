-- Update mmi_os status constraint for Etapa 5
-- Add 'executado' and 'atrasado' status values for simplified work order management

-- Drop existing status constraint
ALTER TABLE public.mmi_os 
DROP CONSTRAINT IF EXISTS mmi_os_status_check;

-- Add updated status constraint with new values for Etapa 5
ALTER TABLE public.mmi_os 
ADD CONSTRAINT mmi_os_status_check 
CHECK (status IN (
  'open', 'in_progress', 'completed', 'cancelled',  -- Existing statuses
  'pendente', 'executado', 'atrasado'                -- New statuses for Etapa 5
));

-- Add comment
COMMENT ON CONSTRAINT mmi_os_status_check ON public.mmi_os IS 'Work order status constraint - includes Etapa 5 simplified statuses';
