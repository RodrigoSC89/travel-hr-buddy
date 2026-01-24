/**
 * Crew Health Intelligence System
 * PATCH REVOLUTION v1.0
 * Biometrics & Predictive Health Monitoring
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Heart, Activity, Brain, Moon, Thermometer, 
  AlertTriangle, TrendingUp, TrendingDown, Zap,
  Phone, Video, Shield, Clock, Users, Smile,
  Frown, Meh, Battery, Droplets, Wind
} from "lucide-react";
import { motion } from "framer-motion";

interface CrewHealthData {
  id: string;
  name: string;
  role: string;
  heartRate: number;
  heartRateStatus: "normal" | "elevated" | "low";
  hrv: number;
  hrvTrend: "up" | "down" | "stable";
  sleepQuality: number;
  sleepHours: number;
  stressLevel: number;
  spO2: number;
  temperature: number;
  fatigueScore: number;
  mentalState: "good" | "neutral" | "concern";
  alerts: HealthAlert[];
  lastSync: string;
}

interface HealthAlert {
  id: string;
  type: "cardiac" | "fatigue" | "mental" | "sleep" | "stress";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  recommendation: string;
  timestamp: string;
}

const mockCrewHealth: CrewHealthData[] = [
  {
    id: "1",
    name: "Carlos Ferreira",
    role: "Chief Engineer",
    heartRate: 78,
    heartRateStatus: "normal",
    hrv: 45,
    hrvTrend: "stable",
    sleepQuality: 85,
    sleepHours: 7.5,
    stressLevel: 35,
    spO2: 98,
    temperature: 36.5,
    fatigueScore: 25,
    mentalState: "good",
    alerts: [],
    lastSync: "2025-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "2nd Officer",
    heartRate: 92,
    heartRateStatus: "elevated",
    hrv: 32,
    hrvTrend: "down",
    sleepQuality: 45,
    sleepHours: 4.5,
    stressLevel: 75,
    spO2: 97,
    temperature: 37.1,
    fatigueScore: 72,
    mentalState: "concern",
    alerts: [
      {
        id: "a1",
        type: "fatigue",
        severity: "high",
        message: "Fadiga elevada detectada - 4 dias consecutivos com sono insuficiente",
        recommendation: "Reduzir carga de trabalho e priorizar descanso",
        timestamp: "2025-01-20T10:00:00Z",
      },
      {
        id: "a2",
        type: "stress",
        severity: "medium",
        message: "Níveis de estresse acima da média",
        recommendation: "Considerar sessão de teleconsulta com psicólogo",
        timestamp: "2025-01-20T08:00:00Z",
      },
    ],
    lastSync: "2025-01-20T14:25:00Z",
  },
  {
    id: "3",
    name: "João Lima",
    role: "Chief Officer",
    heartRate: 68,
    heartRateStatus: "normal",
    hrv: 55,
    hrvTrend: "up",
    sleepQuality: 92,
    sleepHours: 8.2,
    stressLevel: 20,
    spO2: 99,
    temperature: 36.4,
    fatigueScore: 15,
    mentalState: "good",
    alerts: [],
    lastSync: "2025-01-20T14:28:00Z",
  },
  {
    id: "4",
    name: "Pedro Costa",
    role: "Bosun",
    heartRate: 105,
    heartRateStatus: "elevated",
    hrv: 28,
    hrvTrend: "down",
    sleepQuality: 38,
    sleepHours: 3.5,
    stressLevel: 85,
    spO2: 96,
    temperature: 37.3,
    fatigueScore: 88,
    mentalState: "concern",
    alerts: [
      {
        id: "a3",
        type: "cardiac",
        severity: "critical",
        message: "HRV em declínio 30% nos últimos 14 dias - risco cardiovascular elevado",
        recommendation: "Evacuação médica recomendada para avaliação cardiológica",
        timestamp: "2025-01-20T06:00:00Z",
      },
    ],
    lastSync: "2025-01-20T14:20:00Z",
  },
];

const getHealthColor = (value: number, thresholds: { low: number; high: number }) => {
  if (value < thresholds.low) return "text-yellow-500";
  if (value > thresholds.high) return "text-red-500";
  return "text-green-500";
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-red-500/10 text-red-500 border-red-500/30";
    case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
    case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
    default: return "bg-blue-500/10 text-blue-500 border-blue-500/30";
  }
};

export function CrewHealthIntelligence() {
  const [selectedCrew, setSelectedCrew] = useState<CrewHealthData | null>(null);

  const criticalAlerts = mockCrewHealth.flatMap(c => 
    c.alerts.filter(a => a.severity === "critical")
  );

  const crewWithConcerns = mockCrewHealth.filter(c => 
    c.mentalState === "concern" || c.fatigueScore > 70
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Crew Health Intelligence
          </h2>
          <p className="text-muted-foreground">
            Monitoramento biométrico e saúde preditiva
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-500">
            <Activity className="h-3 w-3 mr-1" />
            {mockCrewHealth.filter(c => c.mentalState === "good").length} Saudáveis
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {crewWithConcerns.length} Atenção
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Alertas Críticos de Saúde</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Button size="sm" variant="destructive">
                  <Phone className="h-4 w-4 mr-1" />
                  Emergência
                </Button>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Crew Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockCrewHealth.map((crew) => (
          <motion.div
            key={crew.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                crew.alerts.some(a => a.severity === "critical") 
                  ? "border-red-500/50 bg-red-500/5" 
                  : crew.mentalState === "concern"
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : ""
              }`}
              onClick={() => setSelectedCrew(crew)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={
                        crew.mentalState === "good" ? "bg-green-500" :
                        crew.mentalState === "neutral" ? "bg-yellow-500" : "bg-red-500"
                      }>
                        {crew.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{crew.name}</h4>
                      <p className="text-xs text-muted-foreground">{crew.role}</p>
                    </div>
                  </div>
                  {crew.mentalState === "good" && <Smile className="h-5 w-5 text-green-500" />}
                  {crew.mentalState === "neutral" && <Meh className="h-5 w-5 text-yellow-500" />}
                  {crew.mentalState === "concern" && <Frown className="h-5 w-5 text-red-500" />}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Heart className={`h-3 w-3 ${
                      crew.heartRateStatus === "normal" ? "text-green-500" : "text-red-500"
                    }`} />
                    <span>{crew.heartRate} bpm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className={`h-3 w-3 ${
                      crew.sleepQuality > 60 ? "text-blue-500" : "text-yellow-500"
                    }`} />
                    <span>{crew.sleepHours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Battery className={`h-3 w-3 ${
                      crew.fatigueScore < 50 ? "text-green-500" : "text-red-500"
                    }`} />
                    <span>{100 - crew.fatigueScore}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className={`h-3 w-3 ${
                      crew.stressLevel < 50 ? "text-green-500" : "text-orange-500"
                    }`} />
                    <span>{100 - crew.stressLevel}%</span>
                  </div>
                </div>

                {crew.alerts.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="outline" className={getSeverityColor(crew.alerts[0].severity)}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {crew.alerts.length} alerta{crew.alerts.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedCrew && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Detalhes - {selectedCrew.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Video className="h-4 w-4 mr-1" />
                  Teleconsulta
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-1" />
                  Contatar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{selectedCrew.heartRate}</div>
                <div className="text-xs text-muted-foreground">BPM</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Activity className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{selectedCrew.hrv}</div>
                <div className="text-xs text-muted-foreground">HRV</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Droplets className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{selectedCrew.spO2}%</div>
                <div className="text-xs text-muted-foreground">SpO2</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Thermometer className="h-6 w-6 mx-auto mb-2 text-warning" />
                <div className="text-2xl font-bold">{selectedCrew.temperature}°</div>
                <div className="text-xs text-muted-foreground">Temp</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Moon className="h-6 w-6 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">{selectedCrew.sleepQuality}%</div>
                <div className="text-xs text-muted-foreground">Sono</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Brain className="h-6 w-6 mx-auto mb-2 text-success" />
                <div className="text-2xl font-bold">{100 - selectedCrew.stressLevel}%</div>
                <div className="text-xs text-muted-foreground">Bem-estar</div>
              </div>
            </div>

            {/* Alerts for selected crew */}
            {selectedCrew.alerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas Ativos
                </h4>
                {selectedCrew.alerts.map(alert => (
                  <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="capitalize">{alert.type} - {alert.severity}</AlertTitle>
                    <AlertDescription>
                      <p>{alert.message}</p>
                      <p className="mt-2 font-medium">Recomendação: {alert.recommendation}</p>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
