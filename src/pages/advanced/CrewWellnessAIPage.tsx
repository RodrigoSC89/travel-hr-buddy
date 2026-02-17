/**
 * Crew Wellness AI Page
 * Monitoramento de bem-estar mental e físico da tripulação
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Brain, Activity, Users, AlertTriangle, 
  Smile, Frown, Meh, TrendingUp, Clock, Shield
} from "lucide-react";

const CrewWellnessAIPage = () => {
  const overallScore = 78;

  const wellnessMetrics = [
    { name: "Fadiga Geral", score: 72, trend: "up", icon: Clock },
    { name: "Estresse", score: 68, trend: "stable", icon: Brain },
    { name: "Saúde Física", score: 85, trend: "up", icon: Heart },
    { name: "Moral da Equipe", score: 82, trend: "up", icon: Smile },
    { name: "Qualidade do Sono", score: 65, trend: "down", icon: Activity },
    { name: "Engajamento", score: 88, trend: "up", icon: Users }
  ];

  const crewAlerts = [
    { 
      id: 1,
      name: "João Silva", 
      role: "2º Oficial",
      alert: "Horas de descanso abaixo do mínimo MLC",
      severity: "high",
      recommendation: "Ajustar escala para garantir 10h de descanso"
    },
    { 
      id: 2,
      name: "Maria Santos", 
      role: "Eng. Chefe",
      alert: "Indicadores de estresse elevados (survey)",
      severity: "medium",
      recommendation: "Agendar conversa com capitão"
    },
    { 
      id: 3,
      name: "Pedro Lima", 
      role: "Cozinheiro",
      alert: "6 meses a bordo - monitorar bem-estar",
      severity: "low",
      recommendation: "Verificar data de repatriação"
    }
  ];

  const surveyResponses = {
    total: 24,
    responded: 22,
    satisfaction: 4.2,
    topConcerns: [
      "Conexão com família",
      "Qualidade do sono",
      "Variedade de refeições"
    ]
  };

  const getMoodIcon = (score: number) => {
    if (score >= 80) return Smile;
    if (score >= 60) return Meh;
    return Frown;
  };

  const getMoodColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-destructive" />
            Crew Wellness AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento inteligente de bem-estar da tripulação
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-success" />
            IA Preditiva Ativa
          </Badge>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            Novo Survey
          </Button>
        </div>
      </div>

      {/* Overall Wellness Score */}
      <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Índice de Bem-Estar da Tripulação</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Baseado em 6 métricas principais • 24 tripulantes monitorados
              </p>
              <div className="mt-4 flex items-center gap-4">
                {(() => {
                  const MoodIcon = getMoodIcon(overallScore);
                  return <MoodIcon className={`h-8 w-8 ${getMoodColor(overallScore)}`} />;
                })()}
                <div>
                  <Badge className={
                    overallScore >= 80 ? "bg-success" :
                    overallScore >= 60 ? "bg-warning" : "bg-destructive"
                  }>
                    {overallScore >= 80 ? "Excelente" :
                     overallScore >= 60 ? "Bom" : "Requer Atenção"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    fill="none" 
                    strokeDasharray={`${overallScore * 3.02} 302`}
                    className={getMoodColor(overallScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{overallScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {wellnessMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="text-center">
                <metric.icon className={`h-6 w-6 mx-auto mb-2 ${getMoodColor(metric.score)}`} />
                <p className="text-xs text-muted-foreground mb-1">{metric.name}</p>
                <p className={`text-xl font-bold ${getMoodColor(metric.score)}`}>{metric.score}%</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className={`h-3 w-3 ${
                    metric.trend === "up" ? "text-success" :
                    metric.trend === "down" ? "text-destructive rotate-180" :
                    "text-warning"
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {metric.trend === "up" ? "Melhorando" :
                     metric.trend === "down" ? "Piorando" : "Estável"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Alertas IA</TabsTrigger>
          <TabsTrigger value="survey">Surveys</TabsTrigger>
          <TabsTrigger value="fatigue">Fadiga & MLC</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertas de Bem-Estar ({crewAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "high" ? "border-l-destructive bg-destructive/5" :
                      alert.severity === "medium" ? "border-l-warning bg-warning/5" :
                      "border-l-info bg-info/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{alert.name}</p>
                          <Badge variant="outline">{alert.role}</Badge>
                        </div>
                        <p className="text-sm">{alert.alert}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>Recomendação: {alert.recommendation}</span>
                        </div>
                      </div>
                      <Badge className={
                        alert.severity === "high" ? "bg-destructive" :
                        alert.severity === "medium" ? "bg-warning" : "bg-info"
                      }>
                        {alert.severity === "high" ? "Alto" :
                         alert.severity === "medium" ? "Médio" : "Baixo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="survey">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Último Survey de Bem-Estar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Participação</span>
                    <span className="font-bold">{surveyResponses.responded}/{surveyResponses.total} ({Math.round(surveyResponses.responded/surveyResponses.total*100)}%)</span>
                  </div>
                  <Progress value={(surveyResponses.responded/surveyResponses.total)*100} className="h-2" />
                  
                  <div className="flex items-center justify-between pt-4">
                    <span>Satisfação Geral</span>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map((star) => (
                        <span 
                          key={star}
                          className={star <= Math.round(surveyResponses.satisfaction) ? "text-warning" : "text-muted"}
                        >
                          ⭐
                        </span>
                      ))}
                      <span className="font-bold ml-2">{surveyResponses.satisfaction}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Principais Preocupações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {surveyResponses.topConcerns.map((concern, cIdx) => (
                    <div key={concern} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                      <span className="text-lg">{cIdx + 1}.</span>
                      <span>{concern}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Resultados Completos
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fatigue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Monitoramento de Fadiga & Compliance MLC 2006
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sistema de Fadiga Integrado</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Monitoramento contínuo de horas de trabalho/descanso com 
                  predição de fadiga baseada em Machine Learning.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recomendações da IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-success/10 rounded-lg">
                  <h4 className="font-semibold text-success mb-2">✅ Pontos Positivos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Moral da equipe em alta após último evento social</li>
                    <li>• Saúde física melhorou com programa de exercícios</li>
                    <li>• Engajamento aumentou após melhorias na conectividade</li>
                  </ul>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg">
                  <h4 className="font-semibold text-warning mb-2">⚠️ Áreas de Atenção</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Qualidade do sono em declínio - revisar temperatura dos camarotes</li>
                    <li>• 3 tripulantes com mais de 5 meses a bordo - planejar rotações</li>
                    <li>• Níveis de estresse elevados no engine room</li>
                  </ul>
                </div>
                <div className="p-4 bg-info/10 rounded-lg">
                  <h4 className="font-semibold text-info mb-2">💡 Sugestões</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Implementar "Wellness Wednesday" com atividades recreativas</li>
                    <li>• Melhorar menu do rancho com mais opções variadas</li>
                    <li>• Instalar equipamentos de ginástica adicionais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewWellnessAIPage;
