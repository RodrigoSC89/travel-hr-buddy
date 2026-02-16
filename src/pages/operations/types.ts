/**
 * Operations Command Center - Types and data
 */

export interface OperationsData {
  activeVessels: number;
  totalVessels: number;
  crewMembers: number;
  activeCrew: number;
  completedVoyages: number;
  activeAlerts: number;
  fleetEfficiency: number;
  vesselsInOperation: number;
  vesselsAtPort: number;
  vesselsInMaintenance: number;
  fuelConsumption: number;
  maintenancePending: number;
  complianceRate: number;
}

export interface Insight {
  id: number;
  title: string;
  description: string;
  type: "opportunity" | "warning" | "success";
  impact: string;
  confidence: number;
  category: string;
  status: string;
  estimatedValue: string;
}

export interface OperationsSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  showNotifications: boolean;
  compactMode: boolean;
}

export interface VesselRecord { id: string; name: string; status: string; vessel_type?: string; }
export interface CrewRecord { id: string; full_name: string; status: string; }
export interface AIInsightRecord { id: string; title?: string; description?: string; priority?: string; created_at: string; status?: string; category?: string; }

export const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export const sampleInsights: Insight[] = [
  { id: 1, title: "Otimização de Rotas Detectada", description: "A rota atual pode ser otimizada economizando 15% em combustível", type: "opportunity", impact: "Alto", confidence: 94, category: "Operações", status: "pending", estimatedValue: "R$ 45.000/mês" },
  { id: 2, title: "Manutenção Preventiva Recomendada", description: "Motor principal necessita inspeção baseado em padrões de vibração", type: "warning", impact: "Crítico", confidence: 87, category: "Manutenção", status: "in_progress", estimatedValue: "R$ 120.000 economia" },
  { id: 3, title: "Eficiência de Tripulação Acima da Média", description: "Performance 23% acima do benchmark do setor", type: "success", impact: "Médio", confidence: 91, category: "RH", status: "completed", estimatedValue: "+12% produtividade" },
  { id: 4, title: "Tendência de Mercado Identificada", description: "Aumento de 40% na demanda por transporte na região Sul", type: "opportunity", impact: "Alto", confidence: 78, category: "Mercado", status: "pending", estimatedValue: "R$ 200.000 potencial" },
  { id: 5, title: "Risco Regulatório Detectado", description: "Novas regulamentações ANTAQ entram em vigor em 90 dias", type: "warning", impact: "Médio", confidence: 100, category: "Compliance", status: "pending", estimatedValue: "Evitar multas" },
];

export const trends = [
  { category: "Operações", score: 85, change: 12 },
  { category: "Finanças", score: 78, change: -3 },
  { category: "Manutenção", score: 92, change: 8 },
  { category: "RH", score: 71, change: 15 },
  { category: "Compliance", score: 88, change: 5 },
];

export const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } },
};

export const tabFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
