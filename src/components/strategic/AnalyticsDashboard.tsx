import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Ship, 
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  Mail,
  Calendar,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KPIMetric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  unit?: string;
  target?: number;
  category: "operational" | "financial" | "hr" | "safety";
}

interface Report {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  lastGenerated: string;
  recipients: string[];
  format: "pdf" | "excel" | "powerbi";
  enabled: boolean;
}

export const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { toast } = useToast();

  const kpiMetrics: KPIMetric[] = [
    {
      id: "1",
      name: "Utilização de Frota",
      value: 78.5,
      change: 5.2,
      trend: "up",
      unit: "%",
      target: 85,
      category: "operational"
    },
    {
      id: "2",
      name: "Receita por Viagem",
      value: 125000,
      change: 8.7,
      trend: "up",
      unit: "R$",
      target: 130000,
      category: "financial"
    },
    {
      id: "3",
      name: "Tempo Médio de Turnaround",
      value: 4.2,
      change: -12.3,
      trend: "down",
      unit: "horas",
      target: 3.5,
      category: "operational"
    },
    {
      id: "4",
      name: "Satisfação da Tripulação",
      value: 4.6,
      change: 3.1,
      trend: "up",
      unit: "/5",
      target: 4.8,
      category: "hr"
    },
    {
      id: "5",
      name: "Incidentes de Segurança",
      value: 2,
      change: -40,
      trend: "down",
      unit: "ocorrências",
      target: 0,
      category: "safety"
    },
    {
      id: "6",
      name: "Economia de Combustível",
      value: 15.8,
      change: 12.4,
      trend: "up",
      unit: "%",
      target: 20,
      category: "operational"
    }
  ];

  const reports: Report[] = [
    {
      id: "1",
      name: "Relatório Operacional Diário",
      description: "Performance da frota, alertas e indicadores operacionais.",
      frequency: "daily",
      lastGenerated: "2025-01-16 08:00",
      recipients: ["operacoes@empresa.com", "gerencia@empresa.com"],
      format: "pdf",
      enabled: true
    },
    {
      id: "2",
      name: "Dashboard Executivo Semanal",
      description: "KPIs consolidados e análises estratégicas.",
      frequency: "weekly",
      lastGenerated: "2025-01-13 09:00",
      recipients: ["diretoria@empresa.com", "ceo@empresa.com"],
      format: "powerbi",
      enabled: true
    },
    {
      id: "3",
      name: "Relatório de RH Marítimo",
      description: "Certificações, escalas e bem-estar da tripulação.",
      frequency: "monthly",
      lastGenerated: "2025-01-01 10:00",
      recipients: ["rh@empresa.com", "capitania@empresa.com"],
      format: "excel",
      enabled: true
    },
    {
      id: "4",
      name: "Análise Financeira Mensal",
      description: "Custos operacionais, receitas e margem por rota.",
      frequency: "monthly",
      lastGenerated: "2025-01-01 11:00",
      recipients: ["financeiro@empresa.com", "controladoria@empresa.com"],
      format: "excel",
      enabled: false
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "down":
      return <TrendingUp className="h-4 w-4 text-danger rotate-180" />;
    default:
      return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "operational":
      return <Ship className="h-4 w-4 text-primary" />;
    case "financial":
      return <DollarSign className="h-4 w-4 text-success" />;
    case "hr":
      return <Users className="h-4 w-4 text-info" />;
    case "safety":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    default:
      return <BarChart3 className="h-4 w-4" />;
    }
  };

  const generateReport = async (reportId: string) => {
    toast({
      title: "Gerando Relatório",
      description: "O relatório está sendo processado...",
    });

    // Simular geração
    setTimeout(() => {
      toast({
        title: "Relatório Gerado",
        description: "O relatório foi enviado para os destinatários configurados.",
      });
    }, 2000);
  };

  const exportDashboard = async (format: string) => {
    toast({
      title: "Exportando Dashboard",
      description: `Exportando dashboard em formato ${format.toUpperCase()}...`,
    });

    setTimeout(() => {
      toast({
        title: "Dashboard Exportado",
        description: `Dashboard exportado com sucesso em ${format.toUpperCase()}.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics & Business Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Dashboards dinâmicos, KPIs e relatórios automáticos para gestão estratégica.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportDashboard("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportDashboard("excel")}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportDashboard("powerbi")}>
                <Download className="h-4 w-4 mr-2" />
                Power BI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="kpis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kpis">KPIs & Métricas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios Automáticos</TabsTrigger>
          <TabsTrigger value="governance">Governança de Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiMetrics.map((metric) => (
              <Card key={metric.id} className="glass-effect hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(metric.category)}
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {typeof metric.value === "number" && metric.unit === "R$" 
                        ? `R$ ${metric.value.toLocaleString()}`
                        : `${metric.value}${metric.unit || ""}`
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        metric.change > 0 ? &quot;text-success&quot; : metric.change < 0 ? "text-danger" : "text-muted-foreground"
                      }`}>
                        {metric.change > 0 ? "+" : ""}{metric.change}%
                      </span>
                      {metric.target && (
                        <span className="text-sm text-muted-foreground">
                          Meta: {metric.target}{metric.unit}
                        </span>
                      )}
                    </div>
                    {metric.target && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((Number(metric.value) / metric.target) * 100, 100)}%`
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Time Series Chart Placeholder */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tendências Temporais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Gráfico de séries temporais em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground">Integração com Recharts/Chart.js planejada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Report Management */}
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {report.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.enabled ? "default" : "secondary"}>
                        {report.enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                        {report.frequency}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Último Relatório:</span>
                        <p className="text-muted-foreground">{report.lastGenerated}</p>
                      </div>
                      <div>
                        <span className="font-medium">Formato:</span>
                        <p className="text-muted-foreground uppercase">{report.format}</p>
                      </div>
                      <div>
                        <span className="font-medium">Destinatários:</span>
                        <p className="text-muted-foreground">{report.recipients.length} pessoa(s)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => generateReport(report.id)}
                        disabled={!report.enabled}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Gerar Agora
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Destinatários
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          {/* Data Governance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Qualidade dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completude</span>
                    <span className="font-bold text-success">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Consistência</span>
                    <span className="font-bold text-success">96.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Precisão</span>
                    <span className="font-bold text-warning">89.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Atualidade</span>
                    <span className="font-bold text-success">99.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-info" />
                  Retenção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Dados Operacionais</span>
                    <span className="font-bold">7 anos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Logs de Sistema</span>
                    <span className="font-bold">2 anos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dados de RH</span>
                    <span className="font-bold">15 anos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Auditoria</span>
                    <span className="font-bold">Permanente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Export & Compliance */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Exportação & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">LGPD Compliant</h4>
                  <div className="text-2xl font-bold text-success mb-2">✓</div>
                  <p className="text-sm text-muted-foreground">
                    Direito ao esquecimento implementado
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Backup Automático</h4>
                  <div className="text-2xl font-bold text-success mb-2">24h</div>
                  <p className="text-sm text-muted-foreground">
                    Últimas 30 versões mantidas
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Criptografia</h4>
                  <div className="text-2xl font-bold text-success mb-2">AES-256</div>
                  <p className="text-sm text-muted-foreground">
                    Em repouso e em trânsito
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};