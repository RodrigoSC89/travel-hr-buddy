/**
 * ISM Audit Dashboard
 * PATCH-609: Main interface for ISM audit management
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Upload, 
  FileText, 
  ClipboardCheck, 
  TrendingUp,
  Ship,
  Calendar,
  Download
} from "lucide-react";
import type { ISMAudit } from "@/types/ism-audit";
import { calculateComplianceScore } from "@/types/ism-audit";

interface ISMAuditDashboardProps {
  onCreateNew: () => void;
  onUploadPDF: () => void;
  onViewHistory: () => void;
  audits?: ISMAudit[];
}

export function ISMAuditDashboard({
  onCreateNew,
  onUploadPDF,
  onViewHistory,
  audits = []
}: ISMAuditDashboardProps) {
  const [stats, setStats] = useState({
    totalAudits: 0,
    inProgress: 0,
    completed: 0,
    averageScore: 0,
  });

  useEffect(() => {
    if (audits.length > 0) {
      const inProgress = audits.filter(a => a.status === "in-progress").length;
      const completed = audits.filter(a => a.status === "completed" || a.status === "approved").length;
      
      const scores = audits
        .filter(a => a.items.length > 0)
        .map(a => calculateComplianceScore(a.items).score);
      
      const averageScore = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

      setStats({
        totalAudits: audits.length,
        inProgress,
        completed,
        averageScore: Math.round(averageScore),
      });
    }
  }, [audits]);

  const recentAudits = audits
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ISM Audits</h1>
          <p className="text-gray-600 mt-1">
            International Safety Management Audit System
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onUploadPDF} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Auditorias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAudits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Auditorias Recentes</TabsTrigger>
          <TabsTrigger value="actions">Ações Rápidas</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {recentAudits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardCheck className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center mb-4">
                  Nenhuma auditoria registrada ainda
                </p>
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Auditoria
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentAudits.map((audit) => {
                const score = calculateComplianceScore(audit.items);
                return (
                  <Card key={audit.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Ship className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold">{audit.vesselName}</span>
                            <Badge variant={audit.auditType === "internal" ? "default" : "secondary"}>
                              {audit.auditType === "internal" ? "Interna" : "Externa"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(audit.auditDate).toLocaleDateString()}
                            </div>
                            {audit.port && <span>Porto: {audit.port}</span>}
                            <span>Auditor: {audit.auditor}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {score.score}%
                          </div>
                          <Badge variant="outline">{score.grade}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {recentAudits.length > 0 && (
            <Button variant="outline" onClick={onViewHistory} className="w-full">
              Ver Histórico Completo
            </Button>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onCreateNew}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nova Auditoria Digital
                </CardTitle>
                <CardDescription>
                  Preencha um checklist interativo com análise de IA
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onUploadPDF}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload de Checklist Digitalizado
                </CardTitle>
                <CardDescription>
                  Extraia dados automaticamente de PDFs escaneados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onViewHistory}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Histórico e Comparação
                </CardTitle>
                <CardDescription>
                  Compare auditorias por embarcação e período
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Gerar Relatório
                </CardTitle>
                <CardDescription>
                  Exporte relatórios em PDF ou Excel
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
