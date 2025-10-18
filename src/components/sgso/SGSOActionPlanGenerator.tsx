/**
 * SGSO Incident Action Plan Generator
 * Component to generate AI-powered action plans for SGSO incidents
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { generateSGSOActionPlan, SGSOIncident, SGSOActionPlan } from "@/lib/ai/sgso";
import { useToast } from "@/hooks/use-toast";

interface IncidentWithPlan extends SGSOIncident {
  corrective_action?: string;
  preventive_action?: string;
  recommendation?: string;
}

export const SGSOActionPlanGenerator: React.FC = () => {
  const [incident, setIncident] = useState<IncidentWithPlan>({
    description: "",
    sgso_category: "",
    sgso_root_cause: "",
    sgso_risk_level: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateActionPlan = async () => {
    if (!incident.description || !incident.sgso_category || !incident.sgso_root_cause || !incident.sgso_risk_level) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Preencha todos os campos antes de gerar o plano de ação",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const plan = await generateSGSOActionPlan({
        description: incident.description,
        sgso_category: incident.sgso_category,
        sgso_root_cause: incident.sgso_root_cause,
        sgso_risk_level: incident.sgso_risk_level,
      });

      if (plan) {
        setIncident((prev) => ({
          ...prev,
          corrective_action: plan.corrective_action,
          preventive_action: plan.preventive_action,
          recommendation: plan.recommendation,
        }));
        
        toast({
          title: "✅ Plano de Ação Gerado",
          description: "O plano de ação foi gerado com sucesso pela IA",
        });
      } else {
        toast({
          title: "❌ Erro ao Gerar Plano",
          description: "Não foi possível gerar o plano de ação. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating action plan:", error);
      toast({
        title: "❌ Erro",
        description: "Ocorreu um erro ao gerar o plano de ação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExampleIncident = () => {
    setIncident({
      description: "Operador inseriu coordenadas erradas no DP durante manobra.",
      sgso_category: "Erro humano",
      sgso_root_cause: "Falta de dupla checagem antes da execução",
      sgso_risk_level: "alto",
    });
    
    toast({
      title: "📝 Exemplo Carregado",
      description: "Dados de exemplo foram carregados no formulário",
    });
  };

  const clearForm = () => {
    setIncident({
      description: "",
      sgso_category: "",
      sgso_root_cause: "",
      sgso_risk_level: "",
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            Gerador de Plano de Ação SGSO com IA
          </CardTitle>
          <CardDescription>
            Gera automaticamente planos de ação corretiva e preventiva baseados em normas IMCA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadExampleIncident}
                className="gap-2"
              >
                📝 Carregar Exemplo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearForm}
                className="gap-2"
              >
                🗑️ Limpar
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Incidente *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o incidente em detalhes..."
                  value={incident.description}
                  onChange={(e) =>
                    setIncident({ ...incident, description: e.target.value })
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria SGSO *</Label>
                  <Select
                    value={incident.sgso_category}
                    onValueChange={(value) =>
                      setIncident({ ...incident, sgso_category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Erro humano">Erro humano</SelectItem>
                      <SelectItem value="Falha de equipamento">Falha de equipamento</SelectItem>
                      <SelectItem value="Ambiental">Ambiental</SelectItem>
                      <SelectItem value="Procedimento inadequado">Procedimento inadequado</SelectItem>
                      <SelectItem value="Comunicação">Comunicação</SelectItem>
                      <SelectItem value="Treinamento insuficiente">Treinamento insuficiente</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_level">Nível de Risco *</Label>
                  <Select
                    value={incident.sgso_risk_level}
                    onValueChange={(value) =>
                      setIncident({ ...incident, sgso_risk_level: value })
                    }
                  >
                    <SelectTrigger id="risk_level">
                      <SelectValue placeholder="Selecione o risco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crítico">Crítico</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="médio">Médio</SelectItem>
                      <SelectItem value="baixo">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="root_cause">Causa Raiz *</Label>
                  <Input
                    id="root_cause"
                    placeholder="Ex: Falta de treinamento"
                    value={incident.sgso_root_cause}
                    onChange={(e) =>
                      setIncident({ ...incident, sgso_root_cause: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerateActionPlan}
              disabled={loading}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando Plano de Ação com IA...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  🧠 Gerar Plano de Ação com IA
                </>
              )}
            </Button>
          </div>

          {/* Generated Action Plan */}
          {(incident.corrective_action || incident.preventive_action || incident.recommendation) && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Plano de Ação Gerado
              </h3>

              <div className="grid gap-4">
                {incident.corrective_action && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-red-900">
                            ✅ Ação Corretiva Imediata
                          </h4>
                          <p className="text-sm text-red-800">
                            {incident.corrective_action}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {incident.preventive_action && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-blue-900">
                            🔁 Ação Preventiva
                          </h4>
                          <p className="text-sm text-blue-800">
                            {incident.preventive_action}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {incident.recommendation && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-purple-900">
                            🧠 Recomendação da IA
                          </h4>
                          <p className="text-sm text-purple-800">
                            {incident.recommendation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SGSOActionPlanGenerator;
