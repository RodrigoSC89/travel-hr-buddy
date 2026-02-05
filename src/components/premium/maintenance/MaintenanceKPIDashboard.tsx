/**
 * FASE 2 - Maintenance Hub
 * Dashboard com KPIs MTBF/MTTR (benchmark: DNV ShipManager)
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, Clock, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, BarChart3, Target, Activity, Zap 
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Mock data - replace with real Supabase data
const mtbfData = [
  { month: "Jan", mtbf: 2100, mttr: 4.2, availability: 98.5 },
  { month: "Fev", mtbf: 2250, mttr: 3.8, availability: 98.8 },
  { month: "Mar", mtbf: 2180, mttr: 4.0, availability: 98.6 },
  { month: "Abr", mtbf: 2400, mttr: 3.5, availability: 99.1 },
  { month: "Mai", mtbf: 2350, mttr: 3.6, availability: 99.0 },
  { month: "Jun", mtbf: 2500, mttr: 3.2, availability: 99.3 },
];

const workOrdersByPriority = [
  { priority: "Crítica", count: 3, color: "hsl(var(--destructive))" },
  { priority: "Alta", count: 12, color: "hsl(var(--warning))" },
  { priority: "Média", count: 28, color: "hsl(var(--primary))" },
  { priority: "Baixa", count: 45, color: "hsl(var(--muted-foreground))" },
];

const equipmentHealth = [
  { name: "Motor Principal", health: 94, status: "good", nextMaintenance: "15 dias" },
  { name: "Sistema Hidráulico", health: 87, status: "warning", nextMaintenance: "5 dias" },
  { name: "Gerador Auxiliar", health: 92, status: "good", nextMaintenance: "22 dias" },
  { name: "Sistema de Navegação", health: 98, status: "good", nextMaintenance: "45 dias" },
  { name: "Bomba de Lastro", health: 78, status: "critical", nextMaintenance: "Vencida" },
];

export default function MaintenanceKPIDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MTBF (Mean Time Between Failures)</p>
                <p className="text-2xl font-bold">2,500h</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs último mês
                </div>
              </div>
              <Clock className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MTTR (Mean Time To Repair)</p>
                <p className="text-2xl font-bold">3.2h</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingDown className="h-3 w-3" />
                  -8% vs último mês
                </div>
              </div>
              <Wrench className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Disponibilidade</p>
                <p className="text-2xl font-bold">99.3%</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle className="h-3 w-3" />
                  Acima da meta (98%)
                </div>
              </div>
              <Activity className="h-8 w-8 text-cyan-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ordens Pendentes</p>
                <p className="text-2xl font-bold">88</p>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  3 críticas
                </div>
              </div>
              <Target className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MTBF/MTTR Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendência MTBF/MTTR
            </CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mtbfData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="mtbf" stroke="hsl(var(--primary))" strokeWidth={2} name="MTBF (h)" />
                <Line yAxisId="right" type="monotone" dataKey="mttr" stroke="hsl(var(--warning))" strokeWidth={2} name="MTTR (h)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Orders by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Ordens por Prioridade
            </CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workOrdersByPriority} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="priority" type="category" fontSize={12} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Saúde dos Equipamentos
          </CardTitle>
          <CardDescription>Monitoramento em tempo real baseado em sensores IoT</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {equipmentHealth.map((equipment) => (
              <div key={equipment.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      equipment.status === "good" ? "bg-success" : 
                      equipment.status === "warning" ? "bg-warning" : "bg-destructive"
                    }`} />
                    <span className="font-medium">{equipment.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      equipment.status === "good" ? "default" : 
                      equipment.status === "warning" ? "secondary" : "destructive"
                    }>
                      {equipment.health}% Health
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Próxima: {equipment.nextMaintenance}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={equipment.health} 
                  className={`h-2 ${
                    equipment.status === "good" ? "[&>div]:bg-success" : 
                    equipment.status === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
