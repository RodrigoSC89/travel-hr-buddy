import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrendDataPoint {
  date?: string;
  value?: number;
  count?: number;
  total?: number;
  [key: string]: string | number | undefined;
}

interface JobsForecastReportProps {
  trend: TrendDataPoint[];
}

export default function JobsForecastReport({ trend }: JobsForecastReportProps) {
  const [forecast, setForecast] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bi-jobs-forecast", {
        body: { trend }
      });

      if (error) {
        console.error("Error fetching forecast:", error);
        toast({
          title: "Erro ao gerar previsão",
          description: "Não foi possível gerar a previsão. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      setForecast(data.forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      toast({
        title: "Erro ao gerar previsão",
        description: "Não foi possível gerar a previsão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [trend, toast]);

  useEffect(() => {
    if (trend?.length) fetchForecast();
  }, [trend, fetchForecast]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">🔮 Previsão IA de Jobs</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : forecast ? (
          <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-100 p-4 rounded-lg">{forecast}</pre>
        ) : (
          <Button onClick={fetchForecast}>Gerar Previsão</Button>
        )}
      </CardContent>
    </Card>
  );
}
