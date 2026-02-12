/**
 * Incident Investigation AI Page
 * Análise de causa raiz com IA e timeline visual
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, Search, Brain, FileText, Users, 
  Clock, Target, CheckCircle, ChevronRight, Activity
} from "lucide-react";

const IncidentInvestigationPage = () => {
  const [analyzing, setAnalyzing] = useState(false);

  const recentIncidents = [
    { 
      id: "INC-2024-001",
      title: "Falha no Sistema de Propulsão",
      date: "2024-01-15",
      severity: "high",
      status: "investigating",
      category: "Mechanical"
    },
    { 
      id: "INC-2024-002",
      title: "Lesão Menor - Escorregão no Convés",
      date: "2024-01-12",
      severity: "low",
      status: "closed",
      category: "Personnel"
    },
    { 
      id: "INC-2024-003",
      title: "Derramamento de Óleo no Engine Room",
      date: "2024-01-08",
      severity: "medium",
      status: "under_review",
      category: "Environmental"
    }
  ];

  const rootCauseAnalysis = {
    incident: "Falha no Sistema de Propulsão",
    immediateResult: "Perda de propulsão por 4 horas",
    directCauses: [
      "Superaquecimento do motor principal",
      "Falha no sistema de refrigeração"
    ],
    contributingFactors: [
      "Manutenção preventiva atrasada em 15 dias",
      "Sensor de temperatura defeituoso não detectado",
      "Procedimento de check inadequado"
    ],
    rootCauses: [
      "Falta de calibração periódica dos sensores",
      "Gaps no programa de manutenção preditiva",
      "Pressão operacional para manter cronograma"
    ],
    recommendations: [
      { action: "Implementar calibração trimestral de sensores", priority: "high", deadline: "30 dias" },
      { action: "Revisar intervalos de manutenção preventiva", priority: "high", deadline: "15 dias" },
      { action: "Treinamento de tripulação em detecção de anomalias", priority: "medium", deadline: "60 dias" }
    ]
  };

  const timeline = [
    { time: "08:00", event: "Início do turno - parâmetros normais", type: "normal" },
    { time: "10:30", event: "Temperatura do motor principal: +5°C acima normal", type: "warning" },
    { time: "11:15", event: "Alarme de temperatura disparado", type: "alert" },
    { time: "11:20", event: "Redução de RPM ordenada", type: "action" },
    { time: "11:45", event: "Desligamento de emergência do motor", type: "critical" },
    { time: "12:00", event: "Equipe de emergência acionada", type: "action" },
    { time: "14:30", event: "Causa identificada: bomba de refrigeração", type: "info" },
    { time: "15:45", event: "Reparo temporário concluído", type: "action" },
    { time: "16:00", event: "Motor reiniciado com sucesso", type: "resolved" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            Incident Investigation AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de causa raiz com IA e timeline visual
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-success" />
            IA Ativa
          </Badge>
          <Button>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reportar Incidente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Em Investigação</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">4.2 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos 2024</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Ações Pendentes</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis">Análise IA</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="actions">Ações Corretivas</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análise de Causa Raiz - {rootCauseAnalysis.incident}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Fishbone Diagram Simplified */}
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Resultado Imediato</h4>
                  <p>{rootCauseAnalysis.immediateResult}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-warning/10 rounded-lg">
                    <h4 className="font-semibold text-warning mb-2">Causas Diretas</h4>
                    <ul className="space-y-1 text-sm">
                      {rootCauseAnalysis.directCauses.map((cause, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-semibold text-accent-foreground mb-2">Fatores Contribuintes</h4>
                    <ul className="space-y-1 text-sm">
                      {rootCauseAnalysis.contributingFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-info/10 rounded-lg">
                    <h4 className="font-semibold text-info mb-2">Causas Raiz (IA)</h4>
                    <ul className="space-y-1 text-sm">
                      {rootCauseAnalysis.rootCauses.map((cause, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Brain className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-success/10 rounded-lg">
                  <h4 className="font-semibold text-success mb-3">Recomendações da IA</h4>
                  <div className="space-y-2">
                    {rootCauseAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="text-sm">{rec.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                            {rec.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{rec.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline do Incidente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                        event.type === "critical" ? "bg-destructive" :
                        event.type === "alert" ? "bg-warning" :
                        event.type === "warning" ? "bg-accent" :
                        event.type === "action" ? "bg-info" :
                        event.type === "resolved" ? "bg-success" :
                        "bg-muted-foreground"
                      }`} />
                      <div className={`p-3 rounded-lg border ${
                        event.type === "critical" ? "border-destructive/50 bg-destructive/5" :
                        event.type === "alert" ? "border-warning/50 bg-warning/5" :
                        event.type === "warning" ? "border-accent/50 bg-accent/5" :
                        event.type === "resolved" ? "border-success/50 bg-success/5" :
                        "border-border"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Incidentes Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <div 
                    key={incident.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        incident.severity === "high" ? "bg-destructive/10" :
                        incident.severity === "medium" ? "bg-warning/10" :
                        "bg-success/10"
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          incident.severity === "high" ? "text-destructive" :
                          incident.severity === "medium" ? "text-warning" :
                          "text-success"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{incident.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{incident.id}</span>
                          <span>•</span>
                          <span>{incident.date}</span>
                          <span>•</span>
                          <Badge variant="outline">{incident.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <Badge className={
                      incident.status === "investigating" ? "bg-warning" :
                      incident.status === "closed" ? "bg-success" :
                      "bg-info"
                    }>
                      {incident.status === "investigating" ? "Em Investigação" :
                       incident.status === "closed" ? "Fechado" : "Em Revisão"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Ações Corretivas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rootCauseAnalysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{rec.action}</p>
                        <p className="text-sm text-muted-foreground">Prazo: {rec.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                        {rec.priority === "high" ? "Alta" : "Média"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Concluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentInvestigationPage;
