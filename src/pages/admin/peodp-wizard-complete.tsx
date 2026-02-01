/**
 * PEO-DP Complete Wizard
 * Dynamic positioning audit wizard with inference and validation
 */
import React, { useState, useEffect, useCallback } from "react";
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
import type { Database } from "@/integrations/supabase/types";

type DpIncidentRow = Database["public"]["Tables"]["dp_incidents"]["Row"];
type SgsoAuditRow = Database["public"]["Tables"]["sgso_audits"]["Row"];

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
}

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

interface HistoricalData {
  incidents: DpIncidentRow[];
  audits: SgsoAuditRow[];
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
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [inferenceResults, setInferenceResults] = useState<InferenceResults | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateRiskLevel = useCallback((data: FormData, incidents: DpIncidentRow[]): string => {
    let riskScore = 0;

    if (data.dp_class === "DP3") riskScore -= 2;
    else if (data.dp_class === "DP2") riskScore += 0;
    else riskScore += 3;

    if (!data.training_plan || data.training_plan.length < 100) riskScore += 2;
    if (!data.fmea || data.fmea.length < 100) riskScore += 3;
    if (!data.preventive || data.preventive.length < 50) riskScore += 2;

    if (incidents && incidents.length > 10) {
      riskScore += Math.min(incidents.length / 10, 5);
    }

    if (riskScore <= 2) return "LOW";
    if (riskScore <= 5) return "MEDIUM";
    if (riskScore <= 8) return "HIGH";
    return "CRITICAL";
  }, []);

  const calculateComplianceScore = useCallback((data: FormData): number => {
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
  }, []);

  const generateRecommendations = useCallback((data: FormData, incidents: DpIncidentRow[]): string[] => {
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

    if (incidents && incidents.length > 5) {
      recommendations.push("Revisar análise de incidentes recorrentes e implementar ações preventivas");
    }

    return recommendations;
  }, []);

  const identifyCriticalFindings = useCallback((data: FormData): string[] => {
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

    return findings;
  }, []);

  const performCrossValidation = useCallback((data: FormData, historical: HistoricalData | null) => {
    const validations: ValidationResult[] = [];

    if (historical?.audits) {
      const recentAudits = historical.audits.filter((a) => {
        const auditDate = new Date(a.audit_date || a.created_at || "");
        return auditDate > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      });
      
      if (recentAudits.length < 2) {
        validations.push({
          field: "training_plan",
          status: "warning",
          message: "Poucas auditorias registradas nos últimos 12 meses"
        });
      } else {
        validations.push({
          field: "training_plan",
          status: "pass",
          message: `${recentAudits.length} auditorias registradas nos últimos 12 meses`
        });
      }
    }

    if (historical?.incidents) {
      const criticalIncidents = historical.incidents.filter((i) => 
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
  }, []);

  const runInference = useCallback((data: FormData, historical: HistoricalData | null) => {
    const incidents = historical?.incidents || [];
    
    const results: InferenceResults = {
      risk_level: calculateRiskLevel(data, incidents),
      compliance_score: calculateComplianceScore(data),
      recommendations: generateRecommendations(data, incidents),
      critical_findings: identifyCriticalFindings(data)
    };

    setInferenceResults(results);
    performCrossValidation(data, historical);
  }, [calculateRiskLevel, calculateComplianceScore, generateRecommendations, identifyCriticalFindings, performCrossValidation]);

  const loadHistoricalData = useCallback(async () => {
    try {
      const [incidentsData, auditsData] = await Promise.all([
        supabase.from("dp_incidents").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("sgso_audits").select("*").order("audit_date", { ascending: false }).limit(50)
      ]);

      const historical: HistoricalData = {
        incidents: incidentsData.data || [],
        audits: auditsData.data || []
      };

      setHistoricalData(historical);
      runInference(formData, historical);
    } catch (error) {
      logger.error("Error loading PEO-DP historical data", { error });
    }
  }, [formData, runInference]);

  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData]);

