import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Download,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  return { jsPDF, autoTable: autoTableModule.default };
});

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

export default function PeoDpWizardComplete() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({
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
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [inferenceResults, setInferenceResults] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    try {
      // Load historical DP incidents, training records, and audits for inference
      const [incidentsData, trainingData, auditsData] = await Promise.all([
        supabase.from("dp_incidents").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("crew_training_records").select("*").order("training_date", { ascending: false }).limit(100),
        supabase.from("sgso_audits").select("*").order("audit_date", { ascending: false }).limit(50)
      ]);

      setHistoricalData({
        incidents: incidentsData.data || [],
        training: trainingData.data || [],
        audits: auditsData.data || []
      });

      // Run initial inference
      runInference(formData);
    } catch (error) {
      logger.error("Error loading PEO-DP historical data", { error });
    }
  };

  const runInference = async (data: unknown) => {
    try {
      // Inference rules based on historical data
      const results = {
        risk_level: calculateRiskLevel(data),
        compliance_score: calculateComplianceScore(data),
        recommendations: generateRecommendations(data),
        critical_findings: identifyCriticalFindings(data)
      };

      setInferenceResults(results);
      performCrossValidation(data, results);
    } catch (error) {
      logger.error("Error running PEO-DP inference", { error });
    }
  };

  const calculateRiskLevel = (data: unknown): string => {
    let riskScore = 0;

    // Check DP class requirements
    if (data.dp_class === "DP3") riskScore -= 2;
    else if (data.dp_class === "DP2") riskScore += 0;
    else riskScore += 3;

    // Check training completeness
    if (!data.training_plan || data.training_plan.length < 100) riskScore += 2;
    
    // Check FMEA availability
    if (!data.fmea || data.fmea.length < 100) riskScore += 3;
    
    // Check maintenance plan
    if (!data.preventive || data.preventive.length < 50) riskScore += 2;

    // Check historical incidents
    if (historicalData?.incidents && historicalData.incidents.length > 10) {
      riskScore += Math.min(historicalData.incidents.length / 10, 5);
    }

    if (riskScore <= 2) return "LOW";
    if (riskScore <= 5) return "MEDIUM";
    if (riskScore <= 8) return "HIGH";
    return "CRITICAL";
  };

  const calculateComplianceScore = (data: unknown): number => {
    let score = 100;
    const requiredFields = ["vessel_name", "dp_class", "dp_master", "fmea", "asog", "training_plan"];
    
    requiredFields.forEach(field => {
      if (!data[field] || data[field].length < 10) {
        score -= 15;
      }
    });

    // Bonus for comprehensive documentation
    if (data.fmea && data.fmea.length > 500) score += 5;
    if (data.training_plan && data.training_plan.length > 500) score += 5;
    if (data.contingency_plan && data.contingency_plan.length > 300) score += 5;

    return Math.max(0, Math.min(100, score));
  });

  const generateRecommendations = (data: unknown): string[] => {
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

    // Check historical data patterns
    if (historicalData?.incidents && historicalData.incidents.length > 5) {
      recommendations.push("Revisar análise de incidentes recorrentes e implementar ações preventivas");
    }

    return recommendations;
  };

  const identifyCriticalFindings = (data: unknown): string[] => {
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
  });

  const performCrossValidation = (data: unknown, inference: unknown: unknown: unknown) => {
    const validations: ValidationResult[] = [];

    // Validate against historical training records
    if (historicalData?.training) {
      const recentTraining = historicalData.training.filter((t: unknown) => 
        new Date(t.training_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      );
      
      if (recentTraining.length < 5) {
        validations.push({
          field: "training_plan",
          status: "warning",
          message: "Histórico de treinamento limitado nos últimos 12 meses"
        });
      } else {
        validations.push({
          field: "training_plan",
          status: "pass",
          message: `${recentTraining.length} treinamentos registrados nos últimos 12 meses`
        });
      }
    }

    // Validate against incident history
    if (historicalData?.incidents) {
      const criticalIncidents = historicalData.incidents.filter((i: unknown) => 
        i.severity === "critical" || i.severity === "high"
      );
      
      if (criticalIncidents.length > 3) {
        validations.push({
          field: "operation",
          status: "fail",
          message: `${criticalIncidents.length} incidentes críticos identificados - revisão operacional necessária`
        });
      } else if (criticalIncidents.length > 0) {
        validations.push({
          field: "operation",
          status: "warning",
          message: `${criticalIncidents.length} incidentes críticos registrados`
        });
      }
    }

    // Validate FMEA completeness
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

    setValidationResults(validations);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.text("Relatório de Auditoria PEO-DP", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, yPos);
    yPos += 15;

    // Basic Information
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

    // Inference Results
    if (inferenceResults) {
      doc.setFontSize(14);
      doc.text("2. Análise de Conformidade", 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Nível de Risco: ${inferenceResults.risk_level}`, 25, yPos);
      yPos += 6;
      doc.text(`Score de Conformidade: ${inferenceResults.compliance_score}%`, 25, yPos);
      yPos += 10;

      // Recommendations
      if (inferenceResults.recommendations && inferenceResults.recommendations.length > 0) {
        doc.setFontSize(14);
        doc.text("3. Recomendações", 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        inferenceResults.recommendations.forEach((rec: string, index: number) => {
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
        yPos += 5;
      }

      // Critical Findings
      if (inferenceResults.critical_findings && inferenceResults.critical_findings.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.text("4. Achados Críticos", 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        inferenceResults.critical_findings.forEach((finding: string, index: number) => {
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

    // Validation Results
    if (validationResults.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("5. Resultados de Validação", 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      validationResults.forEach((result: ValidationResult) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const statusIcon = result.status === "pass" ? "✓" : result.status === "warning" ? "⚠" : "✗";
        doc.text(`${statusIcon} ${result.field}: ${result.message}`, 25, yPos);
        yPos += 6;
  });
    }

    doc.save(`peodp-audit-${Date.now()}.pdf`);
    
    toast({
      title: "PDF Exportado",
      description: "Relatório de auditoria PEO-DP salvo com sucesso"
    });
  });

  const handleFieldChange = (field: string, value: unknown: unknown: unknown) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Re-run inference on data change
    if (historicalData) {
      runInference(newData);
    }
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
      
      const { error } = await supabase
        .from("peodp_audits")
        .insert({
          ...formData,
          risk_level: inferenceResults?.risk_level,
          compliance_score: inferenceResults?.compliance_score,
          recommendations: inferenceResults?.recommendations,
          critical_findings: inferenceResults?.critical_findings,
          validation_results: validationResults,
          created_by: user?.id,
          audit_date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Auditoria Salva",
        description: "Auditoria PEO-DP registrada com sucesso"
      });

      // Auto-export PDF
      await exportToPDF();
    } catch (error) {
      logger.error("Error submitting PEO-DP audit", { error, vesselName: formData.vessel_name });
      toast({
        title: "Erro",
        description: "Falha ao salvar auditoria",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWizardStep = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const StepIcon = currentWizardStep.icon;

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "pass": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "fail": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wizard PEO-DP Completo</h1>
          <p className="text-muted-foreground mt-1">
            Sistema integrado de auditoria com inferência e validação
          </p>
        </div>
        <Badge variant={inferenceResults?.risk_level === "LOW" ? "default" : 
          inferenceResults?.risk_level === "MEDIUM" ? "secondary" :
            inferenceResults?.risk_level === "HIGH" ? "destructive" : "destructive"}>
          {inferenceResults?.risk_level || "CALCULANDO..."}
        </Badge>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Etapa {currentStep + 1} de {WIZARD_STEPS.length}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Inference Results */}
      {inferenceResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Análise em Tempo Real
              <Badge>{inferenceResults.compliance_score}% Conformidade</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inferenceResults.critical_findings && inferenceResults.critical_findings.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg space-y-2">
                <h3 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Achados Críticos
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {inferenceResults.critical_findings.map((finding: string, index: number) => (
                    <li key={index} className="text-sm text-red-600 dark:text-red-400">{finding}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {inferenceResults.recommendations && inferenceResults.recommendations.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">Recomendações</h3>
                <ul className="list-disc list-inside space-y-1">
                  {inferenceResults.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-blue-600 dark:text-blue-400">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <StepIcon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{currentWizardStep.title}</CardTitle>
              <CardDescription>{currentWizardStep.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {currentWizardStep.fields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {field.includes("description") || field.includes("plan") || field.includes("structure") || 
                   field.includes("matrix") || field.includes("fmea") || field.includes("asog") ? (
                      <Textarea
                        id={field}
                        value={formData[field] || ""}
                        onChange={handleChange}
                        placeholder={`Digite ${field.replace(/_/g, " ")}`}
                        rows={4}
                      />
                    ) : field.includes("dp_class") ? (
                      <Select value={formData[field] || ""} onValueChange={(value) => handleFieldChange(field, value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DP1">DP1</SelectItem>
                          <SelectItem value="DP2">DP2</SelectItem>
                          <SelectItem value="DP3">DP3</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field}
                        value={formData[field] || ""}
                        onChange={handleChange}
                        placeholder={`Digite ${field.replace(/_/g, " ")}`}
                      />
                    )}
                  
                  {/* Show validation for current field */}
                  {validationResults.find(v => v.field === field) && (
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(validationResults.find(v => v.field === field)!.status)}
                      <span className={
                        validationResults.find(v => v.field === field)!.status === "pass" ? "text-green-600" :
                        validationResults.find(v => v.field === field)!.status === "warning" ? "text-yellow-600" :
                          "text-red-600"
                      }>
                        {validationResults.find(v => v.field === field)!.message}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
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
      </div>
    </div>
  );
}
