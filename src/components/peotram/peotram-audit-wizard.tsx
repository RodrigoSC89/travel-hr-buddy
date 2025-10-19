import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileCheck, 
  Upload, 
  Camera,
  Mic,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  Users,
  Calendar,
  MapPin,
  Ship,
  Building,
  Star,
  Target,
  Clock,
  Save,
  Send,
  X,
  Plus
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { nullToUndefined } from "@/lib/type-helpers";

interface AuditRequirement {
  id: string;
  code: string;
  description: string;
  evidenceRequired: string[];
  criticalityLevel: "low" | "medium" | "high" | "critical";
  helpText: string;
  score?: number;
  evidence?: string[];
  comments?: string;
  nonConformity?: boolean;
  justification?: string;
}

interface AuditElement {
  id: string;
  name: string;
  description: string;
  requirements: AuditRequirement[];
  progress: number;
  status: "pending" | "in-progress" | "completed";
}

interface AuditData {
  auditId: string;
  auditType: "vessel" | "shore";
  auditPeriod: string;
  auditDate: string;
  auditorName: string;
  company?: string;
  vessel?: {
    name: string;
    indication: string;
    type: string;
  };
  location?: {
    base: string;
    city: string;
    state: string;
  };
  scope: string;
  operationSummary: string;
  observations: string;
  auditors: string[];
  auditees: string[];
}

const PEOTRAM_ELEMENTS: AuditElement[] = [
  {
    id: "ELEMENTO_01",
    name: "Liderança, Gerenciamento e Responsabilidade",
    description: "Compromisso da alta administração com SMS e segurança operacional",
    requirements: [
      {
        id: "1.1.1",
        code: "1.1.1",
        description: "A alta administração da empresa demonstra compromisso claro em implementar e manter a gestão de segurança, meio ambiente e saúde?",
        evidenceRequired: ["Entrevistas com alta administração", "Definição de atribuições e responsabilidades", "Visitas periódicas nas embarcações"],
        criticalityLevel: "high",
        helpText: "Verificar se as lideranças demonstram compromisso efetivo com SMS através de ações práticas e visitas regulares."
      },
      {
        id: "1.1.2",
        code: "1.1.2",
        description: "A empresa demonstra ter setores de Operação, Manutenção/Técnico, RH, SMS adequadamente estruturados?",
        evidenceRequired: ["Organograma estruturado", "Matriz de responsabilidades", "Evidências de articulação entre setores"],
        criticalityLevel: "high",
        helpText: "Avaliar a estrutura organizacional e competência técnica dos setores críticos."
      }
    ],
    progress: 0,
    status: "pending"
  },
  {
    id: "ELEMENTO_02",
    name: "Conformidade Legal",
    description: "Identificação e atendimento a requisitos legais e normativos",
    requirements: [
      {
        id: "2.1.1",
        code: "2.1.1",
        description: "A empresa possui sistema que identifique e atualize as legislações e normas pertinentes às operações?",
        evidenceRequired: ["Lista atualizada de requisitos legais", "Software de gestão legal", "Correlação com estudos de risco"],
        criticalityLevel: "critical",
        helpText: "Sistema deve incluir legislações federais, estaduais, municipais e normas técnicas aplicáveis."
      }
    ],
    progress: 0,
    status: "pending"
  }
];

const SCORING_CRITERIA = {
  "N/A": { value: null, label: "Não Aplicável", percentage: 0, color: "hsl(var(--muted))" },
  "0": { value: 0, label: "Não Evidenciado", percentage: 0, color: "hsl(var(--destructive))" },
  "1": { value: 1, label: "Falhas Sistemáticas", percentage: 20, color: "hsl(var(--destructive))" },
  "2": { value: 2, label: "Falhas Pontuais", percentage: 50, color: "hsl(var(--warning))" },
  "3": { value: 3, label: "Sem Falhas", percentage: 90, color: "hsl(var(--success))" },
  "4": { value: 4, label: "Excelência", percentage: 100, color: "hsl(var(--success))" }
};

const CRITICALITY_LEVELS = {
  "N/A": { label: "Não Aplicável", color: "hsl(var(--muted))" },
  "A": { label: "Crítica", color: "hsl(var(--destructive))" },
  "B": { label: "Grave", color: "hsl(var(--destructive))" },
  "C": { label: "Moderada", color: "hsl(var(--warning))" },
  "D": { label: "Leve", color: "hsl(var(--warning))" },
  "✓": { label: "Conforme", color: "hsl(var(--success))" },
  "✓✓": { label: "Excelência", color: "hsl(var(--success))" }
};

