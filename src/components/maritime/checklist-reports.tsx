import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  id: string;
  title: string;
  type: "compliance" | "performance" | "audit" | "trend";
  generatedAt: Date;
  period: string;
  status: "completed" | "generating" | "failed";
  metrics: {
    totalChecklists: number;
    completedChecklists: number;
    complianceRate: number;
    criticalIssues: number;
  };
}

export const ChecklistReports = () => {
  const [reports, setReports] = useState<ReportData[]>([
    {
      id: "1",
      title: "Relatório de Conformidade - Dezembro 2024",
      type: "compliance",
      generatedAt: new Date("2024-12-15"),
      period: "Dezembro 2024",
      status: "completed",
      metrics: {
        totalChecklists: 150,
        completedChecklists: 142,
        complianceRate: 94.7,
        criticalIssues: 3,
      },
    },
    {
      id: "2",
      title: "Análise de Performance - Q4 2024",
      type: "performance",
      generatedAt: new Date("2024-12-10"),
      period: "Q4 2024",
      status: "completed",
      metrics: {
        totalChecklists: 450,
        completedChecklists: 425,
        complianceRate: 94.4,
        criticalIssues: 8,
      },
    },
  ]);

  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("last30");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "compliance":
        return <FileText className="h-4 w-4" />;
      case "performance":
        return <BarChart3 className="h-4 w-4" />;
      case "audit":
        return <AlertTriangle className="h-4 w-4" />;
      case "trend":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: "Relatório em Geração",
      description: "Seu relatório está sendo gerado e estará disponível em breve.",
    });
  };

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: "Download Iniciado",
      description: "O download do relatório foi iniciado.",
    });
  };

  const filteredReports = reports.filter(
    report => filterType === "all" || report.type === filterType
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios de Checklists</h2>
          <p className="text-muted-foreground">
            Gere e visualize relatórios detalhados de conformidade e performance
          </p>
        </div>
        <Button onClick={handleGenerateReport}>
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <Label htmlFor="type-filter">Tipo:</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="compliance">Conformidade</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="audit">Auditoria</SelectItem>
              <SelectItem value="trend">Tendências</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <Label htmlFor="date-filter">Período:</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Últimos 7 dias</SelectItem>
              <SelectItem value="last30">Últimos 30 dias</SelectItem>
              <SelectItem value="last90">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="generator">Gerador</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4">
            {filteredReports.map(report => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.type)}
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>
                          Gerado em {report.generatedAt.toLocaleDateString("pt-BR")} •{" "}
                          {report.period}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status === "completed"
                        ? "Concluído"
                        : report.status === "generating"
                          ? "Gerando"
                          : "Falhou"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {report.metrics.totalChecklists}
                      </div>
                      <div className="text-sm text-muted-foreground">Total de Checklists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {report.metrics.completedChecklists}
                      </div>
                      <div className="text-sm text-muted-foreground">Concluídos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {report.metrics.complianceRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Conformidade</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {report.metrics.criticalIssues}
                      </div>
                      <div className="text-sm text-muted-foreground">Críticos</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Conclusão</span>
                      <span>
                        {(
                          (report.metrics.completedChecklists / report.metrics.totalChecklists) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (report.metrics.completedChecklists / report.metrics.totalChecklists) * 100
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conformidade Média</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.5%</div>
                <p className="text-xs text-muted-foreground">+2.1% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checklists Mensais</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Críticos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">-5% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45min</div>
                <p className="text-xs text-muted-foreground">-3min em relação ao mês anterior</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Relatórios</CardTitle>
              <CardDescription>
                Configure e gere relatórios personalizados de checklists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-title">Título do Relatório</Label>
                  <Input id="report-title" placeholder="Ex: Relatório Mensal de Conformidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-type">Tipo de Relatório</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliance">Conformidade</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="audit">Auditoria</SelectItem>
                      <SelectItem value="trend">Análise de Tendências</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data Inicial</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data Final</Label>
                  <Input id="end-date" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vessels">Navios (Opcional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os navios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os navios</SelectItem>
                    <SelectItem value="vessel-1">MV Atlantic Explorer</SelectItem>
                    <SelectItem value="vessel-2">MV Pacific Navigator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateReport} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
