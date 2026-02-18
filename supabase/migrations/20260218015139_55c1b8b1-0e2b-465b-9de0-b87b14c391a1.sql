
-- =============================================
-- WAVE 4: DIFFERENTIATORS (Sprints 45-56)
-- Blockchain Certificates, VR Training, Digital Twin, Autonomous Decision Engine
-- =============================================

-- Sprint 45-46: Blockchain Certificate Verification
CREATE TABLE IF NOT EXISTS public.blockchain_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  certificate_id UUID,
  crew_member_id UUID REFERENCES public.crew_members(id),
  vessel_id UUID REFERENCES public.vessels(id),
  certificate_type TEXT NOT NULL,
  certificate_number TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  blockchain_hash TEXT NOT NULL,
  previous_hash TEXT,
  block_number BIGINT,
  merkle_root TEXT,
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  verification_count INTEGER DEFAULT 0,
  smart_contract_address TEXT,
  token_id TEXT,
  metadata JSONB DEFAULT '{}',
  ipfs_hash TEXT,
  qr_code_data TEXT,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blockchain_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID REFERENCES public.blockchain_certificates(id),
  verifier_id UUID,
  verifier_type TEXT, -- 'internal', 'port_state', 'classification_society', 'flag_state'
  verification_method TEXT, -- 'qr_scan', 'api', 'manual', 'automated'
  verification_result TEXT NOT NULL, -- 'valid', 'invalid', 'expired', 'revoked'
  chain_integrity_check BOOLEAN DEFAULT true,
  response_time_ms INTEGER,
  ip_address INET,
  location_data JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 47-48: VR Training Infrastructure
CREATE TABLE IF NOT EXISTS public.vr_training_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL, -- 'fire_drill', 'abandon_ship', 'man_overboard', 'cargo_ops', 'mooring', 'collision_avoidance'
  difficulty_level TEXT DEFAULT 'intermediate',
  vessel_type TEXT,
  environment_config JSONB DEFAULT '{}', -- weather, sea state, time of day
  objectives JSONB DEFAULT '[]',
  scoring_criteria JSONB DEFAULT '{}',
  max_duration_minutes INTEGER DEFAULT 30,
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 20,
  equipment_required TEXT[],
  regulatory_reference TEXT, -- 'STCW A-VI/1', 'SOLAS III/19'
  pass_score NUMERIC DEFAULT 70,
  assets_url TEXT,
  scene_data JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vr_training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES public.vr_training_scenarios(id),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  instructor_id UUID,
  session_status TEXT DEFAULT 'scheduled', -- 'scheduled','in_progress','completed','cancelled'
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes NUMERIC,
  weather_simulation JSONB,
  emergency_type TEXT,
  recording_url TEXT,
  after_action_review TEXT,
  instructor_notes TEXT,
  overall_score NUMERIC,
  pass_fail TEXT,
  compliance_credit BOOLEAN DEFAULT false,
  stcw_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vr_participant_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.vr_training_sessions(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id),
  role_assigned TEXT, -- 'team_leader', 'firefighter', 'first_aid', 'navigator'
  individual_score NUMERIC,
  reaction_time_ms INTEGER,
  decision_accuracy NUMERIC,
  communication_score NUMERIC,
  leadership_score NUMERIC,
  safety_compliance_score NUMERIC,
  stress_level_data JSONB,
  biometric_data JSONB, -- heart rate, movement patterns
  errors_made JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  improvement_areas TEXT[],
  ai_feedback TEXT,
  competency_gaps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 49-50: Digital Twin Advanced
