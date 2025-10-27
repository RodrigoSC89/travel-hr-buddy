-- PATCH 300: API Gateway
-- API management platform with routing, rate limiting, and analytics

-- ============================================
-- API Keys Table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  tier text DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'premium', 'unlimited')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  organization_id uuid,
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  last_used_at timestamptz,
  usage_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys(tier);

-- ============================================
-- API Routes Table
-- ============================================
CREATE TABLE IF NOT EXISTS api_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path text UNIQUE NOT NULL,
  route_name text NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS')),
  description text,
  schema_validation jsonb DEFAULT '{}'::jsonb, -- JSON schema for request/response validation
  rate_limit_tier text DEFAULT 'basic',
  requires_auth boolean DEFAULT true,
  is_public boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated', 'disabled')),
  version text DEFAULT 'v1',
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_routes_path ON api_routes(route_path);
CREATE INDEX IF NOT EXISTS idx_api_routes_method ON api_routes(method);
CREATE INDEX IF NOT EXISTS idx_api_routes_status ON api_routes(status);
CREATE INDEX IF NOT EXISTS idx_api_routes_version ON api_routes(version);

-- ============================================
-- API Rate Limits Table
-- ============================================
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE CASCADE,
  route_path text,
  tier text NOT NULL CHECK (tier IN ('basic', 'standard', 'premium', 'unlimited')),
  requests_per_minute integer NOT NULL,
  requests_per_hour integer NOT NULL,
  requests_per_day integer NOT NULL,
  window_start timestamptz DEFAULT now(),
  current_minute_count integer DEFAULT 0,
  current_hour_count integer DEFAULT 0,
  current_day_count integer DEFAULT 0,
  last_request_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(api_key_id, route_path)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_key ON api_rate_limits(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_route ON api_rate_limits(route_path);

-- Set default rate limits by tier
INSERT INTO api_rate_limits (tier, requests_per_minute, requests_per_hour, requests_per_day, route_path)
SELECT 
  tier,
  CASE tier
    WHEN 'basic' THEN 100
    WHEN 'standard' THEN 1000
    WHEN 'premium' THEN 10000
    WHEN 'unlimited' THEN 999999
  END,
  CASE tier
    WHEN 'basic' THEN 1000
    WHEN 'standard' THEN 10000
    WHEN 'premium' THEN 100000
    WHEN 'unlimited' THEN 9999999
  END,
  CASE tier
    WHEN 'basic' THEN 10000
    WHEN 'standard' THEN 100000
    WHEN 'premium' THEN 1000000
    WHEN 'unlimited' THEN 99999999
  END,
  '*' -- Default for all routes
FROM unnest(ARRAY['basic', 'standard', 'premium', 'unlimited']::text[]) AS tier
ON CONFLICT DO NOTHING;

-- Function to check rate limit with sliding window
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_api_key_id uuid,
  p_route_path text DEFAULT '*'
)
RETURNS boolean AS $$
DECLARE
  v_tier text;
  v_limit_per_minute integer;
  v_limit_per_hour integer;
  v_limit_per_day integer;
  v_current_minute integer;
  v_current_hour integer;
  v_current_day integer;
  v_window_start timestamptz;
