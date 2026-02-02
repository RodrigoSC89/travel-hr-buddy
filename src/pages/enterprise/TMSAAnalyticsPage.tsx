/**
 * TMSA Analytics - Página dedicada
 * Tanker Management and Self Assessment analytics
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Ship, Shield, Target, TrendingUp, FileText,
  Download, CheckCircle2, AlertTriangle, Clock
} from "lucide-react";

// Mock TMSA data
const tmsaOverview = {
  overallScore: 87,
  elements: 13,
  kpis: 156,
  bestPractices: 892,
  lastAssessment: "2025-01-15",
  nextAssessment: "2025-04-15",
};

const elementScores = [
  { element: "1 - Management, Leadership & Accountability", score: 92, level: 4, trend: "up" },
  { element: "2 - Recruitment, Management & Training", score: 88, level: 4, trend: "stable" },
  { element: "3 - Reliability & Maintenance Standards", score: 85, level: 3, trend: "up" },
  { element: "4 - Navigational Safety", score: 90, level: 4, trend: "stable" },
  { element: "5 - Cargo, Ballast & Mooring Operations", score: 86, level: 4, trend: "up" },
  { element: "6 - Management of Change", score: 82, level: 3, trend: "down" },
  { element: "7 - Incident Investigation & Analysis", score: 89, level: 4, trend: "stable" },
  { element: "8 - Safety Management", score: 91, level: 4, trend: "up" },
  { element: "9 - Environmental Management", score: 84, level: 3, trend: "up" },
  { element: "10 - Emergency Preparedness", score: 88, level: 4, trend: "stable" },
  { element: "11 - Measurement, Analysis & Improvement", score: 83, level: 3, trend: "up" },
  { element: "12 - Maritime Security", score: 87, level: 4, trend: "stable" },
  { element: "13 - Corporate Social Responsibility", score: 85, level: 3, trend: "up" },
];

const recentActions = [
  { action: "Atualizar procedimentos Element 6", status: "in_progress", priority: "high", due: "2025-02-15" },
  { action: "Treinamento TMSA para oficiais", status: "completed", priority: "medium", due: "2025-01-28" },
  { action: "Revisão KPIs Element 11", status: "pending", priority: "medium", due: "2025-02-28" },
  { action: "Implementar best practices Element 9", status: "in_progress", priority: "high", due: "2025-02-20" },
];

export default function TMSAAnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getLevelColor = (level: number) => {
    switch (level) {
      case 4: return "bg-green-500";
      case 3: return "bg-yellow-500";
      case 2: return "bg-orange-500";
      case 1: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <div className="h-4 w-4 border-t-2 border-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              TMSA Analytics
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                OCIMF
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Tanker Management and Self Assessment - Análise de Conformidade
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Relatório TMSA
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <p className="text-3xl font-bold text-primary">{tmsaOverview.overallScore}%</p>
              </div>
              <Target className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Elementos</p>
                <p className="text-3xl font-bold">{tmsaOverview.elements}</p>
              </div>
              <Shield className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KPIs</p>
                <p className="text-3xl font-bold">{tmsaOverview.kpis}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Practices</p>
                <p className="text-3xl font-bold">{tmsaOverview.bestPractices}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próxima Avaliação</p>
                <p className="text-lg font-bold">{new Date(tmsaOverview.nextAssessment).toLocaleDateString("pt-BR")}</p>
              </div>
              <Clock className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="elements">Elementos</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Score por Elemento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {elementScores.slice(0, 6).map((el, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="truncate flex-1 mr-2">{el.element}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(el.trend)}
                          <span className="font-medium">{el.score}%</span>
                        </div>
                      </div>
                      <Progress value={el.score} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Níveis de Maturidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center mb-6">
                  <div>
                    <div className="w-12 h-12 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl mb-2">
                      8
                    </div>
                    <p className="text-sm">Nível 4</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xl mb-2">
                      5
                    </div>
                    <p className="text-sm">Nível 3</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mx-auto rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl mb-2">
                      0
                    </div>
                    <p className="text-sm">Nível 2</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl mb-2">
                      0
                    </div>
                    <p className="text-sm">Nível 1</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Meta:</strong> Atingir Nível 4 em todos os 13 elementos até Q4 2025
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="elements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Elementos TMSA3</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {elementScores.map((el, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{el.element}</h3>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(el.trend)}
                        <Badge className={getLevelColor(el.level)}>Nível {el.level}</Badge>
                        <span className="font-bold">{el.score}%</span>
                      </div>
                    </div>
                    <Progress value={el.score} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Ações de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(action.status)}`} />
                      <div>
                        <p className="font-medium">{action.action}</p>
                        <p className="text-sm text-muted-foreground">
                          Prazo: {new Date(action.due).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={action.priority === "high" ? "destructive" : "secondary"}>
                        {action.priority === "high" ? "Alta" : "Média"}
                      </Badge>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status === "completed" ? "Concluído" : 
                         action.status === "in_progress" ? "Em Andamento" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Histórica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de tendências será exibido aqui</p>
                  <p className="text-sm">Comparando avaliações trimestrais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
