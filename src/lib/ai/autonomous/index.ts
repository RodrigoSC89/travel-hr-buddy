/**
 * Autonomous Platform Module Index
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

// Core engines
export { autonomousEngine, type AutonomousConfig, type SystemStatus } from './autonomous-engine';
export { agentOrchestrator, type AIAgent, type AgentPerspective, type Decision, type Situation, type OperationalContext } from './agent-orchestrator';
export { vesselDigitalTwin, type VesselState, type EquipmentState, type CrewState, type WeatherData, type ComplianceState, type VesselPrediction, type Anomaly, type Risk, type Recommendation } from './digital-twin';
export { selfHealingSystem, type HealthIssue, type SystemHealth } from './self-healing';
export { sensorFusionEngine, type SensorReading, type SensorType, type FusedData, type FusedPosition, type FusedNavigation, type FusedPropulsion, type FusedEnvironment, type FusedStructural } from './sensor-fusion';
