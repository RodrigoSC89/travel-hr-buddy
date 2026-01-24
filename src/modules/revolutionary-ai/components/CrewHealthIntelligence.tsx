/**
 * Crew Health Intelligence System
 * PATCH REVOLUTION v1.0
 * Biometrics & Predictive Health Monitoring
 * Integrated with Supabase
 */
import { useState, useEffect } from "react";
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
  Frown, Meh, Battery, Droplets, Wind, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useCrewWellness, type CrewWellnessData, type WellnessAlert } from "@/hooks/useCrewData";

interface HealthAlert {
  id: string;
  type: "cardiac" | "fatigue" | "mental" | "sleep" | "stress";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  recommendation: string;
  timestamp: string;
}

// Design token helper functions
const getHealthColor = (value: number, thresholds: { low: number; high: number }) => {
  if (value < thresholds.low) return "text-warning";
  if (value > thresholds.high) return "text-destructive";
  return "text-primary";
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
    case "high": return "bg-warning/10 text-warning border-warning/30";
    case "medium": return "bg-accent/10 text-accent border-accent/30";
    default: return "bg-primary/10 text-primary border-primary/30";
  }
};

export function CrewHealthIntelligence() {
  // Fetch real crew wellness data from Supabase
  const { data: crewWellnessData = [], isLoading } = useCrewWellness();
  const [selectedCrew, setSelectedCrew] = useState<CrewWellnessData | null>(null);

  // Set selected crew when data loads
  useEffect(() => {
    if (crewWellnessData.length > 0 && !selectedCrew) {
      setSelectedCrew(crewWellnessData[0]);
    }
  }, [crewWellnessData.length]);

  const criticalAlerts = crewWellnessData.flatMap((c: CrewWellnessData) => 
    c.alerts.filter((a: WellnessAlert) => a.severity === "critical" || a.severity === "high")
  );

  const crewWithConcerns = crewWellnessData.filter((c: CrewWellnessData) => 
    c.mentalState === "concern" || c.fatigueScore > 70
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados de saúde...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-destructive" />
            Crew Health Intelligence
          </h2>
          <p className="text-muted-foreground">
            Monitoramento biométrico e saúde preditiva
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Activity className="h-3 w-3 mr-1" />
            {crewWellnessData.filter((c: CrewWellnessData) => c.mentalState === "good").length} Saudáveis
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {crewWithConcerns.length} Atenção
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Alertas Críticos de Saúde</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {criticalAlerts.map((alert: WellnessAlert) => (
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
        {crewWellnessData.map((crew: CrewWellnessData) => (
          <motion.div
            key={crew.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                crew.alerts.some((a: WellnessAlert) => a.severity === "critical") 
                  ? "border-destructive/50 bg-destructive/5" 
                  : crew.mentalState === "concern"
                  ? "border-warning/50 bg-warning/5"
                  : ""
              }`}
              onClick={() => setSelectedCrew(crew)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={
                        crew.mentalState === "good" ? "bg-primary" :
                        crew.mentalState === "concern" ? "bg-destructive" : "bg-warning"
                      }>
                        {crew.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{crew.name}</h4>
                      <p className="text-xs text-muted-foreground">{crew.role}</p>
                    </div>
                  </div>
                  {crew.mentalState === "good" && <Smile className="h-5 w-5 text-primary" />}
                  {crew.mentalState === "concern" && <Frown className="h-5 w-5 text-destructive" />}
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
