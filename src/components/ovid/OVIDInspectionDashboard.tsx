import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Ship, FileText, CheckCircle, AlertTriangle, XCircle, 
  Plus, Download, Filter, Search, Calendar, User, 
  ClipboardCheck, BarChart3, MessageSquare, Settings,
  Brain, FileCheck, Clock, Target, Shield, Anchor
} from "lucide-react";
import { OVIQ4_SECTIONS, VESSEL_TYPES, getTotalQuestions } from "@/data/oviq4-checklist";
import { OVIDChecklist } from "./OVIDChecklist";
import { OVIDNonConformities } from "./OVIDNonConformities";
import { OVIDAIAssistant } from "./OVIDAIAssistant";
import { OVIDReports } from "./OVIDReports";

interface InspectionStatus {
  compliant: number;
  nonCompliant: number;
  notApplicable: number;
  pending: number;
}

export const OVIDInspectionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVesselType, setSelectedVesselType] = useState<string>("Offshore Supply Vessel (OSV)");
  const [inspectionStarted, setInspectionStarted] = useState(false);
  const [vesselName, setVesselName] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [status, setStatus] = useState<InspectionStatus>({
    compliant: 0,
    nonCompliant: 0,
    notApplicable: 0,
    pending: getTotalQuestions(),
  };

  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, { 
    answer: "yes" | "no" | "na" | null;
    observation: string;
    evidence: string[];
  }>>({});

  const totalQuestions = getTotalQuestions();
  const answeredQuestions = status.compliant + status.nonCompliant + status.notApplicable;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  
  const complianceScore = answeredQuestions > 0 
    ? Math.round(((status.compliant + status.notApplicable) / answeredQuestions) * 100) 
    : 0;

  const handleStartInspection = () => {
    if (!vesselName || !imoNumber || !inspectorName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setInspectionStarted(true);
    setActiveTab("checklist");
    toast.success("Inspeção OVID iniciada");
  };

  const handleAnswerChange = (questionId: string, answer: "yes" | "no" | "na", observation?: string) => {
    const prevAnswer = checklistAnswers[questionId]?.answer;
    
    setChecklistAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer,
        observation: observation || prev[questionId]?.observation || "",
        evidence: prev[questionId]?.evidence || [],
      }
    }));

    // Update status counts
    setStatus(prev => {
      const newStatus = { ...prev };
      
      // Decrement previous count
      if (prevAnswer === "yes") newStatus.compliant--;
      else if (prevAnswer === "no") newStatus.nonCompliant--;
      else if (prevAnswer === "na") newStatus.notApplicable--;
      else newStatus.pending--;
      
      // Increment new count
      if (answer === "yes") newStatus.compliant++;
      else if (answer === "no") newStatus.nonCompliant++;
      else if (answer === "na") newStatus.notApplicable++;
      
      return newStatus;
    });
  });

  const handleExport = () => {
    toast.success("Exportando relatório OVID...");
    // Export logic would go here
  };

  const handleFilter = () => {
    toast.info("Filtros aplicados");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">OVID Inspection Dashboard</h2>
          <p className="text-muted-foreground">
            OCIMF Offshore Vessel Inspection Database - OVIQ4 (7300)
          </p>
        </div>
        <div className="flex gap-2">
          {!inspectionStarted ? (
            <Button onClick={handleSetActiveTab}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Inspeção
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleFilter}>
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Vessel Type Selection */}
      <Card className="border-primary/20">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-primary" />
              <span className="font-medium">Tipo de Embarcação:</span>
            </div>
            <Select value={selectedVesselType} onValueChange={setSelectedVesselType}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VESSEL_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {inspectionStarted && (
              <div className="flex items-center gap-4 ml-auto">
                <Badge variant="outline" className="text-sm">
                  <User className="w-3 h-3 mr-1" />
                  {inspectorName}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Calendar className="w-3 h-3 mr-1" />
                  {inspectionDate}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" 
          onClick={handleSetActiveTab}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{complianceScore}%</p>
              </div>
              <Target className={`w-8 h-8 ${complianceScore >= 85 ? "text-green-500" : complianceScore >= 70 ? "text-yellow-500" : "text-red-500"}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-500/50 transition-colors"
          onClick={handleSetActiveTab}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conforme</p>
                <p className="text-2xl font-bold text-green-500">{status.compliant}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-red-500/50 transition-colors"
          onClick={handleSetActiveTab}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Conforme</p>
                <p className="text-2xl font-bold text-red-500">{status.nonCompliant}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onClick={handleSetActiveTab}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">N/A</p>
                <p className="text-2xl font-bold text-muted-foreground">{status.notApplicable}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-yellow-500/50 transition-colors"
          onClick={handleSetActiveTab}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-500">{status.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-blue-500/50 transition-colors"
          onClick={handleSetActiveTab}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold text-blue-500">{progressPercent}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {inspectionStarted && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da Inspeção</span>
                <span>{answeredQuestions} de {totalQuestions} questões ({progressPercent}%)</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-1">
            <ClipboardCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
          <TabsTrigger value="ncs" className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">NCs</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  Sobre o OVID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O Offshore Vessel Inspection Database (OVID) foi desenvolvido pelo OCIMF para 
                  fornecer inspeções offshore de acordo com o formato SIRE. O programa permite 
                  que membros do OCIMF submetam relatórios de inspeção para distribuição.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Benefícios:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Banco de dados centralizado de relatórios de inspeção</li>
                    <li>Padronização de procedimentos de inspeção</li>
                    <li>Verificações de garantia aceleradas</li>
                    <li>Documento de inspeção comum (OVIQ4)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Estrutura OVIQ4
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {OVIQ4_SECTIONS.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{section.id}</Badge>
                          <span className="text-sm font-medium">{section.name}</span>
                        </div>
                        <Badge variant="secondary">{section.questions.length} questões</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Referências Normativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "SOLAS", desc: "Safety of Life at Sea" },
                    { name: "MARPOL", desc: "Marine Pollution Prevention" },
                    { name: "ISM Code", desc: "International Safety Management" },
                    { name: "ISPS Code", desc: "Ship and Port Facility Security" },
                    { name: "STCW 2010", desc: "Training, Certification and Watchkeeping" },
                    { name: "MLC 2006", desc: "Maritime Labour Convention" },
                    { name: "IMCA M103", desc: "DP Vessels Guidelines" },
                    { name: "GOMO", desc: "Guidelines for Offshore Marine Operations" },
                  ].map((ref) => (
                    <div key={ref.name} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm">{ref.name}</p>
                      <p className="text-xs text-muted-foreground">{ref.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* New Inspection Tab */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Inspeção OVID
              </CardTitle>
              <CardDescription>
                Preencha os dados para iniciar uma nova inspeção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vesselName">Nome da Embarcação *</Label>
                    <Input 
                      id="vesselName"
                      placeholder="Ex: SKANDI NEPTUNE"
                      value={vesselName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imoNumber">Número IMO *</Label>
                    <Input 
                      id="imoNumber"
                      placeholder="Ex: 9876543"
                      value={imoNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="operator">Operador</Label>
                    <Input 
                      id="operator"
                      placeholder="Nome do operador"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inspectorName">Nome do Inspetor *</Label>
                    <Input 
                      id="inspectorName"
                      placeholder="Seu nome completo"
                      value={inspectorName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inspectionDate">Data da Inspeção</Label>
                    <Input 
                      id="inspectionDate"
                      type="date"
                      value={inspectionDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Porto de Inspeção</Label>
                    <Input 
                      id="port"
                      placeholder="Porto e país"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button size="lg" onClick={handleStartInspection}>
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Iniciar Inspeção
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <OVIDChecklist 
            vesselType={selectedVesselType}
            answers={checklistAnswers}
            onAnswerChange={handleAnswerChange}
            inspectionStarted={inspectionStarted}
          />
        </TabsContent>

        {/* Non-Conformities Tab */}
        <TabsContent value="ncs">
          <OVIDNonConformities 
            answers={checklistAnswers}
            onGenerateActionPlan={(questionId) => {
              toast.success(`Gerando plano de ação para ${questionId}...`);
            }}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <OVIDReports 
            vesselName={vesselName}
            imoNumber={imoNumber}
            inspectorName={inspectorName}
            inspectionDate={inspectionDate}
            status={status}
            answers={checklistAnswers}
          />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai">
          <OVIDAIAssistant vesselType={selectedVesselType} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Preferências de Inspeção</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Salvar automaticamente</span>
                    <Button variant="outline" size="sm">Ativar</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Notificações de prazo</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Idioma do relatório</span>
                    <Select defaultValue="pt-BR">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Formato de exportação</span>
                    <Select defaultValue="pdf">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OVIDInspectionDashboard;
