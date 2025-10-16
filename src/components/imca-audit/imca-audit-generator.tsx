/**
 * IMCA Audit Generator Component
 * Main UI component for generating IMCA DP Technical Audits
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Save,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Ship,
  MapPin,
  Calendar,
  Target
} from "lucide-react";
import { toast } from "sonner";
import {
  generateIMCAAudit,
  saveIMCAAudit,
  exportIMCAAudit
} from "@/services/imca-audit-service";
import {
  DPClass,
  IMCAAuditReport,
  IMCAAuditRequest,
  getRiskLevelColor,
  getPriorityLevelColor
} from "@/types/imca-audit";

const IMCAAuditGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [vesselName, setVesselName] = useState("");
  const [dpClass, setDpClass] = useState<DPClass | "">("");
  const [location, setLocation] = useState("");
  const [auditObjective, setAuditObjective] = useState("");
  const [incidentDetails, setIncidentDetails] = useState("");
  const [environmentalConditions, setEnvironmentalConditions] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  
  // Result state
  const [auditReport, setAuditReport] = useState<IMCAAuditReport | null>(null);

  const validateBasicData = (): boolean => {
    if (!vesselName.trim()) {
      toast.error("Por favor, informe o nome da embarcação");
      return false;
    }
    if (!dpClass) {
      toast.error("Por favor, selecione a classe DP");
      return false;
    }
    if (!location.trim()) {
      toast.error("Por favor, informe o local");
      return false;
    }
    if (!auditObjective.trim()) {
      toast.error("Por favor, informe o objetivo da auditoria");
      return false;
    }
    return true;
  };

  const handleGenerateAudit = async () => {
    if (!validateBasicData()) {
      return;
    }

    setGenerating(true);
    
    try {
      const request: IMCAAuditRequest = {
        vesselName,
        dpClass: dpClass as DPClass,
        location,
        auditObjective,
        incidentDetails: incidentDetails || undefined,
        environmentalConditions: environmentalConditions || undefined,
        systemStatus: systemStatus || undefined
      };

      const report = await generateIMCAAudit(request);
      setAuditReport(report);
      setActiveTab("results");
      
      toast.success("Auditoria gerada com sucesso!", {
        description: `Pontuação geral: ${report.overallScore}/${report.maxScore}`
      });
    } catch (error) {
      console.error("Error generating audit:", error);
      toast.error("Erro ao gerar auditoria", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!auditReport) {
      toast.error("Nenhuma auditoria para salvar");
      return;
    }

    setSaving(true);
    
    try {
      await saveIMCAAudit(auditReport, "completed");
      toast.success("Auditoria salva com sucesso!");
    } catch (error) {
      console.error("Error saving audit:", error);
      toast.error("Erro ao salvar auditoria", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportAudit = () => {
    if (!auditReport) {
      toast.error("Nenhuma auditoria para exportar");
      return;
    }

    try {
      exportIMCAAudit(auditReport);
      toast.success("Auditoria exportada com sucesso!");
    } catch (error) {
      console.error("Error exporting audit:", error);
      toast.error("Erro ao exportar auditoria");
    }
  };

  const handleReset = () => {
    setVesselName("");
    setDpClass("");
    setLocation("");
    setAuditObjective("");
    setIncidentDetails("");
    setEnvironmentalConditions("");
    setSystemStatus("");
    setAuditReport(null);
    setActiveTab("basic");
    toast.info("Formulário resetado");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Ship className="h-6 w-6" />
                Gerador de Auditoria IMCA DP
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Sistema de auditoria técnica com análise IA para embarcações DP seguindo normas IMCA, IMO e MTS
              </p>
            </div>
            {auditReport && (
              <div className="flex gap-2">
                <Button onClick={handleSaveAudit} disabled={saving} variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button onClick={handleExportAudit} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={handleReset} variant="destructive">
                  Resetar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">
                <FileText className="h-4 w-4 mr-2" />
                Dados Básicos
              </TabsTrigger>
              <TabsTrigger value="operational">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Dados Operacionais
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!auditReport}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Resultados
              </TabsTrigger>
            </TabsList>

            {/* Basic Data Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vesselName">
                    <Ship className="h-4 w-4 inline mr-2" />
                    Nome da Embarcação *
                  </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Local *
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Santos Basin, Brazil"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auditDate">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Data da Auditoria
                  </Label>
                  <Input
                    id="auditDate"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditObjective">
                  <Target className="h-4 w-4 inline mr-2" />
                  Objetivo da Auditoria *
                </Label>
                <Textarea
                  id="auditObjective"
                  placeholder="Ex: Avaliação técnica pós-incidente para identificar não-conformidades e ações corretivas"
                  value={auditObjective}
                  onChange={(e) => setAuditObjective(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  * Campos obrigatórios
                </p>
                <Button onClick={() => setActiveTab("operational")}>
                  Próximo
                </Button>
              </div>
            </TabsContent>

            {/* Operational Data Tab */}
            <TabsContent value="operational" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dados operacionais opcionais para análise mais detalhada
              </p>

              <div className="space-y-2">
                <Label htmlFor="incidentDetails">Detalhes do Incidente (Opcional)</Label>
                <Textarea
                  id="incidentDetails"
                  placeholder="Ex: Thruster #3 failure during ROV launch operations"
                  value={incidentDetails}
                  onChange={(e) => setIncidentDetails(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="environmentalConditions">Condições Ambientais (Opcional)</Label>
                <Textarea
                  id="environmentalConditions"
                  placeholder="Ex: Sea state 3, wind 15 knots, current 1.2 knots"
                  value={environmentalConditions}
                  onChange={(e) => setEnvironmentalConditions(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemStatus">Status do Sistema (Opcional)</Label>
                <Textarea
                  id="systemStatus"
                  placeholder="Ex: All systems operational except thruster #3"
                  value={systemStatus}
                  onChange={(e) => setSystemStatus(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Voltar
                </Button>
                <Button onClick={handleGenerateAudit} disabled={generating}>
                  <Brain className="h-4 w-4 mr-2" />
                  {generating ? "Gerando Auditoria..." : "Gerar Auditoria"}
                </Button>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {auditReport && (
                <>
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pontuação Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-4xl font-bold">
                          {auditReport.overallScore}/{auditReport.maxScore}
                        </div>
                        <Badge className={
                          auditReport.overallScore >= 80 ? "bg-green-500" :
                          auditReport.overallScore >= 60 ? "bg-yellow-500" :
                          "bg-red-500"
                        }>
                          {auditReport.overallScore >= 80 ? "Conforme" :
                           auditReport.overallScore >= 60 ? "Parcial" :
                           "Não Conforme"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Executive Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo Executivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line">{auditReport.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Module Evaluations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliação por Módulo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditReport.moduleEvaluations.map((module, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{module.module}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {module.score}/{module.maxScore}
                                </span>
                                <Badge variant={
                                  module.status === "compliant" ? "default" :
                                  module.status === "partial" ? "secondary" :
                                  "destructive"
                                }>
                                  {module.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {module.observations}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Non-Conformities */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Não-Conformidades ({auditReport.nonConformities.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditReport.nonConformities.map((nc, index) => (
                          <div key={nc.id} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">#{index + 1}</span>
                                  <Badge className={getRiskLevelColor(nc.riskLevel)}>
                                    {nc.riskLevel}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">{nc.module}</span>
                                </div>
                                <p className="text-sm font-medium mb-1">{nc.description}</p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Norma:</strong> {nc.standard}
                                </p>
                                <p className="text-xs text-blue-600">
                                  <strong>Recomendação:</strong> {nc.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Plano de Ação ({auditReport.actionPlan.length} itens)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditReport.actionPlan.map((action, index) => (
                          <div key={action.id} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">#{index + 1}</span>
                                  <Badge className={getPriorityLevelColor(action.priority)}>
                                    {action.priority}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Prazo: {action.deadline}
                                  </span>
                                </div>
                                <p className="text-sm mb-1">{action.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  Módulo: {action.module}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Standards Compliance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Conformidade com Normas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {auditReport.standardsCompliance.map((std, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-lg">
                              {std.compliant ? "✅" : "❌"}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium">{std.standard}</p>
                              <p className="text-muted-foreground text-xs">{std.observations}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default IMCAAuditGenerator;
