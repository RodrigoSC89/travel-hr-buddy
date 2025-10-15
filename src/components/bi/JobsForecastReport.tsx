import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface TrendData {
  month?: string;
  total_jobs?: number;
  date?: string;
  jobs?: number;
  [key: string]: unknown;
}

interface JobsForecastReportProps {
  trend: TrendData[];
  onForecastUpdate?: (forecast: string) => void;
}

export default function JobsForecastReport({ trend, onForecastUpdate }: JobsForecastReportProps) {
  const [forecast, setForecast] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchForecast() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bi-jobs-forecast", {
        body: { trend }
      });

      if (error) {
        console.error("Error fetching forecast:", error);
        const errorMessage = "Erro ao buscar previsão. Tente novamente.";
        setForecast(errorMessage);
        if (onForecastUpdate) {
          onForecastUpdate(errorMessage);
        }
      } else if (data?.forecast) {
        setForecast(data.forecast);
        if (onForecastUpdate) {
          onForecastUpdate(data.forecast);
        }
      } else {
        const noDataMessage = "Nenhuma previsão disponível.";
        setForecast(noDataMessage);
        if (onForecastUpdate) {
          onForecastUpdate(noDataMessage);
        }
      }
    } catch (error) {
      console.error("Error invoking forecast function:", error);
      const errorMessage = "Erro ao buscar previsão. Tente novamente.";
      setForecast(errorMessage);
      if (onForecastUpdate) {
        onForecastUpdate(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (trend?.length) {
      void fetchForecast();
    }
  }, [trend]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">🔮 Previsão IA de Jobs</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : forecast ? (
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{forecast}</p>
          </div>
        ) : (
          <Button onClick={fetchForecast} className="w-full">
            Gerar Previsão
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
