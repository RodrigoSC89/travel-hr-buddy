import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const complianceTrend = [
  { month: "Mai", compliance: 78, target: 85 },
  { month: "Jun", compliance: 81, target: 85 },
  { month: "Jul", compliance: 83, target: 85 },
  { month: "Ago", compliance: 82, target: 85 },
  { month: "Set", compliance: 84, target: 85 },
  { month: "Out", compliance: 84, target: 85 }
];

const practiceCompliance = [
  { practice: "P1", name: "Liderança", score: 95 },
  { practice: "P2", name: "Riscos", score: 78 },
  { practice: "P3", name: "Controles", score: 92 },
  { practice: "P4", name: "Treinamento", score: 65 },
  { practice: "P5", name: "Comunicação", score: 88 },
  { practice: "P13", name: "Mudanças", score: 58 },
  { practice: "P17", name: "Integridade", score: 62 }
];

const incidentStats = [
  { name: "Críticos", value: 1, color: "hsl(var(--destructive))" },
  { name: "Altos", value: 3, color: "hsl(var(--warning))" },
  { name: "Médios", value: 5, color: "hsl(var(--warning))" },
  { name: "Baixos", value: 3, color: "hsl(var(--info))" }
];

const auditResults = [
  { category: "Conformidades", value: 85, color: "hsl(var(--success))" },
  { category: "Não Conformidades", value: 10, color: "hsl(var(--destructive))" },
  { category: "Observações", value: 5, color: "hsl(var(--info))" }
];

export const ComplianceMetrics: React.FC = () => {
  const currentCompliance = 84;
  const targetCompliance = 90;
  const trend = "+2%";

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-10 w-10 text-primary" />
              <Badge className="bg-primary text-primary-foreground font-bold">COMPLIANCE</Badge>
            </div>
            <h3 className="text-sm font-medium text-primary mb-1">Compliance Geral</h3>
            <p className="text-3xl font-bold text-foreground">{currentCompliance}%</p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <p className="text-xs text-success font-bold">{trend} vs. mês anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
              <Badge className="bg-success text-success-foreground font-bold">PRÁTICAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-success mb-1">Práticas Conformes</h3>
            <p className="text-3xl font-bold text-foreground">10/17</p>
            <p className="text-xs text-success mt-2">58.8% do total</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-warning" />
              <Badge className="bg-warning text-warning-foreground font-bold">INCIDENTES</Badge>
            </div>
            <h3 className="text-sm font-medium text-warning mb-1">Incidentes Ativos</h3>
            <p className="text-3xl font-bold text-foreground">4</p>
            <p className="text-xs text-warning mt-2">12 total no mês</p>
          </CardContent>
        </Card>

        <Card className="bg-accent/50 border-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-10 w-10 text-accent-foreground" />
              <Badge className="bg-accent text-accent-foreground font-bold">META</Badge>
            </div>
            <h3 className="text-sm font-medium text-accent-foreground mb-1">Meta ANP</h3>
            <p className="text-3xl font-bold text-foreground">{targetCompliance}%</p>
            <p className="text-xs text-accent-foreground mt-2">Gap: {targetCompliance - currentCompliance}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tendência de Compliance
            </CardTitle>
            <CardDescription>Evolução mensal vs. meta ANP</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Compliance Atual"
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Meta ANP"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Practice Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Compliance por Prática
            </CardTitle>
            <CardDescription>Score das 17 práticas ANP (principais)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={practiceCompliance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="practice" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}%`,
                    props.payload.name
                  ]}
                />
                <Bar dataKey="score" name="Score">
                  {practiceCompliance.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.score >= 85 ? "hsl(var(--success))" : entry.score >= 70 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Distribuição de Incidentes
            </CardTitle>
            <CardDescription>Por severidade no último mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incidentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {incidentStats.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audit Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Resultados de Auditorias
            </CardTitle>
            <CardDescription>Última auditoria ANP - Setembro 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={auditResults}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${value}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {auditResults.map((entry) => (
                    <Cell key={`cell-${entry.category}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalhadas por Prática</CardTitle>
          <CardDescription>Score e status de cada uma das 17 práticas ANP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {practiceCompliance.map((practice) => (
              <div key={practice.practice} className="p-4 border-2 border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        practice.score >= 85
                          ? "bg-success text-success-foreground"
                          : practice.score >= 70
                            ? "bg-warning text-warning-foreground"
                            : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {practice.practice}
                    </Badge>
                    <span className="font-bold text-foreground">{practice.name}</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{practice.score}%</span>
                </div>
                <Progress value={practice.score} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceMetrics;
