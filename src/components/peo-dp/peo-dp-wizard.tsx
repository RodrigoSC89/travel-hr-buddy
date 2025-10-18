import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  GraduationCap,
  FileText,
  Radio,
  Wrench,
  TestTube,
  Ship,
  Save,
  Send
} from "lucide-react";
import { toast } from "sonner";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  fields: string[];
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "basic",
    title: "Informações Básicas",
    description: "Dados gerais da embarcação e operação",
    icon: Ship,
    fields: ["vessel_name", "vessel_type", "dp_class", "operation_type"]
  },
  {
    id: "management",
    title: "Gestão",
    description: "Organograma e responsabilidades",
    icon: Users,
    fields: ["org_structure", "dp_master", "responsibilities"]
  },
  {
    id: "training",
    title: "Treinamentos",
    description: "Certificações e competências",
    icon: GraduationCap,
    fields: ["required_certs", "training_plan", "competency_matrix"]
  },
  {
    id: "procedures",
    title: "Procedimentos",
    description: "FMEA, ASOG e contingência",
    icon: FileText,
    fields: ["fmea", "asog", "contingency_plan"]
  },
  {
    id: "operation",
    title: "Operação",
    description: "Watch keeping e protocolos",
    icon: Radio,
    fields: ["watch_keeping", "communication", "protocols"]
  },
  {
    id: "maintenance",
    title: "Manutenção",
    description: "Preventiva, preditiva e corretiva",
    icon: Wrench,
    fields: ["preventive", "predictive", "corrective"]
  },
  {
    id: "testing",
    title: "Testes Anuais",
    description: "DP trials e validação",
    icon: TestTube,
    fields: ["dp_trials", "capability_plots", "validation"]
  }
];

