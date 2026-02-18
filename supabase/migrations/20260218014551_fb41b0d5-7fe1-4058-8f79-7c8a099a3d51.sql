
-- =============================================
-- WAVE 3: AI & ML INFRASTRUCTURE (Sprints 37-44)
-- =============================================

-- Sprint 37-38: ML Model Registry & Feature Store (Predictive Maintenance Pipeline)

CREATE TABLE public.ml_model_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  model_type TEXT NOT NULL, -- classification, regression, anomaly_detection, nlp, time_series
  domain TEXT NOT NULL, -- maintenance, routing, contracts, safety, crew
  framework TEXT, -- tensorflow, pytorch, sklearn, custom
  artifact_url TEXT,
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  hyperparameters JSONB DEFAULT '{}',
  training_dataset_id UUID,
  -- Performance metrics
  accuracy NUMERIC(6,4),
  precision_score NUMERIC(6,4),
  recall NUMERIC(6,4),
  f1_score NUMERIC(6,4),
  rmse NUMERIC(10,4),
  mae NUMERIC(10,4),
  auc_roc NUMERIC(6,4),
  -- Deployment
  status TEXT DEFAULT 'draft', -- draft, training, validating, deployed, retired
  deployed_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  serving_endpoint TEXT,
  avg_inference_ms NUMERIC(8,2),
  total_predictions BIGINT DEFAULT 0,
  -- Governance
  approved_by UUID,
  bias_assessment JSONB DEFAULT '{}',
  explainability_method TEXT, -- shap, lime, attention
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(model_name, model_version)
);

CREATE TABLE public.ml_training_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.ml_model_registry(id),
  organization_id UUID REFERENCES public.organizations(id),
  run_number INTEGER NOT NULL,
  status TEXT DEFAULT 'queued', -- queued, running, completed, failed, cancelled
  -- Data
  training_samples INTEGER,
  validation_samples INTEGER,
  test_samples INTEGER,
  feature_columns JSONB DEFAULT '[]',
  target_column TEXT,
  -- Training config
  epochs INTEGER,
  batch_size INTEGER,
  learning_rate NUMERIC(10,8),
  optimizer TEXT,
  loss_function TEXT,
  -- Results
  train_loss NUMERIC(10,6),
  val_loss NUMERIC(10,6),
  test_metrics JSONB DEFAULT '{}',
  confusion_matrix JSONB DEFAULT '{}',
  feature_importance JSONB DEFAULT '{}',
  training_duration_s INTEGER,
  -- Logs
  error_message TEXT,
  logs_url TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ml_feature_store (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  feature_name TEXT NOT NULL,
  feature_group TEXT NOT NULL, -- equipment_health, voyage_performance, crew_fatigue, weather
  data_type TEXT NOT NULL, -- numeric, categorical, boolean, timestamp, array
  description TEXT,
  computation_logic TEXT, -- SQL or formula
  source_tables TEXT[],
  refresh_frequency TEXT DEFAULT 'daily', -- realtime, hourly, daily, weekly
  last_computed_at TIMESTAMPTZ,
  statistics JSONB DEFAULT '{}', -- mean, std, min, max, nulls_pct
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(feature_name, feature_group)
);

-- Sprint 39-40: Route Optimization with Weather AI

