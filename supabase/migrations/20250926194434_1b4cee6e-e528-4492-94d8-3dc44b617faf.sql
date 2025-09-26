-- Create real-time notifications system
CREATE TABLE IF NOT EXISTS public.real_time_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, error, success
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  category TEXT NOT NULL DEFAULT 'general', -- general, fleet, crew, maintenance, emergency
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.real_time_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.real_time_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.real_time_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.real_time_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_real_time_notifications_updated_at
  BEFORE UPDATE ON public.real_time_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.real_time_notifications;

-- Create emergency alerts table
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL, -- fire, flooding, collision, medical, security, technical
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT,
  location JSONB, -- coordinates, port, etc.
  status TEXT NOT NULL DEFAULT 'active', -- active, acknowledged, resolved, false_alarm
  reported_by UUID REFERENCES auth.users(id),
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for emergency alerts
CREATE POLICY "Organization members can view emergency alerts" 
ON public.emergency_alerts 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Authenticated users can create emergency alerts" 
ON public.emergency_alerts 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organization members can update emergency alerts" 
ON public.emergency_alerts 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add trigger for emergency alerts
CREATE TRIGGER update_emergency_alerts_updated_at
  BEFORE UPDATE ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for emergency alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;