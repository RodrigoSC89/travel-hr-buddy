import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Download,
  Eye,
  Filter,
  Target,
  Globe,
  Ship,
  Clock,
  AlertCircle
} from "lucide-react";

interface KPIMetric {
  id: string;
  name: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  target?: string;
  unit: string;
}

interface Report {
  id: string;
  title: string;
  type: "financial" | "operational" | "compliance" | "performance";
  lastGenerated: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  recipients: number;
  status: "ready" | "generating" | "scheduled";
}

interface Benchmark {
  id: string;
  metric: string;
  ourValue: number;
  industryAverage: number;
  marketLeader: number;
  unit: string;
  performance: "above" | "below" | "equal";
}

export const BusinessIntelligence = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [aiReports, setAiReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAiReports(data || []);
    } catch (error) {
  }
  };

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-report", {
        body: { 
          type,
          period: selectedPeriod,
          department: selectedDepartment 
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Relatório gerado!",
        description: "Novo relatório de BI foi criado com sucesso.",
      });
      
      fetchReports();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const kpiMetrics: KPIMetric[] = [
    {
      id: "1",
      name: "Revenue Total",
      value: "R$ 12.5M",
      change: 8.2,
      trend: "up",
      target: "R$ 15M",
      unit: "BRL"
    },
    {
      id: "2",
      name: "Eficiência Operacional",
      value: "94.3%",
      change: 2.1,
      trend: "up",
      target: "95%",
      unit: "%"
    },
    {
      id: "3",
      name: "Custo por Viagem",
      value: "R$ 45.2k",
      change: -3.8,
      trend: "down",
      target: "R$ 42k",
      unit: "BRL"
    },
    {
      id: "4",
      name: "Tempo Médio Portuário",
      value: "18.5h",
      change: -12.3,
      trend: "down",
      target: "16h",
      unit: "hours"
    },
    {
      id: "5",
      name: "Satisfação Cliente",
      value: "4.7/5",
      change: 4.2,
      trend: "up",
      target: "4.8/5",
      unit: "rating"
    },
    {
      id: "6",
      name: "ROI de Investimentos",
      value: "23.4%",
      change: 5.7,
      trend: "up",
      target: "25%",
      unit: "%"
    }
  ];

  const reports: Report[] = [
    {
      id: "1",
      title: "Relatório Financeiro Executivo",
      type: "financial",
      lastGenerated: "2024-01-15",
      frequency: "monthly",
      recipients: 8,
      status: "ready"
    },
    {
      id: "2",
      title: "Performance Operacional da Frota",
      type: "operational",
      lastGenerated: "2024-01-16",
      frequency: "weekly",
      recipients: 12,
      status: "ready"
    },
    {
      id: "3",
      title: "Auditoria de Compliance",
      type: "compliance",
      lastGenerated: "2024-01-10",
      frequency: "quarterly",
      recipients: 5,
      status: "generating"
    },
    {
      id: "4",
      title: "Dashboard de Performance KPIs",
      type: "performance",
      lastGenerated: "2024-01-16",
      frequency: "daily",
      recipients: 15,
      status: "scheduled"
    }
  ];

  const benchmarks: Benchmark[] = [
    {
      id: "1",
      metric: "Fuel Efficiency",
      ourValue: 87.3,
      industryAverage: 82.1,
      marketLeader: 91.2,
      unit: "%",
      performance: "above"
    },
    {
      id: "2",
      metric: "Port Turnaround Time",
      ourValue: 18.5,
      industryAverage: 22.3,
      marketLeader: 15.2,
      unit: "hours",
      performance: "above"
    },
    {
      id: "3",
      metric: "Safety Incidents",
      ourValue: 0.8,
      industryAverage: 1.2,
      marketLeader: 0.3,
      unit: "per 1000 trips",
      performance: "above"
    },
    {
      id: "4",
      metric: "Customer Satisfaction",
      ourValue: 4.7,
      industryAverage: 4.2,
      marketLeader: 4.9,
      unit: "/5",
      performance: "above"
    }
  ];

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === "down") return <TrendingUp className="h-4 w-4 text-danger rotate-180" />;
    return <div className="h-4 w-4 bg-muted rounded-full" />;
  };

  const getReportIcon = (type: string) => {
    switch (type) {
    case "financial": return <DollarSign className="h-4 w-4 text-success" />;
    case "operational": return <Ship className="h-4 w-4 text-primary" />;
    case "compliance": return <AlertCircle className="h-4 w-4 text-warning" />;
    case "performance": return <Target className="h-4 w-4 text-info" />;
    default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "ready": return "bg-success text-success-foreground";
    case "generating": return "bg-warning text-warning-foreground";
    case "scheduled": return "bg-info text-info-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
    case "above": return "text-success";
    case "below": return "text-danger";
    case "equal": return "text-warning";
    default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Business Intelligence</h2>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Setores</SelectItem>
                  <SelectItem value="logistics">Logística</SelectItem>
                  <SelectItem value="hr">RH Marítimo</SelectItem>
                  <SelectItem value="finance">Financeiro</SelectItem>
                  <SelectItem value="operations">Operações</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive KPIs */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            KPIs Executivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiMetrics.map((metric) => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{metric.name}</h4>
                  {getTrendIcon(metric.trend, metric.change)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${metric.change > 0 ? "text-success" : "text-danger"}`}>
                      {metric.change > 0 ? "+" : ""}{metric.change}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs período anterior</span>
                  </div>
                  
                  {metric.target && (
                    <div className="text-xs text-muted-foreground">
                      Meta: {metric.target}
                    </div>
                  )}
                  
                  {metric.target && (
                    <Progress 
                      value={parseFloat(metric.value.replace(/[^\d.]/g, "")) / parseFloat(metric.target.replace(/[^\d.]/g, "")) * 100} 
                      className="h-1" 
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automated Reports */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Relatórios Automatizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getReportIcon(report.type)}
                    <div>
                      <h4 className="font-semibold">{report.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Último: {report.lastGenerated}</span>
                        <span>Frequência: {report.frequency}</span>
                        <span>{report.recipients} destinatários</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmarks */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Benchmarks do Setor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarks.map((benchmark) => (
              <div key={benchmark.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{benchmark.metric}</h4>
                  <Badge className={getPerformanceColor(benchmark.performance) + " border"} variant="outline">
                    {benchmark.performance === "above" ? "Acima da Média" : 
                      benchmark.performance === "below" ? "Abaixo da Média" : "Na Média"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {benchmark.ourValue}{benchmark.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">Nossa Performance</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-muted-foreground">
                      {benchmark.industryAverage}{benchmark.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">Média do Setor</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-success">
                      {benchmark.marketLeader}{benchmark.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">Líder de Mercado</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Exportar Dados</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>Agendar Relatório</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Target className="h-6 w-6 mb-2" />
              <span>Definir Metas</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Dashboard Customizado</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};