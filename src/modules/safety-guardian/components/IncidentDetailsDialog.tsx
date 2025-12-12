/**
import { useState, useCallback } from "react";;
 * Incident Details Dialog Component
 * Visualização detalhada de incidentes com análise de IA
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  AlertTriangle,
  Shield,
  Brain,
  CheckCircle,
  Clock,
  MapPin,
  Ship,
  User,
  FileText,
  Loader2,
  Lightbulb,
  BookOpen,
  Scale,
} from "lucide-react";
import type { SafetyIncident, AIIncidentAnalysis } from "../types";

interface IncidentDetailsDialogProps {
  incident: SafetyIncident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze: (incident: SafetyIncident) => Promise<AIIncidentAnalysis | undefined>;
  analysisLoading?: boolean;
}

const statusConfig = {
  open: { label: "Aberto", color: "bg-warning/10 text-warning border-warning/20" },
  investigating: { label: "Investigando", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  action_pending: { label: "Ação Pendente", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  resolved: { label: "Resolvido", color: "bg-success/10 text-success border-success/20" },
  closed: { label: "Fechado", color: "bg-muted text-muted-foreground" },
};

const severityConfig = {
  low: { label: "Baixa", color: "bg-success/10 text-success border-success/20" },
  medium: { label: "Média", color: "bg-warning/10 text-warning border-warning/20" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30" },
  critical: { label: "Crítica", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const typeConfig = {
  incident: { label: "Incidente", icon: AlertCircle, color: "text-destructive" },
  near_miss: { label: "Near Miss", icon: AlertTriangle, color: "text-warning" },
  unsafe_condition: { label: "Condição Insegura", icon: Shield, color: "text-blue-500" },
  unsafe_act: { label: "Ato Inseguro", icon: AlertTriangle, color: "text-orange-500" },
};

export const IncidentDetailsDialog: React.FC<IncidentDetailsDialogProps> = ({
  incident,
  open,
  onOpenChange,
  onAnalyze,
  analysisLoading,
}) => {
  const [analysis, setAnalysis] = useState<AIIncidentAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const handleAnalyze = async () => {
    if (!incident) return;
    const result = await onAnalyze(incident);
    if (result) {
      setAnalysis(result);
      setActiveTab("analysis");
    }
  };

  if (!incident) return null;

  const typeInfo = typeConfig[incident.type];
  const TypeIcon = typeInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={"p-2 rounded-lg bg-muted"}>
              <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
            </div>
            <span className="truncate">{incident.title}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{incident.id}</Badge>
            <Badge className={statusConfig[incident.status].color}>
              {statusConfig[incident.status].label}
            </Badge>
            <Badge className={severityConfig[incident.severity].color}>
              {severityConfig[incident.severity].label}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-2">
              <FileText className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <Brain className="h-4 w-4" />
              Análise IA
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Ações
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="details" className="space-y-4 pr-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ship className="h-3 w-3" /> Embarcação
                  </p>
                  <p className="font-medium">{incident.vessel_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Local
                  </p>
                  <p className="font-medium">{incident.location || "Não especificado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Data
                  </p>
                  <p className="font-medium">{incident.incident_date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Reportado por
                  </p>
                  <p className="font-medium">{incident.reporter_name || "Anônimo"}</p>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-semibold">Descrição</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{incident.description}</p>
                </div>
              </div>

              {/* Root Cause */}
              {incident.root_cause && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Causa Raiz</h4>
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm">{incident.root_cause}</p>
                  </div>
                </div>
              )}

              {/* Witnesses */}
              {incident.witnesses && incident.witnesses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Testemunhas</h4>
                  <div className="flex flex-wrap gap-2">
                    {incident.witnesses.map((witness, i) => (
                      <Badge key={i} variant="outline">
                        <User className="h-3 w-3 mr-1" />
                        {witness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4 pr-4">
              {!analysis && !analysisLoading && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Análise de IA Disponível</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Clique para gerar uma análise detalhada usando inteligência artificial
                    </p>
                    <Button onClick={handleAnalyze}>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar com IA
                    </Button>
                  </CardContent>
                </Card>
              )}

              {analysisLoading && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Analisando incidente com IA...
                    </p>
                  </CardContent>
                </Card>
              )}

              {analysis && (
                <div className="space-y-4">
                  {/* Risk Score */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Avaliação de Risco
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold">{analysis.riskScore}</div>
                        <div className="flex-1">
                          <Progress value={analysis.riskScore} className="h-3" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Probabilidade de recorrência: {analysis.predictedRecurrence.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Root Cause Analysis */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Análise de Causa Raiz
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{analysis.rootCauseAnalysis}</p>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Recomendações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Lessons Learned */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Lições Aprendidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{analysis.lessonsLearned}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4 pr-4">
              {incident.corrective_actions && incident.corrective_actions.length > 0 ? (
                incident.corrective_actions.map((action, i) => (
                  <Card key={i}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{action.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Responsável: {action.responsible}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Prazo: {action.due_date}
                          </p>
                        </div>
                        <Badge
                          className={
                            action.status === "completed"
                              ? "bg-success/10 text-success"
                              : action.status === "overdue"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-warning/10 text-warning"
                          }
                        >
                          {action.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Nenhuma ação cadastrada</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione ações corretivas para este incidente
                    </p>
                    <Button>Adicionar Ação</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={() => handleonOpenChange}>
            Fechar
          </Button>
          <Button className="flex-1">Editar Ocorrência</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
