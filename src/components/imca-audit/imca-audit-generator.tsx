// ===========================
// IMCA Audit Generator Component
// Main UI component for IMCA DP Technical Audit System
// ===========================

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, FileText, Download, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  AuditBasicData,
  AuditOperationalData,
  AuditReport,
  DPClass,
  IMCA_STANDARDS
} from "@/types/imca-audit";
import { IMCA_STANDARDS as STANDARDS } from "@/types/imca-audit";
import { generateIMCAAudit, saveAudit, exportToMarkdown, downloadMarkdown } from "@/services/imca-audit-service";

const IMCAAuditGenerator = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [showStandards, setShowStandards] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  // Basic Data State
  const [vesselName, setVesselName] = useState("");
  const [dpClass, setDPClass] = useState<DPClass>("DP2");
  const [location, setLocation] = useState("");
  const [auditObjective, setAuditObjective] = useState("");

  // Operational Data State
  const [incidentDescription, setIncidentDescription] = useState("");
  const [environmentalConditions, setEnvironmentalConditions] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  const [tamActivation, setTamActivation] = useState(false);

  const isBasicDataValid = () => {
    return vesselName.trim() !== "" && 
           location.trim() !== "" && 
           auditObjective.trim() !== "";
  };

  const handleGenerateAudit = async () => {
    if (!isBasicDataValid()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    
    const basicData: AuditBasicData = {
      vesselName,
      dpClass,
      location,
      auditObjective
    };

    const operationalData: AuditOperationalData | undefined = 
      incidentDescription || environmentalConditions || systemStatus
        ? {
            incidentDescription: incidentDescription || undefined,
            environmentalConditions: environmentalConditions || undefined,
            systemStatus: systemStatus || undefined,
            tamActivation
          }
        : undefined;

    try {
      const response = await generateIMCAAudit({
        basicData,
        operationalData
      });

      if (response.success && response.audit) {
        setAuditReport(response.audit);
        setActiveTab("results");
        toast.success("Auditoria gerada com sucesso!");
      } else {
        toast.error(response.error || "Erro ao gerar auditoria");
      }
    } catch (error) {
      console.error("Error generating audit:", error);
      toast.error("Erro ao gerar auditoria");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!auditReport) return;

    const result = await saveAudit(auditReport);
    if (result.success) {
      toast.success("Auditoria salva com sucesso!");
    } else {
      toast.error(result.error || "Erro ao salvar auditoria");
    }
  };

  const handleExport = () => {
    if (!auditReport) return;

    const markdown = exportToMarkdown(auditReport);
    const filename = `auditoria-imca-${auditReport.basicData.vesselName}-${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdown(markdown, filename);
    toast.success("Auditoria exportada com sucesso!");
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "destructive";
      case "Médio":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "🔴";
      case "Médio":
        return "🟡";
      default:
        return "⚪";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gerador de Auditoria Técnica IMCA</CardTitle>
              <CardDescription>
                Sistema de auditoria de posicionamento dinâmico com análise por IA
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStandards(true)}
            >
              <Info className="w-4 h-4 mr-2" />
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

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vesselName">
                    Nome da Embarcação <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vesselName"
                    placeholder="Ex: Aurora Explorer"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dpClass">
                    Classe DP <span className="text-red-500">*</span>
                  </Label>
                  <Select value={dpClass} onValueChange={(value) => setDPClass(value as DPClass)}>
                    <SelectTrigger id="dpClass">
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
                  <Label htmlFor="location">
                    Local <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Santos - SP, Brasil"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="auditObjective">
                    Objetivo da Auditoria <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="auditObjective"
                    placeholder="Ex: Auditoria técnica de rotina para verificação de conformidade com normas IMCA"
                    value={auditObjective}
                    onChange={(e) => setAuditObjective(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setActiveTab("operational")}
                  disabled={!isBasicDataValid()}
                >
                  Próximo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="operational" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Os dados operacionais são opcionais, mas ajudam a gerar uma auditoria mais precisa.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentDescription">Descrição de Incidente (opcional)</Label>
                  <Textarea
                    id="incidentDescription"
                    placeholder="Ex: Falha parcial do sensor GNSS durante operação"
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmentalConditions">Condições Ambientais (opcional)</Label>
                  <Input
                    id="environmentalConditions"
                    placeholder="Ex: Vento moderado de 15 nós, corrente lateral de 2 nós"
                    value={environmentalConditions}
                    onChange={(e) => setEnvironmentalConditions(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemStatus">Status do Sistema (opcional)</Label>
                  <Input
                    id="systemStatus"
                    placeholder="Ex: Todos os thrusters operacionais, 3 sensores GNSS ativos"
                    value={systemStatus}
                    onChange={(e) => setSystemStatus(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tamActivation"
                    checked={tamActivation}
                    onCheckedChange={setTamActivation}
                  />
                  <Label htmlFor="tamActivation">Ativação TAM (Thruster Assisted Mooring)</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleGenerateAudit}
                  disabled={loading || !isBasicDataValid()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando Auditoria...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Gerar Auditoria
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4 mt-4">
              {auditReport && (
                <>
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" onClick={handleSaveAudit}>
                      Salvar Auditoria
                    </Button>
                    <Button onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Markdown
                    </Button>
                  </div>

                  {/* Context Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contexto da Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{auditReport.context.summary}</p>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Normas Aplicáveis:</h4>
                        <div className="flex flex-wrap gap-2">
                          {auditReport.context.applicableStandards.map((standard, idx) => (
                            <Badge key={idx} variant="secondary">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Non-conformities Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Não Conformidades ({auditReport.nonConformities.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {auditReport.nonConformities.map((nc, idx) => (
                        <Card key={idx} className="border-l-4" style={{
                          borderLeftColor: nc.riskLevel === "Alto" ? "#ef4444" : 
                                          nc.riskLevel === "Médio" ? "#f59e0b" : "#9ca3af"
                        }}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">
                                {getRiskIcon(nc.riskLevel)} {nc.module}
                              </CardTitle>
                              <Badge variant={getRiskColor(nc.riskLevel) as any}>
                                {nc.riskLevel}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <span className="font-semibold">Norma: </span>
                              <span className="text-sm">{nc.standard}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Descrição: </span>
                              <span className="text-sm">{nc.description}</span>
                            </div>
                            {nc.evidence && (
                              <div>
                                <span className="font-semibold">Evidência: </span>
                                <span className="text-sm">{nc.evidence}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Corrective Actions Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Plano de Ações Corretivas ({auditReport.correctiveActions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {auditReport.correctiveActions.map((action, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{idx + 1}. {action.description}</h4>
                            <Badge variant={
                              action.priority === "Crítico" ? "destructive" :
                              action.priority === "Alto" ? "warning" :
                              "secondary"
                            }>
                              {action.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Prazo:</span> {action.deadline}
                            {action.responsible && (
                              <span className="ml-4">
                                <span className="font-medium">Responsável:</span> {action.responsible}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Standards Reference Dialog */}
      <Dialog open={showStandards} onOpenChange={setShowStandards}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Normas IMCA, IMO e MTS de Referência</DialogTitle>
            <DialogDescription>
              Normas internacionais aplicadas na auditoria de sistemas DP
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {STANDARDS.map((standard, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{standard.code}</CardTitle>
                  <CardDescription className="font-semibold">{standard.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{standard.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IMCAAuditGenerator;