CREATE TABLE public.route_optimization_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  voyage_id UUID,
  -- Route parameters
  origin_port TEXT NOT NULL,
  origin_lat NUMERIC(9,6),
  origin_lng NUMERIC(9,6),
  destination_port TEXT NOT NULL,
  destination_lat NUMERIC(9,6),
  destination_lng NUMERIC(9,6),
  departure_window_start TIMESTAMPTZ,
  departure_window_end TIMESTAMPTZ,
  required_arrival TIMESTAMPTZ,
  -- Vessel constraints
  max_speed_knots NUMERIC(5,2),
  eco_speed_knots NUMERIC(5,2),
  draft_meters NUMERIC(5,2),
  air_draft_meters NUMERIC(5,2),
  beam_meters NUMERIC(5,2),
  ice_class TEXT,
  -- Optimization objectives (weights 0-1)
  weight_fuel_cost NUMERIC(3,2) DEFAULT 0.4,
  weight_time NUMERIC(3,2) DEFAULT 0.3,
  weight_safety NUMERIC(3,2) DEFAULT 0.2,
  weight_emissions NUMERIC(3,2) DEFAULT 0.1,
  -- Constraints
  avoid_zones JSONB DEFAULT '[]', -- war risk, piracy, ice
  eca_zones JSONB DEFAULT '[]', -- emission control areas
  canal_preferences JSONB DEFAULT '{}', -- suez, panama preferences
  max_wave_height_m NUMERIC(4,1),
  max_wind_speed_knots NUMERIC(5,1),
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.route_optimization_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.route_optimization_requests(id),
  route_name TEXT NOT NULL, -- optimal, shortest, safest, eco
  is_recommended BOOLEAN DEFAULT false,
  -- Route details
  waypoints JSONB DEFAULT '[]', -- [{lat, lng, name, eta, speed}]
  total_distance_nm NUMERIC(10,1),
  estimated_duration_hours NUMERIC(8,1),
  -- Fuel & cost
  fuel_consumption_mt NUMERIC(10,3),
  fuel_cost_usd NUMERIC(12,2),
  co2_emissions_mt NUMERIC(10,3),
  eca_fuel_mt NUMERIC(10,3), -- low-sulfur fuel in ECAs
  total_cost_usd NUMERIC(12,2),
  -- Weather analysis
  weather_windows JSONB DEFAULT '[]', -- [{from, to, conditions, risk_level}]
  max_encountered_wave_m NUMERIC(4,1),
  max_encountered_wind_kts NUMERIC(5,1),
  weather_risk_score NUMERIC(5,2), -- 0-100
  -- Comparison metrics
  vs_shortest_fuel_saving_pct NUMERIC(5,2),
  vs_shortest_time_diff_hours NUMERIC(6,1),
  overall_score NUMERIC(5,2), -- weighted objective score
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 41-42: NLP Contract Analysis Pipeline

CREATE TABLE public.contract_nlp_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  document_id UUID,
  charter_party_id UUID REFERENCES public.charter_parties(id),
  -- Document info
  document_name TEXT NOT NULL,
  contract_type TEXT, -- charter_party, sea_agreement, mou, addendum, side_letter
  form_type TEXT, -- GENCON, NYPE, SHELLTIME, BPVOY, custom
  language TEXT DEFAULT 'en',
  total_pages INTEGER,
  -- NLP extraction
  entities JSONB DEFAULT '{}', -- parties, vessels, ports, dates, amounts
  clauses_extracted JSONB DEFAULT '[]', -- [{number, title, text, category, risk}]
  key_terms JSONB DEFAULT '{}', -- hire_rate, duration, laycan, cargo
  obligations JSONB DEFAULT '[]', -- [{party, obligation, clause_ref}]
  -- Risk analysis
  risk_clauses JSONB DEFAULT '[]', -- [{clause, risk_type, severity, recommendation}]
  overall_risk_score NUMERIC(5,2),
  missing_standard_clauses TEXT[],
  deviation_from_standard JSONB DEFAULT '[]', -- vs BIMCO template
  -- Financial extraction
  total_contract_value NUMERIC(14,2),
  currency TEXT,
  payment_terms TEXT,
  penalty_clauses JSONB DEFAULT '[]',
  -- Comparison
  compared_with_id UUID, -- previous version/similar contract
  comparison_diff JSONB DEFAULT '{}',
  -- AI metadata
  model_used TEXT,
  confidence NUMERIC(5,3),
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, reviewed
  reviewed_by UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 43-44: IoT Anomaly Detection

