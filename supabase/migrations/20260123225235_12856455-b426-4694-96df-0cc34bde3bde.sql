-- FIX CRITICAL RLS POLICIES (Audit Report Section 4.2)
-- Using valid enum values: admin, hr_manager, manager, auditor

-- 1. Fix system_logs policy - restrict to admin only (policy already dropped)
CREATE POLICY "admin_read_system_logs" ON public.system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Fix access_logs policy - users see own, admins see all (policy already dropped)
CREATE POLICY "admin_or_own_access_logs" ON public.access_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Ensure ai_audit_logs is properly secured (policy already dropped)
CREATE POLICY "users_view_own_ai_audit_logs" ON public.ai_audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'hr_manager')
    )
  );