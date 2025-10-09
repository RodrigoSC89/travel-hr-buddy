import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Users,
  Ship,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Globe,
  Shield,
  Target,
} from "lucide-react";

interface SystemStatus {
  name: string;
  status: "online" | "warning" | "offline";
  uptime: number;
  lastCheck: string;
}

interface KPIMetric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const systemStatus: SystemStatus[] = [
  { name: "Sistema Marítimo", status: "online", uptime: 99.9, lastCheck: "2 min ago" },
  { name: "Analytics IA", status: "online", uptime: 98.7, lastCheck: "1 min ago" },
  { name: "Blockchain Docs", status: "warning", uptime: 95.3, lastCheck: "5 min ago" },
  { name: "IoT Dashboard", status: "online", uptime: 99.2, lastCheck: "3 min ago" },
  { name: "Voice Interface", status: "online", uptime: 97.8, lastCheck: "1 min ago" },
  { name: "AR Interface", status: "warning", uptime: 92.1, lastCheck: "8 min ago" },
];

const kpiMetrics: KPIMetric[] = [
  {
    title: "Usuários Ativos",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Embarcações Monitoradas",
    value: "34",
    change: "+2",
    trend: "up",
    icon: Ship,
    color: "text-cyan-600",
  },
  {
    title: "Eficiência IA",
    value: "94.8%",
    change: "+3.2%",
    trend: "up",
    icon: Zap,
    color: "text-purple-600",
  },
  {
    title: "Compliance Score",
    value: "97.2%",
    change: "+1.8%",
    trend: "up",
    icon: Shield,
    color: "text-green-600",
  },
  {
    title: "Performance Geral",
    value: "96.5%",
    change: "+2.1%",
    trend: "up",
    icon: Target,
    color: "text-orange-600",
  },
  {
    title: "Satisfação",
    value: "4.8/5",
    change: "+0.2",
    trend: "up",
    icon: TrendingUp,
    color: "text-pink-600",
  },
];

export const SystemMonitoringDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const getStatusColor = (status: "online" | "warning" | "offline") => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "offline":
        return "text-red-600 bg-red-100";
    }
  };

  const getStatusIcon = (status: "online" | "warning" | "offline") => {
    switch (status) {
      case "online":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "offline":
        return AlertTriangle;
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Status dos Sistemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemStatus.map((system, index) => {
              const StatusIcon = getStatusIcon(system.status);
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">{system.name}</h4>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(system.status)}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {system.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uptime</span>
                      <span className="font-medium">{system.uptime}%</span>
                    </div>
                    <Progress value={system.uptime} className="h-2" />

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Verificado {system.lastCheck}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* KPI Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Métricas Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card
                  key={index}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedMetric === metric.title ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() =>
                    setSelectedMetric(selectedMetric === metric.title ? null : metric.title)
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-opacity-20 ${metric.color}`}>
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-medium text-sm text-muted-foreground">{metric.title}</h4>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p
                      className={`text-sm flex items-center gap-1 ${
                        metric.trend === "up"
                          ? "text-green-600"
                          : metric.trend === "down"
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {metric.change} vs mês anterior
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Global Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Score Global do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${95.8 * 2.51} ${100 * 2.51}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                  95.8%
                </span>
                <span className="text-sm text-muted-foreground">Health Score</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className="text-xl font-semibold text-green-600">Excelente</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
              <p className="text-xl font-semibold text-blue-600">99.2%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Segurança</p>
              <p className="text-xl font-semibold text-purple-600">Máxima</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eficiência</p>
              <p className="text-xl font-semibold text-orange-600">94.8%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
