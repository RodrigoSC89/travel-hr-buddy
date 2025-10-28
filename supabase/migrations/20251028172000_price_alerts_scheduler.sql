-- PATCH 418: Price Alerts Scheduler Integration
-- Creates a function to check price alerts and trigger notifications

CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_record RECORD;
  price_change NUMERIC;
  should_notify BOOLEAN;
BEGIN
  -- Loop through active price alerts
  FOR alert_record IN 
    SELECT * FROM price_alerts 
    WHERE is_active = true
  LOOP
    should_notify := false;
    
    -- Check if current price has reached target
    IF alert_record.current_price IS NOT NULL AND alert_record.target_price IS NOT NULL THEN
      price_change := alert_record.current_price - alert_record.target_price;
      
      -- Determine if we should notify based on alert type
      CASE alert_record.alert_type
        WHEN 'price_drop' THEN
          should_notify := alert_record.current_price <= alert_record.target_price;
        WHEN 'price_rise' THEN
          should_notify := alert_record.current_price >= alert_record.target_price;
        WHEN 'any_change' THEN
          should_notify := ABS(price_change) >= (alert_record.target_price * 0.05); -- 5% change
        ELSE
          should_notify := false;
      END CASE;
      
      -- Create notification if needed
      IF should_notify THEN
        INSERT INTO price_notifications (
          alert_id,
          notification_type,
          message,
          metadata
        ) VALUES (
          alert_record.id,
          'price_alert_triggered',
          format('Price alert triggered for %s: Current price $%s reached target $%s', 
                 alert_record.item_name, 
                 alert_record.current_price, 
                 alert_record.target_price),
          jsonb_build_object(
            'current_price', alert_record.current_price,
            'target_price', alert_record.target_price,
            'alert_type', alert_record.alert_type,
            'triggered_at', NOW()
          )
        );
        
        -- Update alert triggered count
        UPDATE price_alerts
        SET 
          last_triggered_at = NOW(),
          triggered_count = COALESCE(triggered_count, 0) + 1
        WHERE id = alert_record.id;
        
        -- Optionally deactivate one-time alerts
        IF alert_record.frequency = 'once' THEN
          UPDATE price_alerts
          SET is_active = false
          WHERE id = alert_record.id;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Add columns to track alert triggering
ALTER TABLE price_alerts 
  ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS triggered_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'realtime'));

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_price_alerts() TO authenticated;

COMMENT ON FUNCTION check_price_alerts() IS 'PATCH 418: Checks price alerts and creates notifications when conditions are met';
