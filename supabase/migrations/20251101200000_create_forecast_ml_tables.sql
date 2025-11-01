-- PATCH 557: Create missing forecast_results and ml_configurations tables

-- Forecast Results Table
-- Stores AI-generated forecast predictions and their metadata
CREATE TABLE IF NOT EXISTS public.forecast_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_type VARCHAR(100) NOT NULL, -- e.g., 'demand', 'maintenance', 'cost', 'performance'
  entity_type VARCHAR(100), -- e.g., 'vessel', 'crew', 'component', 'system'
  entity_id UUID,
  prediction_date TIMESTAMPTZ NOT NULL,
  prediction_period VARCHAR(50), -- e.g., 'daily', 'weekly', 'monthly', 'quarterly'
  predicted_value JSONB NOT NULL, -- Flexible JSON structure for various prediction types
  confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  model_version VARCHAR(50),
  model_name VARCHAR(100),
  input_features JSONB, -- Features used for prediction
  metadata JSONB DEFAULT '{}',
  actual_value JSONB, -- For model evaluation after the fact
  accuracy_metrics JSONB, -- MAE, RMSE, etc. when actual values are available
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'invalidated'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for forecast_results
CREATE INDEX IF NOT EXISTS idx_forecast_results_type ON public.forecast_results(forecast_type);
CREATE INDEX IF NOT EXISTS idx_forecast_results_entity ON public.forecast_results(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_forecast_results_date ON public.forecast_results(prediction_date);
CREATE INDEX IF NOT EXISTS idx_forecast_results_status ON public.forecast_results(status);
CREATE INDEX IF NOT EXISTS idx_forecast_results_created_at ON public.forecast_results(created_at DESC);

-- ML Configurations Table
-- Stores machine learning model configurations and hyperparameters
CREATE TABLE IF NOT EXISTS public.ml_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_type VARCHAR(100) NOT NULL, -- e.g., 'regression', 'classification', 'clustering', 'time_series'
  algorithm VARCHAR(100), -- e.g., 'random_forest', 'lstm', 'xgboost', 'neural_network'
  use_case VARCHAR(100), -- e.g., 'maintenance_prediction', 'demand_forecasting', 'risk_assessment'
  hyperparameters JSONB DEFAULT '{}', -- Model-specific hyperparameters
  feature_config JSONB DEFAULT '{}', -- Feature engineering configuration
  training_config JSONB DEFAULT '{}', -- Training parameters (epochs, batch_size, etc.)
  preprocessing_config JSONB DEFAULT '{}', -- Data preprocessing steps
  performance_metrics JSONB DEFAULT '{}', -- Latest model performance metrics
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  version VARCHAR(50),
  deployment_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'staging', 'production', 'deprecated'
  last_trained_at TIMESTAMPTZ,
  last_evaluated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Note: Only one default configuration per use_case is allowed via partial unique constraint
  -- Multiple non-default configurations for the same use_case are permitted
  CONSTRAINT unique_active_default_per_use_case UNIQUE (use_case, is_default) WHERE is_default = true
);

-- Indexes for ml_configurations
CREATE INDEX IF NOT EXISTS idx_ml_configurations_model_type ON public.ml_configurations(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_configurations_use_case ON public.ml_configurations(use_case);
CREATE INDEX IF NOT EXISTS idx_ml_configurations_active ON public.ml_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_ml_configurations_deployment ON public.ml_configurations(deployment_status);
CREATE INDEX IF NOT EXISTS idx_ml_configurations_created_at ON public.ml_configurations(created_at DESC);

-- RLS Policies for forecast_results
ALTER TABLE public.forecast_results ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all forecast results
CREATE POLICY "Allow read access to forecast_results for authenticated users"
  ON public.forecast_results
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert forecast results
CREATE POLICY "Allow insert access to forecast_results for authenticated users"
  ON public.forecast_results
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow users to update their own forecast results
CREATE POLICY "Allow update access to forecast_results for creators"
  ON public.forecast_results
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Allow users to delete their own forecast results
CREATE POLICY "Allow delete access to forecast_results for creators"
  ON public.forecast_results
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for ml_configurations
ALTER TABLE public.ml_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all ml configurations
CREATE POLICY "Allow read access to ml_configurations for authenticated users"
  ON public.ml_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert ml configurations
CREATE POLICY "Allow insert access to ml_configurations for authenticated users"
  ON public.ml_configurations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow users to update their own ml configurations
CREATE POLICY "Allow update access to ml_configurations for creators"
  ON public.ml_configurations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Allow users to delete their own ml configurations
CREATE POLICY "Allow delete access to ml_configurations for creators"
  ON public.ml_configurations
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Add comments for documentation
COMMENT ON TABLE public.forecast_results IS 'Stores AI-generated forecast predictions and their metadata for various system entities';
COMMENT ON TABLE public.ml_configurations IS 'Stores machine learning model configurations, hyperparameters, and deployment settings';
