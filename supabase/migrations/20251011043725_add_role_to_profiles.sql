-- Add role column to profiles table for simplified role checking
-- This allows querying role directly from profiles instead of joining with user_roles

DO $$ 
BEGIN
  -- Check if the column doesn't exist before adding it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'employee';
  END IF;
END $$;

-- Create function to sync role from user_roles to profiles
CREATE OR REPLACE FUNCTION sync_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET role = NEW.role::TEXT
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep profiles.role in sync with user_roles.role
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON public.user_roles;
CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OF role ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_role();

-- Populate existing profiles with roles from user_roles
UPDATE public.profiles p
SET role = ur.role::TEXT
FROM public.user_roles ur
WHERE p.id = ur.user_id;

-- Set default role for profiles without user_roles entry
UPDATE public.profiles
SET role = 'employee'
WHERE role IS NULL;
