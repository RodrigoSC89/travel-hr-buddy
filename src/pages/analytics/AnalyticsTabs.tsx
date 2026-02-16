/**
 * Analytics - Core, Advanced, Predictive, Insights Tabs
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import {
  TrendingUp, TrendingDown, Activity, Brain, Check, Zap, Users,
  DollarSign, Clock, BarChart3, AlertTriangle, CheckCircle, Fuel, Eye
} from "lucide-react";
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell,
  AreaChart, LineChart as RechartsLineChart
} from "recharts";
import type { KPIMetric, AIInsight, PredictiveInsight, FleetMetrics } from "./types";
import {
  CHART_COLORS, REVENUE_DATA, CATEGORY_DATA, PERFORMANCE_DATA,
  MAINTENANCE_DATA, RISK_DATA, MODEL_ACCURACY
} from "./types";
import { Target } from "lucide-react";

// ============ HELPERS ============
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="h-4 w-4 text-success" />;
    case "down": return <TrendingDown className="h-4 w-4 text-destructive" />;
    default: return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const getImpactBadge = (impact: string) => {
  switch (impact) {
    case "high": return <Badge variant="destructive">Alto Impacto</Badge>;
    case "medium": return <Badge variant="secondary">Médio Impacto</Badge>;
    default: return <Badge variant="outline">Baixo Impacto</Badge>;
  }
};

interface AnalyticsTabsProps {
  metrics: KPIMetric[];
  insights: AIInsight[];
  predictions: PredictiveInsight[];
  fleetMetrics: FleetMetrics | null;
}

export const AnalyticsTabs = ({ metrics, insights, predictions, fleetMetrics }: AnalyticsTabsProps) => (
  <>
    {/* Core Tab */}
    <TabsContent value="core" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.slice(0, 8).map((metric) => (
          <Card key={metric.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{metric.name}</p>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{metric.value}</span>
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs ${metric.change >= 0 ? "text-success" : "text-destructive"}`}>
                  {metric.change >= 0 ? "+" : ""}{metric.change}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Receita, Custos e Lucro</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="receita" fill="#3b82f6" name="Receita" />
                <Bar dataKey="custos" fill="#f59e0b" name="Custos" />
                <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} name="Lucro" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Distribuição por Categoria</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  {CATEGORY_DATA.map((entry, i) => (
                    <Cell key={`pie2-${entry.name}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip /><Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    {/* Advanced Tab */}
    <TabsContent value="advanced" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Eficiência de Combustível</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                <Line type="monotone" dataKey="fuel_efficiency" stroke="#8884d8" name="Eficiência %" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Receita Diária</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" name="Receita" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Eficiência da Tripulação</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm">Performance Geral</span><span className="font-semibold">{fleetMetrics?.crew_efficiency}%</span></div>
              <Progress value={fleetMetrics?.crew_efficiency} className="h-2" />
              <div className="text-xs text-success">+3.2% vs período anterior</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Fuel className="h-5 w-5" />Consumo de Combustível</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm">Litros/Milha</span><span className="font-semibold">{fleetMetrics?.fuel_consumption}</span></div>
              <Progress value={75} className="h-2" />
              <div className="text-xs text-success">-5.8% vs período anterior</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Score Ambiental</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm">Sustentabilidade</span><span className="font-semibold">{fleetMetrics?.environmental_score}%</span></div>
              <Progress value={fleetMetrics?.environmental_score} className="h-2" />
              <div className="text-xs text-success">+1.5% vs período anterior</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    {/* Predictive Tab */}
    <TabsContent value="predictive" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(MODEL_ACCURACY).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisão {key.charAt(0).toUpperCase() + key.slice(1)}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}%</div>
              <Progress value={value} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {predictions.map((prediction) => (
          <Card key={prediction.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{prediction.title}</CardTitle>
                {getImpactBadge(prediction.impact)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Confiança</span><span className="font-medium">{prediction.confidence}%</span></div>
                <Progress value={prediction.confidence} />
              </div>
              <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span>Prazo: {prediction.timeline}</span></div>
              <p className="text-sm text-muted-foreground">{prediction.description}</p>
              <div className="flex items-center gap-2 text-sm text-success"><DollarSign className="h-4 w-4" /><span>Economia potencial: R$ {prediction.potential_savings.toLocaleString()}</span></div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Ações Recomendadas:</div>
                <ul className="text-xs space-y-1">
                  {prediction.actions.map((action) => (<li key={action} className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />{action}</li>))}
                </ul>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1"><Eye className="h-4 w-4 mr-2" />Detalhes</Button>
                <Button size="sm" className="flex-1">Aplicar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Tendências de Manutenção Preditiva</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={MAINTENANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2} name="Predito" />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--secondary))" strokeWidth={2} name="Real" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Distribuição de Riscos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie data={RISK_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  {RISK_DATA.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                </Pie>
                <Tooltip /><Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    {/* AI Insights Tab */}
    <TabsContent value="insights" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className={`border-l-4 ${
            insight.priority === "high" ? "border-l-destructive" :
            insight.priority === "medium" ? "border-l-warning" : "border-l-primary"
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </div>
                <Badge variant={insight.priority === "high" ? "destructive" : "secondary"}>{insight.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{insight.content}</p>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Confiança</span><span className="font-medium">{insight.confidence}%</span></div>
              <Progress value={insight.confidence} className="h-2" />
              <div className="flex items-center gap-2">
                <Badge variant="outline">{insight.type}</Badge>
                {insight.actionable && <Badge variant="secondary">Acionável</Badge>}
              </div>
              {insight.actionable && (
                <Button size="sm" className="w-full"><Zap className="h-4 w-4 mr-2" />Aplicar Recomendação</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Alertas de Risco</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div className="flex-1">
              <div className="font-medium text-sm">Alto Risco - Motor Auxiliar</div>
              <div className="text-xs text-muted-foreground">Temperatura elevada detectada</div>
            </div>
            <Button size="sm" variant="destructive">Ação Urgente</Button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div className="flex-1">
              <div className="font-medium text-sm">Médio Risco - Sistema Hidráulico</div>
              <div className="text-xs text-muted-foreground">Pressão ligeiramente baixa</div>
            </div>
            <Button size="sm" variant="outline">Monitorar</Button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
            <CheckCircle className="h-4 w-4 text-success" />
            <div className="flex-1">
              <div className="font-medium text-sm">Baixo Risco - Todos os Sistemas</div>
              <div className="text-xs text-muted-foreground">Operação normal</div>
            </div>
            <Badge variant="outline" className="text-success">OK</Badge>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </>
);
