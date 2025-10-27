-- Missing tables for oauth-service and peodp-inference-service

-- OAuth/Integration tables
CREATE TABLE IF NOT EXISTS public.integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  token_type TEXT DEFAULT 'Bearer',
  scope TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PEODP tables
CREATE TABLE IF NOT EXISTS public.vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  positioning_accuracy NUMERIC,
  fuel_efficiency NUMERIC,
  thruster_efficiency NUMERIC,
  response_time NUMERIC,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  description TEXT,
  location TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.peodp_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  dp_class TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  crew_composition JSONB DEFAULT '[]',
  equipment_config JSONB DEFAULT '{}',
  environmental_limits JSONB DEFAULT '{}',
  safety_procedures JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dp_inference_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  plan_id UUID REFERENCES public.peodp_plans(id),
  inference_type TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  output_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC,
  processing_time_ms INTEGER,
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peodp_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dp_inference_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Integration Credentials
DROP POLICY IF EXISTS "Users can manage their credentials" ON public.integration_credentials;
CREATE POLICY "Users can manage their credentials" ON public.integration_credentials
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Integration Logs
DROP POLICY IF EXISTS "Users can view their logs" ON public.integration_logs;
CREATE POLICY "Users can view their logs" ON public.integration_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert logs" ON public.integration_logs;
CREATE POLICY "System can insert logs" ON public.integration_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Vessel Performance Metrics
DROP POLICY IF EXISTS "Users can view vessel metrics" ON public.vessel_performance_metrics;
CREATE POLICY "Users can view vessel metrics" ON public.vessel_performance_metrics
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "System can insert metrics" ON public.vessel_performance_metrics;
CREATE POLICY "System can insert metrics" ON public.vessel_performance_metrics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Incidents
DROP POLICY IF EXISTS "Users can manage incidents" ON public.incidents;
CREATE POLICY "Users can manage incidents" ON public.incidents
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for PEODP Plans
DROP POLICY IF EXISTS "Users can view PEODP plans" ON public.peodp_plans;
CREATE POLICY "Users can view PEODP plans" ON public.peodp_plans
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage PEODP plans" ON public.peodp_plans;
CREATE POLICY "Users can manage PEODP plans" ON public.peodp_plans
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for DP Inference Logs
DROP POLICY IF EXISTS "Users can view inference logs" ON public.dp_inference_logs;
CREATE POLICY "Users can view inference logs" ON public.dp_inference_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "System can insert inference logs" ON public.dp_inference_logs;
CREATE POLICY "System can insert inference logs" ON public.dp_inference_logs
  FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_integration_credentials_updated_at ON public.integration_credentials;
CREATE TRIGGER update_integration_credentials_updated_at BEFORE UPDATE ON public.integration_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_peodp_plans_updated_at ON public.peodp_plans;
CREATE TRIGGER update_peodp_plans_updated_at BEFORE UPDATE ON public.peodp_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_credentials_user_id ON public.integration_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_user_id ON public.integration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_metrics_vessel_id ON public.vessel_performance_metrics(vessel_id);
CREATE INDEX IF NOT EXISTS idx_incidents_vessel_id ON public.incidents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_peodp_plans_vessel_id ON public.peodp_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_dp_inference_logs_vessel_id ON public.dp_inference_logs(vessel_id);