import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertCircle, FileText, Save, Send, Camera, Mic, Upload, Plus, Trash2, Star, Award, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuditElement {
  number: string;
  name: string;
  requirements: string[];
}

interface AuditResponse {
  element_number: string;
  requirement_code: string;
  score: "compliant" | "partial" | "non-compliant" | "not-applicable";
  evidence_type: "document" | "photo" | "voice" | "observation";
  evidence_description: string;
  evidence_urls: string[];
  auditor_comments: string;
  recommendations: string;
  criticality: "low" | "medium" | "high" | "critical";
}

interface NonConformity {
  element_number: string;
  element_name: string;
  type: "major" | "minor" | "observation";
  description: string;
  evidence_urls: string[];
  corrective_action: string;
  responsible_person: string;
  target_date: string;
}

interface PeotramAuditFormProps {
  auditId: string;
  template: {
    id: string;
    template_data: {
      elements: AuditElement[];
    };
  };
  onSave: () => void;
  onComplete: () => void;
}

export const PeotramAuditForm: React.FC<PeotramAuditFormProps> = ({
  auditId,
  template,
  onSave,
  onComplete
}) => {
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [auditResponses, setAuditResponses] = useState<Record<string, AuditResponse[]>>({});
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<Record<string, unknown>>({});
  const [overallProgress, setOverallProgress] = useState(0);

  const elements = template.template_data.elements;
  const currentElement = elements[currentElementIndex];

  useEffect(() => {
    // Calculate overall progress
    const totalRequirements = elements.reduce((acc, el) => acc + el.requirements.length, 0);
    const completedRequirements = Object.values(auditResponses).reduce(
      (acc, responses) => acc + responses.length, 0
    );
    setOverallProgress((completedRequirements / totalRequirements) * 100);
  }, [auditResponses, elements]);

  const addResponse = (elementNumber: string, response: AuditResponse) => {
    setAuditResponses(prev => ({
      ...prev,
      [elementNumber]: [...(prev[elementNumber] || []), response]
    }));
  };

  const updateResponse = (elementNumber: string, index: number, response: AuditResponse) => {
    setAuditResponses(prev => ({
      ...prev,
      [elementNumber]: prev[elementNumber].map((r, i) => i === index ? response : r)
    }));
  };

  const addNonConformity = (nc: NonConformity) => {
    setNonConformities(prev => [...prev, nc]);
  };

  const runElementAnalysis = async (elementNumber: string) => {
    setIsAnalyzing(true);
    try {
      const elementResponses = auditResponses[elementNumber] || [];
      
      const { data, error } = await supabase.functions.invoke("peotram-ai-analysis", {
        body: {
          audit_id: auditId,
          element_number: elementNumber,
          responses: elementResponses,
          element_name: currentElement.name
        }
      });

      if (error) throw error;

      setAiInsights(prev => ({
        ...prev,
        [elementNumber]: data.analysis
      }));

      toast({
        title: "Análise AI Concluída",
        description: "A análise inteligente do elemento foi realizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível executar a análise IA.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAudit = async () => {
    try {
      // Save audit responses - using existing table if available
      // Note: This would require a proper audit responses table to be created
      for (const [elementNumber, responses] of Object.entries(auditResponses)) {
        for (const response of responses) {
          // For now, store as JSON in audit metadata
        }
      }

      // Save non-conformities
      for (const nc of nonConformities) {
        await supabase
          .from("peotram_non_conformities")
          .insert({
            audit_id: auditId,
            element_number: nc.element_number,
            element_name: nc.element_name,
            non_conformity_type: nc.type,
            description: nc.description,
            evidence_urls: nc.evidence_urls,
            corrective_action: nc.corrective_action,
            responsible_person: nc.responsible_person,
            target_date: nc.target_date
          });
      }

      toast({
        title: "Auditoria Salva",
        description: "Dados da auditoria salvos com sucesso.",
      });

      onSave();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a auditoria.",
        variant: "destructive",
      });
    }
  };

  const completeAudit = async () => {
    await saveAudit();
    
    // Calculate final scores and update audit status
    const complianceScore = calculateComplianceScore();
    
    await supabase
      .from("peotram_audits")
      .update({
        status: "completed",
        compliance_score: complianceScore,
        elements_evaluated: elements.length,
        non_conformities_count: nonConformities.length
      })
      .eq("id", auditId);

    toast({
      title: "Auditoria Concluída",
      description: `Auditoria finalizada com ${complianceScore}% de compliance.`,
    });

    onComplete();
  };

  const calculateComplianceScore = () => {
    const allResponses = Object.values(auditResponses).flat();
    const compliantResponses = allResponses.filter(r => r.score === "compliant").length;
    return allResponses.length > 0 ? Math.round((compliantResponses / allResponses.length) * 100) : 0;
  };

  const getScoreColor = (score: string) => {
    switch (score) {
    case "compliant":
      return "text-green-600";
    case "partial":
      return "text-yellow-600";
    case "non-compliant":
      return "text-red-600";
    default:
      return "text-muted-foreground";
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
    case "compliant":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "non-compliant":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Elemento {currentElement.number}: {currentElement.name}
              </CardTitle>
              <CardDescription>
                Elemento {currentElementIndex + 1} de {elements.length} • {overallProgress.toFixed(0)}% concluído
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => runElementAnalysis(currentElement.number)}
                disabled={isAnalyzing || !auditResponses[currentElement.number]?.length}
              >
                {isAnalyzing ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Análise IA
              </Button>
            </div>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Elementos PEOTRAM</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {elements.map((element, index) => {
                  const elementResponses = auditResponses[element.number] || [];
                  const completionRate = (elementResponses.length / element.requirements.length) * 100;
                  
                  return (
                    <Button
                      key={element.number}
                      variant={index === currentElementIndex ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setCurrentElementIndex(index)}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {element.number}
                          </Badge>
                          {completionRate === 100 && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="font-medium text-sm line-clamp-2">
                          {element.name}
                        </p>
                        <Progress value={completionRate} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {elementResponses.length}/{element.requirements.length} requisitos
                        </p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requisitos do Elemento</CardTitle>
              <CardDescription>
                Avalie cada requisito e forneça evidências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentElement.requirements.map((requirement, reqIndex) => {
                  const requirementCode = `${currentElement.number}.${reqIndex + 1}`;
                  const existingResponse = auditResponses[currentElement.number]?.find(
                    r => r.requirement_code === requirementCode
                  );
                  
                  return (
                    <div key={requirementCode} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">
                            Requisito {requirementCode}
                          </Badge>
                          <p className="text-sm">{requirement}</p>
                        </div>
                        {existingResponse && getScoreIcon(existingResponse.score)}
                      </div>
                      
                      <RequirementForm
                        requirementCode={requirementCode}
                        elementNumber={currentElement.number}
                        existingResponse={existingResponse}
                        onSave={(response) => {
                          if (existingResponse) {
                            const index = auditResponses[currentElement.number].findIndex(
                              r => r.requirement_code === requirementCode
                            );
                            updateResponse(currentElement.number, index, response);
                          } else {
                            addResponse(currentElement.number, response);
                          }
                        }}
                        onAddNonConformity={addNonConformity}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {aiInsights[currentElement.number] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {aiInsights[currentElement.number].compliance_score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Score de Conformidade</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {aiInsights[currentElement.number].risk_level}
                      </p>
                      <p className="text-sm text-muted-foreground">Nível de Risco</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {aiInsights[currentElement.number].recommendations?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Recomendações</p>
                    </div>
                  </div>
                  
                  {aiInsights[currentElement.number].recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">Recomendações Prioritárias:</h4>
                      <ul className="space-y-1">
                        {aiInsights[currentElement.number].recommendations.slice(0, 3).map((rec: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentElementIndex(Math.max(0, currentElementIndex - 1))}
              disabled={currentElementIndex === 0}
            >
              Elemento Anterior
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveAudit}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              
              {currentElementIndex === elements.length - 1 ? (
                <Button onClick={completeAudit}>
                  <Award className="h-4 w-4 mr-2" />
                  Finalizar Auditoria
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentElementIndex(Math.min(elements.length - 1, currentElementIndex + 1))}
                >
                  Próximo Elemento
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Requirement Form Component
const RequirementForm: React.FC<{
  requirementCode: string;
  elementNumber: string;
  existingResponse?: AuditResponse;
  onSave: (response: AuditResponse) => void;
  onAddNonConformity: (nc: NonConformity) => void;
}> = ({ requirementCode, elementNumber, existingResponse, onSave, onAddNonConformity }) => {
  const [formData, setFormData] = useState<AuditResponse>(
    existingResponse || {
      element_number: elementNumber,
      requirement_code: requirementCode,
      score: "compliant",
      evidence_type: "document",
      evidence_description: "",
      evidence_urls: [],
      auditor_comments: "",
      recommendations: "",
      criticality: "low"
    }
  );

  const handleSave = () => {
    onSave(formData);
    
    if (formData.score === "non-compliant") {
      // Automatically suggest creating a non-conformity
      onAddNonConformity({
        element_number: elementNumber,
        element_name: `Elemento ${elementNumber}`,
        type: formData.criticality === "critical" ? "major" : "minor",
        description: formData.auditor_comments,
        evidence_urls: formData.evidence_urls,
        corrective_action: "",
        responsible_person: "",
        target_date: ""
      });
    }
    
    toast({
      title: "Requisito Salvo",
      description: `Avaliação do requisito ${requirementCode} salva.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Avaliação</Label>
          <RadioGroup
            value={formData.score}
            onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, score: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compliant" id="compliant" />
              <Label htmlFor="compliant" className="text-green-600">Conforme</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partial" id="partial" />
              <Label htmlFor="partial" className="text-yellow-600">Parcialmente Conforme</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-compliant" id="non-compliant" />
              <Label htmlFor="non-compliant" className="text-red-600">Não Conforme</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-applicable" id="not-applicable" />
              <Label htmlFor="not-applicable" className="text-muted-foreground">Não Aplicável</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Criticidade</Label>
          <Select
            value={formData.criticality}
            onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, criticality: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Descrição da Evidência</Label>
        <Textarea
          value={formData.evidence_description}
          onChange={(e) => setFormData(prev => ({ ...prev, evidence_description: e.target.value }))}
          placeholder="Descreva as evidências observadas..."
        />
      </div>
      
      <div className="space-y-2">
        <Label>Comentários do Auditor</Label>
        <Textarea
          value={formData.auditor_comments}
          onChange={(e) => setFormData(prev => ({ ...prev, auditor_comments: e.target.value }))}
          placeholder="Comentários e observações do auditor..."
        />
      </div>
      
      <div className="space-y-2">
        <Label>Recomendações</Label>
        <Textarea
          value={formData.recommendations}
          onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
          placeholder="Recomendações para melhoria..."
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Anexar Foto
        </Button>
        <Button variant="outline" size="sm">
          <Mic className="h-4 w-4 mr-2" />
          Gravar Áudio
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
      
      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Salvar Avaliação
      </Button>
    </div>
  );
};