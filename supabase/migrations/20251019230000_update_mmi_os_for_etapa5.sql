-- Update mmi_os table for Etapa 5 - Extended status values
-- Adds support for new status values: 'pendente', 'executado', 'atrasado'

-- Drop existing check constraint on status
ALTER TABLE public.mmi_os 
DROP CONSTRAINT IF EXISTS mmi_os_status_check;

-- Add new check constraint with extended status values
ALTER TABLE public.mmi_os 
ADD CONSTRAINT mmi_os_status_check 
CHECK (status IN (
  'open', 'in_progress', 'completed', 'cancelled',  -- Existing statuses
  'pendente', 'executado', 'atrasado'                -- New Etapa 5 statuses
));

-- Add descricao field if it doesn't exist (Portuguese description field)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mmi_os' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE public.mmi_os ADD COLUMN descricao TEXT;
  END IF;
END $$;

-- Update existing policy to allow all authenticated users to update
DROP POLICY IF EXISTS "Users can update their own mmi_os" ON mmi_os;

CREATE POLICY "Authenticated users can update mmi_os"
  ON mmi_os FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.mmi_os IS 'MMI Work Orders (Ordens de Serviço) with Etapa 5 status support';
