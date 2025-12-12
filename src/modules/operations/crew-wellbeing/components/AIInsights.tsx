import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAnalysis {
  summary: string;
  health_status: string;
  fatigue_level: string;
  stress_indicators?: string[];
  recommendations?: string[];
  alerts?: string[];
  rotation_needed?: boolean;
  rotation_reason?: string;
  preventive_actions?: string[];
}

export const AIInsights = memo(() => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const requestAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado",
          variant: "destructive",
        };
        return;
      }

      const { data, error } = await supabase.functions.invoke("crew-ai-analysis" as unknown, {
        body: { crewMemberId: user.id, analysisType: "wellbeing" }
      };

      if (error) throw error;

      setAnalysis(data.analysis);
      
      toast({
        title: "Análise concluída",
        description: "A IA gerou insights sobre seu bem-estar",
      });
    } catch (error) {
      console.error("Error requesting analysis:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar análise",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFatigueLevelColor = (level: string) => {
    switch (level) {
    case "low": return "text-green-500";
    case "medium": return "text-yellow-500";
    case "high": return "text-orange-500";
    case "critical": return "text-red-500";
    default: return "text-gray-500";
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Análise IA de Bem-Estar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={requestAnalysis} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? "Analisando..." : "Solicitar Análise IA"}
        </Button>

        {analysis && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Resumo</h4>
              <p className="text-sm">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Status de Saúde</p>
                <p className="font-semibold">{analysis.health_status}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Nível de Fadiga</p>
                <p className={`font-semibold ${getFatigueLevelColor(analysis.fatigue_level)}`}>
                  {analysis.fatigue_level}
                </p>
              </div>
            </div>

            {analysis.alerts && analysis.alerts.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alertas:</strong>
                  <ul className="mt-2 space-y-1">
                    {analysis.alerts.map((alert, idx) => (
                      <li key={idx}>• {alert}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {analysis.rotation_needed && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rotação Recomendada:</strong>
                  <p className="mt-1">{analysis.rotation_reason}</p>
                </AlertDescription>
              </Alert>
            )}

            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Recomendações
                </h4>
                <ul className="space-y-1 text-sm">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.preventive_actions && analysis.preventive_actions.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Ações Preventivas</h4>
                <ul className="space-y-1 text-sm">
                  {analysis.preventive_actions.map((action, idx) => (
                    <li key={idx}>• {action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
