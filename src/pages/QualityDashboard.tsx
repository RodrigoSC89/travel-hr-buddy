/**
 * Quality Dashboard Page
 * PATCH: QUALITY-10/10 - Real-time quality monitoring
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Zap,
  Eye,
  TestTube,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code,
  Gauge,
  Activity,
} from "lucide-react";
import { codeQualityChecker, type QualityReport, type QualityCheck } from "@/lib/quality";
import { performanceTracker } from "@/lib/quality";

const getStatusIcon = (status: QualityCheck["status"]) => {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case "warn":
      return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case "fail":
      return <XCircle className="w-4 h-4 text-destructive" />;
  }
};

const getCategoryIcon = (category: QualityCheck["category"]) => {
  switch (category) {
    case "typescript":
      return <Code className="w-4 h-4" />;
    case "security":
      return <Shield className="w-4 h-4" />;
    case "performance":
      return <Zap className="w-4 h-4" />;
    case "accessibility":
      return <Eye className="w-4 h-4" />;
    case "testing":
      return <TestTube className="w-4 h-4" />;
  }
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-emerald-600 dark:bg-emerald-500";
  if (grade.startsWith("B")) return "bg-primary";
  if (grade.startsWith("C")) return "bg-amber-600 dark:bg-amber-500";
  if (grade.startsWith("D")) return "bg-orange-600 dark:bg-orange-500";
  return "bg-destructive";
};

export default function QualityDashboard() {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<{
    score: number;
    grade: string;
    details: Record<string, string>;
  } | null>(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const qualityReport = await codeQualityChecker.runAllChecks();
      setReport(qualityReport);

      const perfScore = performanceTracker.getScore();
      setPerformanceScore(perfScore);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const groupedChecks = report?.checks.reduce(
    (acc, check) => {
      if (!acc[check.category]) {
        acc[check.category] = [];
      }
      acc[check.category].push(check);
      return acc;
    },
    {} as Record<string, QualityCheck[]>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Qualidade</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da qualidade do sistema
          </p>
        </div>
        <Button onClick={runAudit} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analisando..." : "Executar Auditoria"}
        </Button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quality Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Score de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  report ? getGradeColor(report.grade) : "bg-muted"
                }`}
              >
                {report?.grade || "–"}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{report?.score || 0}/100</div>
                <Progress value={report?.score || 0} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Score de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  performanceScore ? getGradeColor(performanceScore.grade) : "bg-muted"
                }`}
              >
                {performanceScore?.grade || "–"}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  {performanceScore?.score || 0}/100
                </div>
                <Progress value={performanceScore?.score || 0} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checks Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Resumo das Verificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {report?.checks.filter((c) => c.status === "pass").length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Passou</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {report?.checks.filter((c) => c.status === "warn").length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Avisos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {report?.checks.filter((c) => c.status === "fail").length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Falhou</div>
              </div>
            </div>
            {report && (
              <p className="text-xs text-muted-foreground mt-2">
                Última verificação: {new Date(report.timestamp).toLocaleString("pt-BR")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
              <TabsTrigger value="testing">Testes</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-2">
                {report?.checks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(check.category)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {check.message}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {check.category}
                      </Badge>
                      {getStatusIcon(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {Object.entries(groupedChecks || {}).map(([category, checks]) => (
              <TabsContent key={category} value={category}>
                <div className="space-y-2">
                  {checks.map((check, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(check.category)}
                        <div>
                          <div className="font-medium">{check.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {check.message}
                          </div>
                        </div>
                      </div>
                      {getStatusIcon(check.status)}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {report && report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg text-sm"
                >
                  {rec}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {performanceScore?.details &&
              Object.entries(performanceScore.details).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase">
                    {key}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      value === "Excelente"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : value === "Precisa melhorar"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-destructive"
                    }`}
                  >
                    {value}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
