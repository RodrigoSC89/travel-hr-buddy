/**
 * 🔧 Predictive Maintenance Module
 * NAUTILUS ONE v5.0
 * 
 * ML-powered maintenance prediction using TensorFlow.js,
 * Weibull distribution analysis, and real-time sensor data
 */

export { MaintenanceDashboardML } from './components/MaintenanceDashboardML';
export { 
  predictiveMaintenanceMLEngine,
  type FailurePrediction,
  type MaintenancePlan,
  type EquipmentHealth,
  type SensorReading
} from './ai/PredictiveMaintenanceEngine';

// Re-export component as default for lazy loading
export { default } from './components/MaintenanceDashboardML';
