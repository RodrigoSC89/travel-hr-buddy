/**
 * AI-powered incident classification modal
 * Integrates GPT-4 to automatically classify incidents based on description
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { classifyIncidentWithAI, IncidentClassification } from "@/lib/ai/classifyIncidentWithAI";
import { useToast } from "@/hooks/use-toast";

interface IncidentAIClassificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassificationComplete: (classification: IncidentClassification) => void;
}

export const IncidentAIClassificationModal: React.FC<IncidentAIClassificationModalProps> = ({
  open,
  onOpenChange,
  onClassificationComplete,
}) => {
  const [description, setDescription] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<IncidentClassification | null>(null);
  const { toast } = useToast();

  const handleClassify = async () => {
    if (!description.trim()) {
      toast({
        title: "⚠️ Descrição necessária",
        description: "Por favor, insira uma descrição do incidente para classificação.",
        variant: "destructive",
      });
      return;
    }

    setIsClassifying(true);
    try {
      const result = await classifyIncidentWithAI(description);
      
      if (result) {
        setClassification(result);
        toast({
          title: "✨ Classificação concluída",
          description: "IA analisou o incidente com sucesso!",
        });
      } else {
        toast({
          title: "❌ Erro na classificação",
          description: "Não foi possível classificar o incidente. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error classifying incident:", error);
      toast({
        title: "❌ Erro na classificação",
        description: "Ocorreu um erro ao processar a classificação. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleApplyClassification = () => {
    if (classification) {
      onClassificationComplete(classification);
      onOpenChange(false);
      // Reset state
      setDescription("");
      setClassification(null);
    }
  };

  const handleCancel = () => {
    setDescription("");
    setClassification(null);
    onOpenChange(false);
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      crítico: "bg-red-600 text-white border-red-700",
      alto: "bg-orange-600 text-white border-orange-700",
      moderado: "bg-yellow-600 text-white border-yellow-700",
      baixo: "bg-blue-600 text-white border-blue-700",
    };
    return colors[level.toLowerCase()] || "bg-gray-600 text-white";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Classificar Incidente com IA
          </DialogTitle>
          <DialogDescription>
            Use IA (GPT-4) para analisar automaticamente o incidente e sugerir categoria SGSO,
            causa raiz provável e nível de risco.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Incidente</Label>
            <Textarea
              id="description"
              placeholder="Ex: Durante manobra de posicionamento dinâmico (DP), operador inseriu coordenadas erradas, causando desvio de rota."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="resize-none"
              disabled={isClassifying}
            />
            <p className="text-xs text-muted-foreground">
              Descreva o incidente detalhadamente para obter melhor classificação.
            </p>
          </div>

          {!classification && (
            <Button
              onClick={handleClassify}
              disabled={isClassifying || !description.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isClassifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Classificar com IA
                </>
              )}
            </Button>
          )}

          {classification && (
            <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="h-5 w-5" />
                Classificação IA Concluída
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoria SGSO</Label>
                  <Badge variant="outline" className="text-base py-1 px-3">
                    {classification.sgso_category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Causa Raiz Provável</Label>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-sm">{classification.sgso_root_cause}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nível de Risco</Label>
                  <Badge className={getRiskLevelColor(classification.sgso_risk_level)}>
                    {classification.sgso_risk_level}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold">Benefícios da Classificação IA:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Classificação rápida e padronizada</li>
                    <li>Auxilia na análise da causa mais provável</li>
                    <li>Automatiza a avaliação de gravidade</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isClassifying}
          >
            Cancelar
          </Button>
          
          {classification && (
            <Button
              onClick={handleApplyClassification}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aplicar Classificação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
