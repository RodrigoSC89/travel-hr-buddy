/**
 * 🚢 Operations Intelligence Module
 * NAUTILUS ONE v5.0
 * 
 * AI-powered voyage optimization with 3D fleet visualization,
 * real-time monitoring, and intelligent route planning
 */

export { OperationsDashboard3D } from './components/OperationsDashboard3D';
export { 
  operationalIntelligenceEngine, 
  type VoyageOptimization, 
  type VoyageData,
  type RouteWaypoint 
} from './ai/OperationalIntelligenceEngine';

// Re-export component as default for lazy loading
export { default } from './components/OperationsDashboard3D';
