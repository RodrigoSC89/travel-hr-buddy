/**
 * PATCH 557: Type definitions for forecast_results and ml_configurations tables
 * 
 * These types define the structure of AI forecasting and ML configuration data
 */

export type ForecastType = 
  | "demand"
  | "maintenance"
  | "cost"
  | "performance"
  | "risk"
  | "efficiency"
  | "custom";

export type EntityType = 
  | "vessel"
  | "crew"
  | "component"
  | "system"
  | "route"
  | "job"
  | "custom";

export type ForecastStatus = 
  | "pending"
  | "confirmed"
  | "invalidated"
  | "archived";

export interface ForecastResult {
  id: string;
  forecast_type: ForecastType;
  entity_type?: EntityType;
  entity_id?: string;
  prediction_date: string;
  prediction_period?: string; // 'daily', 'weekly', 'monthly', 'quarterly'
  predicted_value: Record<string, unknown>; // Flexible JSON structure
  confidence_score?: number; // 0 to 1
  model_version?: string;
  model_name?: string;
  input_features?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  actual_value?: Record<string, unknown>; // For model evaluation
  accuracy_metrics?: Record<string, unknown>; // MAE, RMSE, etc.
  status?: ForecastStatus;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ForecastResultInsert extends Omit<ForecastResult, "id" | "created_at" | "updated_at"> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ForecastResultUpdate extends Partial<ForecastResultInsert> {}

export type ModelType = 
  | "regression"
  | "classification"
  | "clustering"
  | "time_series"
  | "deep_learning"
  | "ensemble";

export type Algorithm = 
  | "random_forest"
  | "lstm"
  | "xgboost"
  | "neural_network"
  | "svm"
  | "linear_regression"
  | "decision_tree"
  | "arima"
  | "prophet"
  | "custom";

export type UseCase = 
  | "maintenance_prediction"
  | "demand_forecasting"
  | "risk_assessment"
  | "anomaly_detection"
  | "cost_optimization"
  | "performance_prediction"
  | "custom";

export type DeploymentStatus = 
  | "draft"
  | "staging"
  | "production"
  | "deprecated";

export interface MLConfiguration {
  id: string;
  name: string;
  description?: string;
  model_type: ModelType;
  algorithm?: Algorithm;
  use_case?: UseCase;
  hyperparameters?: Record<string, unknown>;
  feature_config?: Record<string, unknown>;
  training_config?: Record<string, unknown>;
  preprocessing_config?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  is_active?: boolean;
  is_default?: boolean;
  version?: string;
  deployment_status?: DeploymentStatus;
  last_trained_at?: string;
  last_evaluated_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MLConfigurationInsert extends Omit<MLConfiguration, "id" | "created_at" | "updated_at"> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MLConfigurationUpdate extends Partial<MLConfigurationInsert> {}

// Helper types for working with forecast results
export interface ForecastWithMetrics extends ForecastResult {
  accuracy_metrics: {
    mae?: number; // Mean Absolute Error
    rmse?: number; // Root Mean Squared Error
    mape?: number; // Mean Absolute Percentage Error
    r2?: number; // R-squared
    [key: string]: unknown;
  };
}

// Helper types for ML configuration with specific metrics
export interface MLConfigurationWithMetrics extends MLConfiguration {
  performance_metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    auc_roc?: number;
    [key: string]: unknown;
  };
}
