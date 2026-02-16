/**
 * AgentOrchestrationDashboard - Static data
 */
import {
  Anchor, Wrench, Shield, Heart, Navigation, TrendingUp, Eye, MessageSquare
} from "lucide-react";

export interface OrchAgent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  status: "active" | "idle" | "processing" | "consensus";
  autonomyLevel: 0 | 1 | 2 | 3;
  model: string;
  lastAction: string;
  lastActionTime: Date;
  tasksCompleted: number;
  avgResponseMs: number;
  successRate: number;
}

export interface OrchDecision {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  agents: string[];
  consensus: number;
  status: "pending" | "approved" | "executed" | "rejected";
  autonomyLevel: number;
}

export const agents: OrchAgent[] = [
  { id: "captain", name: "Captain Agent", role: "Decisões estratégicas, planejamento de rota, alocação de tripulação", icon: Anchor, status: "active", autonomyLevel: 2, model: "Claude Opus 4", lastAction: "Otimizou rotação de tripulação para Q1", lastActionTime: new Date(Date.now() - 300000), tasksCompleted: 147, avgResponseMs: 2340, successRate: 98.2 },
  { id: "engineer", name: "Engineer Agent", role: "Manutenção preditiva, otimização de combustível", icon: Wrench, status: "processing", autonomyLevel: 3, model: "Claude Opus 4", lastAction: "Agendou manutenção preventiva - Motor Principal", lastActionTime: new Date(Date.now() - 120000), tasksCompleted: 234, avgResponseMs: 1890, successRate: 99.1 },
  { id: "safety", name: "Safety Officer Agent", role: "Compliance PEOTRAM/MLC, enforcement de segurança", icon: Shield, status: "active", autonomyLevel: 3, model: "Claude Opus 4", lastAction: "Validou checklist PEOTRAM - 100% compliant", lastActionTime: new Date(Date.now() - 600000), tasksCompleted: 189, avgResponseMs: 1560, successRate: 100 },
  { id: "wellness", name: "HR/Wellness Agent", role: "Gestão de tripulação, recrutamento, bem-estar", icon: Heart, status: "idle", autonomyLevel: 2, model: "Claude Opus 4", lastAction: "Alertou burnout risk - 2 tripulantes", lastActionTime: new Date(Date.now() - 900000), tasksCompleted: 156, avgResponseMs: 2100, successRate: 96.8 },
  { id: "navigator", name: "Navigator Agent", role: "Otimização de rota quantum-AI, previsão meteorológica", icon: Navigation, status: "consensus", autonomyLevel: 1, model: "Claude Opus 4", lastAction: "Propôs rota alternativa - economia 12% fuel", lastActionTime: new Date(Date.now() - 180000), tasksCompleted: 98, avgResponseMs: 4200, successRate: 94.5 },
  { id: "economist", name: "Economist Agent", role: "Otimização de custos, economia de combustível, pricing", icon: TrendingUp, status: "active", autonomyLevel: 2, model: "Claude Opus 4", lastAction: "Ajustou RPM para economia ótima", lastActionTime: new Date(Date.now() - 450000), tasksCompleted: 167, avgResponseMs: 1780, successRate: 97.3 },
  { id: "predictor", name: "Predictor Agent", role: "Previsão de falhas, anomalias, mudanças de mercado", icon: Eye, status: "processing", autonomyLevel: 3, model: "Claude Opus 4 + TensorFlow", lastAction: "Detectou anomalia térmica - Gerador #2", lastActionTime: new Date(Date.now() - 60000), tasksCompleted: 312, avgResponseMs: 890, successRate: 95.7 },
  { id: "communicator", name: "Communicator Agent", role: "Notificações, relatórios, comunicação com tripulação", icon: MessageSquare, status: "active", autonomyLevel: 2, model: "Claude Sonnet 4", lastAction: "Enviou briefing diário para 45 tripulantes", lastActionTime: new Date(Date.now() - 3600000), tasksCompleted: 892, avgResponseMs: 450, successRate: 99.8 },
];

export const recentDecisions: OrchDecision[] = [
  { id: "1", timestamp: new Date(Date.now() - 60000), type: "Manutenção Preventiva", description: "Agendar troca de rolamentos do motor principal em 5 dias", agents: ["engineer", "predictor", "economist"], consensus: 95, status: "executed", autonomyLevel: 3 },
  { id: "2", timestamp: new Date(Date.now() - 180000), type: "Otimização de Rota", description: "Rota alternativa via Canal X - economia de 12% combustível", agents: ["navigator", "economist", "captain"], consensus: 87, status: "pending", autonomyLevel: 1 },
  { id: "3", timestamp: new Date(Date.now() - 300000), type: "Alerta de Wellness", description: "2 tripulantes com risco de burnout - sugerir rotação", agents: ["wellness", "captain"], consensus: 92, status: "approved", autonomyLevel: 2 },
  { id: "4", timestamp: new Date(Date.now() - 600000), type: "Compliance Check", description: "Auditoria PEOTRAM completa - 100% conformidade", agents: ["safety"], consensus: 100, status: "executed", autonomyLevel: 3 },
];

export const statusColors: Record<OrchAgent["status"], string> = {
  active: "bg-success",
  idle: "bg-muted-foreground",
  processing: "bg-info animate-pulse",
  consensus: "bg-accent animate-pulse",
};

export const autonomyLabels: Record<number, { label: string; color: string }> = {
  0: { label: "Manual", color: "text-muted-foreground" },
  1: { label: "Recomenda", color: "text-info" },
  2: { label: "Auto + Notifica", color: "text-warning" },
  3: { label: "Autônomo", color: "text-success" },
};
