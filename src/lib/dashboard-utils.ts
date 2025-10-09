import { MetricCard, AlertItem, ActivityItem } from "@/types/dashboard";
import {
  Activity,
  Users,
  DollarSign,
  AlertTriangle,
  Ship,
  CheckCircle,
  Settings,
  Clock,
  Shield,
  Award,
  FileText,
  Target,
} from "lucide-react";

export const formatMetricValue = (value: number | string, unit: string): string => {
  if (typeof value === "string") return value;

  switch (unit) {
  case "%":
    return `${value.toFixed(1)}%`;
  case "BRL":
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  case "USD":
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  case "K":
    return `${(value / 1000).toFixed(1)}K`;
  case "M":
    return `${(value / 1000000).toFixed(1)}M`;
  default:
    return value.toLocaleString("pt-BR");
  }
};

export const getMetricsByProfile = (profile: string): MetricCard[] => {
  const baseMetrics = {
    admin: [
      {
        id: "system-health",
        title: "Saúde do Sistema",
        value: 98.5,
        change: 2.1,
        trend: "up" as const,
        icon: Activity,
        color: "text-success",
        subtitle: "Excelente",
        target: 99,
        unit: "%",
      },
      {
        id: "active-users",
        title: "Usuários Ativos",
        value: 1247,
        change: 8.3,
        trend: "up" as const,
        icon: Users,
        color: "text-primary",
        subtitle: "Hoje",
      },
      {
        id: "monthly-revenue",
        title: "Receita Mensal",
        value: 125000,
        change: 12.5,
        trend: "up" as const,
        icon: DollarSign,
        color: "text-success",
        unit: "BRL",
      },
      {
        id: "critical-alerts",
        title: "Alertas Críticos",
        value: 3,
        change: -25,
        trend: "down" as const,
        icon: AlertTriangle,
        color: "text-destructive",
        subtitle: "Últimas 24h",
      },
    ],
    hr: [
      {
        id: "crew-onboard",
        title: "Tripulação Embarcada",
        value: 145,
        change: 3.2,
        trend: "up" as const,
        icon: Users,
        color: "text-primary",
        subtitle: "Ativos",
      },
      {
        id: "certificates-expiring",
        title: "Certificados Vencendo",
        value: 12,
        change: -8.1,
        trend: "down" as const,
        icon: AlertTriangle,
        color: "text-warning",
        subtitle: "30 dias",
      },
      {
        id: "training-completion",
        title: "Treinamentos Concluídos",
        value: 87.5,
        change: 15.2,
        trend: "up" as const,
        icon: Award,
        color: "text-success",
        unit: "%",
        target: 95,
      },
      {
        id: "hr-requests",
        title: "Solicitações RH",
        value: 28,
        change: 5.7,
        trend: "up" as const,
        icon: FileText,
        color: "text-info",
        subtitle: "Pendentes",
      },
    ],
    operator: [
      {
        id: "vessels-operational",
        title: "Embarcações Operacionais",
        value: 18,
        change: 0,
        trend: "stable" as const,
        icon: Ship,
        color: "text-success",
        subtitle: "De 20 total",
      },
      {
        id: "pending-checklists",
        title: "Checklists Pendentes",
        value: 7,
        change: -12.5,
        trend: "down" as const,
        icon: CheckCircle,
        color: "text-warning",
        subtitle: "Hoje",
      },
      {
        id: "equipment-status",
        title: "Equipamentos OK",
        value: 94.2,
        change: 1.8,
        trend: "up" as const,
        icon: Settings,
        color: "text-success",
        unit: "%",
        target: 98,
      },
      {
        id: "maintenance-due",
        title: "Manutenções Programadas",
        value: 5,
        change: 25,
        trend: "up" as const,
        icon: Clock,
        color: "text-info",
        subtitle: "Esta semana",
      },
    ],
    auditor: [
      {
        id: "peotram-compliance",
        title: "Conformidade PEOTRAM",
        value: 92.8,
        change: 4.3,
        trend: "up" as const,
        icon: Shield,
        color: "text-success",
        unit: "%",
        target: 95,
      },
      {
        id: "non-conformities",
        title: "Não Conformidades",
        value: 14,
        change: -18.2,
        trend: "down" as const,
        icon: AlertTriangle,
        color: "text-warning",
        subtitle: "Abertas",
      },
      {
        id: "audit-coverage",
        title: "Cobertura de Auditoria",
        value: 78.5,
        change: 8.9,
        trend: "up" as const,
        icon: Target,
        color: "text-primary",
        unit: "%",
        target: 85,
      },
      {
        id: "evidence-submitted",
        title: "Evidências Enviadas",
        value: 156,
        change: 12.7,
        trend: "up" as const,
        icon: FileText,
        color: "text-success",
        subtitle: "Este mês",
      },
    ],
  };

  return baseMetrics[profile as keyof typeof baseMetrics] || baseMetrics.admin;
};

export const getAlertsByProfile = (profile: string): AlertItem[] => {
  const baseAlerts = [
    {
      id: "1",
      type: "warning" as const,
      title: "Certificado STCW vencendo em 15 dias",
      description: "João Silva - Oficial de Máquinas",
      priority: "high" as const,
      module: "RH",
      actionUrl: "/hr/certificates",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: "error" as const,
      title: "Não conformidade crítica encontrada",
      description: "Auditoria PEOTRAM - Embarcação MV Atlantic",
      priority: "critical" as const,
      module: "PEOTRAM",
      actionUrl: "/peotram/audits",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      type: "info" as const,
      title: "Novo checklist disponível",
      description: "Inspeção de segurança semanal",
      priority: "medium" as const,
      module: "Checklists",
      actionUrl: "/checklists",
      isRead: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return baseAlerts;
};

export const getActivitiesByProfile = (profile: string): ActivityItem[] => {
  const baseActivities = [
    {
      id: "1",
      type: "audit" as const,
      title: "Auditoria PEOTRAM concluída",
      description: "MV Atlantic - Score: 94.2%",
      userName: "Carlos Mendes",
      userAvatar: undefined,
      module: "PEOTRAM",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      metadata: { score: 94.2, vesselId: "mv-atlantic" },
    },
    {
      id: "2",
      type: "checklist" as const,
      title: "Checklist de segurança aprovado",
      description: "Inspeção diária - Ponte de comando",
      userName: "Ana Costa",
      userAvatar: undefined,
      module: "Checklists",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      metadata: { checklistId: "safety-daily", location: "bridge" },
    },
    {
      id: "3",
      type: "document" as const,
      title: "Certificado atualizado",
      description: "STCW renovado para Pedro Santos",
      userName: "Maria Silva",
      userAvatar: undefined,
      module: "RH",
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      metadata: { employeeId: "pedro-santos", certificateType: "STCW" },
    },
  ];

  return baseActivities;
};
