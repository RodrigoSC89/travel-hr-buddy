import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ship, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Forecast {
  id: string;
  vessel_name: string;
  system_name: string;
  forecast_text: string;
  priority: string;
  suggested_date?: string;
  created_at: string;
  created_by?: string;
}

interface ForecastHistoryPanelProps {
  vesselFilter?: string;
}

export default function ForecastHistoryPanel({ vesselFilter }: ForecastHistoryPanelProps) {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingOS, setGeneratingOS] = useState<string | null>(null);

  useEffect(() => {
    fetchForecasts();
  }, [vesselFilter]);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("mmi_forecasts")
        .select("*")
        .order("created_at", { ascending: false });

      if (vesselFilter) {
        query = query.eq("vessel_name", vesselFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setForecasts(data || []);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      toast.error("Erro ao carregar histórico de forecasts");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOS = async (forecast: Forecast) => {
    try {
      setGeneratingOS(forecast.id);

      // Get the auth session for the bearer token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar autenticado para gerar OS");
        return;
      }

      const response = await fetch("/api/os/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          forecast_id: forecast.id,
          vessel_name: forecast.vessel_name,
          system_name: forecast.system_name,
          description: forecast.forecast_text,
          priority: forecast.priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar OS");
      }

      if (data.success) {
        toast.success("✅ Ordem de Serviço gerada com sucesso!");
        // Optionally refresh the forecasts list or add a visual indicator
        fetchForecasts();
      } else {
        toast.error("❌ Falha ao gerar OS");
      }
    } catch (error) {
      console.error("Error generating OS:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Erro ao gerar Ordem de Serviço"
      );
    } finally {
      setGeneratingOS(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critica":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "alta":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "normal":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "baixa":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando histórico de forecasts...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Forecasts</h1>
          <p className="text-muted-foreground mt-1">
            Forecasts de manutenção gerados pela IA
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {forecasts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum forecast encontrado</p>
            </CardContent>
          </Card>
        ) : (
          forecasts.map((forecast) => (
            <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{forecast.system_name}</CardTitle>
                      <Badge variant="outline" className={getPriorityColor(forecast.priority)}>
                        Prioridade: {forecast.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        <span>{forecast.vessel_name}</span>
                      </div>
                      {forecast.suggested_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Sugerido para:{" "}
                            {format(new Date(forecast.suggested_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm whitespace-pre-line">{forecast.forecast_text}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Criado em {format(new Date(forecast.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  <Button
                    variant="default"
                    onClick={() => handleGenerateOS(forecast)}
                    disabled={generatingOS === forecast.id}
                    className="gap-2"
                  >
                    {generatingOS === forecast.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        📄 Gerar Ordem de Serviço
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
