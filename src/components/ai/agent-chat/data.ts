/**
 * InteractiveAgentChat - Static data (agents, logs)
 */
import type { Agent, ExecutionLog } from "./types";

export const fallbackAgents: Agent[] = [
  {
    id: "agent-voyage",
    name: "Voyage Optimizer",
    description: "Otimização de rotas e consumo de combustível",
    type: "analyst",
    status: "active",
    capabilities: ["Route optimization", "Fuel analysis", "Weather integration", "ETA prediction"],
    stats: { tasks_completed: 1247, success_rate: 94.5, avg_response_ms: 850 },
  },
  {
    id: "agent-compliance",
    name: "Compliance Guardian",
    description: "Monitoramento de conformidade regulatória",
    type: "guardian",
    status: "active",
    capabilities: ["MLC 2006", "STCW", "SOLAS", "MARPOL", "Document validation"],
    stats: { tasks_completed: 892, success_rate: 99.1, avg_response_ms: 420 },
  },
  {
    id: "agent-maintenance",
    name: "Predictive Maintenance",
    description: "Predição de falhas e manutenção preventiva",
    type: "analyst",
    status: "busy",
    capabilities: ["Failure prediction", "Sensor analysis", "Work order generation"],
    stats: { tasks_completed: 567, success_rate: 91.2, avg_response_ms: 1200 },
  },
  {
    id: "agent-crew",
    name: "Crew Wellness AI",
    description: "Monitoramento de bem-estar da tripulação",
    type: "assistant",
    status: "active",
    capabilities: ["Fatigue detection", "Work hours tracking", "Wellness recommendations"],
    stats: { tasks_completed: 2341, success_rate: 96.8, avg_response_ms: 380 },
  },
];

export const fallbackLogs: ExecutionLog[] = [
  {
    id: "log-001",
    agent_id: "agent-voyage",
    action: "Route Optimization",
    status: "success",
    message: "Rota Santos → Rotterdam otimizada. Economia estimada: 12% combustível",
    timestamp: "2026-01-31T10:15:00Z",
    duration_ms: 2340,
    details: { fuel_saved_tons: 45.2, time_saved_hours: 8 },
  },
  {
    id: "log-002",
    agent_id: "agent-compliance",
    action: "Document Validation",
    status: "warning",
    message: "Certificado STCW de 3 tripulantes expira em 30 dias",
    timestamp: "2026-01-31T09:45:00Z",
    duration_ms: 890,
    details: { crew_ids: ["crew-123", "crew-456", "crew-789"] },
  },
  {
    id: "log-003",
    agent_id: "agent-maintenance",
    action: "Failure Prediction",
    status: "error",
    message: "Sensor de temperatura do motor principal offline",
    timestamp: "2026-01-31T09:30:00Z",
    duration_ms: 1100,
  },
];
