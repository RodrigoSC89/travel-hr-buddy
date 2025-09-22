-- Create price_alerts table
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  target_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  product_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE
);

-- Create price_history table
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_notifications table
CREATE TABLE public.price_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_id UUID NOT NULL REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for price_alerts
CREATE POLICY "Users can view their own price alerts" 
ON public.price_alerts 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own price alerts" 
ON public.price_alerts 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own price alerts" 
ON public.price_alerts 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own price alerts" 
ON public.price_alerts 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- RLS policies for price_history
CREATE POLICY "Users can view price history for their alerts" 
ON public.price_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.price_alerts 
  WHERE price_alerts.id = price_history.alert_id 
  AND price_alerts.user_id::text = auth.uid()::text
));

CREATE POLICY "Users can insert price history for their alerts" 
ON public.price_history 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.price_alerts 
  WHERE price_alerts.id = price_history.alert_id 
  AND price_alerts.user_id::text = auth.uid()::text
));

-- RLS policies for price_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.price_notifications 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" 
ON public.price_notifications 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can create notifications" 
ON public.price_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_is_active ON public.price_alerts(is_active);
CREATE INDEX idx_price_history_alert_id ON public.price_history(alert_id);
CREATE INDEX idx_price_notifications_user_id ON public.price_notifications(user_id);
CREATE INDEX idx_price_notifications_is_read ON public.price_notifications(is_read);