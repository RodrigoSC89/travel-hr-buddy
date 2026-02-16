/**
 * Analytics Command Center - Shared types and constants
 */

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  category: string;
  icon?: React.ReactNode;
}

export interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: "prediction" | "recommendation" | "alert" | "trend";
  confidence: number;
  priority: "high" | "medium" | "low";
  createdAt: Date;
  actionable: boolean;
}

export interface PredictiveInsight {
  id: string;
  type: "maintenance" | "fuel" | "route" | "crew" | "cost";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  potential_savings: number;
  action_required: boolean;
  timeline: string;
  actions: string[];
}

export interface FleetMetrics {
  efficiency: number;
  fuel_consumption: number;
  operational_cost: number;
  revenue: number;
  profit_margin: number;
  vessel_utilization: number;
  crew_efficiency: number;
  safety_score: number;
  environmental_score: number;
}

export const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export const REVENUE_DATA = [
  { month: "Jan", receita: 45000, custos: 28000, lucro: 17000 },
  { month: "Fev", receita: 52000, custos: 30000, lucro: 22000 },
  { month: "Mar", receita: 48000, custos: 29000, lucro: 19000 },
  { month: "Abr", receita: 61000, custos: 35000, lucro: 26000 },
  { month: "Mai", receita: 55000, custos: 32000, lucro: 23000 },
  { month: "Jun", receita: 70000, custos: 38000, lucro: 32000 },
];

export const CATEGORY_DATA = [
  { name: "Operacional", value: 35 },
  { name: "Manutenção", value: 25 },
  { name: "RH", value: 20 },
  { name: "Combustível", value: 15 },
  { name: "Outros", value: 5 },
];

export const TREND_DATA = [
  { date: "Sem 1", eficiencia: 92, disponibilidade: 96, manutencao: 88 },
  { date: "Sem 2", eficiencia: 94, disponibilidade: 97, manutencao: 90 },
  { date: "Sem 3", eficiencia: 93, disponibilidade: 95, manutencao: 91 },
  { date: "Sem 4", eficiencia: 96, disponibilidade: 98, manutencao: 93 },
];

export const PERFORMANCE_DATA = [
  { date: "Dia 1", fuel_efficiency: 85, revenue: 420000, crew_satisfaction: 87 },
  { date: "Dia 2", fuel_efficiency: 87, revenue: 435000, crew_satisfaction: 89 },
  { date: "Dia 3", fuel_efficiency: 89, revenue: 445000, crew_satisfaction: 91 },
  { date: "Dia 4", fuel_efficiency: 86, revenue: 430000, crew_satisfaction: 88 },
  { date: "Dia 5", fuel_efficiency: 90, revenue: 465000, crew_satisfaction: 93 },
  { date: "Dia 6", fuel_efficiency: 88, revenue: 450000, crew_satisfaction: 90 },
  { date: "Dia 7", fuel_efficiency: 91, revenue: 470000, crew_satisfaction: 94 },
];

export const MAINTENANCE_DATA = [
  { month: "Jan", predicted: 85, actual: 82, confidence: 94 },
  { month: "Fev", predicted: 78, actual: 76, confidence: 91 },
  { month: "Mar", predicted: 92, actual: 89, confidence: 87 },
  { month: "Abr", predicted: 67, actual: 71, confidence: 89 },
  { month: "Mai", predicted: 88, actual: null, confidence: 92 },
  { month: "Jun", predicted: 75, actual: null, confidence: 88 },
];

export const RISK_DATA = [
  { name: "Baixo Risco", value: 65, color: "#10b981" },
  { name: "Médio Risco", value: 25, color: "#f59e0b" },
  { name: "Alto Risco", value: 10, color: "#ef4444" },
];

export const MODEL_ACCURACY = {
  maintenance: 94.2,
  performance: 89.7,
  fuel: 91.3,
  safety: 96.1,
};