CREATE TABLE public.iot_anomaly_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  equipment_id UUID,
  -- Anomaly details
  anomaly_type TEXT NOT NULL, -- spike, drift, flatline, out_of_range, pattern_break, correlation_break
  severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  confidence NUMERIC(5,3),
  -- Data context
  sensor_type TEXT, -- temperature, pressure, vibration, rpm, flow, voltage
  sensor_value NUMERIC(12,4),
  expected_value NUMERIC(12,4),
  deviation_pct NUMERIC(8,2),
  baseline_mean NUMERIC(12,4),
  baseline_std NUMERIC(12,4),
  -- Detection method
  detection_model TEXT, -- isolation_forest, autoencoder, lstm, statistical, rule_based
  model_version TEXT,
  feature_vector JSONB DEFAULT '{}',
  contributing_factors JSONB DEFAULT '[]',
  -- Time context
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  anomaly_start TIMESTAMPTZ,
  anomaly_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  -- Response
  auto_action_taken TEXT, -- alert_sent, throttle_adjusted, shutdown_initiated
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  false_positive BOOLEAN,
  -- Linked prediction
  prediction_id UUID REFERENCES public.ai_maintenance_predictions(id),
  work_order_created UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.iot_anomaly_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  rule_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  equipment_type TEXT,
  -- Thresholds
  condition_type TEXT NOT NULL, -- above, below, range, rate_of_change, correlation
  threshold_value NUMERIC(12,4),
  threshold_min NUMERIC(12,4),
  threshold_max NUMERIC(12,4),
  rate_threshold NUMERIC(10,4), -- per minute
  correlation_sensor TEXT,
  correlation_min NUMERIC(6,4),
  -- Action
  severity TEXT DEFAULT 'medium',
  alert_channels TEXT[] DEFAULT '{"dashboard"}', -- dashboard, email, sms, mqtt
  auto_action TEXT, -- none, alert, throttle, shutdown
  cooldown_minutes INTEGER DEFAULT 15,
  -- Status
  is_active BOOLEAN DEFAULT true,
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for all Wave 3 tables
ALTER TABLE public.ml_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_training_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_feature_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_optimization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_optimization_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_nlp_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_anomaly_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_anomaly_rules ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated access)
CREATE POLICY "View ml_models" ON public.ml_model_registry FOR SELECT USING (true);
CREATE POLICY "Manage ml_models" ON public.ml_model_registry FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update ml_models" ON public.ml_model_registry FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "View training_runs" ON public.ml_training_runs FOR SELECT USING (true);
CREATE POLICY "Manage training_runs" ON public.ml_training_runs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "View features" ON public.ml_feature_store FOR SELECT USING (true);
CREATE POLICY "Manage features" ON public.ml_feature_store FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update features" ON public.ml_feature_store FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "View route_requests" ON public.route_optimization_requests FOR SELECT USING (true);
CREATE POLICY "Create route_requests" ON public.route_optimization_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "View route_results" ON public.route_optimization_results FOR SELECT USING (true);
CREATE POLICY "Create route_results" ON public.route_optimization_results FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "View contract_nlp" ON public.contract_nlp_analysis FOR SELECT USING (true);
CREATE POLICY "Create contract_nlp" ON public.contract_nlp_analysis FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update contract_nlp" ON public.contract_nlp_analysis FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "View anomalies" ON public.iot_anomaly_detections FOR SELECT USING (true);
CREATE POLICY "Create anomalies" ON public.iot_anomaly_detections FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update anomalies" ON public.iot_anomaly_detections FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "View anomaly_rules" ON public.iot_anomaly_rules FOR SELECT USING (true);
CREATE POLICY "Manage anomaly_rules" ON public.iot_anomaly_rules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update anomaly_rules" ON public.iot_anomaly_rules FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_ml_models_domain ON public.ml_model_registry(domain);
CREATE INDEX idx_ml_models_status ON public.ml_model_registry(status);
CREATE INDEX idx_training_model ON public.ml_training_runs(model_id);
CREATE INDEX idx_features_group ON public.ml_feature_store(feature_group);
CREATE INDEX idx_route_req_vessel ON public.route_optimization_requests(vessel_id);
CREATE INDEX idx_route_results_req ON public.route_optimization_results(request_id);
CREATE INDEX idx_contract_nlp_org ON public.contract_nlp_analysis(organization_id);
CREATE INDEX idx_anomaly_vessel ON public.iot_anomaly_detections(vessel_id);
CREATE INDEX idx_anomaly_severity ON public.iot_anomaly_detections(severity);
CREATE INDEX idx_anomaly_detected ON public.iot_anomaly_detections(detected_at DESC);
CREATE INDEX idx_anomaly_rules_vessel ON public.iot_anomaly_rules(vessel_id);
