-- ============================================
-- PATCH 100.0 - API Gateway Tables
-- Criar tabelas necessárias para API Gateway funcional
-- ============================================

-- 1. API Keys (gerenciamento de chaves)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  tier TEXT DEFAULT 'free',
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  allowed_endpoints TEXT[] DEFAULT '{}',
  allowed_ips TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON public.api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON public.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their API keys"
ON public.api_keys FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Org admins can view org API keys"
ON public.api_keys FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- 2. API Gateway Requests (logs de requisições)
CREATE TABLE IF NOT EXISTS public.api_gateway_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size INTEGER,
  response_size INTEGER,
  user_agent TEXT,
  ip_address INET,
  error_message TEXT,
  request_headers JSONB,
  response_headers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_key ON public.api_gateway_requests(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_org ON public.api_gateway_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_endpoint ON public.api_gateway_requests(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_status ON public.api_gateway_requests(status_code);
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_created ON public.api_gateway_requests(created_at DESC);

-- Particionamento por data (opcional, para performance)
-- CREATE TABLE api_gateway_requests_2025_01 PARTITION OF api_gateway_requests
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- RLS
ALTER TABLE public.api_gateway_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their API requests"
ON public.api_gateway_requests FOR SELECT
USING (
  api_key_id IN (
    SELECT id FROM public.api_keys
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Org admins can view org API requests"
ON public.api_gateway_requests FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

CREATE POLICY "System can insert requests"
ON public.api_gateway_requests FOR INSERT
WITH CHECK (true);

-- 3. API Gateway Webhooks (gerenciamento de webhooks)
CREATE TABLE IF NOT EXISTS public.api_gateway_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  webhook_name TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  headers JSONB DEFAULT '{}',
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_gateway_webhooks_user ON public.api_gateway_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_api_gateway_webhooks_org ON public.api_gateway_webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_gateway_webhooks_active ON public.api_gateway_webhooks(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE public.api_gateway_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their webhooks"
ON public.api_gateway_webhooks FOR ALL
USING (user_id = auth.uid());

-- 4. API Gateway Webhook Deliveries (logs de entregas)
CREATE TABLE IF NOT EXISTS public.api_gateway_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.api_gateway_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON public.api_gateway_webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON public.api_gateway_webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON public.api_gateway_webhook_deliveries(created_at DESC);

-- RLS
ALTER TABLE public.api_gateway_webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their webhook deliveries"
ON public.api_gateway_webhook_deliveries FOR SELECT
USING (
  webhook_id IN (
    SELECT id FROM public.api_gateway_webhooks
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage webhook deliveries"
ON public.api_gateway_webhook_deliveries FOR ALL
USING (true);

-- 5. API Rate Limits (tracking de limites)
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  window_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  limit_exceeded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_key_id, window_start, window_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_key ON public.api_rate_limits(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start, window_end);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_type ON public.api_rate_limits(window_type);

-- RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits"
ON public.api_rate_limits FOR ALL
USING (true);

-- 6. API Analytics (estatísticas agregadas)
CREATE TABLE IF NOT EXISTS public.api_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time_ms NUMERIC,
  p95_response_time_ms NUMERIC,
  p99_response_time_ms NUMERIC,
  total_data_transferred INTEGER DEFAULT 0,
  unique_api_keys INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_analytics_org ON public.api_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_analytics_endpoint ON public.api_analytics(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_analytics_period ON public.api_analytics(period_start, period_end);

-- RLS
ALTER TABLE public.api_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org API analytics"
ON public.api_analytics FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "System can insert analytics"
ON public.api_analytics FOR INSERT
WITH CHECK (true);

-- 7. Triggers
CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

CREATE TRIGGER update_api_gateway_webhooks_updated_at
BEFORE UPDATE ON public.api_gateway_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

CREATE TRIGGER update_api_rate_limits_updated_at
BEFORE UPDATE ON public.api_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

-- 8. Function para incrementar rate limit
CREATE OR REPLACE FUNCTION public.increment_api_rate_limit(
  p_api_key_id UUID,
  p_window_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_window_end TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
  v_rate_limit INTEGER;
BEGIN
  -- Calcular janela baseado no tipo
  CASE p_window_type
    WHEN 'minute' THEN
      v_window_start := date_trunc('minute', NOW());
      v_window_end := v_window_start + INTERVAL '1 minute';
    WHEN 'hour' THEN
      v_window_start := date_trunc('hour', NOW());
      v_window_end := v_window_start + INTERVAL '1 hour';
    WHEN 'day' THEN
      v_window_start := date_trunc('day', NOW());
      v_window_end := v_window_start + INTERVAL '1 day';
    ELSE
      RETURN FALSE;
  END CASE;

  -- Buscar rate limit configurado
  SELECT 
    CASE p_window_type
      WHEN 'minute' THEN rate_limit_per_minute
      WHEN 'hour' THEN rate_limit_per_hour
      WHEN 'day' THEN rate_limit_per_day
    END INTO v_rate_limit
  FROM public.api_keys
  WHERE id = p_api_key_id AND is_active = TRUE;

  IF v_rate_limit IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Inserir ou atualizar contador
  INSERT INTO public.api_rate_limits (
    api_key_id, window_start, window_end, window_type, request_count
  ) VALUES (
    p_api_key_id, v_window_start, v_window_end, p_window_type, 1
  )
  ON CONFLICT (api_key_id, window_start, window_type)
  DO UPDATE SET
    request_count = api_rate_limits.request_count + 1,
    limit_exceeded = (api_rate_limits.request_count + 1) > v_rate_limit,
    updated_at = NOW()
  RETURNING request_count INTO v_current_count;

  -- Retornar se ainda está dentro do limite
  RETURN v_current_count <= v_rate_limit;
END;
$$;