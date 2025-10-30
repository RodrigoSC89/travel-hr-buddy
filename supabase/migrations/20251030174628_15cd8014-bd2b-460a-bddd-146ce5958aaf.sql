-- ============================================
-- SECURITY FIX: Restrict Access to User Profiles
-- ============================================
-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate secure policies
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- SECURITY FIX: Restrict Access to Dashboard Alerts
-- ============================================
-- Drop all existing policies on dashboard_alerts
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Public can view alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Users can view own org alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Users can create org alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Users can update org alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Admins can delete alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Users can view own alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Users can create alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.dashboard_alerts;

-- Recreate secure policies based on user_id
CREATE POLICY "Users can view own alerts"
ON public.dashboard_alerts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create alerts"
ON public.dashboard_alerts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
ON public.dashboard_alerts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete alerts"
ON public.dashboard_alerts
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));