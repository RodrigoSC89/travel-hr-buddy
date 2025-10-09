import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  title: string;
  type: string;
  status: "generating" | "completed" | "failed";
  createdAt: string;
  size: string;
  format: string;
}

export const FunctionalReportsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      title: "Relatório Mensal de RH",
      type: "hr",
      status: "completed",
      createdAt: "2024-01-15",
      size: "2.4 MB",
      format: "PDF"
    },
    {
      id: "2",
      title: "Analytics de Viagens",
      type: "travel",
      status: "completed",
      createdAt: "2024-01-14",
      size: "1.8 MB",
      format: "Excel"
    },
    {
      id: "3",
      title: "Dashboard Executivo",
      type: "executive",
      status: "generating",
      createdAt: "2024-01-15",
      size: "...",
      format: "PDF"
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    
    const newReport: Report = {
      id: Date.now().toString(),
      title: `Relatório ${type} - ${new Date().toLocaleDateString()}`,
      type,
      status: "generating",
      createdAt: new Date().toISOString().split("T")[0],
      size: "...",
      format: "PDF"
    };

    setReports(prev => [newReport, ...prev]);

    toast({
      title: "Relatório em Geração",
      description: "Seu relatório está sendo criado. Isso pode levar alguns minutos.",
    });

    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: "completed", size: "2.1 MB" }
          : report
      ));
      
      setIsGenerating(false);
      
      toast({
        title: "Relatório Concluído",
        description: "Seu relatório foi gerado com sucesso!",
      });
    }, 3000);
  };

  const downloadReport = (reportId: string) => {
    toast({
      title: "Download Iniciado",
      description: "O download do seu relatório foi iniciado.",
    });
  };

  const getStatusIcon = (status: Report["status"]) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "generating":
      return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = (status: Report["status"]) => {
    switch (status) {
    case "completed":
      return "Concluído";
    case "generating":
      return "Gerando...";
    case "failed":
      return "Falhou";
    }
  };

  const reportTypes = [
    { id: "hr", name: "Recursos Humanos", description: "Funcionários, certificados e métricas de RH" },
    { id: "analytics", name: "Analytics", description: "Métricas de uso e performance" },
    { id: "travel", name: "Viagens", description: "Relatório de viagens e hospedagens" },
    { id: "executive", name: "Executivo", description: "Visão estratégica e KPIs principais" },
    { id: "financial", name: "Financeiro", description: "Alertas de preços e economias" },
    { id: "custom", name: "Personalizado", description: "Relatório customizado por módulos" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e gerencie relatórios detalhados do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Configuração do Relatório
                </CardTitle>
                <CardDescription>
                  Configure os parâmetros para gerar seu relatório
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Módulo</label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Módulos</SelectItem>
                      <SelectItem value="hr">Recursos Humanos</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="travel">Viagens</SelectItem>
                      <SelectItem value="price-alerts">Alertas de Preços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 3 meses</SelectItem>
                      <SelectItem value="365">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => generateReport(selectedModule)}
                  disabled={isGenerating}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGenerating ? "Gerando..." : "Gerar Relatório"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Rápidos</CardTitle>
                <CardDescription>
                  Gere relatórios predefinidos com um clique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {reportTypes.slice(0, 4).map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{type.name}</h4>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateReport(type.id)}
                        disabled={isGenerating}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total de Relatórios</span>
                  </div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">+3 este mês</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Concluídos</span>
                  </div>
                  <p className="text-2xl font-bold">22</p>
                  <p className="text-xs text-muted-foreground">91.7% taxa de sucesso</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Tempo Médio</span>
                  </div>
                  <p className="text-2xl font-bold">2.4min</p>
                  <p className="text-xs text-muted-foreground">-15% vs. mês anterior</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Mais Popular</span>
                  </div>
                  <p className="text-lg font-bold">Analytics</p>
                  <p className="text-xs text-muted-foreground">45% dos relatórios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
              <CardDescription>
                Visualize e baixe relatórios anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="space-y-1">
                        <h4 className="font-medium">{report.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {report.format}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <span className="text-sm">{getStatusText(report.status)}</span>
                      </div>
                      
                      {report.status === "completed" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadReport(report.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Baixar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>
                Configure relatórios automáticos recorrentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum relatório agendado</h3>
                <p className="text-muted-foreground mb-4">
                  Configure relatórios automáticos para receber updates regulares
                </p>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};