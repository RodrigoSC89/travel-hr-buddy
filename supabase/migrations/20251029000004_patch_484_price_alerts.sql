-- PATCH 484: Finalizar Price Alerts UI
-- Complete price alerts system with notifications and historical tracking

-- Ensure price_alerts table exists with all necessary columns
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  current_price DECIMAL(10,2),
  target_price DECIMAL(10,2) NOT NULL,
  threshold_type TEXT CHECK (threshold_type IN ('below', 'above')) DEFAULT 'below',
  is_active BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  visual_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure price_history table exists
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for price alert notifications
CREATE TABLE IF NOT EXISTS public.price_alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('email', 'visual', 'push')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_is_active ON public.price_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_price_alerts_route ON public.price_alerts(route);

CREATE INDEX IF NOT EXISTS idx_price_history_alert_id ON public.price_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_price_history_checked_at ON public.price_history(checked_at);

CREATE INDEX IF NOT EXISTS idx_price_alert_notifications_alert_id ON public.price_alert_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_price_alert_notifications_user_id ON public.price_alert_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alert_notifications_read_at ON public.price_alert_notifications(read_at);

-- Add comments
COMMENT ON TABLE public.price_alerts IS 'PATCH 484: Price alert configurations with multiple notification channels';
COMMENT ON TABLE public.price_history IS 'PATCH 484: Historical price data for trend analysis';
COMMENT ON TABLE public.price_alert_notifications IS 'PATCH 484: Notification history for price alerts';

-- Grant permissions
GRANT ALL ON public.price_alerts TO authenticated;
GRANT ALL ON public.price_history TO authenticated;
GRANT ALL ON public.price_alert_notifications TO authenticated;

-- Function to check and trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TABLE (
  alert_id UUID,
  should_trigger BOOLEAN,
  current_price DECIMAL,
  target_price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    CASE 
      WHEN pa.threshold_type = 'below' THEN pa.current_price <= pa.target_price
      WHEN pa.threshold_type = 'above' THEN pa.current_price >= pa.target_price
      ELSE false
    END as should_trigger,
    pa.current_price,
    pa.target_price
  FROM public.price_alerts pa
  WHERE pa.is_active = true
    AND pa.current_price IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to record price check
CREATE OR REPLACE FUNCTION record_price_check(
  p_alert_id UUID,
  p_price DECIMAL,
  p_source TEXT DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  -- Insert price history
  INSERT INTO public.price_history (alert_id, price, source, checked_at)
  VALUES (p_alert_id, p_price, p_source, NOW())
  RETURNING id INTO v_history_id;
  
  -- Update alert with current price and last checked time
  UPDATE public.price_alerts
  SET 
    current_price = p_price,
    last_checked_at = NOW(),
    updated_at = NOW()
  WHERE id = p_alert_id;
  
  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;
