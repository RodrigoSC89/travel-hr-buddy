-- ============================================
-- PRE-DEPLOYMENT FIX: Infinite Recursion in RLS Policies
-- Fixes: tenant_users, conversation_participants, channel_members
-- ============================================

-- Step 1: Create SECURITY DEFINER helper functions

-- Function to check if user is member of a channel (non-recursive)
CREATE OR REPLACE FUNCTION public.is_channel_member(_user_id uuid, _channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members
    WHERE user_id = _user_id AND channel_id = _channel_id
  )
$$;

-- Function to check if user participates in conversation (non-recursive)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id 
    AND conversation_id = _conversation_id 
    AND is_active = true
  )
$$;

-- Function to check if user is tenant admin (non-recursive)
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_users
    WHERE user_id = _user_id 
    AND tenant_id = _tenant_id
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
$$;

-- Function to get user's tenant IDs (non-recursive)
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.tenant_users
  WHERE user_id = _user_id AND status = 'active'
$$;

-- Step 2: Drop problematic recursive policies

-- Drop channel_members recursive policy
DROP POLICY IF EXISTS "Users can view channel members of their channels" ON public.channel_members;
DROP POLICY IF EXISTS "Members can view channel membership" ON public.channel_members;

-- Drop conversation_participants recursive policy
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

-- Drop tenant_users recursive policies
DROP POLICY IF EXISTS "Tenant admins can manage users" ON public.tenant_users;
DROP POLICY IF EXISTS "Tenant owners and admins can manage users" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can view users from their tenants" ON public.tenant_users;

-- Step 3: Create non-recursive replacement policies

-- channel_members: Use SECURITY DEFINER function
CREATE POLICY "channel_members_select_v2"
ON public.channel_members FOR SELECT
USING (
  user_id = auth.uid() OR 
  public.is_channel_member(auth.uid(), channel_id)
);

-- conversation_participants: Use SECURITY DEFINER function
CREATE POLICY "conversation_participants_select_v2"
ON public.conversation_participants FOR SELECT
USING (
  user_id = auth.uid() OR
  public.is_conversation_participant(auth.uid(), conversation_id)
);

-- tenant_users: Use SECURITY DEFINER function for admin access
CREATE POLICY "tenant_users_admin_manage_v2"
ON public.tenant_users FOR ALL
USING (
  user_id = auth.uid() OR
  public.is_tenant_admin(auth.uid(), tenant_id)
)
WITH CHECK (
  user_id = auth.uid() OR
  public.is_tenant_admin(auth.uid(), tenant_id)
);

-- tenant_users: View users from same tenant (non-recursive)
CREATE POLICY "tenant_users_view_same_tenant_v2"
ON public.tenant_users FOR SELECT
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
);