CREATE TABLE IF NOT EXISTS public.digital_twin_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  model_version TEXT NOT NULL,
  model_type TEXT DEFAULT 'full_vessel', -- 'full_vessel','engine_room','bridge','cargo_hold','hull'
  geometry_data JSONB, -- 3D model references
  sensor_mappings JSONB DEFAULT '{}', -- sensor_id → 3D position mapping
  component_registry JSONB DEFAULT '[]', -- all modeled components
  physics_config JSONB DEFAULT '{}', -- hydrodynamics, structural
  baseline_parameters JSONB DEFAULT '{}',
  calibration_status TEXT DEFAULT 'uncalibrated',
  calibrated_at TIMESTAMPTZ,
  accuracy_score NUMERIC,
  last_sync_at TIMESTAMPTZ,
  sync_frequency_seconds INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.digital_twin_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID REFERENCES public.digital_twin_models(id),
  simulation_type TEXT NOT NULL, -- 'stress_analysis','fuel_optimization','weather_routing','cargo_loading','stability'
  input_parameters JSONB NOT NULL,
  output_results JSONB,
  predicted_values JSONB,
  actual_values JSONB,
  deviation_percent NUMERIC,
  confidence_level NUMERIC,
  duration_ms INTEGER,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  triggered_by TEXT, -- 'manual','scheduled','anomaly','threshold'
  recommendations JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.digital_twin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID REFERENCES public.digital_twin_models(id),
  alert_type TEXT NOT NULL, -- 'structural_stress','vibration_anomaly','thermal_deviation','performance_degradation'
  severity TEXT DEFAULT 'medium',
  component_id TEXT,
  component_name TEXT,
  predicted_failure_date TIMESTAMPTZ,
  confidence NUMERIC,
  sensor_readings JSONB,
  baseline_deviation JSONB,
  recommended_action TEXT,
  auto_work_order_created BOOLEAN DEFAULT false,
  work_order_id UUID,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 51-52: Autonomous Decision Engine
CREATE TABLE IF NOT EXISTS public.autonomous_decision_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  rule_name TEXT NOT NULL,
  rule_category TEXT NOT NULL, -- 'safety','compliance','operations','commercial','maintenance'
  trigger_conditions JSONB NOT NULL, -- conditions that activate the rule
  decision_logic JSONB NOT NULL, -- action to take
  confidence_threshold NUMERIC DEFAULT 0.85,
  requires_human_approval BOOLEAN DEFAULT true,
  approval_timeout_hours INTEGER DEFAULT 24,
  auto_execute_if_timeout BOOLEAN DEFAULT false,
  escalation_chain JSONB DEFAULT '[]',
  priority INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  cooldown_minutes INTEGER DEFAULT 60,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.autonomous_decision_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.autonomous_decision_rules(id),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  trigger_data JSONB NOT NULL,
  decision_made TEXT NOT NULL,
  confidence_score NUMERIC,
  reasoning TEXT,
  action_payload JSONB,
  execution_status TEXT DEFAULT 'pending', -- 'pending','approved','executed','rejected','rolled_back'
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  rollback_data JSONB,
  rolled_back_at TIMESTAMPTZ,
  feedback_score NUMERIC,
  feedback_notes TEXT,
  impact_assessment JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 53-54: Fleet Digital Passport
CREATE TABLE IF NOT EXISTS public.fleet_digital_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) UNIQUE,
  organization_id UUID REFERENCES public.organizations(id),
  passport_number TEXT UNIQUE,
  qr_code TEXT,
  vessel_lifecycle_data JSONB DEFAULT '{}', -- build, conversions, class changes
  ownership_history JSONB DEFAULT '[]',
  flag_history JSONB DEFAULT '[]',
  class_history JSONB DEFAULT '[]',
  insurance_summary JSONB DEFAULT '{}',
  environmental_record JSONB DEFAULT '{}', -- CII history, emissions profile
  safety_record JSONB DEFAULT '{}', -- incidents, detentions, casualties
  maintenance_score NUMERIC,
  compliance_score NUMERIC,
  commercial_rating TEXT,
  last_psc_result JSONB,
  last_vetting_result JSONB,
  rightship_ghi NUMERIC,
  sanctions_check_status TEXT DEFAULT 'clear',
  sanctions_checked_at TIMESTAMPTZ,
  blockchain_anchor TEXT,
  shared_with JSONB DEFAULT '[]', -- organizations with access
  access_log JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sprint 55-56: Predictive Crew Wellbeing & Smart Contracts
CREATE TABLE IF NOT EXISTS public.crew_wellbeing_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  prediction_date DATE NOT NULL,
  fatigue_risk_score NUMERIC,
  mental_health_score NUMERIC,
  physical_health_score NUMERIC,
  social_isolation_score NUMERIC,
  burnout_risk_score NUMERIC,
  overall_wellbeing_score NUMERIC,
  risk_factors JSONB DEFAULT '[]',
  contributing_factors JSONB DEFAULT '{}', -- hours worked, port calls, contract duration
  recommended_interventions JSONB DEFAULT '[]',
  days_on_board INTEGER,
  contract_remaining_days INTEGER,
  shore_leave_last_date DATE,
  communication_frequency JSONB,
  ml_model_version TEXT,
  confidence NUMERIC,
  alert_triggered BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.smart_charter_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  charter_party_id UUID,
  contract_type TEXT NOT NULL, -- 'time_charter','voyage_charter','coa','bareboat'
  parties JSONB NOT NULL,
  terms JSONB NOT NULL,
  payment_schedule JSONB DEFAULT '[]',
  performance_clauses JSONB DEFAULT '[]',
  penalty_clauses JSONB DEFAULT '[]',
  weather_routing_clause JSONB,
  fuel_quality_clause JSONB,
  off_hire_conditions JSONB DEFAULT '[]',
  auto_invoicing BOOLEAN DEFAULT false,
  auto_laytime_calc BOOLEAN DEFAULT false,
  dispute_resolution_mechanism TEXT,
  blockchain_hash TEXT,
  digital_signatures JSONB DEFAULT '[]',
  execution_log JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft', -- 'draft','pending_signatures','active','suspended','completed','terminated'
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT,
  total_value NUMERIC,
  currency TEXT DEFAULT 'USD',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all Wave 4 tables
