-- Fix RLS policies with proper authentication checks

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can insert wellbeing logs" ON public.crew_wellbeing_logs;
DROP POLICY IF EXISTS "Users can update wellbeing logs" ON public.crew_wellbeing_logs;
DROP POLICY IF EXISTS "Users can insert weather alerts" ON public.weather_alerts;
DROP POLICY IF EXISTS "Users can update weather alerts" ON public.weather_alerts;

-- Create proper authenticated policies
CREATE POLICY "Authenticated users can insert wellbeing logs" ON public.crew_wellbeing_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update wellbeing logs" ON public.crew_wellbeing_logs
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert weather alerts" ON public.weather_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update weather alerts" ON public.weather_alerts
  FOR UPDATE USING (auth.uid() IS NOT NULL);