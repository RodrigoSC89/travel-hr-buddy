-- AI Telemetry and Audit Tables Migration
-- v4.3.0 - Complete AI Infrastructure

-- AI Telemetry Data for predictive maintenance
CREATE TABLE IF NOT EXISTS public.ai_telemetry_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  sensor_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  status TEXT DEFAULT 'normal',
  location TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- AI Maintenance Predictions
CREATE TABLE IF NOT EXISTS public.ai_maintenance_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  equipment_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  failure_probability NUMERIC NOT NULL,
  predicted_failure_date TIMESTAMP WITH TIME ZONE,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  recommended_action TEXT,
  confidence NUMERIC DEFAULT 0.85,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Crew Matching Results
CREATE TABLE IF NOT EXISTS public.ai_crew_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  position_id TEXT NOT NULL,
  candidate_id UUID,
  match_score NUMERIC NOT NULL,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  compatibility_factors JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  recommendation TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Risk Assessments
CREATE TABLE IF NOT EXISTS public.ai_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  voyage_id UUID,
  overall_score NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  decision TEXT NOT NULL,
  factors JSONB DEFAULT '[]'::jsonb,
  mitigations JSONB DEFAULT '[]'::jsonb,
  weather_data JSONB DEFAULT '{}'::jsonb,
  crew_fatigue_data JSONB DEFAULT '{}'::jsonb,
  assessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_by UUID
);

-- AI NC Predictions for PSC/OVID
CREATE TABLE IF NOT EXISTS public.ai_nc_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  inspection_type TEXT NOT NULL,
  target_port TEXT,
  area_code TEXT NOT NULL,
  area_name TEXT NOT NULL,
  probability NUMERIC NOT NULL,
  severity TEXT NOT NULL,
  historical_occurrences INTEGER DEFAULT 0,
  recommendation TEXT,
  preparation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  inspection_date TIMESTAMP WITH TIME ZONE
);

-- AI Blockchain Audit Trail
CREATE TABLE IF NOT EXISTS public.ai_blockchain_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_number BIGINT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  previous_hash TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  module TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  confidence NUMERIC,
  reasoning TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  human_override BOOLEAN DEFAULT false,
  override_by UUID,
  override_reason TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Access Anomalies
CREATE TABLE IF NOT EXISTS public.ai_access_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID,
  event_id TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '[]'::jsonb,
  recommendation TEXT,
  auto_action_taken JSONB,
  status TEXT DEFAULT 'open',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Contract Analysis Results
CREATE TABLE IF NOT EXISTS public.ai_contract_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  document_id UUID,
  contract_type TEXT NOT NULL,
  parties JSONB DEFAULT '[]'::jsonb,
  risk_clauses JSONB DEFAULT '[]'::jsonb,
  negotiation_opportunities JSONB DEFAULT '[]'::jsonb,
  key_dates JSONB DEFAULT '[]'::jsonb,
  financial_terms JSONB DEFAULT '{}'::jsonb,
  overall_risk_score NUMERIC,
  total_potential_savings NUMERIC,
  analysis_duration_ms INTEGER,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_telemetry_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_maintenance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_crew_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_nc_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_blockchain_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_access_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_contract_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_telemetry_data
CREATE POLICY "Users can view telemetry for their organization"
  ON public.ai_telemetry_data FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Users can insert telemetry for their organization"
  ON public.ai_telemetry_data FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

-- RLS Policies for ai_maintenance_predictions
CREATE POLICY "Users can view predictions for their organization"
  ON public.ai_maintenance_predictions FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Users can manage predictions for their organization"
  ON public.ai_maintenance_predictions FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

-- RLS Policies for ai_crew_matches
CREATE POLICY "Users can view crew matches for their organization"
  ON public.ai_crew_matches FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Users can manage crew matches for their organization"
  ON public.ai_crew_matches FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

-- RLS Policies for ai_risk_assessments
CREATE POLICY "Users can view risk assessments for their organization"
  ON public.ai_risk_assessments FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Users can manage risk assessments for their organization"
  ON public.ai_risk_assessments FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

-- RLS Policies for ai_nc_predictions
CREATE POLICY "Users can view NC predictions for their organization"
  ON public.ai_nc_predictions FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Users can manage NC predictions for their organization"
  ON public.ai_nc_predictions FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

-- RLS Policies for ai_blockchain_audit
CREATE POLICY "Users can view blockchain audit for their organization"
  ON public.ai_blockchain_audit FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "System can insert blockchain audit entries"
  ON public.ai_blockchain_audit FOR INSERT
  WITH CHECK (true);

-- RLS Policies for ai_access_anomalies
CREATE POLICY "Admins can view access anomalies"
  ON public.ai_access_anomalies FOR SELECT
  USING (public.is_admin() OR organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "System can manage access anomalies"
  ON public.ai_access_anomalies FOR ALL
  USING (public.is_admin());

-- RLS Policies for ai_contract_analysis
CREATE POLICY "Users can view contract analysis for their organization"
  ON public.ai_contract_analysis FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Users can manage contract analysis for their organization"
  ON public.ai_contract_analysis FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_telemetry_vessel_sensor ON public.ai_telemetry_data(vessel_id, sensor_type);
CREATE INDEX IF NOT EXISTS idx_ai_telemetry_recorded_at ON public.ai_telemetry_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_maintenance_vessel ON public.ai_maintenance_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ai_crew_matches_vessel ON public.ai_crew_matches(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ai_risk_vessel ON public.ai_risk_assessments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ai_nc_vessel ON public.ai_nc_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ai_blockchain_hash ON public.ai_blockchain_audit(hash);
CREATE INDEX IF NOT EXISTS idx_ai_blockchain_timestamp ON public.ai_blockchain_audit(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_access_anomalies_user ON public.ai_access_anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_contract_org ON public.ai_contract_analysis(organization_id);