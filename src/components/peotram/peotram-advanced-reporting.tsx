import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart,
  Download, 
  Mail, 
  Calendar,
  Filter,
  FileText,
  Eye,
  Share,
  Settings,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Users,
  Ship,
  Building,
  Globe
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface Report {
  id: string;
  name: string;
  description: string;
  type: "compliance-trend" | "performance-analysis" | "risk-assessment" | "operational-summary" | "custom";
  frequency: "manual" | "daily" | "weekly" | "monthly" | "quarterly";
  lastGenerated?: string;
  nextScheduled?: string;
  recipients: string[];
  format: "pdf" | "excel" | "powerpoint" | "dashboard";
  status: "active" | "paused" | "draft";
}

export const PeotramAdvancedReporting: React.FC = () => {
  const [reports, setReports] = useState<Report[]>(getDemoReports());
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  function getDemoReports(): Report[] {
    return [
      {
        id: "RPT001",
        name: "Relatório Mensal de Conformidade",
        description: "Análise detalhada de conformidade PEOTRAM mensal",
        type: "compliance-trend",
        frequency: "monthly",
        lastGenerated: "2024-01-15",
        nextScheduled: "2024-02-15",
        recipients: ["diretoria@empresa.com", "qualidade@empresa.com"],
        format: "pdf",
        status: "active"
      },
      {
        id: "RPT002",
        name: "Dashboard Executivo Semanal",
        description: "Resumo executivo de KPIs e indicadores semanais",
        type: "performance-analysis",
        frequency: "weekly",
        lastGenerated: "2024-01-20",
        nextScheduled: "2024-01-27",
        recipients: ["ceo@empresa.com", "coo@empresa.com"],
        format: "powerpoint",
        status: "active"
      },
      {
        id: "RPT003",
        name: "Análise de Riscos Trimestral",
        description: "Avaliação completa de riscos e tendências",
        type: "risk-assessment",
        frequency: "quarterly",
        lastGenerated: "2024-01-01",
        nextScheduled: "2024-04-01",
        recipients: ["risco@empresa.com"],
        format: "excel",
        status: "active"
      }
    ];
  }

  const complianceData = [
    { month: "Jan", score: 85, target: 90 },
    { month: "Feb", score: 88, target: 90 },
    { month: "Mar", score: 92, target: 90 },
    { month: "Apr", score: 87, target: 90 },
    { month: "May", score: 94, target: 90 },
    { month: "Jun", score: 91, target: 90 }
  ];

  const performanceData = [
    { name: "Auditorias Concluídas", value: 45, color: "#22c55e" },
    { name: "Em Andamento", value: 12, color: "#3b82f6" },
    { name: "Pendentes", value: 8, color: "#f59e0b" },
    { name: "Atrasadas", value: 3, color: "#ef4444" }
  ];

  const riskData = [
    { category: "Operacional", critical: 2, high: 5, medium: 12, low: 8 },
    { category: "Ambiental", critical: 1, high: 3, medium: 8, low: 15 },
    { category: "Segurança", critical: 3, high: 7, medium: 10, low: 6 },
    { category: "Regulatório", critical: 0, high: 2, medium: 6, low: 12 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active": return "bg-success/20 text-success border-success/30";
    case "paused": return "bg-warning/20 text-warning border-warning/30";
    case "draft": return "bg-muted/20 text-muted-foreground border-muted/30";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "compliance-trend": return <TrendingUp className="w-4 h-4" />;
    case "performance-analysis": return <BarChart3 className="w-4 h-4" />;
    case "risk-assessment": return <AlertTriangle className="w-4 h-4" />;
    case "operational-summary": return <Target className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
    }
  };

  const generateReport = (reportId: string) => {// Implementar geração de relatório
  };

  const scheduleReport = (reportId: string) => {// Implementar agendamento
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatórios Avançados</h2>
          <p className="text-muted-foreground">
            Análises detalhadas e relatórios personalizados do sistema PEOTRAM
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Relatório</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Nome do Relatório</Label>
                    <Input id="report-name" placeholder="Nome do relatório" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compliance-trend">Tendência de Conformidade</SelectItem>
                        <SelectItem value="performance-analysis">Análise de Performance</SelectItem>
                        <SelectItem value="risk-assessment">Avaliação de Riscos</SelectItem>
                        <SelectItem value="operational-summary">Resumo Operacional</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-frequency">Frequência</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-format">Formato</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint</SelectItem>
                        <SelectItem value="dashboard">Dashboard Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Métricas e Dados</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compliance-score" />
                      <Label htmlFor="compliance-score">Score de Conformidade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="non-conformities" />
                      <Label htmlFor="non-conformities">Não Conformidades</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="audit-progress" />
                      <Label htmlFor="audit-progress">Progresso de Auditorias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="risk-analysis" />
                      <Label htmlFor="risk-analysis">Análise de Riscos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="training-status" />
                      <Label htmlFor="training-status">Status de Treinamentos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="performance-kpis" />
                      <Label htmlFor="performance-kpis">KPIs de Performance</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Destinatários (emails separados por vírgula)</Label>
                  <Input id="recipients" placeholder="email1@empresa.com, email2@empresa.com" />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewReportOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewReportOpen(false)}>
                    Criar Relatório
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendência de Conformidade
                </CardTitle>
                <CardDescription>Score de conformidade ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Status das Auditorias
                </CardTitle>
                <CardDescription>Distribuição atual das auditorias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Análise de Riscos por Categoria
              </CardTitle>
              <CardDescription>Distribuição de riscos por categoria e severidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                  <Bar dataKey="high" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="medium" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="low" stackId="a" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Freq: {report.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span>Formato: {report.format}</span>
                    </div>
                  </div>

                  {report.lastGenerated && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      Último: {report.lastGenerated}
                    </div>
                  )}

                  {report.nextScheduled && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Próximo: {report.nextScheduled}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{report.recipients.length} destinatários</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => generateReport(report.id)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Gerar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => scheduleReport(report.id)}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Agendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="text-center p-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Relatórios Agendados</h3>
            <p className="text-muted-foreground mb-4">
              Gerencie agendamentos e automatizações de relatórios
            </p>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Configurar Agendamento
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center p-8">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Avançado</h3>
            <p className="text-muted-foreground mb-4">
              Análises preditivas e insights avançados dos dados PEOTRAM
            </p>
            <Button>
              <TrendingUp className="w-4 h-4 mr-2" />
              Acessar Analytics
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};