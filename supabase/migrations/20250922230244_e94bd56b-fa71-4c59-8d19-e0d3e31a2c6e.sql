-- Expandir funcionalidades dos alertas de preços
-- Adicionar campos para categorização e metadados dos produtos
ALTER TABLE price_alerts 
ADD COLUMN category TEXT,
ADD COLUMN image_url TEXT,
ADD COLUMN description TEXT,
ADD COLUMN store_name TEXT,
ADD COLUMN availability_status TEXT DEFAULT 'unknown',
ADD COLUMN check_frequency_minutes INTEGER DEFAULT 60,
ADD COLUMN discount_percentage NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN current_price IS NOT NULL AND current_price > 0 
    THEN ROUND(((target_price - current_price) / current_price) * 100, 2)
    ELSE 0 
  END
) STORED;

-- Criar tabela para estatísticas do usuário
CREATE TABLE user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_alerts INTEGER DEFAULT 0,
  active_alerts INTEGER DEFAULT 0,
  total_savings NUMERIC DEFAULT 0,
  alerts_triggered INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para compartilhamento de alertas
CREATE TABLE shared_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES price_alerts(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para avaliações de alertas compartilhados
CREATE TABLE alert_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_alert_id UUID NOT NULL REFERENCES shared_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(shared_alert_id, user_id)
);

-- Criar tabela para configurações de notificação
CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  price_drop_threshold NUMERIC DEFAULT 0,
  daily_summary BOOLEAN DEFAULT false,
  weekly_report BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_statistics
CREATE POLICY "Users can view their own statistics"
ON user_statistics FOR SELECT
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own statistics"
ON user_statistics FOR UPDATE
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own statistics"
ON user_statistics FOR INSERT
WITH CHECK (user_id::text = auth.uid()::text);

-- Políticas RLS para shared_alerts
CREATE POLICY "Anyone can view shared alerts"
ON shared_alerts FOR SELECT
USING (true);

CREATE POLICY "Users can create shared alerts for their own alerts"
ON shared_alerts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM price_alerts 
    WHERE price_alerts.id = shared_alerts.alert_id 
    AND price_alerts.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can update their own shared alerts"
ON shared_alerts FOR UPDATE
USING (shared_by::text = auth.uid()::text);

-- Políticas RLS para alert_votes
CREATE POLICY "Anyone can view alert votes"
ON alert_votes FOR SELECT
USING (true);

CREATE POLICY "Users can vote on shared alerts"
ON alert_votes FOR INSERT
WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own votes"
ON alert_votes FOR UPDATE
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own votes"
ON alert_votes FOR DELETE
USING (user_id::text = auth.uid()::text);

-- Políticas RLS para notification_settings
CREATE POLICY "Users can view their own notification settings"
ON notification_settings FOR SELECT
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own notification settings"
ON notification_settings FOR UPDATE
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own notification settings"
ON notification_settings FOR INSERT
WITH CHECK (user_id::text = auth.uid()::text);

-- Triggers para atualizar timestamps
CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON user_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estatísticas do usuário
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar ou inserir estatísticas
  INSERT INTO user_statistics (user_id, total_alerts, active_alerts)
  SELECT 
    NEW.user_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true)
  FROM price_alerts 
  WHERE user_id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_alerts = EXCLUDED.total_alerts,
    active_alerts = EXCLUDED.active_alerts,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estatísticas quando alertas são modificados
CREATE TRIGGER update_statistics_on_alert_change
  AFTER INSERT OR UPDATE OR DELETE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_user_statistics();

-- Índices para performance
CREATE INDEX idx_price_alerts_category ON price_alerts(category);
CREATE INDEX idx_price_alerts_store_name ON price_alerts(store_name);
CREATE INDEX idx_shared_alerts_upvotes ON shared_alerts(upvotes DESC);
CREATE INDEX idx_price_history_alert_checked ON price_history(alert_id, checked_at DESC);