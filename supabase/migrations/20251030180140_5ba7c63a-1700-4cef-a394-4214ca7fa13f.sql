-- ============================================
-- SECURITY FIX: Remove Public Access from Critical Tables
-- ============================================

-- 1. PROFILES TABLE - Remove public access policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Keep only authenticated user policies for profiles
-- (Already exist from previous migration)

-- 2. DASHBOARD_ACTIVITIES - Remove public access
DROP POLICY IF EXISTS "Users can view all activities" ON public.dashboard_activities;

-- Create restricted policy - only authenticated users can view
CREATE POLICY "Authenticated users can view activities"
ON public.dashboard_activities
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create activities"
ON public.dashboard_activities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. DASHBOARD_METRICS - Remove public access
DROP POLICY IF EXISTS "Users can view department metrics" ON public.dashboard_metrics;

-- Create restricted policy - only authenticated users can view
CREATE POLICY "Authenticated users can view metrics"
ON public.dashboard_metrics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create metrics"
ON public.dashboard_metrics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. DASHBOARD_ALERTS - Remove remaining public policies
DROP POLICY IF EXISTS "Users can view relevant alerts" ON public.dashboard_alerts;
DROP POLICY IF EXISTS "Users can update their alert read status" ON public.dashboard_alerts;

-- Alerts policies are already secured from previous migration