-- =====================================================
-- PATCH 364 - Integrations Hub OAuth & Plugins
-- Objetivo: Sistema de integrações de terceiros com autenticação segura
-- =====================================================

-- =====================================================
-- Integration System
-- =====================================================

-- Create integration_providers table
CREATE TABLE IF NOT EXISTS public.integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('oauth2', 'api_key', 'webhook', 'plugin')),
  auth_url TEXT,
  token_url TEXT,
  scopes TEXT[],
  icon_url TEXT,
  documentation_url TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_integrations table
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.integration_providers(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  account_info JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Create integration_logs table
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.user_integrations(id) ON DELETE CASCADE NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('sync', 'auth', 'error', 'webhook', 'api_call')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending', 'retry')),
  message TEXT,
  request_data JSONB,
  response_data JSONB,
  error_details JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.user_integrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  headers JSONB DEFAULT '{}'::jsonb,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhook_deliveries table
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create plugins table
CREATE TABLE IF NOT EXISTS public.plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  author TEXT,
  entry_point TEXT NOT NULL, -- JavaScript/TypeScript entry file
  capabilities TEXT[], -- List of capabilities/hooks
  config_schema JSONB, -- JSON Schema for plugin configuration
  is_active BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  install_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_plugins table
CREATE TABLE IF NOT EXISTS public.user_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plugin_id UUID REFERENCES public.plugins(id) ON DELETE CASCADE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}'::jsonb,
  installed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plugin_id)
);

