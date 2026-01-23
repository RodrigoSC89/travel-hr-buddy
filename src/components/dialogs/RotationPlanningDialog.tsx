/**
 * Rotation Planning Dialog
 * AI-powered crew rotation and schedule optimization
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Users, Ship, Brain, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RotationPlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RotationSuggestion {
  id: string;
  crewMember: string;
  currentVessel: string;
  suggestedVessel: string;
  reason: string;
  impact: "high" | "medium" | "low";
  startDate: string;
  endDate: string;
}

export const RotationPlanningDialog: React.FC<RotationPlanningDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [rotationPeriod, setRotationPeriod] = useState<string>("30");

  const [suggestions] = useState<RotationSuggestion[]>([
    {
      id: "1",
      crewMember: "João Silva",
      currentVessel: "MV Nautilus Pioneer",
      suggestedVessel: "MV Atlantic Explorer",
      reason: "Experiência em rotas transatlânticas necessária",
      impact: "high",
      startDate: "2024-02-15",
      endDate: "2024-08-15",
    },
    {
      id: "2",
      crewMember: "Maria Santos",
      currentVessel: "MV Atlantic Explorer",
      suggestedVessel: "MV Pacific Star",
      reason: "Renovação de certificação concluída - apto para operações maiores",
      impact: "medium",
      startDate: "2024-03-01",
      endDate: "2024-09-01",
    },
    {
      id: "3",
      crewMember: "Carlos Oliveira",
      currentVessel: "MV Pacific Star",
      suggestedVessel: "MV Nautilus Pioneer",
      reason: "Proximidade do porto de origem - otimização de custos",
      impact: "low",
      startDate: "2024-02-20",
      endDate: "2024-08-20",
    },
  ]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsOptimizing(false);
    toast({
      title: "✨ Otimização Concluída",
      description: "IA identificou 3 oportunidades de rotação para maximizar eficiência",
    });
  };

  const handleApplySuggestion = (suggestion: RotationSuggestion) => {
    toast({
      title: "✅ Rotação Agendada",
      description: `${suggestion.crewMember} será transferido para ${suggestion.suggestedVessel}`,
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
    case "high": return "text-green-600 bg-green-50 border-green-200";
    case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "low": return "text-blue-600 bg-blue-50 border-blue-200";
    default: return "text-muted-foreground bg-gray-50 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planejamento de Rotação Inteligente
          </DialogTitle>
          <DialogDescription>
            Use IA para otimizar escalas e rotações de tripulação com base em certificações, experiência e custos operacionais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Embarcações</SelectItem>
                  <SelectItem value="nautilus">MV Nautilus Pioneer</SelectItem>
                  <SelectItem value="atlantic">MV Atlantic Explorer</SelectItem>
                  <SelectItem value="pacific">MV Pacific Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período de Rotação (dias)</Label>
              <Input 
                type="number" 
                value={rotationPeriod} 
                onChange={(e) => setRotationPeriod(e.target.value)}
                min="7"
                max="365"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleOptimize} 
                disabled={isOptimizing}
                className="w-full"
              >
                {isOptimizing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                {isOptimizing ? "Otimizando..." : "Otimizar com IA"}
              </Button>
            </div>
          </div>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Sugestões de Rotação
              </CardTitle>
              <CardDescription>
                Recomendações baseadas em análise de dados de tripulação, certificações e histórico de operações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">{suggestion.crewMember}</span>
                        <Badge 
                          variant="outline" 
                          className={getImpactColor(suggestion.impact)}
                        >
                          {suggestion.impact === "high" ? "Alto Impacto" : 
                            suggestion.impact === "medium" ? "Médio Impacto" : "Baixo Impacto"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Ship className="h-3 w-3" />
                          <span>{suggestion.currentVessel}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1">
                          <Ship className="h-3 w-3" />
                          <span>{suggestion.suggestedVessel}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <span>{suggestion.reason}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Início: {new Date(suggestion.startDate).toLocaleDateString("pt-BR")}</span>
                        <span>Término: {new Date(suggestion.endDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => handleApplySuggestion(suggestion)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aplicar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">15%</div>
                <div className="text-sm text-muted-foreground">Redução de Custos Estimada</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-muted-foreground">Taxa de Compliance MLC</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">8.5/10</div>
                <div className="text-sm text-muted-foreground">Satisfação da Tripulação</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RotationPlanningDialog;
