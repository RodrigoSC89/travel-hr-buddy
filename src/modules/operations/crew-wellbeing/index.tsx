import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Users, TrendingUp, Brain } from "lucide-react";
import { HealthCheckIn } from "./components/HealthCheckIn";
import { AIInsights } from "./components/AIInsights";

const CrewWellbeing = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Crew Wellbeing</h1>
          <p className="text-sm text-muted-foreground">Sistema inteligente de monitoramento de saúde e bem-estar</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bem-Estar Geral</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Score positivo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Análises IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Insights gerados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">Melhoria anual</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthCheckIn />
        <AIInsights />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🧬 Sobre o Sistema de Bem-Estar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Sistema inteligente de monitoramento de saúde e bem-estar da tripulação, com análise por IA e recomendações personalizadas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🔒 Privacidade Total</h4>
              <p className="text-sm text-muted-foreground">
                Dados confidenciais, visíveis apenas pelo tripulante. RH recebe apenas alertas críticos.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🧠 IA Empática</h4>
              <p className="text-sm text-muted-foreground">
                Análise contextual com recomendações de pausas, rotações e ações preventivas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewWellbeing;
