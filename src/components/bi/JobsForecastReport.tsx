import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Forecast {
  component: string;
  priority: "critical" | "high" | "medium" | "low";
  prediction: string;
  action: string;
}

interface ForecastData {
  forecasts: Forecast[];
  summary: {
    totalPredictions: number;
    criticalActions: number;
    accuracy: number;
  };
}

export default function JobsForecastReport() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const { data: result, error } = await supabase.functions.invoke("bi-jobs-forecast");
        
        if (error) {
          console.error("Error fetching forecast:", error);
          setData(getMockForecastData());
        } else {
          setData(result || getMockForecastData());
        }
      } catch (error) {
        console.error("Error invoking forecast function:", error);
        setData(getMockForecastData());
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
    case "critical": return "🔴";
    case "high": return "🟠";
    case "medium": return "🟡";
    case "low": return "🔵";
    default: return "⚪";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "border-red-500 bg-red-50";
    case "high": return "border-orange-500 bg-orange-50";
    case "medium": return "border-yellow-500 bg-yellow-50";
    case "low": return "border-blue-500 bg-blue-50";
    default: return "border-gray-500 bg-gray-50";
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">🔮 Previsão IA de Manutenção</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : data ? (
          <div className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-100 rounded-lg">
                <div className="text-2xl font-bold">{data.summary.totalPredictions}</div>
                <div className="text-sm text-muted-foreground">Previsões</div>
              </div>
              <div className="text-center p-3 bg-slate-100 rounded-lg">
                <div className="text-2xl font-bold">{data.summary.criticalActions}</div>
                <div className="text-sm text-muted-foreground">Ações Críticas</div>
              </div>
              <div className="text-center p-3 bg-slate-100 rounded-lg">
                <div className="text-2xl font-bold">{data.summary.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Precisão IA</div>
              </div>
            </div>

            {/* Forecast Cards */}
            <div className="space-y-3">
              {data.forecasts.map((forecast, index) => (
                <div 
                  key={index} 
                  className={`p-4 border-l-4 rounded ${getPriorityColor(forecast.priority)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{getPriorityIcon(forecast.priority)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{forecast.component}</h3>
                      <p className="text-sm mt-1">
                        <strong>Previsão:</strong> {forecast.prediction}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Ação Recomendada:</strong> {forecast.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Nenhuma previsão disponível.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Mock data for fallback when backend is unavailable
function getMockForecastData(): ForecastData {
  return {
    forecasts: [
      {
        component: "Gerador Principal",
        priority: "critical",
        prediction: "Provável falha nas próximas 48h baseado em padrões históricos",
        action: "Agendar inspeção preventiva imediata"
      },
      {
        component: "Sistema Hidráulico",
        priority: "high",
        prediction: "Desgaste acelerado detectado nos últimos 30 dias",
        action: "Substituir componentes durante próxima manutenção programada"
      },
      {
        component: "Bomba de Água #2",
        priority: "medium",
        prediction: "Performance 15% abaixo do normal",
        action: "Monitorar semanalmente e planejar manutenção"
      },
      {
        component: "Sistema Elétrico",
        priority: "low",
        prediction: "Operação dentro dos parâmetros normais",
        action: "Continuar manutenção de rotina"
      }
    ],
    summary: {
      totalPredictions: 4,
      criticalActions: 1,
      accuracy: 87
    }
  };
}
