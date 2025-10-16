import React from "react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Brain, LineChart } from "lucide-react";

const Forecast = () => {
  // Sample trend data for demonstration
  const [trend] = React.useState([
    { month: "Jan", total_jobs: 45 },
    { month: "Fev", total_jobs: 52 },
    { month: "Mar", total_jobs: 48 },
    { month: "Abr", total_jobs: 61 },
    { month: "Mai", total_jobs: 55 },
    { month: "Jun", total_jobs: 67 },
  ]);

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={TrendingUp}
        title="Previsões e Forecast"
        description="Análises preditivas e forecasting de jobs usando IA"
        gradient="purple"
        badges={[
          { icon: Brain, label: "IA Preditiva" },
          { icon: LineChart, label: "Análise de Tendências" },
          { icon: Calendar, label: "Forecast Mensal" }
        ]}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Previsão de Jobs</CardTitle>
            <CardDescription>
              Análise preditiva baseada em dados históricos e tendências de mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobsForecastReport trend={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
            <CardDescription>
              Recomendações baseadas em análises de IA para otimização de recursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Insights em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                Análises avançadas de IA serão disponibilizadas em breve
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
};

export default Forecast;
