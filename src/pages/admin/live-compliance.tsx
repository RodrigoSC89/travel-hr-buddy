/**
 * Live Compliance Dashboard (ETAPA 33)
 * AI-Powered Maritime Compliance Automation
 * 
 * Features:
 * - Score Card: Visual compliance score with detailed breakdown
 * - AI Status Explainer: Intelligent summaries of compliance state
 * - Timeline View: Chronological non-conformities
 * - Evidence by Norm: Audit evidence grouped by regulation
 * - Training by Vessel: Training assignment tracking
 * - Corrective Actions: Complete action plan management
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Users,
  BookOpen,
  Activity,
  RefreshCw
} from "lucide-react";
import {
  calculateComplianceScore,
  generateComplianceStatusSummary,
  getNonConformities,
  getCorrectiveActions,
  getTrainingAssignments,
  getEvidenceByNorm,
  type ComplianceScore
} from "@/services/compliance-engine";
import { format } from "date-fns";

export default function LiveCompliancePage() {
  const [score, setScore] = useState<ComplianceScore | null>(null);
  const [statusSummary, setStatusSummary] = useState<string>("");
  const [nonConformities, setNonConformities] = useState<any[]>([]);
  const [trainingAssignments, setTrainingAssignments] = useState<any[]>([]);
  const [evidenceByNorm, setEvidenceByNorm] = useState<Record<string, any[]>>({});
  const [selectedNC, setSelectedNC] = useState<string | null>(null);
  const [correctiveActions, setCorrectiveActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load compliance score
      const scoreData = await calculateComplianceScore();
      setScore(scoreData);

      // Load status summary
      const summary = await generateComplianceStatusSummary();
      setStatusSummary(summary);

      // Load non-conformities
      const ncs = await getNonConformities({ limit: 50 });
      setNonConformities(ncs);

      // Load training assignments
      const training = await getTrainingAssignments();
      setTrainingAssignments(training);

      // Load evidence grouped by norm
      const evidence = await getEvidenceByNorm();
      setEvidenceByNorm(evidence);
    } catch (error) {
      console.error("Error loading compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load corrective actions when NC is selected
  const loadCorrectiveActions = async (ncId: string) => {
    try {
      const actions = await getCorrectiveActions(ncId);
      setCorrectiveActions(actions);
    } catch (error) {
      console.error("Error loading corrective actions:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedNC) {
      loadCorrectiveActions(selectedNC);
    }
  }, [selectedNC]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      critical: { className: "bg-red-100 text-red-800", label: "Crítico" },
      high: { className: "bg-orange-100 text-orange-800", label: "Alto" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Médio" },
      low: { className: "bg-blue-100 text-blue-800", label: "Baixo" },
    };
    return variants[severity] || variants.medium;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      open: { className: "bg-red-100 text-red-800", label: "Aberto" },
      in_progress: { className: "bg-blue-100 text-blue-800", label: "Em Progresso" },
      resolved: { className: "bg-green-100 text-green-800", label: "Resolvido" },
      dismissed: { className: "bg-gray-100 text-gray-800", label: "Descartado" },
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pendente" },
      completed: { className: "bg-green-100 text-green-800", label: "Concluído" },
      assigned: { className: "bg-blue-100 text-blue-800", label: "Atribuído" },
      overdue: { className: "bg-red-100 text-red-800", label: "Atrasado" },
    };
    return variants[status] || variants.open;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados de conformidade...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Compliance Module</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Conformidade Viva com IA - Automação de Compliance Marítima
          </p>
        </div>
        <Button onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Score de Conformidade</CardTitle>
            <CardDescription>Pontuação geral (0-100)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score?.score || 0)}`}>
                {score?.score || 0}
              </div>
              <Progress value={score?.score || 0} className="mt-4" />
              <p className="text-sm text-muted-foreground mt-2">
                Taxa de automação: {score?.automation_rate.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Não Conformidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Abertas:</span>
                <span className="font-bold text-red-600">{score?.open_non_conformities || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolvidas:</span>
                <span className="font-bold text-green-600">{score?.resolved_non_conformities || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              Ações Corretivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Atrasadas:</span>
                <span className="font-bold text-red-600">{score?.overdue_actions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total:</span>
                <span className="font-bold">{correctiveActions.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Treinamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Atribuídos:</span>
                <span className="font-bold">{trainingAssignments.filter(t => t.status === 'assigned').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Concluídos:</span>
                <span className="font-bold text-green-600">{trainingAssignments.filter(t => t.status === 'completed').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Status Explainer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Status de Conformidade - Análise IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg">
            {statusSummary}
          </pre>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="evidence">Evidências por Norma</TabsTrigger>
          <TabsTrigger value="training">Treinamentos por Embarcação</TabsTrigger>
          <TabsTrigger value="actions">Ações Corretivas</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Não Conformidades</CardTitle>
              <CardDescription>Ordem cronológica com indicadores de severidade/status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nonConformities.map((nc) => (
                  <div
                    key={nc.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedNC(nc.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityBadge(nc.severity).className}>
                            {getSeverityBadge(nc.severity).label}
                          </Badge>
                          <Badge className={getStatusBadge(nc.status).className}>
                            {getStatusBadge(nc.status).label}
                          </Badge>
                          {nc.vessel_id && (
                            <Badge variant="outline">{nc.vessel_id}</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{nc.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Detectado: {format(new Date(nc.detected_at), "dd/MM/yyyy HH:mm")}</span>
                          <span>Fonte: {nc.source_type}</span>
                        </div>
                        {nc.applicable_norms && nc.applicable_norms.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold">Normas Aplicáveis:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {nc.applicable_norms.map((norm: any, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {norm.norm} - {norm.clause}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {nonConformities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p>Nenhuma não conformidade registrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence by Norm */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidências Agrupadas por Norma</CardTitle>
              <CardDescription>Trilha de auditoria certificável</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(evidenceByNorm).map(([norm, items]) => (
                  <div key={norm} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {norm} ({items.length} evidências)
                    </h3>
                    <div className="space-y-2">
                      {items.map((evidence) => (
                        <div key={evidence.id} className="text-sm bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline">{evidence.evidence_type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(evidence.collected_at), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <p>{evidence.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(evidenceByNorm).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Nenhuma evidência registrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training by Vessel */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treinamentos por Embarcação</CardTitle>
              <CardDescription>Status e certificados de treinamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingAssignments.map((training) => (
                  <div key={training.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{training.vessel_id}</Badge>
                          <Badge className={getStatusBadge(training.status).className}>
                            {getStatusBadge(training.status).label}
                          </Badge>
                        </div>
                        <p className="font-semibold text-sm">{training.training_module}</p>
                        <p className="text-sm text-muted-foreground mt-1">{training.training_description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {training.due_date && (
                            <span>Prazo: {format(new Date(training.due_date), "dd/MM/yyyy")}</span>
                          )}
                          {training.completed_at && (
                            <span className="text-green-600">
                              Concluído: {format(new Date(training.completed_at), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {trainingAssignments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <p>Nenhum treinamento atribuído</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Corrective Actions */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Ação Corretiva</CardTitle>
              <CardDescription>Ações geradas por IA com prazos e responsabilidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedNC ? (
                  <>
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedNC(null)}
                      >
                        ← Voltar
                      </Button>
                    </div>
                    {correctiveActions.map((action) => (
                      <div key={action.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={getStatusBadge(action.status).className}>
                            {getStatusBadge(action.status).label}
                          </Badge>
                          <Badge className={getSeverityBadge(action.priority).className}>
                            {getSeverityBadge(action.priority).label}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Passos:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              {action.action_plan.steps.map((step: string, idx: number) => (
                                <li key={idx} className="text-sm">{step}</li>
                              ))}
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Recursos:</h4>
                            <ul className="list-disc list-inside">
                              {action.action_plan.resources.map((resource: string, idx: number) => (
                                <li key={idx} className="text-sm">{resource}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Timeline:</span> {action.action_plan.timeline}
                            </div>
                            <div>
                              <span className="font-semibold">Responsável:</span> {action.action_plan.responsibilities}
                            </div>
                          </div>
                          {action.due_date && (
                            <div className="text-sm text-muted-foreground">
                              Prazo: {format(new Date(action.due_date), "dd/MM/yyyy")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {correctiveActions.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhuma ação corretiva para esta não conformidade
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                    <p>Selecione uma não conformidade na timeline para ver as ações corretivas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
