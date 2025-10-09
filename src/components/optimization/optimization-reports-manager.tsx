import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Upload,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

interface OptimizationReport {
  id: string;
  title: string;
  date: Date;
  type: "weekly" | "monthly" | "quarterly";
  status: "generating" | "ready" | "exported";
  insights: number;
  improvements: number;
  performanceGain: number;
}

interface OptimizationHistory {
  id: string;
  title: string;
  category: string;
  appliedAt: Date;
  impactAchieved: string;
  performanceGain: number;
  status: "success" | "partial" | "failed";
}

export const OptimizationReportsManager = () => {
  const { toast } = useToast();

  const [reports, setReports] = useState<OptimizationReport[]>([
    {
      id: "weekly_001",
      title: "Relatório Semanal de Otimização",
      date: new Date(),
      type: "weekly",
      status: "ready",
      insights: 12,
      improvements: 8,
      performanceGain: 15.3,
    },
    {
      id: "monthly_001",
      title: "Análise Mensal de Performance",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: "monthly",
      status: "ready",
      insights: 45,
      improvements: 23,
      performanceGain: 28.7,
    },
    {
      id: "quarterly_001",
      title: "Relatório Trimestral Executivo",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      type: "quarterly",
      status: "generating",
      insights: 0,
      improvements: 0,
      performanceGain: 0,
    },
  ]);

  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistory[]>([
    {
      id: "opt_001",
      title: "Cache de Consultas Implementado",
      category: "Database",
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      impactAchieved: "+25% na performance de consultas",
      performanceGain: 25,
      status: "success",
    },
    {
      id: "opt_002",
      title: "Otimização de Bundle Frontend",
      category: "Frontend",
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      impactAchieved: "+40% velocidade de carregamento",
      performanceGain: 40,
      status: "success",
    },
    {
      id: "opt_003",
      title: "Compressão de Assets",
      category: "Assets",
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      impactAchieved: "+18% economia de bandwidth",
      performanceGain: 18,
      status: "partial",
    },
    {
      id: "opt_004",
      title: "Headers de Segurança",
      category: "Security",
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      impactAchieved: "+15% security score",
      performanceGain: 15,
      status: "success",
    },
  ]);

  const performanceTrend = [
    { month: "Jan", score: 65, optimizations: 5 },
    { month: "Fev", score: 68, optimizations: 8 },
    { month: "Mar", score: 72, optimizations: 12 },
    { month: "Abr", score: 75, optimizations: 15 },
    { month: "Mai", score: 78, optimizations: 18 },
    { month: "Jun", score: 82, optimizations: 21 },
  ];

  const generateReport = (type: "weekly" | "monthly" | "quarterly") => {
    const newReport: OptimizationReport = {
      id: `${type}_${Date.now()}`,
      title: `Relatório ${type === "weekly" ? "Semanal" : type === "monthly" ? "Mensal" : "Trimestral"} de Otimização`,
      date: new Date(),
      type,
      status: "generating",
      insights: 0,
      improvements: 0,
      performanceGain: 0,
    };

    setReports(prev => [newReport, ...prev]);

    toast({
      title: "Gerando Relatório",
      description: `Iniciando geração do relatório ${type}...`,
      duration: 2000,
    });

    // Simular geração do relatório
    setTimeout(() => {
      setReports(prev =>
        prev.map(report =>
          report.id === newReport.id
            ? {
              ...report,
              status: "ready" as const,
              insights: Math.floor(Math.random() * 20) + 10,
              improvements: Math.floor(Math.random() * 15) + 5,
              performanceGain: Math.floor(Math.random() * 30) + 10,
            }
            : report
        )
      );

      toast({
        title: "Relatório Concluído",
        description: "Relatório gerado com sucesso e pronto para download!",
        duration: 3000,
      });
    }, 3000);
  };

  const exportReport = (reportId: string) => {
    setReports(prev =>
      prev.map(report =>
        report.id === reportId ? { ...report, status: "exported" as const } : report
      )
    );

    toast({
      title: "Exportando Relatório",
      description: "Relatório exportado em PDF com sucesso!",
      duration: 2000,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "success":
      return CheckCircle;
    case "partial":
      return AlertTriangle;
    case "failed":
      return AlertTriangle;
    default:
      return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "success":
      return "text-success";
    case "partial":
      return "text-warning";
    case "failed":
      return "text-destructive";
    default:
      return "text-muted-foreground";
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
    case "weekly":
      return "bg-primary/10 text-primary border-primary/20";
    case "monthly":
      return "bg-info/10 text-info border-info/20";
    case "quarterly":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios e Histórico</h2>
          <p className="text-muted-foreground">
            Acompanhe otimizações aplicadas e gere relatórios detalhados
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => generateReport("weekly")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Relatório Semanal
          </Button>
          <Button
            onClick={() => generateReport("monthly")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Relatório Mensal
          </Button>
          <Button onClick={() => generateReport("quarterly")} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatório Trimestral
          </Button>
        </div>
      </div>

      {/* Tendência de Performance */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Performance (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="optimizations"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios de Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map(report => (
              <Card key={report.id} className="border border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{report.title}</h4>
                          <Badge className={getReportTypeColor(report.type)}>
                            {report.type.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {report.date.toLocaleDateString()}
                          </span>

                          {report.status === "ready" && (
                            <>
                              <span>{report.insights} insights</span>
                              <span>{report.improvements} melhorias</span>
                              <span className="text-success">
                                +{report.performanceGain}% performance
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === "generating" ? (
                        <Badge className="bg-warning/10 text-warning border-warning/20">
                          <Activity className="h-3 w-3 mr-1 animate-spin" />
                          Gerando...
                        </Badge>
                      ) : report.status === "exported" ? (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Exportado
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => exportReport(report.id)}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Exportar PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Otimizações */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Otimizações Aplicadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationHistory.map(item => {
              const StatusIcon = getStatusIcon(item.status);
              return (
                <Card key={item.id} className="border border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${getStatusColor(item.status)} bg-opacity-10`}
                        >
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(item.status)}`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.appliedAt.toLocaleDateString()}
                            </span>
                            <span>{item.impactAchieved}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${getStatusColor(item.status)}`}>
                          +{item.performanceGain}%
                        </div>
                        <p className="text-xs text-muted-foreground">Ganho</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Impacto por Categoria */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Impacto por Categoria de Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { category: "Database", impact: 25, optimizations: 3 },
                  { category: "Frontend", impact: 40, optimizations: 5 },
                  { category: "Backend", impact: 20, optimizations: 2 },
                  { category: "Security", impact: 15, optimizations: 4 },
                  { category: "Assets", impact: 18, optimizations: 2 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impact" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
