/**
 * IoT Module Index
 * Central export for all IoT-related functionalities
 * 
 * Features INÉDITAS na indústria:
 * - MQTT + Supabase Realtime sensor integration
 * - Auto-fill Noon Reports from IoT data
 * - Predictive analytics with anomaly detection
 * - Real-time vessel health scoring
 */

// Core IoT Connector
export { 
  iotConnector,
  type SensorReading,
  type VesselTelemetry,
} from './IoTConnector';

// Noon Report Auto-Fill (INÉDITO)
export {
  noonReportAutoFill,
  type NoonReportData,
} from './NoonReportAutoFill';

// Predictive Analytics (INÉDITO)
export {
  predictiveIoTAnalytics,
  type AnomalyResult,
  type PredictionResult,
  type HealthScore,
} from './PredictiveIoTAnalytics';
