export interface SystemStatus {
  fleet: { total: number; active: number; maintenance: number; alerts: number };
  crew: { total: number; onboard: number; onLeave: number; expiringCerts: number };
  maintenance: { scheduled: number; overdue: number; completed: number; efficiency: number };
  inventory: { lowStock: number; pendingOrders: number; value: number };
  compliance: { score: number; pendingAudits: number; expiringDocs: number };
}

export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

export const tabs = [
  { id: "visao-geral", label: "Visão Geral", icon: "LayoutDashboard", path: "/command" },
  { id: "operacoes", label: "Operações", icon: "Activity", path: "/command?tab=operations" },
  { id: "executivo", label: "Executivo", icon: "TrendingUp", path: "/command?tab=executive" },
  { id: "ia", label: "IA", icon: "Brain", path: "/ai" },
  { id: "resiliencia", label: "Resiliência", icon: "Shield", path: "/command?tab=resilience" },
  { id: "alertas", label: "Alertas", icon: "Bell", path: "/command?tab=alerts" },
  { id: "config", label: "Config", icon: "Settings", path: "/command?tab=config" },
] as const;

export const DEFAULT_SYSTEM_STATUS: SystemStatus = {
  fleet: { total: 12, active: 11, maintenance: 1, alerts: 3 },
  crew: { total: 247, onboard: 198, onLeave: 49, expiringCerts: 8 },
  maintenance: { scheduled: 15, overdue: 2, completed: 45, efficiency: 94.2 },
  inventory: { lowStock: 5, pendingOrders: 12, value: 2450000 },
  compliance: { score: 96.8, pendingAudits: 2, expiringDocs: 6 },
};
