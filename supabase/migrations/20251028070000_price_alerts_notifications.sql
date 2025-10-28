-- Function to check price alerts and create notifications
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_record RECORD;
  notification_message TEXT;
BEGIN
  -- Loop through all active alerts
  FOR alert_record IN 
    SELECT * FROM public.price_alerts 
    WHERE is_active = true 
    AND current_price IS NOT NULL
  LOOP
    -- Check if current price is at or below target price
    IF alert_record.current_price <= alert_record.target_price THEN
      -- Create notification message
      notification_message := format(
        'Price Alert: %s is now $%s (target: $%s). Save $%s!',
        alert_record.product_name,
        alert_record.current_price::TEXT,
        alert_record.target_price::TEXT,
        (alert_record.target_price - alert_record.current_price)::TEXT
      );
      
      -- Check if we haven't sent a notification recently (within last hour)
      IF NOT EXISTS (
        SELECT 1 FROM public.price_notifications
        WHERE alert_id = alert_record.id
        AND created_at > NOW() - INTERVAL '1 hour'
      ) THEN
        -- Insert notification
        INSERT INTO public.price_notifications (
          user_id,
          alert_id,
          message,
          is_read
        ) VALUES (
          alert_record.user_id,
          alert_record.id,
          notification_message,
          false
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Create a trigger function for price history updates
CREATE OR REPLACE FUNCTION notify_on_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_info RECORD;
  notification_message TEXT;
BEGIN
  -- Get alert information
  SELECT * INTO alert_info FROM public.price_alerts WHERE id = NEW.alert_id;
  
  -- Check if alert is active and price meets criteria
  IF alert_info.is_active AND NEW.price <= alert_info.target_price THEN
    notification_message := format(
      'Price dropped! %s is now $%s (target: $%s)',
      alert_info.product_name,
      NEW.price::TEXT,
      alert_info.target_price::TEXT
    );
    
    -- Insert notification
    INSERT INTO public.price_notifications (
      user_id,
      alert_id,
      message,
      is_read
    ) VALUES (
      alert_info.user_id,
      alert_info.id,
      notification_message,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on price_history table
DROP TRIGGER IF EXISTS trigger_notify_on_price_change ON public.price_history;
CREATE TRIGGER trigger_notify_on_price_change
  AFTER INSERT ON public.price_history
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_price_change();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_price_alerts() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_on_price_change() TO authenticated;

COMMENT ON FUNCTION check_price_alerts() IS 'Checks all active price alerts and creates notifications when target prices are reached';
COMMENT ON FUNCTION notify_on_price_change() IS 'Automatically creates notifications when new price history is added and price meets alert criteria';
