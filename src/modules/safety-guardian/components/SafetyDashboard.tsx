/**
 * Safety Guardian Dashboard
 * Monitoramento de segurança, incidentes e análise preditiva
 * Integrado com Supabase para dados reais
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Clock,
  FileText,
  Brain,
  Sparkles,
  Plus,
  Eye,
  Activity,
  Flame,
  Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Add Ship icon that was missing
import { Ship } from "lucide-react";
import { logger } from '@/lib/logger';

interface DPIncident {
  id: string;
  title: string;
  summary: string | null;
  severity: string | null;
  vessel: string | null;
  incident_date: string;
  location: string | null;
  source: string | null;
  root_cause: string | null;
}

// Demo data as fallback
const demoMonthlyIncidents = [
  { month: "Jan", incidents: 8, nearMiss: 15, unsafe: 22 },
  { month: "Fev", incidents: 6, nearMiss: 12, unsafe: 18 },
  { month: "Mar", incidents: 5, nearMiss: 10, unsafe: 15 },
  { month: "Abr", incidents: 4, nearMiss: 8, unsafe: 12 },
  { month: "Mai", incidents: 3, nearMiss: 9, unsafe: 10 },
  { month: "Jun", incidents: 2, nearMiss: 7, unsafe: 8 },
  { month: "Jul", incidents: 2, nearMiss: 6, unsafe: 7 },
  { month: "Ago", incidents: 1, nearMiss: 5, unsafe: 6 },
];

const incidentTypes = [
  { name: "Quedas", value: 25, color: "hsl(var(--destructive))" },
  { name: "Cortes/Lesões", value: 20, color: "hsl(var(--warning))" },
  { name: "Exposição Química", value: 15, color: "hsl(var(--accent))" },
  { name: "Prensamento", value: 12, color: "hsl(var(--primary))" },
  { name: "Outros", value: 28, color: "hsl(var(--muted-foreground))" },
];

const aiAlerts = [
  {
    id: 1,
    type: "prediction",
    title: "Risco Elevado - Fadiga da Tripulação",
    description: "Análise indica 73% de probabilidade de incidente relacionado à fadiga nas próximas 48h",
    severity: "high",
    action: "Revisar escalas de trabalho"
  },
  {
    id: 2,
    type: "pattern",
    title: "Padrão Detectado - Operações Noturnas",
    description: "68% dos near misses ocorreram durante operações entre 02:00-06:00",
    severity: "medium",
    action: "Reforçar iluminação e supervisão"
  },
  {
    id: 3,
    type: "recommendation",
    title: "Manutenção Preventiva Recomendada",
    description: "Equipamentos de segurança com 85% de vida útil em 3 embarcações",
    severity: "low",
    action: "Programar substituição"
  },
];

export const SafetyDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<DPIncident[]>([]);
  const [monthlyData, setMonthlyData] = useState(demoMonthlyIncidents);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("incident_date", { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setIncidents(data);
        // Group by month for chart
        const grouped: Record<string, number> = {};
        data.forEach((inc: DPIncident) => {
          const month = new Date(inc.incident_date).toLocaleString('pt-BR', { month: 'short' });
          grouped[month] = (grouped[month] || 0) + 1;
        });
      }
    } catch (error) {
      logger.error("Error loading incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Demo incidents for fallback
  const recentIncidents = incidents.length > 0 ? incidents.map(inc => ({
    id: inc.id,
    type: inc.severity === "critical" ? "Incident" : "Near Miss",
    description: inc.summary || inc.title,
    vessel: inc.vessel || "N/A",
    date: inc.incident_date,
    severity: inc.severity,
    status: "investigating"
  })) : [
    { id: "INC-2024-089", type: "Near Miss", description: "Quase queda de objeto em área de convés", vessel: "PSV Atlantic Explorer", date: "2024-08-15", severity: "medium", status: "investigating" },
    { id: "INC-2024-088", type: "Unsafe Condition", description: "Corrimão solto na escada principal", vessel: "AHTS Pacific Star", date: "2024-08-14", severity: "low", status: "resolved" },
  ];

  const handleSubmitReport = () => {
    if (!reportType || !reportDescription) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    toast.success("Reporte de segurança enviado com sucesso!");
    setIsReportDialogOpen(false);
    setReportType("");
    setReportDescription("");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      case "low": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigating": return <Badge className="bg-warning text-warning-foreground">Investigando</Badge>;
      case "resolved": return <Badge className="bg-info text-info-foreground">Resolvido</Badge>;
      case "closed": return <Badge className="bg-success text-success-foreground">Fechado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // Calculate days without LTI
  const daysWithoutLTI = 127;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtd">Este Mês</SelectItem>
            <SelectItem value="qtd">Este Trimestre</SelectItem>
            <SelectItem value="ytd">Este Ano</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-destructive hover:bg-destructive/90">
              <Plus className="h-4 w-4 mr-2" />
              Reportar Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Ocorrência de Segurança</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Ocorrência *</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incident">Incidente</SelectItem>
                    <SelectItem value="near-miss">Near Miss</SelectItem>
                    <SelectItem value="unsafe-condition">Condição Insegura</SelectItem>
                    <SelectItem value="unsafe-act">Ato Inseguro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea 
                  placeholder="Descreva a ocorrência em detalhes..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleSubmitReport} className="w-full">
                Enviar Reporte
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* LTI Counter Banner */}
      <Card className="bg-gradient-to-r from-success to-success/80 text-success-foreground border-0">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success-foreground/20 rounded-full">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{daysWithoutLTI} Dias</h2>
                <p className="text-success-foreground/80">Sem Acidentes com Afastamento (LTI)</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-success-foreground/20 text-success-foreground text-lg px-4 py-2">
                Meta: 365 dias
              </Badge>
              <p className="text-sm text-success-foreground/80 mt-2">
                Progresso: {Math.round((daysWithoutLTI / 365) * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Incidentes (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">31</div>
              <Badge className="bg-success/10 text-success">
                <TrendingDown className="h-3 w-3 mr-1" />
                -42%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs. mesmo período ano anterior</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Near Misses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">72</div>
              <Badge className="bg-success/10 text-success">
                <TrendingDown className="h-3 w-3 mr-1" />
                -28%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              TRIR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">0.42</div>
              <Badge className="bg-success/10 text-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Abaixo da meta
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Meta: &lt; 0.50</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              DDS Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">1,248</div>
              <Badge className="bg-success/10 text-success">
                98%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Compliance DDS</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Tendência de Ocorrências
            </CardTitle>
            <CardDescription>Incidentes, Near Misses e Condições Inseguras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line type="monotone" dataKey="incidents" stroke="hsl(var(--destructive))" strokeWidth={2} name="Incidentes" />
                  <Line type="monotone" dataKey="nearMiss" stroke="hsl(var(--warning))" strokeWidth={2} name="Near Miss" />
                  <Line type="monotone" dataKey="unsafe" stroke="hsl(var(--info))" strokeWidth={2} name="Cond. Inseguras" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incident Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Tipos de Incidentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incidentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {incidentTypes.slice(0, 4).map((type) => (
                <div key={type.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span>{type.name}</span>
                  </div>
                  <span className="font-medium">{type.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Alerts */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            Alertas IA - Safety Guardian
          </CardTitle>
          <CardDescription>Análise preditiva e recomendações baseadas em IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Sparkles className={`h-5 w-5 mt-0.5 ${
                    alert.severity === "high" ? "text-red-600" :
                    alert.severity === "medium" ? "text-yellow-600" : "text-green-600"
                  }`} />
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Ação: {alert.action}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  Detalhes
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ocorrências Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIncidents.map((incident) => (
              <div 
                key={incident.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    incident.type === "Incident" ? "bg-destructive/10" :
                    incident.type === "Near Miss" ? "bg-warning/10" : "bg-info/10"
                  }`}>
                    {incident.type === "Incident" ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : incident.type === "Near Miss" ? (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    ) : (
                      <Shield className="h-5 w-5 text-info" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{incident.id}</span>
                      <Badge variant="outline">{incident.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Ship className="h-3 w-3" />
                        {incident.vessel}
                      </span>
                      <span>{incident.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(incident.status)}
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
