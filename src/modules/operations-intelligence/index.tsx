/**
 * 🚢 Operations Intelligence Module
 * NAUTILUS ONE v5.0
 * 
 * AI-powered voyage optimization with 3D fleet visualization,
 * real-time monitoring, and intelligent route planning
 */

// Components
export { OperationsDashboard3D } from './components/OperationsDashboard3D';

// AI Engine
export { 
  operationalIntelligenceEngine, 
  type VoyageOptimization, 
  type VoyageData,
  type RouteWaypoint 
} from './ai/OperationalIntelligenceEngine';

// React Hooks
export { useOperationsIntelligence, type UseOperationsIntelligenceOptions } from './hooks';

// Re-export component as default for lazy loading
export { default } from './components/OperationsDashboard3D';

