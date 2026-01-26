-- ============================================================================
-- MIGRATION: Fix RLS Permissive Policies
-- Purpose: Replace 'USING (true)' with proper organization-based restrictions
-- ============================================================================

-- 1. Fix weather_logs policies
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated insert weather logs" ON public.weather_logs;

-- Replace with organization-based policy (weather logs are cache, allow but log org)
CREATE POLICY "Users can insert weather logs"
  ON public.weather_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 2. Fix analytics_alert_history policy
-- ============================================================================
DROP POLICY IF EXISTS "System can insert alert history" ON public.analytics_alert_history;

CREATE POLICY "Users can insert to own org alert history"
  ON public.analytics_alert_history FOR INSERT
  TO authenticated
  WITH CHECK (
    alert_id IN (
      SELECT id FROM public.analytics_alerts 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- 3. Fix analytics_sessions policies
-- ============================================================================
DROP POLICY IF EXISTS "Allow session creation" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow session updates" ON public.analytics_sessions;

CREATE POLICY "Users can create own sessions"
  ON public.analytics_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

CREATE POLICY "Users can update own sessions"
  ON public.analytics_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);