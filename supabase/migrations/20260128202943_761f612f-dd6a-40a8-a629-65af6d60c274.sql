-- =====================================================
-- NOTIFICATION SYSTEM SCHEMA
-- Nauti One v4.0 - Complete Notification Infrastructure
-- =====================================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('alert', 'reminder', 'info', 'urgent', 'marketing')),
  
  channels TEXT[] NOT NULL DEFAULT '{in_app}',
  
  email_subject TEXT,
  email_body_html TEXT,
  email_body_text TEXT,
  sms_body TEXT,
  
  variables JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'info',
  priority TEXT DEFAULT 'normal',
  
  resource_type TEXT,
  resource_id UUID,
  
  action_url TEXT,
  action_label TEXT,
  
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  
  alerts_enabled BOOLEAN DEFAULT true,
  reminders_enabled BOOLEAN DEFAULT true,
  info_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT false,
  
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'America/Sao_Paulo',
  
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push Subscriptions (for web push)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  device_type TEXT DEFAULT 'web',
  device_name TEXT,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Email Queue
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  to_email TEXT NOT NULL,
  to_name TEXT,
  from_email TEXT DEFAULT 'noreply@nautione.com',
  reply_to TEXT,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'bounced')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  
  priority TEXT DEFAULT 'normal',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled Notifications
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  template_name TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '{}',
  channels TEXT[] NOT NULL,
  
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON email_queue(created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_time ON scheduled_notifications(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active templates" ON notification_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Insert default templates
INSERT INTO notification_templates (name, title, message, category, channels, email_subject, priority) VALUES
('certificate-expiring', 'Certificado Expirando', 'Seu certificado {{certificate_type}} expira em {{days_remaining}} dias.', 'alert', '{in_app,email}', '⚠️ Certificado Expirando - {{certificate_type}}', 'high'),
('document-expired', 'Documento Expirado', 'O documento {{document_name}} expirou em {{expiry_date}}.', 'urgent', '{in_app,email,sms}', '🚨 Documento Expirado - {{document_name}}', 'urgent'),
('maintenance-due', 'Manutenção Programada', 'A manutenção {{maintenance_title}} está prevista para {{due_date}}.', 'reminder', '{in_app,email}', '🔧 Manutenção Programada - {{maintenance_title}}', 'normal'),
('crew-contract-expiring', 'Contrato Expirando', 'O contrato de {{crew_name}} expira em {{days_remaining}} dias.', 'alert', '{in_app,email}', '📋 Contrato Expirando - {{crew_name}}', 'high'),
('voyage-departure', 'Partida de Viagem', 'A embarcação {{vessel_name}} parte em {{hours_remaining}} horas.', 'info', '{in_app,push}', '🚢 Partida Programada - {{vessel_name}}', 'normal'),
('safety-alert', 'Alerta de Segurança', '{{alert_message}}', 'urgent', '{in_app,email,push,sms}', '🚨 ALERTA DE SEGURANÇA', 'urgent'),
('welcome', 'Bem-vindo ao Nauti One', 'Olá {{user_name}}, bem-vindo ao Nauti One!', 'info', '{in_app,email}', '🎉 Bem-vindo ao Nauti One!', 'normal')
ON CONFLICT (name) DO NOTHING;