ALTER TABLE public.blockchain_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_verification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vr_training_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vr_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vr_participant_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twin_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twin_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_decision_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_decision_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_digital_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_wellbeing_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_charter_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "org_access_blockchain_certificates" ON public.blockchain_certificates FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_blockchain_verification_log" ON public.blockchain_verification_log FOR ALL USING (certificate_id IN (SELECT id FROM public.blockchain_certificates WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))));
CREATE POLICY "org_access_vr_scenarios" ON public.vr_training_scenarios FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_vr_sessions" ON public.vr_training_sessions FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_vr_performance" ON public.vr_participant_performance FOR ALL USING (session_id IN (SELECT id FROM public.vr_training_sessions WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))));
CREATE POLICY "org_access_dt_models" ON public.digital_twin_models FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_dt_simulations" ON public.digital_twin_simulations FOR ALL USING (twin_id IN (SELECT id FROM public.digital_twin_models WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))));
CREATE POLICY "org_access_dt_alerts" ON public.digital_twin_alerts FOR ALL USING (twin_id IN (SELECT id FROM public.digital_twin_models WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))));
CREATE POLICY "org_access_decision_rules" ON public.autonomous_decision_rules FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_decision_executions" ON public.autonomous_decision_executions FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_digital_passports" ON public.fleet_digital_passports FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_wellbeing_predictions" ON public.crew_wellbeing_predictions FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "org_access_smart_contracts" ON public.smart_charter_contracts FOR ALL USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_blockchain_certs_org ON public.blockchain_certificates(organization_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_certs_crew ON public.blockchain_certificates(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_certs_hash ON public.blockchain_certificates(blockchain_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_verify_cert ON public.blockchain_verification_log(certificate_id);
CREATE INDEX IF NOT EXISTS idx_vr_scenarios_org ON public.vr_training_scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_vr_sessions_scenario ON public.vr_training_sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_vr_sessions_vessel ON public.vr_training_sessions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vr_perf_session ON public.vr_participant_performance(session_id);
CREATE INDEX IF NOT EXISTS idx_vr_perf_crew ON public.vr_participant_performance(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_dt_models_vessel ON public.digital_twin_models(vessel_id);
CREATE INDEX IF NOT EXISTS idx_dt_simulations_twin ON public.digital_twin_simulations(twin_id);
CREATE INDEX IF NOT EXISTS idx_dt_alerts_twin ON public.digital_twin_alerts(twin_id);
CREATE INDEX IF NOT EXISTS idx_decision_rules_org ON public.autonomous_decision_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_decision_exec_rule ON public.autonomous_decision_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_digital_passports_vessel ON public.fleet_digital_passports(vessel_id);
CREATE INDEX IF NOT EXISTS idx_wellbeing_crew ON public.crew_wellbeing_predictions(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_wellbeing_date ON public.crew_wellbeing_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_org ON public.smart_charter_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_status ON public.smart_charter_contracts(status);

-- Updated_at triggers
CREATE TRIGGER update_blockchain_certificates_updated_at BEFORE UPDATE ON public.blockchain_certificates FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_vr_scenarios_updated_at BEFORE UPDATE ON public.vr_training_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_vr_sessions_updated_at BEFORE UPDATE ON public.vr_training_sessions FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_dt_models_updated_at BEFORE UPDATE ON public.digital_twin_models FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_decision_rules_updated_at BEFORE UPDATE ON public.autonomous_decision_rules FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_decision_executions_updated_at BEFORE UPDATE ON public.autonomous_decision_executions FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_digital_passports_updated_at BEFORE UPDATE ON public.fleet_digital_passports FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_smart_contracts_updated_at BEFORE UPDATE ON public.smart_charter_contracts FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
