/**
 * IMCA Audit Generator Component
 * Main UI component for generating IMCA DP Technical Audit reports
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ship,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Calendar,
  MapPin,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import type {
  IMCAAuditInput,
  IMCAAuditReport,
  DPClass,
  ModuleEvaluation,
  NonConformity,
  ActionItem,
} from "@/types/imca-audit";
import {
  validateAuditInput,
  getRiskLevelColor,
  getPriorityLevelColor,
  IMCA_STANDARDS,
  DP_MODULES,
} from "@/types/imca-audit";
import { generateIMCAAudit, saveIMCAAudit, downloadAuditMarkdown } from "@/services/imca-audit-service";

export default function IMCAAuditGenerator() {
  const [activeTab, setActiveTab] = useState("basic");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Basic Data
  const [vesselName, setVesselName] = useState("");
  const [dpClass, setDpClass] = useState<DPClass | "">("");
  const [location, setLocation] = useState("");
  const [auditObjective, setAuditObjective] = useState("");
  
  // Optional Operational Data
  const [incidentDetails, setIncidentDetails] = useState("");
  const [environmentalConditions, setEnvironmentalConditions] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  const [recentChanges, setRecentChanges] = useState("");
  
  // Generated Report
  const [report, setReport] = useState<IMCAAuditReport | null>(null);
  
  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);

  const handleGenerate = async () => {
    // Validate input
    const input: IMCAAuditInput = {
      vesselName,
      dpClass: dpClass as DPClass,
      location,
      auditObjective,
      operationalData: {
        incidentDetails: incidentDetails || undefined,
        environmentalConditions: environmentalConditions || undefined,
        systemStatus: systemStatus || undefined,
        recentChanges: recentChanges || undefined,
      },
    };

    const validationErrors = validateAuditInput(input);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      toast.error("Erro de validação", {
        description: "Por favor, corrija os erros antes de continuar",
      });
      return;
    }

    setGenerating(true);
    try {
      const generatedReport = await generateIMCAAudit(input);
      
      if (generatedReport) {
        setReport(generatedReport);
        setActiveTab("results");
        toast.success("Auditoria gerada com sucesso!", {
          description: `Pontuação geral: ${generatedReport.overallScore}/100`,
        });
      } else {
        toast.error("Erro ao gerar auditoria", {
          description: "Não foi possível gerar o relatório. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Error generating audit:", error);
      toast.error("Erro ao gerar auditoria", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;

    setSaving(true);
    try {
      const saved = await saveIMCAAudit(report);
      
      if (saved) {
        toast.success("Auditoria salva com sucesso!", {
          description: "A auditoria foi salva no banco de dados",
        });
      } else {
        toast.error("Erro ao salvar auditoria", {
          description: "Não foi possível salvar a auditoria",
        });
      }
    } catch (error) {
      console.error("Error saving audit:", error);
      toast.error("Erro ao salvar auditoria", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!report) return;
    downloadAuditMarkdown(report);
    toast.success("Exportação concluída", {
      description: "O arquivo Markdown foi baixado",
    });
  };

  const handleReset = () => {
    setVesselName("");
    setDpClass("");
    setLocation("");
    setAuditObjective("");
    setIncidentDetails("");
    setEnvironmentalConditions("");
    setSystemStatus("");
    setRecentChanges("");
    setReport(null);
    setErrors([]);
    setActiveTab("basic");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ship className="w-8 h-8" />
          Sistema de Auditoria Técnica IMCA DP
        </h1>
        <p className="text-muted-foreground mt-2">
          Gere auditorias técnicas completas para embarcações DP seguindo normas IMCA, IMO e MTS
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <Target className="w-4 h-4 mr-2" />
            Dados Básicos
          </TabsTrigger>
          <TabsTrigger value="operational">
            <FileText className="w-4 h-4 mr-2" />
            Dados Operacionais
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!report}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Resultados
          </TabsTrigger>
        </TabsList>

        {/* Basic Data Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas da Auditoria</CardTitle>
              <CardDescription>
                Preencha as informações essenciais sobre a embarcação e o objetivo da auditoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vesselName">Nome da Embarcação *</Label>
                  <Input
                    id="vesselName"
                    placeholder="Ex: DP Construction Vessel Delta"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dpClass">Classe DP *</Label>
                  <Select value={dpClass} onValueChange={(value) => setDpClass(value as DPClass)}>
                    <SelectTrigger id="dpClass">
                      <SelectValue placeholder="Selecione a classe DP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP1">DP1</SelectItem>
                      <SelectItem value="DP2">DP2</SelectItem>
                      <SelectItem value="DP3">DP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Ex: Santos Basin, Brazil"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditObjective">Objetivo da Auditoria *</Label>
                <Textarea
                  id="auditObjective"
                  placeholder="Ex: Avaliação técnica pós-incidente ou auditoria de rotina anual"
                  value={auditObjective}
                  onChange={(e) => setAuditObjective(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setActiveTab("operational")} className="flex-1">
                  Próximo: Dados Operacionais
                </Button>
                <Button onClick={handleGenerate} disabled={generating} variant="default" className="flex-1">
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Gerar Auditoria
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operational Data Tab */}
        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Operacionais (Opcional)</CardTitle>
              <CardDescription>
                Forneça informações adicionais sobre incidentes, condições ambientais ou status dos sistemas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incidentDetails">Detalhes do Incidente</Label>
                <Textarea
                  id="incidentDetails"
                  placeholder="Ex: Falha do thruster #3 durante operações de lançamento de ROV"
                  value={incidentDetails}
                  onChange={(e) => setIncidentDetails(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="environmentalConditions">Condições Ambientais</Label>
                <Textarea
                  id="environmentalConditions"
                  placeholder="Ex: Vento 20 kts, corrente 2 kts, ondas 2m"
                  value={environmentalConditions}
                  onChange={(e) => setEnvironmentalConditions(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemStatus">Status dos Sistemas</Label>
                <Textarea
                  id="systemStatus"
                  placeholder="Ex: Todos os sistemas operacionais exceto thruster #3"
                  value={systemStatus}
                  onChange={(e) => setSystemStatus(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recentChanges">Mudanças Recentes</Label>
                <Textarea
                  id="recentChanges"
                  placeholder="Ex: Atualização de software DP realizada há 2 semanas"
                  value={recentChanges}
                  onChange={(e) => setRecentChanges(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setActiveTab("basic")} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleGenerate} disabled={generating} variant="default" className="flex-1">
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Gerar Auditoria
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {report && (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Ship className="w-5 h-5" />
                        {report.vesselName} - {report.dpClass}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {report.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.auditDate}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{report.overallScore}/100</div>
                      <div className="text-sm text-muted-foreground">Pontuação Geral</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{report.executiveSummary}</p>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave} disabled={saving} variant="default">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Auditoria"
                      )}
                    </Button>
                    <Button onClick={handleExport} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Markdown
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      Nova Auditoria
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Module Evaluations */}
              <Card>
                <CardHeader>
                  <CardTitle>Avaliação por Módulo</CardTitle>
                  <CardDescription>
                    {report.moduleEvaluations.length} módulos avaliados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {report.moduleEvaluations.map((module) => (
                      <Card key={module.moduleId}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{module.moduleName}</CardTitle>
                            <Badge variant={module.score >= 80 ? "default" : module.score >= 60 ? "secondary" : "destructive"}>
                              {module.score}/100
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <p className="text-muted-foreground">{module.findings}</p>
                          {module.recommendations.length > 0 && (
                            <div>
                              <p className="font-semibold">Recomendações:</p>
                              <ul className="list-disc list-inside text-muted-foreground">
                                {module.recommendations.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Non-Conformities */}
              <Card>
                <CardHeader>
                  <CardTitle>Não Conformidades</CardTitle>
                  <CardDescription>
                    {report.nonConformities.length} não conformidades identificadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.nonConformities.map((nc) => (
                      <div key={nc.id} className="flex gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getRiskLevelColor(nc.riskLevel)}>
                              {nc.riskLevel}
                            </Badge>
                            <span className="text-sm font-semibold">{nc.standard}</span>
                            <span className="text-sm text-muted-foreground">- {nc.module}</span>
                          </div>
                          <p className="text-sm">{nc.description}</p>
                          {nc.evidence && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-semibold">Evidência:</span> {nc.evidence}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Plano de Ação</CardTitle>
                  <CardDescription>
                    {report.actionPlan.length} ações priorizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.actionPlan.map((action) => (
                      <div key={action.id} className="flex gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityLevelColor(action.priority)}>
                              {action.priority}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Prazo: {action.deadline}
                            </span>
                          </div>
                          <p className="text-sm">{action.description}</p>
                          {action.responsible && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Responsável: {action.responsible}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
