import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  Ship,
  Calendar,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { generateAudit, saveAudit, downloadAuditMarkdown } from "@/services/imca-audit-service";
import { IMCA_STANDARDS, AUDIT_MODULES } from "@/types/imca-audit";
import type { AuditBasicData, AuditOperationalData, IMCAAuditReport, DPClass, OperationType } from "@/types/imca-audit";

const IMCAAuditGenerator = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [generating, setGenerating] = useState(false);
  const [auditReport, setAuditReport] = useState<IMCAAuditReport | null>(null);
  const [showStandards, setShowStandards] = useState(false);

  // Basic data form state
  const [basicData, setBasicData] = useState<AuditBasicData>({
    vesselName: "",
    operationType: "navio",
    location: "",
    dpClass: "DP2",
    auditObjective: "",
    auditDate: new Date().toISOString().split("T")[0]
  });

  // Operational data form state
  const [operationalData, setOperationalData] = useState<AuditOperationalData>({
    incidentDescription: "",
    environmentalConditions: "",
    systemStatus: "",
    operatorActions: "",
    tamActivation: false,
    logCompleteness: "",
    additionalNotes: ""
  });

  const [includeAllModules, setIncludeAllModules] = useState(true);

  const handleGenerateAudit = async () => {
    // Validate required fields
    if (!basicData.vesselName || !basicData.location || !basicData.auditObjective) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setGenerating(true);
    try {
      const report = await generateAudit({
        basicData,
        operationalData: operationalData.incidentDescription ? operationalData : undefined,
        includeAllModules
      });

      setAuditReport(report);
      toast.success("Auditoria gerada com sucesso!");
      setActiveTab("results");
    } catch (error) {
      console.error("Error generating audit:", error);
      toast.error("Erro ao gerar auditoria. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!auditReport) return;

    try {
      await saveAudit(auditReport);
      toast.success("Auditoria salva com sucesso!");
    } catch (error) {
      console.error("Error saving audit:", error);
      toast.error("Erro ao salvar auditoria");
    }
  };

  const handleExportMarkdown = () => {
    if (!auditReport) return;
    downloadAuditMarkdown(auditReport);
    toast.success("Relatório exportado com sucesso!");
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "destructive";
      case "Médio":
        return "warning";
      case "Baixo":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Crítico":
        return "destructive";
      case "Alto":
        return "warning";
      case "Médio":
        return "secondary";
      case "Baixo":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Ship className="h-6 w-6" />
                Gerador de Auditoria Técnica IMCA
              </CardTitle>
              <CardDescription>
                Sistema de auditoria baseado nas normas IMCA, IMO e MTS para embarcações DP
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStandards(true)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Ver Normas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="operational">Dados Operacionais</TabsTrigger>
              <TabsTrigger value="results" disabled={!auditReport}>
                Resultados
              </TabsTrigger>
            </TabsList>

            {/* Basic Data Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vesselName">
                    Nome da Embarcação/Operação <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vesselName"
                    placeholder="Ex: Aurora Explorer"
                    value={basicData.vesselName}
                    onChange={(e) => setBasicData({ ...basicData, vesselName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operationType">Tipo de Operação</Label>
                  <Select
                    value={basicData.operationType}
                    onValueChange={(value: OperationType) =>
                      setBasicData({ ...basicData, operationType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="navio">Navio</SelectItem>
                      <SelectItem value="terra">Terra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Localização <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      className="pl-9"
                      placeholder="Ex: Santos - SP, Brasil"
                      value={basicData.location}
                      onChange={(e) => setBasicData({ ...basicData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dpClass">Classe DP</Label>
                  <Select
                    value={basicData.dpClass}
                    onValueChange={(value: DPClass) =>
                      setBasicData({ ...basicData, dpClass: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP1">DP1</SelectItem>
                      <SelectItem value="DP2">DP2</SelectItem>
                      <SelectItem value="DP3">DP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auditDate">Data da Auditoria</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="auditDate"
                      type="date"
                      className="pl-9"
                      value={basicData.auditDate}
                      onChange={(e) => setBasicData({ ...basicData, auditDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditObjective">
                  Objetivo da Auditoria <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="auditObjective"
                  placeholder="Descreva o objetivo desta auditoria técnica..."
                  rows={3}
                  value={basicData.auditObjective}
                  onChange={(e) => setBasicData({ ...basicData, auditObjective: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="includeAllModules"
                  checked={includeAllModules}
                  onCheckedChange={setIncludeAllModules}
                />
                <Label htmlFor="includeAllModules" className="cursor-pointer">
                  Auditar todos os {AUDIT_MODULES.length} módulos
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => setActiveTab("operational")}>
                  Próximo: Dados Operacionais
                </Button>
              </div>
            </TabsContent>

            {/* Operational Data Tab */}
            <TabsContent value="operational" className="space-y-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Opcional:</strong> Preencha estes campos se a auditoria estiver relacionada a um incidente específico.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentDescription">Descrição do Incidente</Label>
                  <Textarea
                    id="incidentDescription"
                    placeholder="Descreva o incidente que motivou esta auditoria..."
                    rows={4}
                    value={operationalData.incidentDescription}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, incidentDescription: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmentalConditions">Condições Ambientais</Label>
                  <Textarea
                    id="environmentalConditions"
                    placeholder="Ex: Vento moderado de 15 nós, corrente lateral de 2 nós..."
                    rows={2}
                    value={operationalData.environmentalConditions}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, environmentalConditions: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemStatus">Status do Sistema</Label>
                  <Textarea
                    id="systemStatus"
                    placeholder="Ex: Falha parcial do sensor GNSS..."
                    rows={2}
                    value={operationalData.systemStatus}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, systemStatus: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatorActions">Ações do Operador</Label>
                  <Textarea
                    id="operatorActions"
                    placeholder="Descreva as ações tomadas pelo operador..."
                    rows={2}
                    value={operationalData.operatorActions}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, operatorActions: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tamActivation"
                    checked={operationalData.tamActivation}
                    onCheckedChange={(checked) =>
                      setOperationalData({ ...operationalData, tamActivation: checked })
                    }
                  />
                  <Label htmlFor="tamActivation" className="cursor-pointer">
                    Modo TAM foi ativado
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logCompleteness">Completude dos Logs</Label>
                  <Input
                    id="logCompleteness"
                    placeholder="Ex: Logs parcialmente completos, falta timestamp..."
                    value={operationalData.logCompleteness}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, logCompleteness: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Notas Adicionais</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Outras informações relevantes..."
                    rows={2}
                    value={operationalData.additionalNotes}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, additionalNotes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Voltar
                </Button>
                <Button onClick={handleGenerateAudit} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando Auditoria...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Auditoria
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="mt-4">
              {auditReport && (
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleSaveAudit}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Salvar Auditoria
                    </Button>
                    <Button onClick={handleExportMarkdown}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Markdown
                    </Button>
                  </div>

                  {/* Context */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contexto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {auditReport.context}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Standards Applied */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Normas Aplicadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {auditReport.standardsApplied.map((std) => (
                          <Badge key={std} variant="secondary">
                            {std}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Non-Conformities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Não-Conformidades ({auditReport.nonConformities.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                          {auditReport.nonConformities.map((nc, index) => (
                            <Card key={index} className="border-l-4" style={{
                              borderLeftColor: nc.riskLevel === "Alto" ? "rgb(239, 68, 68)" : 
                                              nc.riskLevel === "Médio" ? "rgb(251, 146, 60)" : 
                                              "rgb(156, 163, 175)"
                            }}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base">{nc.module}</CardTitle>
                                    <CardDescription className="mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {nc.standard}
                                      </Badge>
                                    </CardDescription>
                                  </div>
                                  <Badge variant={getRiskColor(nc.riskLevel) as any}>
                                    {nc.riskLevel}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium mb-1">Descrição:</p>
                                  <p className="text-sm text-gray-700">{nc.description}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Causas Prováveis:</p>
                                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {nc.probableCauses.map((cause, i) => (
                                      <li key={i}>{cause}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Ação Corretiva:</p>
                                  <p className="text-sm text-gray-700">{nc.correctiveAction}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Verificação:</p>
                                  <p className="text-sm text-gray-700">{nc.verificationRequirements}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Action Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Plano de Ação Priorizado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditReport.actionPlan.map((item, index) => (
                          <Card key={index}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg text-gray-500">
                                    {index + 1}.
                                  </span>
                                  <Badge variant={getPriorityColor(item.priority) as any}>
                                    {item.priority}
                                  </Badge>
                                </div>
                                <span className="text-sm text-gray-500">{item.recommendedDeadline}</span>
                              </div>
                              <p className="text-sm font-medium mb-2">{item.action}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Responsável:</span> {item.responsibleParty}
                                </div>
                                <div>
                                  <span className="font-medium">Verificação:</span> {item.verificationMethod}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary and Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resumo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {auditReport.summary}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recomendações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {auditReport.recommendations}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Standards Reference Modal */}
      <Dialog open={showStandards} onOpenChange={setShowStandards}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Normas e Diretrizes de Referência</DialogTitle>
            <DialogDescription>
              Normas IMCA, IMO e MTS aplicadas na geração de auditorias técnicas
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {IMCA_STANDARDS.map((standard) => (
                <Card key={standard.code}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{standard.code}</CardTitle>
                        <CardDescription className="mt-1">{standard.name}</CardDescription>
                      </div>
                      <Badge variant="outline">{standard.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{standard.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IMCAAuditGenerator;
