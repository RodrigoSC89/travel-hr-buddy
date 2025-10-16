// IMCA Audit Generator Component
// Main UI component for generating IMCA DP technical audits

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  Ship,
  MapPin,
  Target
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DPClass,
  AuditBasicData,
  AuditOperationalData,
  AuditResult,
  GenerateAuditRequest
} from "@/types/imca-audit";
import {
  generateAudit,
  saveAudit,
  exportAuditToMarkdown
} from "@/services/imca-audit-service";
import { IMCA_STANDARDS, DP_MODULES } from "@/types/imca-audit";

export const IMCAAuditGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Basic data state
  const [vesselName, setVesselName] = useState("");
  const [dpClass, setDpClass] = useState<DPClass | "">("");
  const [location, setLocation] = useState("");
  const [auditObjective, setAuditObjective] = useState("");
  
  // Operational data state
  const [incidentDetails, setIncidentDetails] = useState("");
  const [environmentalConditions, setEnvironmentalConditions] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  const [operationalNotes, setOperationalNotes] = useState("");
  
  // Result state
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const isBasicDataValid = (): boolean => {
    return !!(vesselName && dpClass && location && auditObjective);
  };

  const handleGenerateAudit = async () => {
    if (!isBasicDataValid()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setGenerating(true);
    
    try {
      const request: GenerateAuditRequest = {
        basicData: {
          vesselName,
          dpClass: dpClass as DPClass,
          location,
          auditObjective,
        },
        operationalData: {
          incidentDetails: incidentDetails || undefined,
          environmentalConditions: environmentalConditions || undefined,
          systemStatus: systemStatus || undefined,
          operationalNotes: operationalNotes || undefined,
        },
      };

      const result = await generateAudit(request);
      setAuditResult(result);
      setActiveTab("results");
      toast.success("Auditoria gerada com sucesso!");
    } catch (error) {
      console.error("Error generating audit:", error);
      toast.error("Erro ao gerar auditoria. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!auditResult) {
      return;
    }

    setSaving(true);
    
    try {
      await saveAudit(auditResult);
      toast.success("Auditoria salva com sucesso!");
    } catch (error) {
      console.error("Error saving audit:", error);
      toast.error("Erro ao salvar auditoria. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportAudit = () => {
    if (!auditResult) {
      return;
    }

    try {
      exportAuditToMarkdown(auditResult);
      toast.success("Auditoria exportada com sucesso!");
    } catch (error) {
      console.error("Error exporting audit:", error);
      toast.error("Erro ao exportar auditoria. Tente novamente.");
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case "Alto":
        return "bg-red-500";
      case "Médio":
        return "bg-yellow-500";
      case "Baixo":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "Crítico":
        return "bg-red-500";
      case "Alto":
        return "bg-orange-500";
      case "Médio":
        return "bg-yellow-500";
      case "Baixo":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gerador de Auditoria IMCA DP</h1>
        <p className="text-muted-foreground">
          Sistema de auditoria técnica para embarcações DP com análise baseada em IA
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="operational">Dados Operacionais</TabsTrigger>
          <TabsTrigger value="results" disabled={!auditResult}>
            Resultados
          </TabsTrigger>
        </TabsList>

        {/* Basic Data Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Informações da Embarcação
              </CardTitle>
              <CardDescription>
                Dados fundamentais para a auditoria técnica DP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização *
                </Label>
                <Input
                  id="location"
                  placeholder="Ex: Santos Basin, Brazil"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditObjective" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivo da Auditoria *
                </Label>
                <Textarea
                  id="auditObjective"
                  placeholder="Ex: Avaliação técnica pós-incidente com falha de propulsor"
                  value={auditObjective}
                  onChange={(e) => setAuditObjective(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setActiveTab("operational")}
                  disabled={!isBasicDataValid()}
                  className="w-full"
                >
                  Continuar para Dados Operacionais
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operational Data Tab */}
        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Dados Operacionais
              </CardTitle>
              <CardDescription>
                Informações adicionais sobre incidentes e condições operacionais (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incidentDetails">Detalhes do Incidente</Label>
                <Textarea
                  id="incidentDetails"
                  placeholder="Descreva o incidente ou situação que motivou a auditoria"
                  value={incidentDetails}
                  onChange={(e) => setIncidentDetails(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="environmentalConditions">Condições Ambientais</Label>
                <Textarea
                  id="environmentalConditions"
                  placeholder="Condições de vento, mar, corrente durante a operação"
                  value={environmentalConditions}
                  onChange={(e) => setEnvironmentalConditions(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemStatus">Status dos Sistemas</Label>
                <Textarea
                  id="systemStatus"
                  placeholder="Status dos sistemas DP, propulsores, sensores, etc."
                  value={systemStatus}
                  onChange={(e) => setSystemStatus(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operationalNotes">Notas Operacionais</Label>
                <Textarea
                  id="operationalNotes"
                  placeholder="Outras observações relevantes para a auditoria"
                  value={operationalNotes}
                  onChange={(e) => setOperationalNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleGenerateAudit}
                  disabled={generating || !isBasicDataValid()}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Auditoria...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar Auditoria com IA
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                  className="w-full"
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {auditResult && (
            <>
              {/* Actions Bar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSaveAudit} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Auditoria
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleExportAudit}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Markdown
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Auditoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Embarcação</p>
                      <p className="font-semibold">{auditResult.vesselName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Classe DP</p>
                      <Badge>{auditResult.dpClass}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pontuação</p>
                      <p className="text-2xl font-bold">{auditResult.overallScore}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Não Conformidades</p>
                      <p className="text-2xl font-bold text-red-500">
                        {auditResult.nonConformities.length}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Resumo</p>
                    <p className="text-sm">{auditResult.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Standards Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Normas Avaliadas ({auditResult.standards.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auditResult.standards.map((standard) => (
                      <div key={standard.code} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{standard.code}</p>
                          <p className="text-xs text-muted-foreground">{standard.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Modules Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Módulos Avaliados ({auditResult.modules.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {auditResult.modules.map((module) => (
                    <div key={module.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{module.name}</h3>
                        {module.score !== undefined && (
                          <Badge variant={module.score >= 70 ? "default" : "destructive"}>
                            {module.score}/100
                          </Badge>
                        )}
                      </div>
                      {module.nonConformities && module.nonConformities.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-500 mb-1">
                            Não Conformidades:
                          </p>
                          <ul className="text-sm space-y-1">
                            {module.nonConformities.map((nc, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                {nc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Non-Conformities Card */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Não Conformidades Críticas ({auditResult.nonConformities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {auditResult.nonConformities.map((nc, index) => (
                    <div key={nc.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">
                          {index + 1}. {nc.description}
                        </h3>
                        <Badge className={getRiskColor(nc.riskLevel)}>
                          {nc.riskLevel}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Módulo:</span> {nc.module}
                        </p>
                        <p>
                          <span className="font-medium">Norma:</span> {nc.standard}
                        </p>
                        <p>
                          <span className="font-medium">Recomendação:</span> {nc.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Plan Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Plano de Ação ({auditResult.actionPlan.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {auditResult.actionPlan.map((action, index) => (
                    <div key={action.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">
                          {index + 1}. {action.description}
                        </h3>
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Prazo:</span> {action.deadline}
                        </p>
                        {action.responsible && (
                          <p>
                            <span className="font-medium">Responsável:</span> {action.responsible}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {auditResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
