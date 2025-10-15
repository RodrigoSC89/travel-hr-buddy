import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

interface TrendData {
  data: string;
  concluídos: number;
  iniciados: number;
}

interface ForecastInsight {
  tipo: "alerta" | "sucesso" | "info";
  titulo: string;
  descricao: string;
  acao: string;
}

interface JobsForecastReportProps {
  trend?: TrendData[];
}

const JobsForecastReport: React.FC<JobsForecastReportProps> = ({ trend = [] }) => {
  const [insights, setInsights] = useState<ForecastInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateForecast();
  }, [trend]);

  const generateForecast = async () => {
    setLoading(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate insights based on trend data or mock data
      const mockInsights: ForecastInsight[] = [
        {
          tipo: "alerta",
          titulo: "Aumento de Jobs Pendentes Detectado",
          descricao: "A IA detectou um aumento de 23% em jobs pendentes no sistema Hidráulico. Isso pode indicar necessidade de recursos adicionais.",
          acao: "Alocar mais técnicos para o setor hidráulico nas próximas 48h"
        },
        {
          tipo: "sucesso",
          titulo: "Eficiência Elevada no Sistema Elétrico",
          descricao: "Taxa de conclusão de 94% no último período. O sistema está operando com alta eficiência.",
          acao: "Manter protocolo atual de manutenção"
        },
        {
          tipo: "info",
          titulo: "Previsão de Manutenção Preventiva",
          descricao: "Com base no histórico, estima-se 15 novos jobs no Gerador nos próximos 7 dias.",
          acao: "Preparar estoque de peças e agendar equipe preventivamente"
        },
        {
          tipo: "alerta",
          titulo: "Componentes Críticos Requerem Atenção",
          descricao: "Sistema de Propulsão apresenta tempo médio de resolução 40% acima da média.",
          acao: "Investigar gargalos no processo e considerar treinamento especializado"
        },
        {
          tipo: "sucesso",
          titulo: "Redução no Tempo de Resposta",
          descricao: "Tempo médio de início dos jobs reduziu 18% comparado ao mês anterior.",
          acao: "Documentar melhores práticas implementadas"
        }
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case "alerta":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "sucesso":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
    }
  };

  const getInsightColor = (tipo: string) => {
    switch (tipo) {
      case "alerta":
        return "border-orange-200 bg-orange-50/50";
      case "sucesso":
        return "border-green-200 bg-green-50/50";
      default:
        return "border-blue-200 bg-blue-50/50";
    }
  };

  const getBadgeVariant = (tipo: string): "destructive" | "default" | "secondary" => {
    switch (tipo) {
      case "alerta":
        return "destructive";
      case "sucesso":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            🔮 Previsão IA com Ações Preventivas
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateForecast}
            disabled={loading}
          >
            <Zap className="h-4 w-4 mr-2" />
            {loading ? "Analisando..." : "Atualizar Análise"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">IA analisando dados...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`border rounded-lg p-4 ${getInsightColor(insight.tipo)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getInsightIcon(insight.tipo)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm">{insight.titulo}</h4>
                      <Badge variant={getBadgeVariant(insight.tipo)} className="text-xs">
                        {insight.tipo.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.descricao}
                    </p>
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-foreground/80 flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        Ação Recomendada:
                      </p>
                      <p className="text-sm mt-1 text-foreground font-medium">
                        {insight.acao}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum insight disponível no momento. Clique em "Atualizar Análise" para gerar novas previsões.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobsForecastReport;
