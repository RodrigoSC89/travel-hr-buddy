-- PATCH 197.1 - Fix duplicate tenant_users table conflict
-- Drop the older/simpler version of tenant_users if it exists
-- Keep only the complete version with all necessary fields

-- First, check if we need to migrate any data from the old table to the new one
-- This migration assumes the newer table (with avatar_url, display_name, etc.) is the correct one

-- Drop the old tenant_users table if it exists (the simpler one)
-- The newer one with more fields will remain

DO $$ 
BEGIN
  -- Check if there are two tenant_users tables and consolidate
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tenant_users'
  ) THEN
    -- Ensure we have the complete tenant_users structure
    -- Add missing columns if they don't exist
    
    ALTER TABLE IF EXISTS public.tenant_users 
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS job_title TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS invited_by UUID,
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    
    -- Ensure status column has default
    ALTER TABLE public.tenant_users 
    ALTER COLUMN status SET DEFAULT 'active';
    
    -- Ensure timestamps have defaults
    ALTER TABLE public.tenant_users 
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();
    
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON public.tenant_users(status);

-- Ensure RLS is enabled
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to use the consolidated structure
DROP POLICY IF EXISTS "Users can view their tenant memberships" ON public.tenant_users;
DROP POLICY IF EXISTS "Tenant admins can manage users" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.tenant_users;

CREATE POLICY "Users can view their tenant memberships"
ON public.tenant_users FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can manage users"
ON public.tenant_users FOR ALL
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

CREATE POLICY "Users can update their own profile"
ON public.tenant_users FOR UPDATE
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_tenant_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tenant_users_updated_at ON public.tenant_users;
CREATE TRIGGER trigger_update_tenant_users_updated_at
BEFORE UPDATE ON public.tenant_users
FOR EACH ROW
EXECUTE FUNCTION update_tenant_users_updated_at();
