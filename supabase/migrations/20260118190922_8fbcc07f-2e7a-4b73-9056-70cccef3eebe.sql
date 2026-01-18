-- =============================================
-- ADVANCED INFRASTRUCTURE - PART 1 (New Tables Only)
-- =============================================

-- 1. COMPLIANCE VIOLATIONS (new)
CREATE TABLE IF NOT EXISTS compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  rule_id UUID REFERENCES compliance_rules(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  violation_details JSONB NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(30) DEFAULT 'open',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  auto_resolved BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. DOMAIN EVENTS (Event Sourcing)
CREATE TABLE IF NOT EXISTS domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  aggregate_type VARCHAR(50) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_version INT NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. EVENT SNAPSHOTS
CREATE TABLE IF NOT EXISTS event_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  aggregate_type VARCHAR(50) NOT NULL,
  aggregate_id UUID NOT NULL,
  snapshot_version INT NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. CUSTOMER HEALTH METRICS (Churn Prediction)
CREATE TABLE IF NOT EXISTS customer_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  health_score INT DEFAULT 100,
  churn_risk DECIMAL(4,3) DEFAULT 0.000,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logins_last_30d INT DEFAULT 0,
  api_calls_last_30d INT DEFAULT 0,
  features_used_count INT DEFAULT 0,
  active_users_count INT DEFAULT 0,
  support_tickets_last_30d INT DEFAULT 0,
  nps_score INT,
  mrr DECIMAL(12,2) DEFAULT 0.00,
  arr DECIMAL(14,2) DEFAULT 0.00,
  usage_trend VARCHAR(20) DEFAULT 'stable',
  engagement_trend VARCHAR(20) DEFAULT 'stable',
  risk_factors JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. USAGE EVENTS (Analytics)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID,
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  properties JSONB DEFAULT '{}',
  session_id VARCHAR(100),
  page_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. INCIDENT RUNBOOKS
CREATE TABLE IF NOT EXISTS incident_runbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  steps JSONB NOT NULL,
  auto_execute BOOLEAN DEFAULT false,
  notification_channels JSONB DEFAULT '["slack", "email"]',
  escalation_policy JSONB,
  estimated_resolution_time INT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. INCIDENT TIMELINE
CREATE TABLE IF NOT EXISTS incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  user_id UUID,
  user_name VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. API ENDPOINTS (Auto-documentation)
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  summary VARCHAR(255),
  description TEXT,
  tags TEXT[],
  request_schema JSONB,
  response_schema JSONB,
  parameters JSONB DEFAULT '[]',
  rate_limit_per_minute INT DEFAULT 60,
  is_public BOOLEAN DEFAULT false,
  is_deprecated BOOLEAN DEFAULT false,
  version VARCHAR(20) DEFAULT 'v1',
  examples JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_compliance_violations_status ON compliance_violations(status);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_severity ON compliance_violations(severity);
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_domain_events_type ON domain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_timestamp ON usage_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_events_name ON usage_events(event_name);

-- ENABLE RLS
ALTER TABLE compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_runbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "auth_compliance_violations" ON compliance_violations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_domain_events" ON domain_events FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_event_snapshots" ON event_snapshots FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_customer_health" ON customer_health_metrics FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_usage_events" ON usage_events FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_runbooks" ON incident_runbooks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_incident_timeline" ON incident_timeline FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "public_api_endpoints" ON api_endpoints FOR SELECT USING (true);