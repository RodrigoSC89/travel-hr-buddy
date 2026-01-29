/**
 * 💰 Finance Module
 * NAUTILUS ONE v6.0 - AI-Powered Financial Intelligence
 * 
 * Features:
 * - Predictive accounting with ML
 * - Fraud detection with anomaly analysis
 * - Budget optimization with AI
 * - Financial risk assessment
 */

// Components
export { default as FinanceHub } from './FinanceHub';

// AI Engines
export {
  predictiveAccountingEngine,
  type CashFlowPrediction,
  type FraudAlert,
  type BudgetOptimization,
  type FinancialRiskAssessment,
  type FinancialMetrics
} from './ai/PredictiveAccountingEngine';

// React Hooks
export {
  useFinanceAI,
  useCashFlowPrediction,
  useFinancialMetrics,
  useFinancialRisk,
  useFraudDetection,
  useBudgetOptimization,
  useRefreshFinanceData,
  type UseFinanceAIOptions
} from './hooks';

// Re-export as default for lazy loading
export { default } from './FinanceHub';