-- Create oauth_states table for CSRF protection
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.integration_providers(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL UNIQUE,
  redirect_uri TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integration_providers_is_active ON public.integration_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider_id ON public.user_integrations(provider_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON public.integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_integration_id ON public.webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_plugins_is_active ON public.plugins(is_active);
CREATE INDEX IF NOT EXISTS idx_user_plugins_user_id ON public.user_plugins(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);

-- Enable RLS
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active providers"
  ON public.integration_providers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage providers"
  ON public.integration_providers
  FOR ALL
  USING (get_user_role() IN ('admin'));

CREATE POLICY "Users can manage their integrations"
  ON public.user_integrations
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their integration logs"
  ON public.integration_logs
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.user_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert integration logs"
  ON public.integration_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can manage their webhooks"
  ON public.webhooks
  FOR ALL
  USING (
    integration_id IN (
      SELECT id FROM public.user_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their webhook deliveries"
  ON public.webhook_deliveries
  FOR SELECT
  USING (
    webhook_id IN (
      SELECT w.id FROM public.webhooks w
      JOIN public.user_integrations ui ON w.integration_id = ui.id
      WHERE ui.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view active plugins"
  ON public.plugins
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plugins"
  ON public.plugins
  FOR ALL
  USING (get_user_role() IN ('admin'));

CREATE POLICY "Users can manage their plugin installations"
  ON public.user_plugins
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their OAuth states"
  ON public.oauth_states
  FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- Functions for Integrations
-- =====================================================

-- Function to create OAuth state
CREATE OR REPLACE FUNCTION public.create_oauth_state(
  p_provider_id UUID,
  p_redirect_uri TEXT DEFAULT NULL
)
RETURNS TABLE (
  state TEXT,
  auth_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_state TEXT;
  provider_auth_url TEXT;
  provider_name TEXT;
BEGIN
  -- Generate random state
  new_state := encode(gen_random_bytes(32), 'base64');
  
  -- Get provider auth URL
  SELECT ip.auth_url, ip.name INTO provider_auth_url, provider_name
  FROM public.integration_providers ip
  WHERE ip.id = p_provider_id AND ip.is_active = true;
  
  IF provider_auth_url IS NULL THEN
    RAISE EXCEPTION 'Provider not found or inactive';
  END IF;
  
  -- Store state
  INSERT INTO public.oauth_states (
    user_id,
    provider_id,
    state,
    redirect_uri,
    expires_at
  )
  VALUES (
    auth.uid(),
    p_provider_id,
    new_state,
    p_redirect_uri,
    now() + INTERVAL '10 minutes'
  );
  
  RETURN QUERY SELECT new_state, provider_auth_url;
END;
$$;

-- Function to verify OAuth state
CREATE OR REPLACE FUNCTION public.verify_oauth_state(
  p_state TEXT
)
RETURNS TABLE (
  user_id UUID,
  provider_id UUID,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  state_record RECORD;
BEGIN
  SELECT 
    os.user_id,
    os.provider_id,
    (os.expires_at > now() AND NOT os.used) AS is_valid
  INTO state_record
  FROM public.oauth_states os
  WHERE os.state = p_state;
  
  IF state_record.is_valid THEN
    -- Mark state as used
    UPDATE public.oauth_states
    SET used = true
    WHERE state = p_state;
  END IF;
  
  RETURN QUERY SELECT state_record.user_id, state_record.provider_id, state_record.is_valid;
END;
$$;

-- Function to activate integration
CREATE OR REPLACE FUNCTION public.activate_integration(
  p_provider_id UUID,
  p_access_token TEXT,
  p_refresh_token TEXT DEFAULT NULL,
  p_token_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_account_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  integration_id UUID;
BEGIN
  INSERT INTO public.user_integrations (
    user_id,
    provider_id,
    is_active,
    access_token,
    refresh_token,
    token_expires_at,
    account_info
  )
  VALUES (
    auth.uid(),
    p_provider_id,
    true,
    p_access_token,
    p_refresh_token,
    p_token_expires_at,
    p_account_info
  )
  ON CONFLICT (user_id, provider_id)
  DO UPDATE SET
    is_active = true,
    access_token = p_access_token,
    refresh_token = p_refresh_token,
    token_expires_at = p_token_expires_at,
    account_info = p_account_info,
    updated_at = now()
  RETURNING id INTO integration_id;
  
  -- Log activation
  INSERT INTO public.integration_logs (
    integration_id,
    log_type,
    status,
    message
  )
  VALUES (
    integration_id,
    'auth',
    'success',
    'Integration activated'
  );
  
  RETURN integration_id;
END;
$$;

-- Function to deactivate integration
CREATE OR REPLACE FUNCTION public.deactivate_integration(
  p_integration_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_integrations
  SET 
    is_active = false,
    updated_at = now()
  WHERE id = p_integration_id AND user_id = auth.uid();
  
  IF FOUND THEN
    -- Log deactivation
    INSERT INTO public.integration_logs (
      integration_id,
      log_type,
      status,
      message
    )
    VALUES (
      p_integration_id,
      'auth',
      'success',
      'Integration deactivated'
    );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to log integration activity
CREATE OR REPLACE FUNCTION public.log_integration_activity(
  p_integration_id UUID,
  p_log_type TEXT,
  p_status TEXT,
  p_message TEXT DEFAULT NULL,
  p_request_data JSONB DEFAULT NULL,
  p_response_data JSONB DEFAULT NULL,
  p_error_details JSONB DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.integration_logs (
    integration_id,
    log_type,
    status,
    message,
    request_data,
    response_data,
    error_details,
    duration_ms
  )
  VALUES (
    p_integration_id,
    p_log_type,
    p_status,
    p_message,
    p_request_data,
    p_response_data,
    p_error_details,
    p_duration_ms
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to trigger webhook
CREATE OR REPLACE FUNCTION public.trigger_webhook(
  p_webhook_id UUID,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  delivery_id UUID;
BEGIN
  INSERT INTO public.webhook_deliveries (
    webhook_id,
    event_type,
    payload,
    status
  )
  VALUES (
    p_webhook_id,
    p_event_type,
    p_payload,
    'pending'
  )
  RETURNING id INTO delivery_id;
  
  -- Update last triggered time
  UPDATE public.webhooks
  SET last_triggered_at = now()
  WHERE id = p_webhook_id;
  
  -- Notify webhook processor
  PERFORM pg_notify(
    'webhook_delivery',
    json_build_object(
      'delivery_id', delivery_id,
      'webhook_id', p_webhook_id
    )::text
  );
  
  RETURN delivery_id;
END;
$$;

-- Function to install plugin
CREATE OR REPLACE FUNCTION public.install_plugin(
  p_plugin_id UUID,
  p_configuration JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  installation_id UUID;
BEGIN
  INSERT INTO public.user_plugins (
    user_id,
    plugin_id,
    is_enabled,
    configuration
  )
  VALUES (
    auth.uid(),
    p_plugin_id,
    true,
    p_configuration
  )
  ON CONFLICT (user_id, plugin_id)
  DO UPDATE SET
    is_enabled = true,
    configuration = p_configuration,
    updated_at = now()
  RETURNING id INTO installation_id;
  
  -- Update install count
  UPDATE public.plugins
  SET install_count = install_count + 1
  WHERE id = p_plugin_id;
  
  RETURN installation_id;
END;
$$;

-- =====================================================
-- Default Integration Providers
-- =====================================================

-- Insert default integration providers
INSERT INTO public.integration_providers (name, display_name, description, provider_type, is_active)
VALUES
  ('google', 'Google', 'Connect with Google services', 'oauth2', true),
  ('zapier', 'Zapier', 'Automate workflows with Zapier', 'webhook', true),
  ('slack', 'Slack', 'Send notifications to Slack', 'oauth2', true),
  ('microsoft', 'Microsoft 365', 'Connect with Microsoft services', 'oauth2', true),
  ('github', 'GitHub', 'Integrate with GitHub repositories', 'oauth2', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.integration_providers IS 'Available third-party integration providers';
COMMENT ON TABLE public.user_integrations IS 'User-activated integrations with access tokens';
COMMENT ON TABLE public.integration_logs IS 'Audit logs for all integration activities';
COMMENT ON TABLE public.webhooks IS 'Configured webhooks for event notifications';
COMMENT ON TABLE public.webhook_deliveries IS 'Webhook delivery attempts and status';
COMMENT ON TABLE public.plugins IS 'Available plugins for extending system functionality';
COMMENT ON TABLE public.user_plugins IS 'User-installed and configured plugins';
COMMENT ON FUNCTION public.create_oauth_state IS 'Creates OAuth state for secure authorization flow';
COMMENT ON FUNCTION public.activate_integration IS 'Activates an integration with OAuth tokens';
COMMENT ON FUNCTION public.trigger_webhook IS 'Triggers a webhook delivery';
