/**
 * SGSO Action Plan Generator Component
 * AI-powered action plan generation for classified incidents
 * Features: Form input, GPT-4 integration, mock mode fallback, visual results
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSGSOActionPlan, type SGSOActionPlan } from "@/lib/ai/sgso";
import { logger } from '@/lib/logger';

export const SGSOActionPlanGenerator: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [actionPlan, setActionPlan] = useState<SGSOActionPlan | null>(null);

  const categories = [
    "Erro humano",
    "Falha de sistema",
    "Problema de comunicação",
    "Não conformidade com procedimento",
    "Fator externo (clima, mar, etc)",
    "Falha organizacional",
    "Ausência de manutenção preventiva",
  ];

  const riskLevels = [
    { value: "baixo", label: "Baixo" },
    { value: "moderado", label: "Moderado" },
    { value: "alto", label: "Alto" },
    { value: "crítico", label: "Crítico" },
  ];

  const handleLoadExample = () => {
    setDescription("Operador inseriu coordenadas erradas no DP durante manobra.");
    setCategory("Erro humano");
    setRootCause("Falta de dupla checagem antes da execução");
    setRiskLevel("alto");
    setActionPlan(null);

    toast({
      title: "Exemplo carregado",
      description: "Dados de exemplo foram carregados no formulário.",
    });
  };

  const handleClear = () => {
    setDescription("");
    setCategory("");
    setRootCause("");
    setRiskLevel("");
    setActionPlan(null);

    toast({
      title: "Formulário limpo",
      description: "Todos os campos foram resetados.",
    });
  };

  const handleGenerate = async () => {
    // Validation
    if (!description.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira a descrição do incidente.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione a categoria SGSO.",
        variant: "destructive",
      });
      return;
    }

    if (!rootCause.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira a causa raiz.",
        variant: "destructive",
      });
      return;
    }

    if (!riskLevel) {
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione o nível de risco.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setActionPlan(null);

    try {
      const plan = await generateSGSOActionPlan({
        description,
        sgso_category: category,
        sgso_root_cause: rootCause,
        sgso_risk_level: riskLevel,
      });

      if (plan) {
        setActionPlan(plan);
        toast({
          title: "Plano de ação gerado com sucesso",
          description: "A IA analisou o incidente e gerou recomendações completas.",
        });
      } else {
        toast({
          title: "Erro ao gerar plano",
          description: "Não foi possível gerar o plano de ação. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("Error generating action plan:", error);
      toast({
        title: "Erro ao gerar plano",
        description: "Ocorreu um erro ao processar a solicitação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-info/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-card rounded-xl shadow-lg">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Gerador de Plano de Ação com IA
              </h2>
              <p className="text-muted-foreground">
                Análise inteligente baseada em padrões IMCA/IMO e Resolução ANP 43/2007
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Incidente</CardTitle>
          <CardDescription>
            Preencha as informações do incidente para gerar o plano de ação automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Incidente *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o incidente em detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria SGSO *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskLevel">Nível de Risco *</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger id="riskLevel">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rootCause">Causa Raiz *</Label>
            <Textarea
              id="rootCause"
              placeholder="Descreva a causa raiz identificada..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1 min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Plano...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Gerar Plano de Ação com IA
                </>
              )}
            </Button>
            <Button
              onClick={handleLoadExample}
              variant="outline"
              disabled={loading}
              className="border-primary/30 text-primary hover:bg-primary/5"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Carregar Exemplo
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {actionPlan && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Plano de Ação Gerado
          </h3>

          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                ✅ Ação Corretiva Imediata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{actionPlan.corrective_action}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20">
            <CardHeader>
              <CardTitle className="text-info flex items-center gap-2">
                🔁 Ação Preventiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{actionPlan.preventive_action}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                🧠 Recomendação da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{actionPlan.recommendation}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SGSOActionPlanGenerator;