  const exportToPDF = async () => {
    try {
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      const autoTable = autoTableModule.default;
      
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
      }

      if (validationResults.length > 0) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.text("4. Resultados de Validação", 20, yPos);
        yPos += 8;
        
        const tableData = validationResults.map(result => [
          result.status === "pass" ? "✓" : result.status === "warning" ? "⚠" : "✗",
          result.field,
          result.message
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [["Status", "Campo", "Mensagem"]],
          body: tableData,
          theme: "grid"
        });
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
        description: "Falha ao exportar PDF",
        variant: "destructive"
      });
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    if (historicalData) {
      runInference(newData, historicalData);
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
        .from("sgso_audits")
        .insert({
          audit_date: new Date().toISOString().split("T")[0],
          auditor_id: user?.id,
          status: "completed",
          audit_type: "peodp",
          findings: JSON.stringify({
            vessel_name: formData.vessel_name,
            dp_class: formData.dp_class,
            risk_level: inferenceResults?.risk_level,
            compliance_score: inferenceResults?.compliance_score,
          }),
        });

      if (error) throw error;

      toast({
        title: "Auditoria Salva",
        description: "Auditoria PEO-DP registrada com sucesso"
      });
    } catch (error) {
      logger.error("Error submitting audit", { error });
      toast({
        title: "Erro",
        description: "Falha ao salvar auditoria",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = WIZARD_STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  const renderField = (field: string) => {
    const fieldKey = field as keyof FormData;
    
    if (field === "dp_class") {
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>Classe DP</Label>
          <Select value={formData[fieldKey]} onValueChange={(value) => handleFieldChange(fieldKey, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a classe DP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DP1">DP1</SelectItem>
              <SelectItem value="DP2">DP2</SelectItem>
              <SelectItem value="DP3">DP3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }
    
    if (field.includes("plan") || field.includes("structure") || field.includes("matrix") || 
        field === "fmea" || field === "asog" || field === "responsibilities") {
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>{field.replace(/_/g, " ").toUpperCase()}</Label>
          <Textarea
            id={field}
            value={formData[fieldKey]}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={`Digite ${field.replace(/_/g, " ")}...`}
            rows={4}
          />
        </div>
      );
    }
    
    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field}>{field.replace(/_/g, " ").toUpperCase()}</Label>
        <Input
          id={field}
          value={formData[fieldKey]}
          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
          placeholder={`Digite ${field.replace(/_/g, " ")}...`}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ship className="h-8 w-8" />
            PEO-DP Wizard Completo
          </h1>
          <p className="text-muted-foreground">
            Assistente de auditoria de Posicionamento Dinâmico
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Passo {currentStep + 1} de {WIZARD_STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / WIZARD_STEPS.length) * 100)}% completo</span>
        </div>
        <Progress value={((currentStep + 1) / WIZARD_STEPS.length) * 100} />
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 flex-wrap">
        {WIZARD_STEPS.map((step, index) => (
          <Button
            key={step.id}
            variant={index === currentStep ? "default" : index < currentStep ? "secondary" : "outline"}
            size="sm"
            onClick={() => setCurrentStep(index)}
            className="flex items-center gap-1"
          >
            {index < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
            <span className="hidden sm:inline">{step.title}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStepData.fields.map(renderField)}
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                {currentStep < WIZARD_STEPS.length - 1 ? (
                  <Button onClick={handleNext}>
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Salvando..." : "Salvar Auditoria"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inference Panel */}
        <div className="space-y-4">
          {inferenceResults && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Análise em Tempo Real</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Nível de Risco:</span>
                    <Badge variant={
                      inferenceResults.risk_level === "LOW" ? "default" :
                      inferenceResults.risk_level === "MEDIUM" ? "secondary" :
                      "destructive"
                    }>
                      {inferenceResults.risk_level}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conformidade</span>
                      <span>{inferenceResults.compliance_score}%</span>
                    </div>
                    <Progress value={inferenceResults.compliance_score} />
                  </div>
                </CardContent>
              </Card>

              {inferenceResults.critical_findings.length > 0 && (
                <Card className="border-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Achados Críticos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {inferenceResults.critical_findings.map((finding, idx) => (
                        <li key={idx} className="text-sm text-red-600">{finding}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {inferenceResults.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <ul className="space-y-2">
                        {inferenceResults.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {validationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Validação</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <ul className="space-y-2">
                    {validationResults.map((result, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {result.status === "pass" ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : result.status === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        )}
                        <span className={
                          result.status === "pass" ? "text-green-600" :
                          result.status === "warning" ? "text-yellow-600" :
                          "text-red-600"
                        }>
                          {result.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
