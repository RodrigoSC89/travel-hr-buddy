import { useState, useEffect } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { supabase } from "@/integrations/supabase/client";

interface TrendData {
  date?: string;
  jobs?: number;
  month?: string;
  total_jobs?: number;
  [key: string]: unknown;
}

export default function ForecastPage() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendData();
  }, []);

  async function fetchTrendData() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc("jobs_trend_by_month");
      
      if (rpcError) {
        console.error("Error fetching trend data:", rpcError);
        setError("Erro ao carregar dados de tendência");
      } else if (data) {
        setTrendData(data);
      }
    } catch (err) {
      console.error("Exception fetching trend data:", err);
      setError("Erro ao carregar dados de tendência");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModulePageWrapper gradient="blue">
      <div className="container mx-auto p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Previsões de Vagas</h1>
          <p className="text-muted-foreground">
            Análise preditiva e previsões baseadas em IA para tendências de vagas de emprego
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Previsão de Tendências</CardTitle>
            <CardDescription>
              Análise de tendências históricas e previsões futuras
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {!loading && !error && trendData.length > 0 && (
              <JobsForecastReport trend={trendData} />
            )}
            
            {!loading && !error && trendData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum dado de tendência disponível
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
