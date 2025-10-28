-- =====================================================
-- PATCH 361 - User Management RBAC Complete
-- Objetivo: Sistema completo de gerenciamento de usuários com RBAC
-- =====================================================

-- =====================================================
-- User Groups Management
-- =====================================================

-- Create user_groups table
CREATE TABLE IF NOT EXISTS public.user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create group_permissions table for inherited permissions
CREATE TABLE IF NOT EXISTS public.group_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE NOT NULL,
  permission_name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_manage BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, permission_name, resource_type)
);

-- Create user_group_members table
CREATE TABLE IF NOT EXISTS public.user_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, group_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_groups_name ON public.user_groups(name);
CREATE INDEX IF NOT EXISTS idx_user_groups_is_active ON public.user_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_group_permissions_group_id ON public.group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_user_id ON public.user_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_group_id ON public.user_group_members(group_id);

-- Enable RLS
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active groups"
  ON public.user_groups
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage groups"
  ON public.user_groups
  FOR ALL
  USING (get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Everyone can view group permissions"
  ON public.group_permissions
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage group permissions"
  ON public.group_permissions
  FOR ALL
  USING (get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Users can view their group memberships"
  ON public.user_group_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('admin', 'hr_manager')
  );

CREATE POLICY "Admins can manage group memberships"
  ON public.user_group_members
  FOR ALL
  USING (get_user_role() IN ('admin', 'hr_manager'));

-- =====================================================
-- Role Change Audit Logging
-- =====================================================

-- Create role_audit_logs table
CREATE TABLE IF NOT EXISTS public.role_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_user_id ON public.role_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_created_at ON public.role_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_changed_by ON public.role_audit_logs(changed_by);

-- Enable RLS
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own role changes"
  ON public.role_audit_logs
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('admin', 'hr_manager', 'auditor')
  );

CREATE POLICY "System can insert role audit logs"
  ON public.role_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Functions for RBAC Management
-- =====================================================

-- Function to get user permissions including group permissions
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  permission_name TEXT,
  resource_type TEXT,
  can_read BOOLEAN,
  can_write BOOLEAN,
  can_delete BOOLEAN,
  can_manage BOOLEAN,
  source TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Get direct role permissions
  RETURN QUERY
  SELECT 
    rp.permission_name,
    'system'::TEXT AS resource_type,
    rp.can_read,
    rp.can_write,
    rp.can_delete,
    rp.can_manage,
    'role'::TEXT AS source
  FROM public.role_permissions rp
  JOIN public.user_roles ur ON ur.role = rp.role
  WHERE ur.user_id = p_user_id;
  
  -- Get group permissions
  RETURN QUERY
  SELECT 
    gp.permission_name,
    gp.resource_type,
    gp.can_read,
    gp.can_write,
    gp.can_delete,
    gp.can_manage,
    'group'::TEXT AS source
  FROM public.group_permissions gp
  JOIN public.user_group_members ugm ON ugm.group_id = gp.group_id
  WHERE ugm.user_id = p_user_id AND ugm.is_active = true;
END;
$$;

