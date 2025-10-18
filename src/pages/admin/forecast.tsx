import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { TrendingUp, Calendar, BarChart } from "lucide-react";

const AdminForecast = () => {
  // Sample trend data for demonstration
  const trendData = [
    { month: "Jan", total_jobs: 45 },
    { month: "Fev", total_jobs: 52 },
    { month: "Mar", total_jobs: 48 },
    { month: "Abr", total_jobs: 61 },
    { month: "Mai", total_jobs: 58 },
    { month: "Jun", total_jobs: 65 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Previsões IA</h1>
          <p className="text-muted-foreground mt-1">
            Análise preditiva de jobs e tendências com inteligência artificial
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análise Preditiva</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GPT-4</div>
            <p className="text-xs text-muted-foreground">
              Modelo de IA ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período de Análise</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 Meses</div>
            <p className="text-xs text-muted-foreground">
              Histórico analisado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de acurácia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Component */}
      <Card>
        <CardHeader>
          <CardTitle>Previsão de Jobs</CardTitle>
          <CardDescription>
            Análise preditiva baseada em tendências históricas usando GPT-4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobsForecastReport trend={trendData} />
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
          <CardDescription>
            Entenda o processo de análise preditiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Coleta de Dados</h4>
              <p className="text-sm text-muted-foreground">
                O sistema analisa histórico de jobs dos últimos 6 meses, incluindo volumes, tipos e padrões sazonais.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Análise com IA</h4>
              <p className="text-sm text-muted-foreground">
                GPT-4 processa os dados identificando tendências, anomalias e padrões que humanos podem não perceber.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Geração de Previsões</h4>
              <p className="text-sm text-muted-foreground">
                Com base na análise, o sistema gera previsões para os próximos períodos com indicadores de confiança.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Ações Recomendadas</h4>
              <p className="text-sm text-muted-foreground">
                A IA sugere ações preventivas e melhorias com base nas previsões e nas melhores práticas do setor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminForecast;
