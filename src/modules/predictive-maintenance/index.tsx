/**
 * 🔧 Predictive Maintenance Module
 * NAUTILUS ONE v5.0
 * 
 * ML-powered maintenance prediction using TensorFlow.js,
 * Weibull distribution analysis, and real-time sensor data
 */

// Components
export { MaintenanceDashboardML } from './components/MaintenanceDashboardML';

// AI Engine
export { 
  predictiveMaintenanceMLEngine,
  type FailurePrediction,
  type MaintenancePlan,
  type EquipmentHealth,
  type SensorReading
} from './ai/PredictiveMaintenanceEngine';

// React Hooks
export { usePredictiveMaintenance, type UsePredictiveMaintenanceOptions } from './hooks';

// Re-export component as default for lazy loading
export { default } from './components/MaintenanceDashboardML';