-- Function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_audit_logs (
      user_id,
      old_role,
      new_role,
      changed_by,
      metadata
    )
    VALUES (
      NEW.user_id,
      OLD.role::TEXT,
      NEW.role::TEXT,
      auth.uid(),
      jsonb_build_object(
        'timestamp', now(),
        'table', TG_TABLE_NAME
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS trigger_log_role_change ON public.user_roles;
CREATE TRIGGER trigger_log_role_change
  AFTER UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- Function to add user to group
CREATE OR REPLACE FUNCTION public.add_user_to_group(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  membership_id UUID;
BEGIN
  -- Check if user has permission to manage groups
  IF NOT (get_user_role() IN ('admin', 'hr_manager')) THEN
    RAISE EXCEPTION 'Insufficient permissions to add users to groups';
  END IF;
  
  INSERT INTO public.user_group_members (
    user_id,
    group_id,
    assigned_by
  )
  VALUES (
    p_user_id,
    p_group_id,
    auth.uid()
  )
  ON CONFLICT (user_id, group_id) 
  DO UPDATE SET is_active = true, assigned_at = now()
  RETURNING id INTO membership_id;
  
  -- Log the action
  PERFORM public.log_user_action(
    'add_user_to_group',
    'user_group_members',
    membership_id,
    'success',
    jsonb_build_object('user_id', p_user_id, 'group_id', p_group_id)
  );
  
  RETURN membership_id;
END;
$$;

-- Function to remove user from group
CREATE OR REPLACE FUNCTION public.remove_user_from_group(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has permission to manage groups
  IF NOT (get_user_role() IN ('admin', 'hr_manager')) THEN
    RAISE EXCEPTION 'Insufficient permissions to remove users from groups';
  END IF;
  
  UPDATE public.user_group_members
  SET is_active = false
  WHERE user_id = p_user_id AND group_id = p_group_id;
  
  -- Log the action
  PERFORM public.log_user_action(
    'remove_user_from_group',
    'user_group_members',
    NULL,
    'success',
    jsonb_build_object('user_id', p_user_id, 'group_id', p_group_id)
  );
  
  RETURN true;
END;
$$;

-- Function to check if user has permission (including group permissions)
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_permission_name TEXT,
  p_resource_type TEXT DEFAULT 'system',
  p_permission_type TEXT DEFAULT 'read',
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  has_perm BOOLEAN := false;
  user_current_role TEXT;
BEGIN
  -- Get user role
  SELECT role::TEXT INTO user_current_role
  FROM public.user_roles
  WHERE user_id = p_user_id;
  
  -- Admin always has permission
  IF user_current_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check role permissions
  SELECT 
    CASE p_permission_type
      WHEN 'read' THEN rp.can_read
      WHEN 'write' THEN rp.can_write
      WHEN 'delete' THEN rp.can_delete
      WHEN 'manage' THEN rp.can_manage
      ELSE false
    END INTO has_perm
  FROM public.role_permissions rp
  WHERE rp.role = user_current_role::public.user_role
    AND rp.permission_name = p_permission_name;
  
  IF has_perm THEN
    RETURN true;
  END IF;
  
  -- Check group permissions
  SELECT 
    CASE p_permission_type
      WHEN 'read' THEN bool_or(gp.can_read)
      WHEN 'write' THEN bool_or(gp.can_write)
      WHEN 'delete' THEN bool_or(gp.can_delete)
      WHEN 'manage' THEN bool_or(gp.can_manage)
      ELSE false
    END INTO has_perm
  FROM public.group_permissions gp
  JOIN public.user_group_members ugm ON ugm.group_id = gp.group_id
  WHERE ugm.user_id = p_user_id
    AND ugm.is_active = true
    AND gp.permission_name = p_permission_name
    AND gp.resource_type = p_resource_type;
  
  RETURN COALESCE(has_perm, false);
END;
$$;

-- =====================================================
-- Default User Groups
-- =====================================================

-- Insert default user groups
INSERT INTO public.user_groups (name, description, is_active)
VALUES
  ('Fleet Managers', 'Users who manage fleet operations', true),
  ('Document Editors', 'Users who can create and edit documents', true),
  ('Analytics Viewers', 'Users who can view analytics dashboards', true),
  ('System Administrators', 'Full system administrative access', true),
  ('Auditors', 'Users who can audit system activities', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.user_groups IS 'User groups for organizing users with shared permissions';
COMMENT ON TABLE public.group_permissions IS 'Permissions inherited by all members of a group';
COMMENT ON TABLE public.user_group_members IS 'Membership records linking users to groups';
COMMENT ON TABLE public.role_audit_logs IS 'Audit trail for all role changes';
COMMENT ON FUNCTION public.get_user_effective_permissions IS 'Returns all permissions for a user including group permissions';
COMMENT ON FUNCTION public.add_user_to_group IS 'Adds a user to a group with audit logging';
COMMENT ON FUNCTION public.remove_user_from_group IS 'Removes a user from a group with audit logging';
COMMENT ON FUNCTION public.user_has_permission IS 'Checks if user has a specific permission including group permissions';
