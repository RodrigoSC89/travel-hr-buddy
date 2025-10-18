import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CompliancePanel } from "@/components/admin/ConformidadePanel";
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Ship,
  ClipboardCheck,
  FileSearch,
  Calendar,
  Download
} from "lucide-react";

interface GapItem {
  id: string;
  norm: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
}

interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
}

interface AuditHistory {
  id: string;
  norm: string;
  date: string;
  auditor: string;
  score: number;
  findings: number;
}

const AdminConformidade = () => {
  // Mock data for compliance scores by vessel
  const complianceData = [
    {
      vessel: "Navio Alpha",
      norms: [
        { name: "IMCA", score: 85 },
        { name: "IBAMA", score: 92 },
        { name: "MTS", score: 78 },
        { name: "PEO-DP", score: 88 }
      ]
    },
    {
      vessel: "Navio Beta",
      norms: [
        { name: "IMCA", score: 91 },
        { name: "IBAMA", score: 87 },
        { name: "MTS", score: 82 },
        { name: "PEO-DP", score: 90 }
      ]
    },
    {
      vessel: "Navio Gamma",
      norms: [
        { name: "IMCA", score: 76 },
        { name: "IBAMA", score: 84 },
        { name: "MTS", score: 71 },
        { name: "PEO-DP", score: 79 }
      ]
    }
  ];

  // Mock data for gaps by norm
  const gapsData: GapItem[] = [
    {
      id: "1",
      norm: "IMCA",
      description: "Documentação de treinamento incompleta para operadores DP",
      severity: "high",
      status: "in_progress"
    },
    {
      id: "2",
      norm: "IBAMA",
      description: "Relatório de descarte de resíduos pendente de revisão",
      severity: "medium",
      status: "open"
    },
    {
      id: "3",
      norm: "MTS",
      description: "Certificação de equipamentos de segurança vencida",
      severity: "critical",
      status: "open"
    },
    {
      id: "4",
      norm: "PEO-DP",
      description: "Procedimento de emergência requer atualização",
      severity: "medium",
      status: "in_progress"
    },
    {
      id: "5",
      norm: "IMCA",
      description: "Simulação de falha DP não realizada no trimestre",
      severity: "high",
      status: "open"
    }
  ];

  // Mock data for corrective actions
  const correctiveActions: CorrectiveAction[] = [
    {
      id: "1",
      description: "Completar treinamento de operadores DP",
      responsible: "João Silva",
      dueDate: "2025-11-15",
      status: "in_progress"
    },
    {
      id: "2",
      description: "Revisar e enviar relatório IBAMA",
      responsible: "Maria Santos",
      dueDate: "2025-10-30",
      status: "overdue"
    },
    {
      id: "3",
      description: "Renovar certificação de equipamentos",
      responsible: "Pedro Costa",
      dueDate: "2025-11-01",
      status: "pending"
    },
    {
      id: "4",
      description: "Atualizar procedimentos de emergência",
      responsible: "Ana Oliveira",
      dueDate: "2025-12-01",
      status: "in_progress"
    }
  ];

  // Mock data for audit history
  const auditHistory: AuditHistory[] = [
    {
      id: "1",
      norm: "IMCA",
      date: "2025-09-15",
      auditor: "Bureau Veritas",
      score: 87,
      findings: 3
    },
    {
      id: "2",
      norm: "IBAMA",
      date: "2025-08-20",
      auditor: "Órgão Ambiental",
      score: 91,
      findings: 2
    },
    {
      id: "3",
      norm: "MTS",
      date: "2025-07-10",
      auditor: "Det Norske Veritas",
      score: 78,
      findings: 5
    },
    {
      id: "4",
      norm: "PEO-DP",
      date: "2025-09-01",
      auditor: "Petrobras",
      score: 89,
      findings: 2
    },
    {
      id: "5",
      norm: "IMCA",
      date: "2025-06-15",
      auditor: "Bureau Veritas",
      score: 84,
      findings: 4
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-gray-100 text-gray-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Aberto",
      in_progress: "Em Progresso",
      resolved: "Resolvido",
      completed: "Concluído",
      pending: "Pendente",
      overdue: "Atrasado"
    };
    return labels[status] || status;
  };

  // Calculate overall statistics
  const totalVessels = complianceData.length;
  const avgComplianceScore = Math.round(
    complianceData.reduce((sum, vessel) => 
      sum + vessel.norms.reduce((s, n) => s + n.score, 0) / vessel.norms.length, 0
    ) / totalVessels
  );
  const openGaps = gapsData.filter(g => g.status === "open").length;
  const overdueActions = correctiveActions.filter(a => a.status === "overdue").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-primary" />
            Dashboard de Conformidade Normativa
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitoramento de compliance com normas IMCA, IBAMA, MTS e PEO-DP
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold text-primary">{avgComplianceScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Navios</p>
                <p className="text-2xl font-bold">{totalVessels}</p>
              </div>
              <Ship className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gaps Abertos</p>
                <p className="text-2xl font-bold text-orange-500">{openGaps}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ações Atrasadas</p>
                <p className="text-2xl font-bold text-red-500">{overdueActions}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="scores" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scores">
            <TrendingUp className="mr-2 h-4 w-4" />
            Scores por Navio
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Gaps por Norma
          </TabsTrigger>
          <TabsTrigger value="actions">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Ações Corretivas
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score de Conformidade por Navio</CardTitle>
              <CardDescription>
                Visão consolidada dos scores de conformidade para cada norma por embarcação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompliancePanel data={complianceData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gaps por Norma</CardTitle>
              <CardDescription>
                Identificação e rastreamento de não conformidades por norma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapsData.map((gap) => (
                  <div key={gap.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{gap.norm}</Badge>
                          <Badge className={getSeverityColor(gap.severity)}>{gap.severity.toUpperCase()}</Badge>
                          <Badge className={getStatusColor(gap.status)} variant="secondary">
                            {getStatusLabel(gap.status)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{gap.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status das Ações Corretivas</CardTitle>
              <CardDescription>
                Monitoramento de ações corretivas implementadas para resolver gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correctiveActions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{action.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Responsável: {action.responsible}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Prazo: {new Date(action.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(action.status)} variant="secondary">
                        {getStatusLabel(action.status)}
                      </Badge>
                    </div>
                    <Progress 
                      value={action.status === "completed" ? 100 : action.status === "in_progress" ? 60 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Auditorias por Norma</CardTitle>
              <CardDescription>
                Registro histórico de auditorias realizadas e seus resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditHistory.map((audit) => (
                  <div key={audit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                          <span className={`text-2xl font-bold ${audit.score >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                            {audit.score}%
                          </span>
                          <span className="text-xs text-muted-foreground">Score</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{audit.norm}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(audit.date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm font-medium">Auditor: {audit.auditor}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {audit.score >= 80 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {audit.findings} {audit.findings === 1 ? "achado" : "achados"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Relatório
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Benefícios Estratégicos</CardTitle>
          <CardDescription>
            Recursos integrados do sistema de conformidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileSearch className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">📚 Vetorização Normativa</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Busca por cláusulas e suporte a IA legal para análise de conformidade
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">🧭 Diagnóstico PEO-DP</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Conformidade automatizada com auditoria Petrobras
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">🌐 Painel de Conformidade</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Score por navio + rastreabilidade QSMS
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">📄 PDF + IA</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Justificativas auditáveis em formato estruturado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConformidade;
