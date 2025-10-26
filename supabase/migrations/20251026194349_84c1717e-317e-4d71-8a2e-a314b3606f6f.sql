-- PATCH 206-209 Support Tables
-- Predictive Events table (already exists from previous migration)

-- Tactical Decisions table
CREATE TABLE IF NOT EXISTS public.tactical_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT NOT NULL UNIQUE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('alert', 'prediction', 'threshold', 'manual')),
  module_name TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  success BOOLEAN DEFAULT NULL,
  override_by UUID REFERENCES auth.users(id),
  context JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID,
  vessel_id UUID REFERENCES public.vessels(id)
);

CREATE INDEX idx_tactical_decisions_module ON public.tactical_decisions(module_name);
CREATE INDEX idx_tactical_decisions_created ON public.tactical_decisions(created_at);
CREATE INDEX idx_tactical_decisions_priority ON public.tactical_decisions(priority);

-- Adaptive Parameters table
CREATE TABLE IF NOT EXISTS public.adaptive_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  baseline_value NUMERIC NOT NULL,
  threshold_percent NUMERIC DEFAULT 15.0,
  auto_adjust BOOLEAN DEFAULT true,
  last_adjusted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID,
  vessel_id UUID REFERENCES public.vessels(id),
  UNIQUE(parameter_name, module_name, vessel_id)
);

CREATE INDEX idx_adaptive_parameters_module ON public.adaptive_parameters(module_name);
CREATE INDEX idx_adaptive_parameters_vessel ON public.adaptive_parameters(vessel_id);

-- Metric History table
CREATE TABLE IF NOT EXISTS public.metric_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  value NUMERIC NOT NULL,
  performance_score NUMERIC,
  deviation_percent NUMERIC,
  adjustment_triggered BOOLEAN DEFAULT false,
  tenant_id UUID,
  vessel_id UUID REFERENCES public.vessels(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_metric_history_parameter ON public.metric_history(parameter_name, module_name);
CREATE INDEX idx_metric_history_timestamp ON public.metric_history(timestamp DESC);
CREATE INDEX idx_metric_history_vessel ON public.metric_history(vessel_id);

-- Parameter Adjustments table
CREATE TABLE IF NOT EXISTS public.parameter_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  old_value NUMERIC NOT NULL,
  new_value NUMERIC NOT NULL,
  delta_percent NUMERIC NOT NULL,
  reason TEXT,
  impact_score NUMERIC,
  adjusted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID,
  vessel_id UUID REFERENCES public.vessels(id)
);

CREATE INDEX idx_parameter_adjustments_module ON public.parameter_adjustments(module_name);
CREATE INDEX idx_parameter_adjustments_created ON public.parameter_adjustments(created_at DESC);

-- Training Deltas table
CREATE TABLE IF NOT EXISTS public.training_deltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT NOT NULL,
  source TEXT NOT NULL,
  module_name TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  baseline_value NUMERIC,
  current_value NUMERIC,
  delta_value NUMERIC,
  confidence NUMERIC,
  deltas JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID
);

CREATE INDEX idx_training_deltas_cycle ON public.training_deltas(cycle_id);
CREATE INDEX idx_training_deltas_module ON public.training_deltas(module_name);

-- Performance Scores table
CREATE TABLE IF NOT EXISTS public.performance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  overall_score NUMERIC NOT NULL,
  prediction_score NUMERIC,
  adaptation_score NUMERIC,
  tactical_score NUMERIC,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'degrading')),
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID
);

CREATE INDEX idx_performance_scores_module ON public.performance_scores(module_name);
CREATE INDEX idx_performance_scores_timestamp ON public.performance_scores(timestamp DESC);

-- Evolution Insights table
CREATE TABLE IF NOT EXISTS public.evolution_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT NOT NULL,
  category TEXT NOT NULL,
  pattern TEXT NOT NULL,
  frequency INTEGER NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('low', 'medium', 'high')),
  recommendation TEXT NOT NULL,
  evolution_score NUMERIC,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID
);

CREATE INDEX idx_evolution_insights_cycle ON public.evolution_insights(cycle_id);
CREATE INDEX idx_evolution_insights_category ON public.evolution_insights(category);

-- Fine Tune Requests table
CREATE TABLE IF NOT EXISTS public.fine_tune_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  deviation_percent NUMERIC,
  training_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fine_tune_requests_status ON public.fine_tune_requests(status);
CREATE INDEX idx_fine_tune_requests_module ON public.fine_tune_requests(module_name);

-- Enable RLS on all tables
ALTER TABLE public.tactical_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parameter_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_deltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fine_tune_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read access for authenticated users)
CREATE POLICY "Users can view tactical decisions"
  ON public.tactical_decisions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view adaptive parameters"
  ON public.adaptive_parameters FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view metric history"
  ON public.metric_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view parameter adjustments"
  ON public.parameter_adjustments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view training deltas"
  ON public.training_deltas FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view performance scores"
  ON public.performance_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view evolution insights"
  ON public.evolution_insights FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view fine tune requests"
  ON public.fine_tune_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Insert policies for system operations
CREATE POLICY "System can insert tactical decisions"
  ON public.tactical_decisions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert adaptive parameters"
  ON public.adaptive_parameters FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert metric history"
  ON public.metric_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert parameter adjustments"
  ON public.parameter_adjustments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert training deltas"
  ON public.training_deltas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert performance scores"
  ON public.performance_scores FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert evolution insights"
  ON public.evolution_insights FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert fine tune requests"
  ON public.fine_tune_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update policies for authorized users
CREATE POLICY "System can update tactical decisions"
  ON public.tactical_decisions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can update adaptive parameters"
  ON public.adaptive_parameters FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can update fine tune requests"
  ON public.fine_tune_requests FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_adaptive_parameters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_adaptive_parameters_updated_at
BEFORE UPDATE ON public.adaptive_parameters
FOR EACH ROW
EXECUTE FUNCTION update_adaptive_parameters_updated_at();