-- Fix RLS policies for alert_rules - make them more secure
DROP POLICY IF EXISTS "Users can view alert rules" ON public.alert_rules;
DROP POLICY IF EXISTS "Users can manage alert rules" ON public.alert_rules;

CREATE POLICY "Users can view their org alert rules" ON public.alert_rules
  FOR SELECT USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert alert rules" ON public.alert_rules
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their org alert rules" ON public.alert_rules
  FOR UPDATE USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their org alert rules" ON public.alert_rules
  FOR DELETE USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

-- Fix RLS policies for ai_predictions
DROP POLICY IF EXISTS "Users can view predictions" ON public.ai_predictions;
DROP POLICY IF EXISTS "Users can manage predictions" ON public.ai_predictions;

CREATE POLICY "Users can view their org predictions" ON public.ai_predictions
  FOR SELECT USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert predictions" ON public.ai_predictions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);