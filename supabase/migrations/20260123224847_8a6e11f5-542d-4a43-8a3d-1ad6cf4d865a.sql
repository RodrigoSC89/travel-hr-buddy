-- Fix remaining RLS policy for contract_alert_logs
DROP POLICY IF EXISTS "Users can view alert logs" ON public.contract_alert_logs;
DROP POLICY IF EXISTS "Users can insert alert logs" ON public.contract_alert_logs;

CREATE POLICY "Users can view alert logs" ON public.contract_alert_logs
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert alert logs" ON public.contract_alert_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR current_setting('role') = 'service_role');