interface PeotramAuditWizardProps {
  auditId?: string;
  onSave?: (data: unknown) => void;
  onComplete?: (data: unknown) => void;
  onCancel?: () => void;
}

export const PeotramAuditWizard: React.FC<PeotramAuditWizardProps> = ({
  auditId,
  onSave,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentElement, setCurrentElement] = useState(0);
  const [currentRequirement, setCurrentRequirement] = useState(0);
  const [auditData, setAuditData] = useState<AuditData>({
    auditId: auditId || `AUDIT_${Date.now()}`,
    auditType: "vessel",
    auditPeriod: "2024-Q4",
    auditDate: new Date().toISOString().split("T")[0],
    auditorName: "",
    scope: "",
    operationSummary: "",
    observations: "",
    auditors: [],
    auditees: []
  });
  const [elements, setElements] = useState<AuditElement[]>(PEOTRAM_ELEMENTS);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: "info", title: "Informações Gerais", icon: Info },
    { id: "audit", title: "Auditoria por Elementos", icon: FileCheck },
    { id: "review", title: "Revisão e Finalização", icon: CheckCircle }
  ];

  const totalRequirements = elements.reduce((total, element) => total + element.requirements.length, 0);
  const completedRequirements = elements.reduce((total, element) => 
    total + element.requirements.filter(req => req.score !== undefined).length, 0
  );
  const overallProgress = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;

  const updateRequirement = (elementIndex: number, reqIndex: number, updates: Partial<AuditRequirement>) => {
    setElements(prev => {
      const newElements = [...prev];
      newElements[elementIndex].requirements[reqIndex] = {
        ...newElements[elementIndex].requirements[reqIndex],
        ...updates
      };
      
      // Update element progress
      const completedReqs = newElements[elementIndex].requirements.filter(req => req.score !== undefined).length;
      newElements[elementIndex].progress = (completedReqs / newElements[elementIndex].requirements.length) * 100;
      
      // Update element status
      if (newElements[elementIndex].progress === 100) {
        newElements[elementIndex].status = "completed";
      } else if (newElements[elementIndex].progress > 0) {
        newElements[elementIndex].status = "in-progress";
      }
      
      return newElements;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const auditResult = {
        ...auditData,
        elements,
        progress: overallProgress,
        completedAt: overallProgress === 100 ? new Date().toISOString() : null
      };
      
      await onSave?.(auditResult);
    } catch (error) { /* Error handled silently */ } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (overallProgress < 100) {
      alert("Todas as avaliações devem ser completadas antes de finalizar a auditoria.");
      return;
    }
    
    setIsSaving(true);
    try {
      const auditResult = {
        ...auditData,
        elements,
        progress: overallProgress,
        completedAt: new Date().toISOString(),
        status: "completed"
      };
      
      await onComplete?.(auditResult);
    } catch (error) { /* Error handled silently */ } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = () => {
    toast({
      title: "📎 Upload de Arquivo",
      description: "Selecione arquivos PDF, imagens ou documentos como evidência"
    });
    // TODO: Implement file upload dialog
  };

  const handleCameraCapture = () => {
    toast({
      title: "📷 Captura de Foto",
      description: "Tire uma foto diretamente como evidência da auditoria"
    });
    // TODO: Implement camera capture functionality
  };

  const handleAudioRecording = () => {
    toast({
      title: "🎙️ Gravação de Áudio",
      description: "Grave notas de voz ou observações verbais da auditoria"
    });
    // TODO: Implement audio recording functionality
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
              ${isActive ? "border-primary bg-primary text-primary-foreground" : 
            isCompleted ? "border-success bg-success text-success-foreground" : 
              "border-muted bg-background text-muted-foreground"}
            `}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div className="ml-3 mr-8">
              <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-16 ${isCompleted ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderInfoStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Informações da Auditoria PEOTRAM
        </CardTitle>
        <CardDescription>
          Preencha as informações básicas da auditoria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="auditType">Tipo de Auditoria</Label>
            <Select 
              value={auditData.auditType} 
              onValueChange={(value: "vessel" | "shore") => 
                setAuditData(prev => ({ ...prev, auditType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vessel">
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4" />
                    Embarcação
                  </div>
                </SelectItem>
                <SelectItem value="shore">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Base Terrestre
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditPeriod">Período da Auditoria</Label>
            <Input
              id="auditPeriod"
              value={auditData.auditPeriod}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditPeriod: e.target.value }))}
              placeholder="Ex: 2024-Q4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditDate">Data da Auditoria</Label>
            <Input
              id="auditDate"
              type="date"
              value={auditData.auditDate}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditorName">Nome do Auditor</Label>
            <Input
              id="auditorName"
              value={auditData.auditorName}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditorName: e.target.value }))}
              placeholder="Nome completo do auditor responsável"
            />
          </div>
        </div>

        {auditData.auditType === "vessel" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Informações da Embarcação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Embarcação</Label>
                <Input
                  value={auditData.vessel?.name || ""}
                  onChange={(e) => setAuditData(prev => ({
                    ...prev,
                    vessel: { ...prev.vessel!, name: e.target.value }
                  }))}
                  placeholder="Nome da embarcação"
                />
              </div>
              <div className="space-y-2">
                <Label>Indicação Petrobras</Label>
                <Input
                  value={auditData.vessel?.indication || ""}
                  onChange={(e) => setAuditData(prev => ({
                    ...prev,
                    vessel: { ...prev.vessel!, indication: e.target.value }
                  }))}
                  placeholder="Código de indicação Petrobras"
                />
              </div>
            </div>
          </div>
        )}

        {auditData.auditType === "shore" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              Informações da Base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base/Terminal</Label>
                <Input
                  value={auditData.location?.base || ""}
                  onChange={(e) => setAuditData(prev => ({
                    ...prev,
                    location: { ...prev.location!, base: e.target.value }
                  }))}
                  placeholder="Nome da base ou terminal"
                />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={auditData.location?.city || ""}
                  onChange={(e) => setAuditData(prev => ({
                    ...prev,
                    location: { ...prev.location!, city: e.target.value }
                  }))}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={auditData.location?.state || ""}
                  onChange={(e) => setAuditData(prev => ({
                    ...prev,
                    location: { ...prev.location!, state: e.target.value }
                  }))}
                  placeholder="Estado"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scope">Escopo da Auditoria</Label>
            <Textarea
              id="scope"
              value={auditData.scope}
              onChange={(e) => setAuditData(prev => ({ ...prev, scope: e.target.value }))}
              placeholder="Descreva o escopo e objetivos da auditoria..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationSummary">Resumo das Operações</Label>
            <Textarea
              id="operationSummary"
              value={auditData.operationSummary}
              onChange={(e) => setAuditData(prev => ({ ...prev, operationSummary: e.target.value }))}
              placeholder="Descreva as principais operações realizadas..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações Gerais</Label>
            <Textarea
              id="observations"
              value={auditData.observations}
              onChange={(e) => setAuditData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observações gerais sobre a auditoria..."
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAuditStep = () => {
    const element = elements[currentElement];
    const requirement = element.requirements[currentRequirement];

    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Progresso Geral da Auditoria</h3>
                <p className="text-sm text-muted-foreground">
                  {completedRequirements} de {totalRequirements} requisitos avaliados
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                <Progress value={overallProgress} className="w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {elements.map((el, index) => (
                <Button
                  key={el.id}
                  variant={index === currentElement ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCurrentElement(index);
                    setCurrentRequirement(0);
                  }}
                  className="h-auto p-2 flex flex-col items-center gap-1"
                >
                  <div className="text-xs font-medium">Elemento {index + 1}</div>
                  <div className="text-xs">{Math.round(el.progress)}%</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Element */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  {element.name}
                </CardTitle>
                <CardDescription>{element.description}</CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {element.requirements.filter(req => req.score !== undefined).length} / {element.requirements.length} completos
              </Badge>
            </div>
            <Progress value={element.progress} className="mt-2" />
          </CardHeader>
        </Card>

        {/* Current Requirement */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Requisito {requirement.code}
              </CardTitle>
              <div className="flex gap-2">
                {currentRequirement > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentRequirement(prev => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                )}
                {currentRequirement < element.requirements.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentRequirement(prev => prev + 1)}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Descrição do Requisito</h4>
              <p className="text-sm text-muted-foreground mb-4">{requirement.description}</p>
              
              <div className="flex items-start gap-2 p-3 bg-info/10 border border-info/20 rounded-lg">
                <HelpCircle className="w-4 h-4 text-info mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-info">Orientação para Avaliação</p>
                  <p className="text-sm text-muted-foreground">{requirement.helpText}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Evidências Requeridas</h4>
              <ul className="space-y-1">
                {requirement.evidenceRequired.map((evidence, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-success mt-1 flex-shrink-0" />
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Avaliação */}
            <div className="space-y-4">
              <h4 className="font-medium">Avaliação do Requisito</h4>
              
              <div className="space-y-3">
                <Label htmlFor="score">Pontuação</Label>
                <Select
                  value={requirement.score?.toString() || ""}
                  onValueChange={(value) => {
                    const scoreValue = value === "N/A" ? undefined : parseInt(value);
                    updateRequirement(currentElement, currentRequirement, { 
                      score: scoreValue,
                      nonConformity: scoreValue !== undefined && scoreValue < 3
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a pontuação" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SCORING_CRITERIA).map(([key, criteria]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: criteria.color }}
                          />
                          <span>{key} - {criteria.label} ({criteria.percentage}%)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {requirement.nonConformity && (
                <Alert className="border-warning bg-warning/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Esta avaliação indica uma não conformidade. Será necessário classificar a criticidade e definir ações corretivas.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="comments">Comentários do Auditor</Label>
                <Textarea
                  id="comments"
                  value={requirement.comments || ""}
                  onChange={(e) => updateRequirement(currentElement, currentRequirement, { 
                    comments: e.target.value 
                  })}
                  placeholder="Descreva as observações, evidências encontradas e justificativas para a pontuação..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label>Anexar Evidências</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFileUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Arquivo
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCameraCapture}>
                    <Camera className="w-4 h-4 mr-2" />
                    Foto
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAudioRecording}>
                    <Mic className="w-4 h-4 mr-2" />
                    Áudio
                  </Button>
                </div>
              </div>

              {requirement.justification && (
                <div className="space-y-3">
                  <Label htmlFor="justification">Justificativa (Para Não Conformidades)</Label>
                  <Textarea
                    id="justification"
                    value={requirement.justification}
                    onChange={(e) => updateRequirement(currentElement, currentRequirement, { 
                      justification: e.target.value 
                    })}
                    placeholder="Justifique a não conformidade e as ações corretivas necessárias..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentRequirement > 0) {
                setCurrentRequirement(prev => prev - 1);
              } else if (currentElement > 0) {
                setCurrentElement(prev => prev - 1);
                setCurrentRequirement(elements[currentElement - 1].requirements.length - 1);
              }
            }}
            disabled={currentElement === 0 && currentRequirement === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          <Button
            onClick={() => {
              if (currentRequirement < element.requirements.length - 1) {
                setCurrentRequirement(prev => prev + 1);
              } else if (currentElement < elements.length - 1) {
                setCurrentElement(prev => prev + 1);
                setCurrentRequirement(0);
              }
            }}
            disabled={currentElement === elements.length - 1 && currentRequirement === element.requirements.length - 1}
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Revisão Final da Auditoria
          </CardTitle>
          <CardDescription>
            Verifique todos os dados antes de finalizar a auditoria PEOTRAM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{Math.round(overallProgress)}%</div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{completedRequirements}</div>
                <p className="text-sm text-muted-foreground">Requisitos Avaliados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">
                  {elements.reduce((total, el) => 
                    total + el.requirements.filter(req => req.nonConformity).length, 0
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Não Conformidades</p>
              </CardContent>
            </Card>
          </div>

          {/* Elements Status */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Status por Elemento</h3>
            <div className="space-y-3">
              {elements.map((element, index) => (
                <div key={element.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{element.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {element.requirements.filter(req => req.score !== undefined).length} / {element.requirements.length} requisitos
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={element.progress} className="w-24" />
                    <Badge 
                      variant="outline"
                      className={element.progress === 100 ? "border-success text-success" : "border-warning text-warning"}
                    >
                      {element.progress === 100 ? "Completo" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Rascunho
              </Button>
              
              <Button 
                onClick={handleComplete}
                disabled={overallProgress < 100 || isSaving}
                className="bg-success hover:bg-success/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Finalizar Auditoria
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {renderStepIndicator()}

        <div className="space-y-6">
          {currentStep === 0 && renderInfoStep()}
          {currentStep === 1 && renderAuditStep()}
          {currentStep === 2 && renderReviewStep()}
        </div>

        {currentStep < 2 && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Etapa Anterior
            </Button>

            <Button
              onClick={() => setCurrentStep(prev => Math.min(2, prev + 1))}
              disabled={currentStep === 1 && overallProgress < 100}
            >
              Próxima Etapa
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};