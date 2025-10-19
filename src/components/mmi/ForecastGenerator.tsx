import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, AlertTriangle, Calendar, Gauge } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { MMIComponent, MMIHistory, AIForecast } from "@/types/mmi";
import { generateForecast } from "@/services/mmi/forecastService";
import { createTaskFromForecast } from "@/services/mmi/taskService";
import { saveForecast, formatForecastText } from "@/services/mmi/forecastStorageService";

interface ForecastGeneratorProps {
  component: MMIComponent;
  systemName: string;
  vesselId?: string;
  vesselName?: string;
  maintenanceHistory: MMIHistory[];
  onForecastGenerated?: () => void;
}

export default function ForecastGenerator({
  component,
  systemName,
  vesselId,
  vesselName,
  maintenanceHistory,
  onForecastGenerated,
}: ForecastGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [forecast, setForecast] = useState<AIForecast | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const handleGenerateForecast = async () => {
    try {
      setGenerating(true);
      const result = await generateForecast({
        system_name: systemName,
        component,
        maintenance_history: maintenanceHistory,
      });

      setForecast(result);
      
      // Save forecast to database
      try {
        const forecastText = formatForecastText(result);
        const lastMaintenanceDates = maintenanceHistory
          .slice(0, 5)
          .map((h) => h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "N/A");
        
        await saveForecast({
          vessel_id: vesselId,
          vessel_name: vesselName || "Embarcação não especificada",
          system_name: systemName,
          hourmeter: component.current_hours,
          last_maintenance: lastMaintenanceDates,
          forecast_text: forecastText,
          priority: result.priority,
        });
        
        toast.success("Forecast gerado e salvo com sucesso!");
      } catch (saveError) {
        console.error("Error saving forecast:", saveError);
        toast.success("Forecast gerado com sucesso! (Aviso: Não foi possível salvar no histórico)");
      }
    } catch (error) {
      console.error("Error generating forecast:", error);
      toast.error("Erro ao gerar forecast");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!forecast) return;

    try {
      setCreatingTask(true);
      const task = await createTaskFromForecast({
        forecast,
        system_name: systemName,
        vessel_id: vesselId,
        component_name: component.component_name,
      });

      if (task) {
        toast.success("Tarefa criada automaticamente!");
        if (onForecastGenerated) {
          onForecastGenerated();
        }
        setForecast(null); // Reset forecast after creating task
      } else {
        toast.error("Erro ao criar tarefa");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Erro ao criar tarefa");
    } finally {
      setCreatingTask(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const progressPercentage = (component.current_hours / component.maintenance_interval_hours) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Status do Componente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Horímetro Atual</p>
              <p className="text-2xl font-bold">{component.current_hours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Intervalo de Manutenção</p>
              <p className="text-2xl font-bold">{component.maintenance_interval_hours.toFixed(1)}h</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  progressPercentage >= 95
                    ? "bg-red-500"
                    : progressPercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {component.last_maintenance_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Última manutenção:{" "}
                {format(new Date(component.last_maintenance_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          )}

          <Button
            onClick={handleGenerateForecast}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Forecast com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Forecast com GPT-4
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {forecast && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Forecast de IA Gerado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(forecast.priority)}>
                Prioridade: {forecast.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(forecast.suggested_date), "dd/MM/yyyy", { locale: ptBR })}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Próxima Intervenção:
              </h4>
              <p className="text-sm bg-muted p-3 rounded-lg">{forecast.next_intervention}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Por que é necessária:</h4>
              <p className="text-sm bg-muted p-3 rounded-lg">{forecast.reasoning}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-destructive">
                Impacto de não executar:
              </h4>
              <p className="text-sm bg-destructive/10 p-3 rounded-lg text-destructive">
                {forecast.impact}
              </p>
            </div>

            {forecast.maintenance_history.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Histórico Considerado:</h4>
                <ul className="text-sm space-y-1">
                  {forecast.maintenance_history.map((h, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>
                        {h.date}: {h.action}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleCreateTask}
              disabled={creatingTask}
              className="w-full"
              variant="default"
            >
              {creatingTask ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando Tarefa...
                </>
              ) : (
                <>
                  Criar Tarefa e OS Automaticamente
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
