/**
 * PEODP Wizard Complete - PATCH 881
 * Type-safe - using tables that exist in the schema
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  ChevronLeft,
  Users,
  GraduationCap,
  FileText,
  Radio,
  Wrench,
  TestTube,
  Ship,
  Save,
  Download,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

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

interface ValidationResult {
  field: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

interface InferenceResults {
  risk_level: string;
  compliance_score: number;
  recommendations: string[];
  critical_findings: string[];
}

interface FormData {
  vessel_name: string;
  vessel_type: string;
  dp_class: string;
  operation_type: string;
  org_structure: string;
  dp_master: string;
  responsibilities: string;
  required_certs: string;
  training_plan: string;
  competency_matrix: string;
  fmea: string;
  asog: string;
  contingency_plan: string;
  watch_keeping: string;
  communication: string;
  protocols: string;
  preventive: string;
  predictive: string;
  corrective: string;
  dp_trials: string;
  capability_plots: string;
  validation: string;
  redundancy_analysis?: string;
}

export default function PeoDpWizardComplete() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    vessel_name: "",
    vessel_type: "",
    dp_class: "DP2",
    operation_type: "",
    org_structure: "",
    dp_master: "",
    responsibilities: "",
    required_certs: "",
    training_plan: "",
    competency_matrix: "",
    fmea: "",
    asog: "",
    contingency_plan: "",
    watch_keeping: "",
    communication: "",
    protocols: "",
    preventive: "",
    predictive: "",
    corrective: "",
    dp_trials: "",
    capability_plots: "",
    validation: ""
  });
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [inferenceResults, setInferenceResults] = useState<InferenceResults | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Run initial inference
    runInference(formData);
  }, []);

  const runInference = (data: FormData) => {
    try {
      const results: InferenceResults = {
        risk_level: calculateRiskLevel(data),
        compliance_score: calculateComplianceScore(data),
        recommendations: generateRecommendations(data),
        critical_findings: identifyCriticalFindings(data)
      };

      setInferenceResults(results);
      performCrossValidation(data);
    } catch (error) {
      logger.error("Error running PEO-DP inference", { error });
    }
  };

  const calculateRiskLevel = (data: FormData): string => {
    let riskScore = 0;

    if (data.dp_class === "DP3") riskScore -= 2;
    else if (data.dp_class === "DP2") riskScore += 0;
    else riskScore += 3;

    if (!data.training_plan || data.training_plan.length < 100) riskScore += 2;
    if (!data.fmea || data.fmea.length < 100) riskScore += 3;
    if (!data.preventive || data.preventive.length < 50) riskScore += 2;

    if (riskScore <= 2) return "LOW";
    if (riskScore <= 5) return "MEDIUM";
    if (riskScore <= 8) return "HIGH";
    return "CRITICAL";
  };

  const calculateComplianceScore = (data: FormData): number => {
    let score = 100;
    const requiredFields: (keyof FormData)[] = ["vessel_name", "dp_class", "dp_master", "fmea", "asog", "training_plan"];
    
    requiredFields.forEach(field => {
      if (!data[field] || data[field].length < 10) {
        score -= 15;
      }
    });

    if (data.fmea && data.fmea.length > 500) score += 5;
    if (data.training_plan && data.training_plan.length > 500) score += 5;
    if (data.contingency_plan && data.contingency_plan.length > 300) score += 5;

    return Math.max(0, Math.min(100, score));
  };

  const generateRecommendations = (data: FormData): string[] => {
    const recommendations: string[] = [];

    if (!data.fmea || data.fmea.length < 200) {
      recommendations.push("Desenvolver FMEA detalhada com análise de modos de falha críticos");
    }
    if (!data.training_plan || data.training_plan.length < 200) {
      recommendations.push("Criar plano de treinamento abrangente para toda a tripulação DP");
    }
    if (!data.contingency_plan || data.contingency_plan.length < 150) {
      recommendations.push("Elaborar plano de contingência para perda de posição");
    }
    if (data.dp_class === "DP1") {
      recommendations.push("Considerar upgrade para DP2 para maior redundância e segurança");
    }
    if (!data.dp_trials || data.dp_trials.length < 100) {
      recommendations.push("Documentar procedimentos de DP trials e capability plots");
    }

    return recommendations;
  };

  const identifyCriticalFindings = (data: FormData): string[] => {
    const findings: string[] = [];

    if (!data.dp_master) {
      findings.push("CRÍTICO: DP Master não identificado");
    }
    if (!data.fmea) {
      findings.push("CRÍTICO: FMEA não disponível - requisito obrigatório IMCA M 117");
    }
    if (!data.asog) {
      findings.push("CRÍTICO: ASOG não disponível - requisito obrigatório IMCA M 117");
    }
    if (data.dp_class === "DP3" && !data.redundancy_analysis) {
      findings.push("CRÍTICO: Análise de redundância necessária para DP3");
    }

    return findings;
  };

  const performCrossValidation = (data: FormData) => {
    const validations: ValidationResult[] = [];

    if (data.fmea && data.fmea.length > 500) {
      validations.push({
        field: "fmea",
        status: "pass",
        message: "FMEA documentada adequadamente"
      });
    } else {
      validations.push({
        field: "fmea",
        status: "fail",
        message: "FMEA insuficiente ou não documentada"
      });
    }

    if (data.training_plan && data.training_plan.length > 200) {
      validations.push({
        field: "training_plan",
        status: "pass",
        message: "Plano de treinamento documentado"
      });
    } else {
      validations.push({
        field: "training_plan",
        status: "warning",
        message: "Plano de treinamento precisa de mais detalhes"
      });
    }

    setValidationResults(validations);
  };

  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(18);
      doc.text("Relatório de Auditoria PEO-DP", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, yPos);
      yPos += 15;

      doc.setFontSize(14);
      doc.text("1. Informações Básicas", 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Embarcação: ${formData.vessel_name || "N/A"}`, 25, yPos);
      yPos += 6;
      doc.text(`Classe DP: ${formData.dp_class || "N/A"}`, 25, yPos);
      yPos += 6;
      doc.text(`Tipo de Operação: ${formData.operation_type || "N/A"}`, 25, yPos);
      yPos += 10;

      if (inferenceResults) {
        doc.setFontSize(14);
        doc.text("2. Análise de Conformidade", 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.text(`Nível de Risco: ${inferenceResults.risk_level}`, 25, yPos);
        yPos += 6;
        doc.text(`Score de Conformidade: ${inferenceResults.compliance_score}%`, 25, yPos);
        yPos += 10;

        if (inferenceResults.recommendations.length > 0) {
          doc.setFontSize(14);
          doc.text("3. Recomendações", 20, yPos);
          yPos += 8;
          doc.setFontSize(10);
          inferenceResults.recommendations.forEach((rec, index) => {
            const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
            lines.forEach((line: string) => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(line, 25, yPos);
              yPos += 6;
            });
          });
        }

        if (inferenceResults.critical_findings.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(14);
          doc.text("4. Achados Críticos", 20, yPos);
          yPos += 8;
          doc.setFontSize(10);
          doc.setTextColor(255, 0, 0);
          inferenceResults.critical_findings.forEach((finding) => {
            const lines = doc.splitTextToSize(`⚠ ${finding}`, 170);
            lines.forEach((line: string) => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(line, 25, yPos);
              yPos += 6;
            });
          });
          doc.setTextColor(0, 0, 0);
        }
      }

      doc.save(`peodp-audit-${Date.now()}.pdf`);
      
      toast({
        title: "PDF Exportado",
        description: "Relatório de auditoria PEO-DP salvo com sucesso"
      });
    } catch (error) {
      logger.error("Error exporting PDF", { error });
      toast({
        title: "Erro",
        description: "Não foi possível exportar o PDF",
        variant: "destructive"
      });
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    runInference(newData);
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save to action_items as a workaround for missing peodp_audits table
      const { error } = await supabase
        .from("action_items")
        .insert({
          title: `PEO-DP Audit: ${formData.vessel_name}`,
          description: JSON.stringify({
            type: "peodp_audit",
            formData,
            risk_level: inferenceResults?.risk_level,
            compliance_score: inferenceResults?.compliance_score,
            recommendations: inferenceResults?.recommendations,
            critical_findings: inferenceResults?.critical_findings,
            validation_results: validationResults,
          }),
          source_module: "peo-dp-wizard",
          priority: inferenceResults?.risk_level === "CRITICAL" ? "critical" : 
                   inferenceResults?.risk_level === "HIGH" ? "high" : "medium",
          status: "pending",
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Auditoria Salva",
        description: "Auditoria PEO-DP registrada com sucesso!"
      });
    } catch (error) {
      logger.error("Error saving PEO-DP audit", { error });
      toast({
        title: "Erro",
        description: "Não foi possível salvar a auditoria",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <step.icon className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {step.fields.map((field) => (
            <div key={field}>
              <Label htmlFor={field} className="capitalize">
                {field.replace(/_/g, " ")}
              </Label>
              {field === "dp_class" ? (
                <Select 
                  value={formData[field as keyof FormData]} 
                  onValueChange={(value) => handleFieldChange(field as keyof FormData, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classe DP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DP1">DP1</SelectItem>
                    <SelectItem value="DP2">DP2</SelectItem>
                    <SelectItem value="DP3">DP3</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Textarea
                  id={field}
                  value={formData[field as keyof FormData] || ""}
                  onChange={(e) => handleFieldChange(field as keyof FormData, e.target.value)}
                  placeholder={`Digite ${field.replace(/_/g, " ")}...`}
                  rows={3}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PEO-DP Wizard Completo</h1>
          <p className="text-muted-foreground">
            Sistema de auditoria com IA e inferência
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Wizard */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Etapa {currentStep + 1} de {WIZARD_STEPS.length}</CardTitle>
                <Badge variant="outline">{Math.round(progress)}% completo</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
              {renderStepContent()}

              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                {currentStep === WIZARD_STEPS.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Salvando..." : "Finalizar Auditoria"}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Inference */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avaliação de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              {inferenceResults ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Nível de Risco:</span>
                    <Badge variant={
                      inferenceResults.risk_level === "LOW" ? "default" :
                      inferenceResults.risk_level === "MEDIUM" ? "secondary" : "destructive"
                    }>
                      {inferenceResults.risk_level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conformidade:</span>
                    <span className="font-bold">{inferenceResults.compliance_score}%</span>
                  </div>
                  <Progress value={inferenceResults.compliance_score} className="h-2" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Calculando...</p>
              )}
            </CardContent>
          </Card>

          {inferenceResults?.critical_findings && inferenceResults.critical_findings.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Achados Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <ul className="space-y-2">
                    {inferenceResults.critical_findings.map((finding, idx) => (
                      <li key={idx} className="text-sm text-destructive">
                        • {finding}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {inferenceResults?.recommendations && inferenceResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <ul className="space-y-2">
                    {inferenceResults.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {validationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResults.map((result, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge variant={
                        result.status === "pass" ? "default" :
                        result.status === "warning" ? "secondary" : "destructive"
                      }>
                        {result.status === "pass" ? "✓" : result.status === "warning" ? "⚠" : "✗"}
                      </Badge>
                      <span className="text-sm truncate">{result.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
