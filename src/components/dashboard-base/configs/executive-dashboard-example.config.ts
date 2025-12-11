/**
 * Executive Dashboard Example Configuration
 * Exemplo de configuração para Executive Dashboard
 * FASE B.2 - Consolidação de Dashboards
 */

import {
  Ship,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity
} from "lucide-react";
import { ExecutiveDashboardConfig } from "@/types/dashboard-config";

export const executiveDashboardConfig: ExecutiveDashboardConfig = {
  id: "executive-dashboard",
  title: "Executive Dashboard",
  description: "Dashboard executivo com métricas e KPIs principais",
  
  layout: {
    type: "grid",
    columns: 12,
    gap: 16,
    responsive: true,
  },

  theme: {
    primaryColor: "blue",
    accentColor: "green",
    cardStyle: "elevated",
    borderRadius: "lg",
  },

  filters: [
    {
      id: "period",
      type: "select",
      label: "Período",
      options: [
        { value: "today", label: "Hoje" },
        { value: "week", label: "Esta Semana" },
        { value: "month", label: "Este Mês" },
        { value: "year", label: "Este Ano" },
      ],
      defaultValue: "month",
    },
    {
      id: "vessel",
      type: "select",
      label: "Embarcação",
      options: [
        { value: "all", label: "Todas" },
        { value: "vessel1", label: "Atlântico I" },
        { value: "vessel2", label: "Pacífico II" },
      ],
      defaultValue: "all",
    },
  ],

  widgets: [
    // KPI Cards
    {
      id: "revenue-kpi",
      type: "kpi",
      colspan: 3,
      order: 1,
      config: {
        id: "revenue",
        title: "Receita Total",
        value: "R$ 125.000",
        change: 8.7,
        trend: "up",
        icon: DollarSign,
        description: "vs mês anterior",
      },
    },
    {
      id: "fleet-utilization-kpi",
      type: "kpi",
      colspan: 3,
      order: 2,
      config: {
        id: "fleet-utilization",
        title: "Utilização de Frota",
        value: "78.5",
        suffix: "%",
        change: 5.2,
        trend: "up",
        icon: Ship,
        target: 85,
        description: "Meta: 85%",
      },
    },
    {
      id: "crew-satisfaction-kpi",
      type: "kpi",
      colspan: 3,
      order: 3,
      config: {
        id: "crew-satisfaction",
        title: "Satisfação da Tripulação",
        value: "4.6",
        suffix: "/5",
        change: 3.1,
        trend: "up",
        icon: Users,
        target: 4.8,
        description: "Pesquisa mensal",
      },
    },
    {
      id: "efficiency-kpi",
      type: "kpi",
      colspan: 3,
      order: 4,
      config: {
        id: "efficiency",
        title: "Eficiência Operacional",
        value: "92",
        suffix: "%",
        change: 4.5,
        trend: "up",
        icon: Target,
        description: "vs trimestre anterior",
      },
    },

    // Revenue Chart
    {
      id: "revenue-chart",
      type: "chart",
      colspan: 8,
      order: 5,
      config: {
        id: "revenue-trend",
        type: "line",
        title: "Tendência de Receita",
        description: "Últimos 6 meses",
        data: [
          { month: "Jan", revenue: 42000, target: 40000 },
          { month: "Fev", revenue: 48000, target: 45000 },
          { month: "Mar", revenue: 52000, target: 50000 },
          { month: "Abr", revenue: 58000, target: 55000 },
          { month: "Mai", revenue: 65000, target: 60000 },
          { month: "Jun", revenue: 72000, target: 70000 },
        ],
        dataKeys: ["revenue", "target"],
        xAxisKey: "month",
        colors: ["#3b82f6", "#22c55e"],
        height: 300,
        showGrid: true,
        showLegend: true,
        showTooltip: true,
      },
    },

    // Fleet Performance
    {
      id: "fleet-performance",
      type: "table",
      colspan: 4,
      order: 6,
      config: {
        title: "Performance da Frota",
        columns: [
          { id: "vessel", label: "Embarcação", width: "40%" },
          { id: "efficiency", label: "Eficiência", width: "30%", align: "center" as const },
          { id: "uptime", label: "Uptime", width: "30%", align: "center" as const },
        ],
        data: [
          { vessel: "Atlântico I", efficiency: "92%", uptime: "98%" },
          { vessel: "Pacífico II", efficiency: "88%", uptime: "95%" },
          { vessel: "Índico III", efficiency: "94%", uptime: "99%" },
        ],
        maxHeight: "300px",
      },
    },
  ],

  actions: [
    {
      id: "export-pdf",
      label: "Exportar PDF",
      icon: Activity,
      variant: "outline",
      onClick: () => {
        // Export logic
      },
    },
  ],

  showHeader: true,
  showFilters: true,
  showActions: true,
  refreshInterval: 300000, // 5 minutes
};