BEGIN
  -- Get API key tier
  SELECT tier INTO v_tier
  FROM api_keys
  WHERE id = p_api_key_id AND status = 'active';
  
  IF v_tier IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get rate limits for this tier
  SELECT 
    requests_per_minute,
    requests_per_hour,
    requests_per_day
  INTO v_limit_per_minute, v_limit_per_hour, v_limit_per_day
  FROM api_rate_limits
  WHERE tier = v_tier AND route_path = '*'
  LIMIT 1;
  
  -- Get or create rate limit tracking for this key
  INSERT INTO api_rate_limits (
    api_key_id,
    route_path,
    tier,
    requests_per_minute,
    requests_per_hour,
    requests_per_day,
    current_minute_count,
    current_hour_count,
    current_day_count,
    window_start
  )
  VALUES (
    p_api_key_id,
    p_route_path,
    v_tier,
    v_limit_per_minute,
    v_limit_per_hour,
    v_limit_per_day,
    0,
    0,
    0,
    now()
  )
  ON CONFLICT (api_key_id, route_path) DO NOTHING;
  
  -- Check and update limits
  SELECT 
    current_minute_count,
    current_hour_count,
    current_day_count,
    window_start
  INTO v_current_minute, v_current_hour, v_current_day, v_window_start
  FROM api_rate_limits
  WHERE api_key_id = p_api_key_id AND route_path = p_route_path;
  
  -- Reset counters if windows have passed
  IF now() - v_window_start > interval '1 minute' THEN
    v_current_minute := 0;
  END IF;
  IF now() - v_window_start > interval '1 hour' THEN
    v_current_hour := 0;
  END IF;
  IF now() - v_window_start > interval '1 day' THEN
    v_current_day := 0;
    v_window_start := now();
  END IF;
  
  -- Check if limits exceeded
  IF v_current_minute >= v_limit_per_minute OR
     v_current_hour >= v_limit_per_hour OR
     v_current_day >= v_limit_per_day THEN
    RETURN false;
  END IF;
  
  -- Increment counters
  UPDATE api_rate_limits
  SET 
    current_minute_count = v_current_minute + 1,
    current_hour_count = v_current_hour + 1,
    current_day_count = v_current_day + 1,
    last_request_at = now(),
    window_start = v_window_start,
    updated_at = now()
  WHERE api_key_id = p_api_key_id AND route_path = p_route_path;
  
  -- Update API key usage
  UPDATE api_keys
  SET 
    usage_count = usage_count + 1,
    last_used_at = now()
  WHERE id = p_api_key_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- API Request Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  route_path text NOT NULL,
  method text NOT NULL,
  status_code integer,
  request_body jsonb,
  response_body jsonb,
  latency_ms integer,
  user_agent text,
  ip_address inet,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_key ON api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_route ON api_request_logs(route_path);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_status ON api_request_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_created ON api_request_logs(created_at DESC);

-- Function to log API request
CREATE OR REPLACE FUNCTION log_api_request(
  p_api_key_id uuid,
  p_route_path text,
  p_method text,
  p_status_code integer,
  p_latency_ms integer,
  p_error_message text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO api_request_logs (
    api_key_id,
    route_path,
    method,
    status_code,
    latency_ms,
    error_message
  ) VALUES (
    p_api_key_id,
    p_route_path,
    p_method,
    p_status_code,
    p_latency_ms,
    p_error_message
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate API documentation
CREATE OR REPLACE FUNCTION generate_api_documentation()
RETURNS TABLE (
  route_path text,
  method text,
  description text,
  schema jsonb,
  version text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.route_path,
    r.method,
    r.description,
    r.schema_validation as schema,
    r.version
  FROM api_routes r
  WHERE r.status = 'active'
  ORDER BY r.route_path, r.method;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

-- API keys policies
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager')
  ));

CREATE POLICY "Users can create API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ))
  WITH CHECK (true);

-- API routes policies (public read, admin write)
CREATE POLICY "Users can view API routes"
  ON api_routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage API routes"
  ON api_routes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ))
  WITH CHECK (true);

-- API rate limits policies
CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT
  TO authenticated
  USING (true);

-- API request logs policies
CREATE POLICY "Users can view own request logs"
  ON api_request_logs FOR SELECT
  TO authenticated
  USING (api_key_id IN (SELECT id FROM api_keys WHERE created_by = auth.uid()) OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager')
  ));

-- Grant permissions
GRANT ALL ON api_keys TO authenticated;
GRANT ALL ON api_routes TO authenticated;
GRANT ALL ON api_rate_limits TO authenticated;
GRANT ALL ON api_request_logs TO authenticated;

COMMENT ON TABLE api_keys IS 'PATCH 300: API key management for authentication';
COMMENT ON TABLE api_routes IS 'PATCH 300: Route registry with schema validation';
COMMENT ON TABLE api_rate_limits IS 'PATCH 300: Sliding window rate limiting with tier-based limits';
COMMENT ON TABLE api_request_logs IS 'PATCH 300: Request/response logging with latency metrics';
