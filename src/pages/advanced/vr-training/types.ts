/**
 * VR Training - Shared types and data
 */

export interface VRScenario {
  id: string;
  title: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  completions: number;
  avgScore: number;
  description: string;
  category: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
}

export interface TrainingSession {
  scenarioId: string;
  startTime: Date;
  status: "running" | "paused" | "completed";
  score: number;
  elapsedTime: number;
}

export const initialScenarios: VRScenario[] = [
  { id: "fire-engine-room", title: "Incêndio na Praça de Máquinas", duration: "25 min", difficulty: "advanced", completions: 45, avgScore: 78, description: "Responda a um incêndio no engine room com procedimentos SOLAS", category: "emergency", status: "published", createdAt: "2025-01-15" },
  { id: "man-overboard", title: "Homem ao Mar (MOB)", duration: "15 min", difficulty: "intermediate", completions: 89, avgScore: 85, description: "Procedimento completo de resgate de homem ao mar", category: "safety", status: "published", createdAt: "2025-01-10" },
  { id: "abandon-ship", title: "Abandono de Navio", duration: "30 min", difficulty: "advanced", completions: 32, avgScore: 72, description: "Evacuação completa com baleeiras e comunicação de emergência", category: "emergency", status: "published", createdAt: "2025-01-08" },
  { id: "collision", title: "Colisão e Alagamento", duration: "35 min", difficulty: "expert", completions: 18, avgScore: 68, description: "Controle de avarias após colisão com alagamento progressivo", category: "damage_control", status: "published", createdAt: "2025-01-05" },
  { id: "medical-emergency", title: "Emergência Médica", duration: "20 min", difficulty: "intermediate", completions: 67, avgScore: 82, description: "Atendimento de emergência médica a bordo", category: "medical", status: "published", createdAt: "2025-01-02" },
  { id: "oil-spill", title: "Derramamento de Óleo", duration: "25 min", difficulty: "intermediate", completions: 54, avgScore: 79, description: "Contenção e resposta a derramamento de óleo (SOPEP)", category: "environmental", status: "draft", createdAt: "2025-01-01" },
];

export const leaderboard = [
  { rank: 1, name: "Cmte. João Silva", score: 9450, scenarios: 12, badge: "Elite" },
  { rank: 2, name: "1º Of. Maria Santos", score: 8920, scenarios: 11, badge: "Expert" },
  { rank: 3, name: "2º Of. Pedro Lima", score: 8100, scenarios: 10, badge: "Expert" },
  { rank: 4, name: "Eng. Carlos Souza", score: 7650, scenarios: 9, badge: "Advanced" },
  { rank: 5, name: "3º Of. Ana Costa", score: 7200, scenarios: 8, badge: "Advanced" },
];

export function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "beginner": return "bg-green-500";
    case "intermediate": return "bg-yellow-500";
    case "advanced": return "bg-orange-500";
    case "expert": return "bg-red-500";
    default: return "bg-muted";
  }
}
