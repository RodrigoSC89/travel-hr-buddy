-- ============================================
-- PATCH 100.0 - API Gateway Tables (Restantes)
-- Criar apenas as tabelas que estão faltando
-- ============================================

-- 1. API Gateway Requests (logs de requisições) - SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.api_gateway_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID,
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
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_org ON public.api_gateway_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_endpoint ON public.api_gateway_requests(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_status ON public.api_gateway_requests(status_code);
CREATE INDEX IF NOT EXISTS idx_api_gateway_requests_created ON public.api_gateway_requests(created_at DESC);

-- RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_gateway_requests' AND policyname = 'Org admins can view org API requests'
  ) THEN
    ALTER TABLE public.api_gateway_requests ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- 2. API Gateway Webhooks
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
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_gateway_webhooks' AND policyname = 'Users can manage their webhooks'
  ) THEN
    ALTER TABLE public.api_gateway_webhooks ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage their webhooks"
    ON public.api_gateway_webhooks FOR ALL
    USING (user_id = auth.uid());
  END IF;
END $$;

-- 3. API Gateway Webhook Deliveries
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
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_gateway_webhook_deliveries' AND policyname = 'Users can view their webhook deliveries'
  ) THEN
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
  END IF;
END $$;

-- 4. API Rate Limits
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  window_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  limit_exceeded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_rate_limits_unique ON public.api_rate_limits(COALESCE(api_key_id::text, 'null'), window_start, window_type);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start, window_end);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_type ON public.api_rate_limits(window_type);

-- RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_rate_limits' AND policyname = 'System can manage rate limits'
  ) THEN
    ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "System can manage rate limits"
    ON public.api_rate_limits FOR ALL
    USING (true);
  END IF;
END $$;

-- 5. API Analytics
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
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_analytics' AND policyname = 'Users can view org API analytics'
  ) THEN
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
  END IF;
END $$;

-- 6. Triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_gateway_webhooks_updated_at') THEN
    CREATE TRIGGER update_api_gateway_webhooks_updated_at
    BEFORE UPDATE ON public.api_gateway_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_workspace_tables_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_rate_limits_updated_at') THEN
    CREATE TRIGGER update_api_rate_limits_updated_at
    BEFORE UPDATE ON public.api_rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_workspace_tables_updated_at();
  END IF;
END $$;