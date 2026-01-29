-- Add missing columns to communication_channels table
ALTER TABLE public.communication_channels 
ADD COLUMN IF NOT EXISTS channel_type text DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS participants jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_activity timestamptz DEFAULT now();

-- Update communication_channels updated_at trigger
CREATE OR REPLACE FUNCTION public.update_communication_channels_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.last_activity = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS update_communication_channels_updated_at ON public.communication_channels;
CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON public.communication_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_communication_channels_updated_at();