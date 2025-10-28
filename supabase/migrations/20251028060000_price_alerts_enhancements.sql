-- Add route and date fields to price_alerts table for travel price monitoring
ALTER TABLE public.price_alerts 
ADD COLUMN IF NOT EXISTS route TEXT,
ADD COLUMN IF NOT EXISTS travel_date DATE,
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly'));

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_price_alerts_route ON public.price_alerts(route);
CREATE INDEX IF NOT EXISTS idx_price_alerts_travel_date ON public.price_alerts(travel_date);

-- Add comment for documentation
COMMENT ON COLUMN public.price_alerts.route IS 'Travel route for the price alert (e.g., "São Paulo - Rio de Janeiro")';
COMMENT ON COLUMN public.price_alerts.travel_date IS 'Target travel date for the price alert';
COMMENT ON COLUMN public.price_alerts.notification_email IS 'Enable email notifications for this alert';
COMMENT ON COLUMN public.price_alerts.notification_push IS 'Enable push notifications for this alert';
COMMENT ON COLUMN public.price_alerts.notification_frequency IS 'Frequency of notifications: immediate, daily, or weekly';
