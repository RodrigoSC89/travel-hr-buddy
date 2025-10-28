-- Enhanced price alert notification trigger with email/push integration

-- Update the notify_on_price_change function to call the edge function
CREATE OR REPLACE FUNCTION notify_on_price_change_enhanced()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_info RECORD;
  notification_message TEXT;
  notification_type TEXT;
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
    
    -- Insert notification in database
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

    -- Determine notification type based on user preferences
    IF alert_info.notification_email AND alert_info.notification_push THEN
      notification_type := 'both';
    ELSIF alert_info.notification_email THEN
      notification_type := 'email';
    ELSIF alert_info.notification_push THEN
      notification_type := 'push';
    ELSE
      notification_type := 'both'; -- Default to both if neither is explicitly set
    END IF;

    -- Call edge function to send email/push notifications (async, don't wait for result)
    -- This uses pg_net extension if available, or stores in a queue table for processing
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-price-alert-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'alert_id', alert_info.id,
        'user_id', alert_info.user_id,
        'product_name', alert_info.product_name,
        'current_price', NEW.price,
        'target_price', alert_info.target_price,
        'product_url', alert_info.product_url,
        'notification_type', notification_type
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in notify_on_price_change_enhanced: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Alternative simpler version without pg_net (stores in queue table instead)
CREATE TABLE IF NOT EXISTS public.price_alert_notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  target_price DECIMAL(10,2) NOT NULL,
  product_url TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.price_alert_notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only
CREATE POLICY "Service role can manage notification queue"
ON public.price_alert_notification_queue
FOR ALL
TO service_role
USING (true);

-- Simpler trigger function that uses queue table
CREATE OR REPLACE FUNCTION notify_on_price_change_with_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_info RECORD;
  notification_message TEXT;
  notification_type TEXT;
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
    
    -- Insert notification in database
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

    -- Determine notification type based on user preferences
    IF alert_info.notification_email AND alert_info.notification_push THEN
      notification_type := 'both';
    ELSIF alert_info.notification_email THEN
      notification_type := 'email';
    ELSIF alert_info.notification_push THEN
      notification_type := 'push';
    ELSE
      notification_type := 'both'; -- Default to both
    END IF;

    -- Queue notification for async processing
    INSERT INTO public.price_alert_notification_queue (
      alert_id,
      user_id,
      product_name,
      current_price,
      target_price,
      product_url,
      notification_type
    ) VALUES (
      alert_info.id,
      alert_info.user_id,
      alert_info.product_name,
      NEW.price,
      alert_info.target_price,
      alert_info.product_url,
      notification_type
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Replace the existing trigger with the queue-based version
DROP TRIGGER IF EXISTS trigger_notify_on_price_change ON public.price_history;
CREATE TRIGGER trigger_notify_on_price_change
  AFTER INSERT ON public.price_history
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_price_change_with_queue();

-- Grant permissions
GRANT EXECUTE ON FUNCTION notify_on_price_change_with_queue() TO authenticated;

COMMENT ON FUNCTION notify_on_price_change_with_queue() IS 'Queues email/push notifications when price alerts are triggered';
COMMENT ON TABLE public.price_alert_notification_queue IS 'Queue for processing email and push notifications for price alerts';
