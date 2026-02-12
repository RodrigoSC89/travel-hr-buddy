/**
 * Insight Implementation Dialog
 * Workflow for implementing AI-generated insights
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb, CheckCircle, Clock, Users, Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InsightImplementationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insight?: {
    id: number;
    title: string;
    description: string;
    recommendations: string[];
    estimatedSavings: string;
    confidence: number;
  };
}

interface ImplementationStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  assignee?: string;
}

export const InsightImplementationDialog: React.FC<InsightImplementationDialogProps> = ({
  open,
  onOpenChange,
  insight,
}) => {
  const { toast } = useToast();
  const [currentPhase, setCurrentPhase] = useState<"plan" | "execute" | "review">("plan");
  const [notes, setNotes] = useState("");
  
  const [steps, setSteps] = useState<ImplementationStep[]>([
    { id: "1", label: "Análise de Impacto", description: "Avaliar impacto nos processos existentes", completed: false },
    { id: "2", label: "Aprovação Stakeholders", description: "Obter aprovação dos responsáveis", completed: false },
    { id: "3", label: "Configuração Técnica", description: "Implementar alterações no sistema", completed: false },
    { id: "4", label: "Teste Piloto", description: "Testar em ambiente controlado", completed: false },
    { id: "5", label: "Rollout Completo", description: "Implantar para todos os usuários", completed: false },
  ]);

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const toggleStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  const handleStartImplementation = () => {
    setCurrentPhase("execute");
    toast({
      title: "🚀 Implementação Iniciada",
      description: "Acompanhe o progresso das etapas",
    });
  };

  const handleCompleteImplementation = () => {
    setCurrentPhase("review");
    toast({
      title: "✅ Implementação Concluída",
      description: "O insight foi implementado com sucesso",
    });
  };

  const handleSaveProgress = () => {
    toast({
      title: "💾 Progresso Salvo",
      description: `${completedSteps} de ${steps.length} etapas concluídas`,
    });
  };

  if (!insight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Implementar Insight
          </DialogTitle>
          <DialogDescription>
            Workflow guiado para implementar a recomendação da IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Insight Summary */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {insight.confidence}% Confiança
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{insight.description}</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Economia estimada: {insight.estimatedSavings}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Phase Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {["plan", "execute", "review"].map((phase, index) => (
                <React.Fragment key={phase}>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    currentPhase === phase 
                      ? "bg-primary text-primary-foreground" 
                      : index < ["plan", "execute", "review"].indexOf(currentPhase)
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {index < ["plan", "execute", "review"].indexOf(currentPhase) && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {phase === "plan" && "Planejamento"}
                    {phase === "execute" && "Execução"}
                    {phase === "review" && "Revisão"}
                  </div>
                  {index < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso da Implementação</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recomendações da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insight.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Implementation Steps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Etapas de Implementação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    step.completed ? "bg-success/5 border-success/20" : "bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={() => toggleStep(step.id)}
                    disabled={currentPhase === "plan"}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                  {step.completed && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas de Implementação</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a implementação..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          
          {currentPhase === "plan" && (
            <Button onClick={handleStartImplementation}>
              Iniciar Implementação
            </Button>
          )}
          
          {currentPhase === "execute" && (
            <>
              <Button variant="outline" onClick={handleSaveProgress}>
                Salvar Progresso
              </Button>
              <Button 
                onClick={handleCompleteImplementation}
                disabled={completedSteps < steps.length}
              >
                Concluir ({completedSteps}/{steps.length})
              </Button>
            </>
          )}
          
          {currentPhase === "review" && (
            <Button onClick={() => onOpenChange(false)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsightImplementationDialog;
