-- Corrigir problema de segurança: remover trigger e função, depois recriar
DROP TRIGGER IF EXISTS update_statistics_on_alert_change ON price_alerts;
DROP FUNCTION IF EXISTS update_user_statistics() CASCADE;

CREATE OR REPLACE FUNCTION public.update_user_statistics()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Atualizar ou inserir estatísticas do usuário
  INSERT INTO user_statistics (user_id, total_alerts, active_alerts)
  SELECT 
    COALESCE(NEW.user_id, OLD.user_id),
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true)
  FROM price_alerts 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  ON CONFLICT (user_id) DO UPDATE SET
    total_alerts = EXCLUDED.total_alerts,
    active_alerts = EXCLUDED.active_alerts,
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recriar o trigger
CREATE TRIGGER update_statistics_on_alert_change
  AFTER INSERT OR UPDATE OR DELETE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_user_statistics();