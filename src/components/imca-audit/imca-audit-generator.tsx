/**
 * IMCA Audit Generator Component
 * UI for creating and viewing IMCA technical audits for DP vessels
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Download,
  Ship,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import type {
  AuditGenerationRequest,
  IMCAAuditReport,
  DPClass,
  OperationType
} from "@/types/imca-audit";
import { IMCA_STANDARDS } from "@/types/imca-audit";
import {
  generateIMCAAudit,
  formatAuditAsMarkdown,
  saveAudit
} from "@/services/imca-audit-service";

const IMCAAuditGenerator: React.FC = () => {
  // Form state
  const [vesselName, setVesselName] = useState("");
  const [operationType, setOperationType] = useState<OperationType>("Navio");
  const [location, setLocation] = useState("");
  const [dpClass, setDpClass] = useState<DPClass>("DP2");
  const [objective, setObjective] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("");
  const [crewInformation, setCrewInformation] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  const [sensorData, setSensorData] = useState("");
  const [logData, setLogData] = useState("");

  // UI state
  const [generating, setGenerating] = useState(false);
  const [generatedAudit, setGeneratedAudit] = useState<IMCAAuditReport | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showStandardsModal, setShowStandardsModal] = useState(false);

  const handleGenerateAudit = async () => {
    // Validation
    if (!vesselName || !location || !objective) {
      toast.error("Campos obrigatórios faltando", {
        description: "Por favor, preencha Nome da Embarcação, Localização e Objetivo."
      });
      return;
    }

    setGenerating(true);
    
    try {
      const request: AuditGenerationRequest = {
        vesselName,
        operationType,
        location,
        dpClass,
        objective,
        operationalData: {
          incidentDescription: incidentDescription || undefined,
          weatherConditions: weatherConditions || undefined,
          crewInformation: crewInformation || undefined,
          systemStatus: systemStatus || undefined,
          sensorData: sensorData || undefined,
          logData: logData || undefined
        }
      };

      const audit = await generateIMCAAudit(request);
      setGeneratedAudit(audit);
      
      // Save to database
      await saveAudit(audit);
      
      setShowAuditModal(true);
      toast.success("Auditoria gerada com sucesso!", {
        description: `${audit.totalNonConformities} não-conformidades identificadas`
      });
    } catch (error) {
      console.error("Error generating audit:", error);
      toast.error("Erro ao gerar auditoria", {
        description: error instanceof Error ? error.message : "Tente novamente"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!generatedAudit) return;
    
    const markdown = formatAuditAsMarkdown(generatedAudit);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-imca-${generatedAudit.vesselName}-${generatedAudit.auditDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Auditoria exportada", {
      description: "Arquivo Markdown baixado com sucesso"
    });
  };

  const getRiskColor = (risk: string) => {
    if (risk === "Alto") return "bg-red-500";
    if (risk === "Médio") return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ship className="h-8 w-8" />
            Gerador de Auditoria IMCA
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de auditoria técnica para embarcações com Dynamic Positioning (DP)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowStandardsModal(true)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Ver Normas IMCA
        </Button>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Auditoria</CardTitle>
          <CardDescription>
            Preencha os dados da embarcação e operação para gerar uma auditoria técnica completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="operational">Dados Operacionais (Opcional)</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vesselName">Nome da Embarcação *</Label>
                  <Input
                    id="vesselName"
                    placeholder="Ex: Aurora Explorer"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operationType">Tipo de Operação *</Label>
                  <Select value={operationType} onValueChange={(value) => setOperationType(value as OperationType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Navio">Navio</SelectItem>
                      <SelectItem value="Terra">Terra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Campos Basin, Santos Basin"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dpClass">Classe DP *</Label>
                  <Select value={dpClass} onValueChange={(value) => setDpClass(value as DPClass)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP1">DP Class 1</SelectItem>
                      <SelectItem value="DP2">DP Class 2</SelectItem>
                      <SelectItem value="DP3">DP Class 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo da Auditoria *</Label>
                <Textarea
                  id="objective"
                  placeholder="Ex: Auditoria de conformidade após incidente de perda parcial de sensor GNSS durante operação com vento moderado"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Operational Data Tab */}
            <TabsContent value="operational" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentDescription">Descrição do Incidente/Operação</Label>
                  <Textarea
                    id="incidentDescription"
                    placeholder="Ex: Falha parcial do sensor GNSS durante operação com vento moderado e corrente lateral. Modo TAM foi ativado automaticamente, mas sem alerta adequado ao operador."
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weatherConditions">Condições Meteorológicas</Label>
                    <Input
                      id="weatherConditions"
                      placeholder="Ex: Vento moderado 15 knots, corrente lateral 2 knots"
                      value={weatherConditions}
                      onChange={(e) => setWeatherConditions(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crewInformation">Informações da Tripulação</Label>
                    <Input
                      id="crewInformation"
                      placeholder="Ex: DPO qualificado conforme IMCA M117"
                      value={crewInformation}
                      onChange={(e) => setCrewInformation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemStatus">Status dos Sistemas</Label>
                  <Textarea
                    id="systemStatus"
                    placeholder="Ex: Todos os thrusters operacionais, PMS funcionando normalmente"
                    value={systemStatus}
                    onChange={(e) => setSystemStatus(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensorData">Dados de Sensores</Label>
                  <Textarea
                    id="sensorData"
                    placeholder="Ex: GNSS-1 com precisão degradada, GNSS-2 operacional, Gyro sem drift detectado"
                    value={sensorData}
                    onChange={(e) => setSensorData(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logData">Dados de Logs</Label>
                  <Textarea
                    id="logData"
                    placeholder="Ex: Log do evento incompleto, faltando timestamp preciso da ativação do TAM"
                    value={logData}
                    onChange={(e) => setLogData(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              onClick={handleGenerateAudit}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando Auditoria...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Auditoria IMCA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Standards Modal */}
      <Dialog open={showStandardsModal} onOpenChange={setShowStandardsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>📚 Normas e Diretrizes IMCA/IMO/MTS</DialogTitle>
            <DialogDescription>
              Normas internacionais utilizadas para auditoria de sistemas DP
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {IMCA_STANDARDS.map((standard) => (
                <Card key={standard.code}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{standard.code}</CardTitle>
                      <Badge variant="secondary">{standard.category}</Badge>
                    </div>
                    <CardDescription className="font-semibold">
                      {standard.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {standard.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Audit Results Modal */}
      <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-6 w-6" />
              Auditoria Técnica IMCA - {generatedAudit?.vesselName}
            </DialogTitle>
            <DialogDescription>
              Auditoria gerada em {generatedAudit?.auditDate} | Classe {generatedAudit?.dpClass}
            </DialogDescription>
          </DialogHeader>

          {generatedAudit && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Conformidade</p>
                          <p className="text-2xl font-bold">{generatedAudit.overallCompliance}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Questões Críticas</p>
                          <p className="text-2xl font-bold">{generatedAudit.criticalIssues}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Não-Conformidades</p>
                          <p className="text-2xl font-bold">{generatedAudit.totalNonConformities}</p>
                        </div>
                        <FileText className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Context Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      Informações da Auditoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold">Embarcação:</p>
                        <p className="text-sm text-muted-foreground">{generatedAudit.vesselName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Tipo:</p>
                        <p className="text-sm text-muted-foreground">{generatedAudit.operationType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Localização:</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {generatedAudit.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Classe DP:</p>
                        <Badge>{generatedAudit.dpClass}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Objetivo:</p>
                      <p className="text-sm text-muted-foreground">{generatedAudit.objective}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Modules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Módulos Auditados</h3>
                  {generatedAudit.modules.map((module, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{module.name}</CardTitle>
                          <Badge variant={module.compliant ? "default" : "destructive"}>
                            {module.compliant ? "Conforme" : "Não Conforme"}
                          </Badge>
                        </div>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {module.findings.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Observações:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {module.findings.map((finding, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {module.nonConformities.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Não-Conformidades:</p>
                            <div className="space-y-3">
                              {module.nonConformities.map((nc) => (
                                <div key={nc.id} className="border-l-4 border-red-500 pl-4 py-2">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-semibold text-sm">{nc.id}: {nc.description}</p>
                                    <Badge className={getRiskColor(nc.riskLevel)}>
                                      {nc.riskLevel}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-semibold">Normas:</span>{" "}
                                      {nc.standardReference.join(", ")}
                                    </div>
                                    <div>
                                      <span className="font-semibold">Causas:</span>
                                      <ul className="list-disc list-inside ml-4">
                                        {nc.probableCauses.map((cause, idx) => (
                                          <li key={idx}>{cause}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <span className="font-semibold">Ações Corretivas:</span>
                                      <ul className="list-disc list-inside ml-4">
                                        {nc.correctiveActions.map((action, idx) => (
                                          <li key={idx}>{action}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    {nc.deadline && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        Prazo: {nc.deadline}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Recomendações:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {module.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>📋 Plano de Ação Priorizado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedAudit.actionPlan.criticalItems.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-red-600">⚠️ Itens Críticos (Atenção Imediata)</h4>
                        <div className="space-y-2">
                          {generatedAudit.actionPlan.criticalItems.map((item, idx) => (
                            <div key={idx} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                              <p className="font-semibold text-sm">{item.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Módulo: {item.module} | Prazo: {item.deadline || "Imediato"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3">📅 Cronograma de Ações</h4>
                      <div className="space-y-2">
                        {generatedAudit.actionPlan.prioritizedActions.map((action, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold text-sm">{action.action}</p>
                              <Badge
                                className={
                                  action.priority === "Crítica" ? "bg-red-500" :
                                  action.priority === "Alta" ? "bg-orange-500" :
                                  action.priority === "Média" ? "bg-yellow-500" : "bg-green-500"
                                }
                              >
                                {action.priority}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Prazo: {action.deadline}
                              </div>
                              <p>Verificação: {action.verification}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAuditModal(false)}>
              Fechar
            </Button>
            <Button onClick={handleDownloadMarkdown}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Markdown
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IMCAAuditGenerator;
