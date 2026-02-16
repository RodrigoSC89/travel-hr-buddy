/**
 * Analytics - Overview Tab
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, DollarSign, Ship, CheckCircle, Brain } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell,
  LineChart as RechartsLineChart, Line
} from "recharts";
import type { FleetMetrics, AIInsight } from "./types";
import { CHART_COLORS, REVENUE_DATA, TREND_DATA, CATEGORY_DATA } from "./types";

interface OverviewTabProps {
  fleetMetrics: FleetMetrics | null;
  insights: AIInsight[];
}

export const OverviewTab = ({ fleetMetrics, insights }: OverviewTabProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {fleetMetrics && (
        <>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eficiência Geral</p>
                  <p className="text-3xl font-bold">{fleetMetrics.efficiency}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">+2.3%</span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                  <p className="text-3xl font-bold">{fleetMetrics.profit_margin}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">+5.1%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilização da Frota</p>
                  <p className="text-3xl font-bold">{fleetMetrics.vessel_utilization}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-destructive">-1.2%</span>
                  </div>
                </div>
                <Ship className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score de Segurança</p>
                  <p className="text-3xl font-bold">{fleetMetrics.safety_score}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">Excelente</span>
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Receita vs Custos</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
              <Area type="monotone" dataKey="receita" stackId="1" stroke="#10b981" fill="#10b981" name="Receita" />
              <Area type="monotone" dataKey="custos" stackId="2" stroke="#f59e0b" fill="#f59e0b" name="Custos" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tendências de Eficiência</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="eficiencia" stroke="#3b82f6" name="Eficiência" />
              <Line type="monotone" dataKey="disponibilidade" stroke="#10b981" name="Disponibilidade" />
              <Line type="monotone" dataKey="manutencao" stroke="#f59e0b" name="Manutenção" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader><CardTitle>Distribuição de Custos</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPie>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {CATEGORY_DATA.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip /><Legend />
            </RechartsPie>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Insights de IA Recentes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{insight.title}</span>
                    <Badge variant={insight.priority === "high" ? "destructive" : "secondary"} className="text-xs">{insight.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.content}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
