-- Fix infinite recursion: replace organization_users policies with non-recursive ones
-- Drop existing policies (safe to call even if missing)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organization_users'
  ) THEN
    DROP POLICY IF EXISTS "Organization admins can manage users" ON public.organization_users;
    DROP POLICY IF EXISTS "Users can view their own organization memberships" ON public.organization_users;
    DROP POLICY IF EXISTS "Users can join organizations if invited" ON public.organization_users;
    DROP POLICY IF EXISTS "View own memberships" ON public.organization_users;
    DROP POLICY IF EXISTS "Insert own membership" ON public.organization_users;
    DROP POLICY IF EXISTS "org_users_select_own_or_admin" ON public.organization_users;
    DROP POLICY IF EXISTS "org_users_insert_self_or_admin" ON public.organization_users;
    DROP POLICY IF EXISTS "org_users_update_admin_only" ON public.organization_users;
    DROP POLICY IF EXISTS "org_users_delete_admin_only" ON public.organization_users;
  END IF;
END $$;

-- Recreate minimal, non-recursive policies using global roles (user_roles)
CREATE POLICY "org_users_select_own_or_admin"
ON public.organization_users FOR SELECT
USING (
  user_id = auth.uid()
  OR public.get_user_role() IN ('admin','hr_manager')
);

CREATE POLICY "org_users_insert_self_or_admin"
ON public.organization_users FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.get_user_role() IN ('admin','hr_manager')
);

CREATE POLICY "org_users_update_admin_only"
ON public.organization_users FOR UPDATE
USING (
  public.get_user_role() IN ('admin','hr_manager')
);

CREATE POLICY "org_users_delete_admin_only"
ON public.organization_users FOR DELETE
USING (
  public.get_user_role() IN ('admin','hr_manager')
);