interface PeoDpWizardProps {
  onComplete: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

export const PeoDpWizard: React.FC<PeoDpWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWizardStep = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      toast.success(`Seção "${currentWizardStep.title}" salva!`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(formData);
      toast.success("Plano PEO-DP criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar plano PEO-DP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderStepContent = () => {
    const StepIcon = currentWizardStep.icon;

    switch (currentWizardStep.id) {
    case "basic":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="vessel_name">Nome da Embarcação *</Label>
            <Input
              id="vessel_name"
              placeholder="Ex: PSV Atlantic Explorer"
              value={formData.vessel_name || ""}
              onChange={(e) => updateFormData("vessel_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="vessel_type">Tipo de Embarcação *</Label>
            <select
              id="vessel_type"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.vessel_type || ""}
              onChange={(e) => updateFormData("vessel_type", e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="PSV">PSV - Platform Supply Vessel</option>
              <option value="OSRV">OSRV - Oil Spill Response Vessel</option>
              <option value="AHTS">AHTS - Anchor Handling Tug Supply</option>
              <option value="ROV">ROV Support Vessel</option>
              <option value="DSV">Dive Support Vessel</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dp_class">Classe DP *</Label>
            <select
              id="dp_class"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.dp_class || ""}
              onChange={(e) => updateFormData("dp_class", e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="DP1">DP1</option>
              <option value="DP2">DP2</option>
              <option value="DP3">DP3</option>
            </select>
          </div>
          <div>
            <Label htmlFor="operation_type">Tipo de Operação</Label>
            <Input
              id="operation_type"
              placeholder="Ex: Apoio à plataforma offshore"
              value={formData.operation_type || ""}
              onChange={(e) => updateFormData("operation_type", e.target.value)}
            />
          </div>
        </div>
      );

    case "management":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="org_structure">Estrutura Organizacional</Label>
            <Textarea
              id="org_structure"
              placeholder="Descreva a estrutura organizacional e hierarquia..."
              rows={4}
              value={formData.org_structure || ""}
              onChange={(e) => updateFormData("org_structure", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dp_master">DP Master/Operator</Label>
            <Input
              id="dp_master"
              placeholder="Nome e certificações do DP Master"
              value={formData.dp_master || ""}
              onChange={(e) => updateFormData("dp_master", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="responsibilities">Responsabilidades e Autoridades</Label>
            <Textarea
              id="responsibilities"
              placeholder="Defina responsabilidades de cada função..."
              rows={4}
              value={formData.responsibilities || ""}
              onChange={(e) => updateFormData("responsibilities", e.target.value)}
            />
          </div>
        </div>
      );

    case "training":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="required_certs">Certificações Requeridas</Label>
            <Textarea
              id="required_certs"
              placeholder="Liste todas as certificações necessárias (STCW, DP, etc.)"
              rows={4}
              value={formData.required_certs || ""}
              onChange={(e) => updateFormData("required_certs", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="training_plan">Plano de Treinamento</Label>
            <Textarea
              id="training_plan"
              placeholder="Descreva o plano de treinamento e reciclagem..."
              rows={4}
              value={formData.training_plan || ""}
              onChange={(e) => updateFormData("training_plan", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="competency_matrix">Matriz de Competências</Label>
            <Textarea
              id="competency_matrix"
              placeholder="Defina a matriz de competências por função..."
              rows={4}
              value={formData.competency_matrix || ""}
              onChange={(e) => updateFormData("competency_matrix", e.target.value)}
            />
          </div>
        </div>
      );

    case "procedures":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="fmea">FMEA (Failure Mode Effects Analysis)</Label>
            <Textarea
              id="fmea"
              placeholder="Análise de modos de falha e seus efeitos..."
              rows={4}
              value={formData.fmea || ""}
              onChange={(e) => updateFormData("fmea", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="asog">ASOG (Activity Specific Operating Guidelines)</Label>
            <Textarea
              id="asog"
              placeholder="Diretrizes operacionais específicas da atividade..."
              rows={4}
              value={formData.asog || ""}
              onChange={(e) => updateFormData("asog", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contingency_plan">Plano de Contingência</Label>
            <Textarea
              id="contingency_plan"
              placeholder="Procedimentos de emergência e contingência..."
              rows={4}
              value={formData.contingency_plan || ""}
              onChange={(e) => updateFormData("contingency_plan", e.target.value)}
            />
          </div>
        </div>
      );

    case "operation":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="watch_keeping">Sistema de Watch Keeping</Label>
            <Textarea
              id="watch_keeping"
              placeholder="Descreva o sistema de turnos e watch keeping..."
              rows={4}
              value={formData.watch_keeping || ""}
              onChange={(e) => updateFormData("watch_keeping", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="communication">Protocolos de Comunicação</Label>
            <Textarea
              id="communication"
              placeholder="Procedimentos de comunicação interna e externa..."
              rows={4}
              value={formData.communication || ""}
              onChange={(e) => updateFormData("communication", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="protocols">Protocolos Operacionais</Label>
            <Textarea
              id="protocols"
              placeholder="Protocolos de operação DP..."
              rows={4}
              value={formData.protocols || ""}
              onChange={(e) => updateFormData("protocols", e.target.value)}
            />
          </div>
        </div>
      );

    case "maintenance":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="preventive">Manutenção Preventiva</Label>
            <Textarea
              id="preventive"
              placeholder="Programa de manutenção preventiva..."
              rows={4}
              value={formData.preventive || ""}
              onChange={(e) => updateFormData("preventive", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="predictive">Manutenção Preditiva</Label>
            <Textarea
              id="predictive"
              placeholder="Estratégias de manutenção preditiva..."
              rows={4}
              value={formData.predictive || ""}
              onChange={(e) => updateFormData("predictive", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="corrective">Manutenção Corretiva</Label>
            <Textarea
              id="corrective"
              placeholder="Procedimentos de manutenção corretiva..."
              rows={4}
              value={formData.corrective || ""}
              onChange={(e) => updateFormData("corrective", e.target.value)}
            />
          </div>
        </div>
      );

    case "testing":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="dp_trials">DP Trials Anuais</Label>
            <Textarea
              id="dp_trials"
              placeholder="Programação e procedimentos dos DP trials..."
              rows={4}
              value={formData.dp_trials || ""}
              onChange={(e) => updateFormData("dp_trials", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="capability_plots">Capability Plots</Label>
            <Textarea
              id="capability_plots"
              placeholder="Análise e atualização dos capability plots..."
              rows={4}
              value={formData.capability_plots || ""}
              onChange={(e) => updateFormData("capability_plots", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="validation">Validação e Certificação</Label>
            <Textarea
              id="validation"
              placeholder="Processo de validação e certificação do sistema DP..."
              rows={4}
              value={formData.validation || ""}
              onChange={(e) => updateFormData("validation", e.target.value)}
            />
          </div>
        </div>
      );

    default:
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">Assistente de Criação PEO-DP</CardTitle>
          <CardDescription>
            Wizard passo-a-passo para criar planos de operação com Dynamic Positioning
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                Etapa {currentStep + 1} de {WIZARD_STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {WIZARD_STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    idx <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      idx < currentStep
                        ? "bg-primary text-primary-foreground"
                        : idx === currentStep
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted"
                    }`}
                  >
                    {idx < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs hidden md:block text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <currentWizardStep.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{currentWizardStep.title}</CardTitle>
              <CardDescription>{currentWizardStep.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Concluir
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
