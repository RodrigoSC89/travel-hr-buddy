/**
 * Analytics Dashboard Example Configuration
 * Exemplo de configuração para Analytics Dashboard
 * FASE B.2 - Consolidação de Dashboards
 */

import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { AnalyticsDashboardConfig } from "@/types/dashboard-config";

export const analyticsDashboardConfig: AnalyticsDashboardConfig = {
  id: "analytics-dashboard",
  title: "Analytics Dashboard",
  description: "Dashboard de análises avançadas com métricas detalhadas",
  
  layout: {
    type: "grid",
    columns: 12,
    gap: 16,
    responsive: true,
  },

  theme: {
    primaryColor: "blue",
    accentColor: "purple",
    cardStyle: "elevated",
    borderRadius: "lg",
  },

  timeRanges: ["7d", "30d", "90d", "1y"],
  defaultTimeRange: "30d",

  categories: ["Receita", "Custos", "Eficiência", "Tripulação"],

  filters: [
    {
      id: "metric",
      type: "select",
      label: "Métrica",
      options: [
        { value: "all", label: "Todas as Métricas" },
        { value: "revenue", label: "Receita" },
        { value: "costs", label: "Custos" },
        { value: "efficiency", label: "Eficiência" },
      ],
      defaultValue: "all",
    },
  ],

  widgets: [
    // KPI Trend Cards
    {
      id: "total-revenue-kpi",
      type: "kpi",
      colspan: 3,
      config: {
        id: "total-revenue",
        title: "Receita Total",
        value: "R$ 325.000",
        change: 12.5,
        trend: "up",
        icon: TrendingUp,
        description: "vs período anterior",
      },
    },
    {
      id: "avg-revenue-kpi",
      type: "kpi",
      colspan: 3,
      config: {
        id: "avg-revenue",
        title: "Receita Média",
        value: "R$ 54.167",
        change: 8.3,
        trend: "up",
        icon: BarChart3,
        description: "por viagem",
      },
    },
    {
      id: "efficiency-index-kpi",
      type: "kpi",
      colspan: 3,
      config: {
        id: "efficiency-index",
        title: "Índice de Eficiência",
        value: "87.3",
        suffix: "%",
        change: 5.7,
        trend: "up",
        icon: Activity,
        target: 90,
        description: "Meta: 90%",
      },
    },
    {
      id: "cost-savings-kpi",
      type: "kpi",
      colspan: 3,
      config: {
        id: "cost-savings",
        title: "Economia de Custos",
        value: "R$ 42.000",
        change: 18.2,
        trend: "up",
        icon: PieChart,
        description: "vs baseline",
      },
    },

    // Trend Chart
    {
      id: "revenue-trend-chart",
      type: "chart",
      colspan: 8,
      config: {
        id: "revenue-trend",
        type: "area",
        title: "Tendência de Receita e Custos",
        description: "Análise temporal",
        data: [
          { date: "Sem 1", revenue: 52000, costs: 32000 },
          { date: "Sem 2", revenue: 55000, costs: 33000 },
          { date: "Sem 3", revenue: 58000, costs: 35000 },
          { date: "Sem 4", revenue: 62000, costs: 36000 },
        ],
        dataKeys: ["revenue", "costs"],
        xAxisKey: "date",
        colors: ["#3b82f6", "#f59e0b"],
        height: 350,
        showGrid: true,
        showLegend: true,
        showTooltip: true,
      },
    },

    // Distribution Pie Chart
    {
      id: "distribution-chart",
      type: "chart",
      colspan: 4,
      config: {
        id: "category-distribution",
        type: "pie",
        title: "Distribuição por Categoria",
        data: [
          { name: "Passageiros", value: 45 },
          { name: "Carga", value: 30 },
          { name: "Serviços", value: 25 },
        ],
        dataKeys: ["value"],
        xAxisKey: "name",
        colors: ["#3b82f6", "#22c55e", "#f59e0b"],
        height: 350,
        showLegend: true,
        showTooltip: true,
      },
    },

    // Performance Table
    {
      id: "performance-metrics",
      type: "table",
      colspan: 12,
      config: {
        title: "Métricas de Performance Detalhadas",
        description: "Visão geral de todas as métricas",
        columns: [
          { id: "metric", label: "Métrica", width: "30%" },
          { id: "current", label: "Atual", width: "20%", align: "center" as const },
          { id: "target", label: "Meta", width: "20%", align: "center" as const },
          { id: "variance", label: "Variação", width: "15%", align: "center" as const },
          { id: "status", label: "Status", width: "15%", align: "center" as const },
        ],
        data: [
          { metric: "Utilização de Frota", current: "78.5%", target: "85%", variance: "-6.5%", status: "⚠️" },
          { metric: "Satisfação da Tripulação", current: "4.6/5", target: "4.8/5", variance: "-4.2%", status: "⚠️" },
          { metric: "Eficiência Operacional", current: "92%", target: "90%", variance: "+2%", status: "✅" },
          { metric: "Tempo de Turnaround", current: "4.2h", target: "3.5h", variance: "+20%", status: "🔴" },
        ],
        maxHeight: "400px",
      },
    },
  ],

  exportFormats: ["csv", "json", "pdf", "excel"],
  drillDownEnabled: true,
  realtimeEnabled: false,
  compareMode: true,
};
