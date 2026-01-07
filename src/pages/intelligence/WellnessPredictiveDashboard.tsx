/**
 * SAWP - Sistema Autônomo de Wellness Preditivo
 * Dashboard de monitoramento de saúde e bem-estar da tripulação
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  Brain,
  Moon,
  Activity,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Users,
  Smile,
  Frown,
  Meh,
  Bell,
  Calendar,
  CheckCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from "recharts";

// Mock data para crew wellness
const crewMembers = [
  {
    id: "crew-1",
    name: "Carlos Silva",
    role: "Chief Engineer",
    riskScore: 78,
    riskLevel: "high",
    daysToBurnout: 14,
    mood: 2.5,
    sleep: 5.5,
    heartRate: 85,
    hrvTrend: "declining",
    recommendation: "Agendar 5 dias de folga + counseling"
  },
  {
    id: "crew-2",
    name: "Ana Martins",
    role: "2nd Officer",
    riskScore: 45,
    riskLevel: "medium",
    daysToBurnout: 35,
    mood: 3.5,
    sleep: 6.5,
    heartRate: 72,
    hrvTrend: "stable",
    recommendation: "Monitorar próximas 2 semanas"
  },
  {
    id: "crew-3",
    name: "João Pereira",
    role: "Bosun",
    riskScore: 22,
    riskLevel: "low",
    daysToBurnout: null,
    mood: 4.2,
    sleep: 7.5,
    heartRate: 68,
    hrvTrend: "improving",
    recommendation: "Manter rotina atual"
  },
  {
    id: "crew-4",
    name: "Maria Santos",
    role: "Cook",
    riskScore: 62,
    riskLevel: "medium",
    daysToBurnout: 28,
    mood: 3.0,
    sleep: 6.0,
    heartRate: 78,
    hrvTrend: "declining",
    recommendation: "Revisar carga de trabalho"
  }
];

const wellnessTrend = [
  { day: "Seg", mood: 3.8, sleep: 7.0, stress: 45, energy: 72 },
  { day: "Ter", mood: 3.5, sleep: 6.5, stress: 52, energy: 68 },
  { day: "Qua", mood: 3.2, sleep: 6.0, stress: 58, energy: 62 },
  { day: "Qui", mood: 3.0, sleep: 5.8, stress: 62, energy: 58 },
  { day: "Sex", mood: 2.8, sleep: 5.5, stress: 68, energy: 52 },
  { day: "Sáb", mood: 2.6, sleep: 5.2, stress: 72, energy: 48 },
  { day: "Dom", mood: 2.5, sleep: 5.0, stress: 75, energy: 45 }
];

const wellnessRadar = [
  { metric: "Humor", value: 65, fullMark: 100 },
  { metric: "Sono", value: 55, fullMark: 100 },
  { metric: "Energia", value: 60, fullMark: 100 },
  { metric: "Foco", value: 70, fullMark: 100 },
  { metric: "Social", value: 45, fullMark: 100 },
  { metric: "Físico", value: 75, fullMark: 100 }
];

const alerts = [
  { id: 1, type: "critical", crew: "Carlos Silva", message: "Risco de burnout em 14 dias", time: "2h atrás" },
  { id: 2, type: "warning", crew: "Maria Santos", message: "Declínio contínuo de sono", time: "4h atrás" },
  { id: 3, type: "info", crew: "Equipe Geral", message: "Satisfação média caiu 8%", time: "1 dia atrás" }
];

export default function WellnessPredictiveDashboard() {
  const [selectedCrew, setSelectedCrew] = useState(crewMembers[0]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default: return "";
    }
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="h-5 w-5 text-emerald-500" />;
    if (mood >= 3) return <Meh className="h-5 w-5 text-amber-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Heart className="h-8 w-8 text-rose-500" />
            SAWP - Wellness Preditivo
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento e predição de bem-estar da tripulação
          </p>
        </div>
        <Badge variant="outline" className="text-rose-500 border-rose-500">
          <Activity className="h-3 w-3 mr-1" />
          Monitorando 24 tripulantes
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risco Alto</p>
                <p className="text-2xl font-bold text-red-500">3</p>
                <p className="text-xs text-red-400">tripulantes</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risco Médio</p>
                <p className="text-2xl font-bold text-amber-500">7</p>
                <p className="text-xs text-amber-400">tripulantes</p>
              </div>
              <TrendingDown className="h-10 w-10 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saudáveis</p>
                <p className="text-2xl font-bold text-emerald-500">14</p>
                <p className="text-xs text-emerald-400">tripulantes</p>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sono Médio</p>
                <p className="text-2xl font-bold text-blue-500">6.2h</p>
                <p className="text-xs text-blue-400">-0.8h vs ideal</p>
              </div>
              <Moon className="h-10 w-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Tripulantes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tripulação em Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {crewMembers.map((crew) => (
                  <div
                    key={crew.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCrew.id === crew.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    } ${getRiskColor(crew.riskLevel)}`}
                    onClick={() => setSelectedCrew(crew)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{crew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{crew.name}</p>
                        <p className="text-xs text-muted-foreground">{crew.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{crew.riskScore}%</p>
                        {crew.daysToBurnout && (
                          <p className="text-xs text-muted-foreground">
                            {crew.daysToBurnout} dias
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detalhes do Tripulante */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise: {selectedCrew.name}
              </CardTitle>
              <Badge className={getRiskColor(selectedCrew.riskLevel)}>
                Risco {selectedCrew.riskLevel === "high" ? "Alto" : selectedCrew.riskLevel === "medium" ? "Médio" : "Baixo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics" className="space-y-4">
              <TabsList>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
                <TabsTrigger value="trend">Tendência</TabsTrigger>
                <TabsTrigger value="action">Ação</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    {getMoodIcon(selectedCrew.mood)}
                    <p className="text-xs text-muted-foreground mt-1">Humor</p>
                    <p className="text-xl font-bold">{selectedCrew.mood}/5</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Moon className="h-5 w-5 mx-auto text-blue-500" />
                    <p className="text-xs text-muted-foreground mt-1">Sono</p>
                    <p className="text-xl font-bold">{selectedCrew.sleep}h</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Heart className="h-5 w-5 mx-auto text-rose-500" />
                    <p className="text-xs text-muted-foreground mt-1">FC Repouso</p>
                    <p className="text-xl font-bold">{selectedCrew.heartRate}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Activity className="h-5 w-5 mx-auto text-purple-500" />
                    <p className="text-xs text-muted-foreground mt-1">HRV</p>
                    <p className="text-xl font-bold capitalize">{selectedCrew.hrvTrend}</p>
                  </div>
                </div>

                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={wellnessRadar}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Radar name="Wellness" dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="trend">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={wellnessTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                    <Area type="monotone" dataKey="mood" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Humor" />
                    <Area type="monotone" dataKey="stress" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} name="Stress" />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="action" className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-medium text-amber-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Recomendação IA
                  </h4>
                  <p className="mt-2 text-sm">{selectedCrew.recommendation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Folga
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Notificar HSO
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  alert.type === "critical" 
                    ? "bg-red-500/10 border border-red-500/20" 
                    : alert.type === "warning"
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-blue-500/10 border border-blue-500/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  {alert.type === "critical" ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : alert.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Bell className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium">{alert.crew}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                  <Button size="sm" variant="ghost">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
