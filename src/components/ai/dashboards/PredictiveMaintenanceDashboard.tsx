/**
 * Predictive Maintenance Dashboard
 * Visualizes equipment failure predictions and maintenance schedules
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePredictiveMaintenance } from "@/hooks/ai/usePredictiveMaintenance";
import type { EquipmentTelemetry, FailurePrediction } from "@/lib/ai/engines/predictive-maintenance-onnx";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Activity,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";

// Mock telemetry data for demo
const mockTelemetry: EquipmentTelemetry[] = [
  {
    equipmentId: "pump-001",
    temperature: 78,
    vibration: 4.2,
    pressure: 145,
    runningHours: 12500,
    lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    sensorReadings: { temp: 78, vib: 4.2 }
  },
  {
    equipmentId: "engine-main",
    temperature: 92,
    vibration: 6.8,
    pressure: 220,
    runningHours: 25000,
    lastMaintenance: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    sensorReadings: { temp: 92, vib: 6.8 }
  },
  {
    equipmentId: "generator-aux",
    temperature: 65,
    vibration: 2.1,
    pressure: 100,
    runningHours: 8000,
    lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    sensorReadings: { temp: 65, vib: 2.1 }
  }
];

export function PredictiveMaintenanceDashboard() {
  const { 
    isLoading, 
    predictions, 
    schedule, 
    batchPredict, 
    generateSchedule,
    clearPredictions 
  } = usePredictiveMaintenance();
  
  const [activeTab, setActiveTab] = useState("predictions");

  const handleRunAnalysis = async () => {
    const results = await batchPredict(mockTelemetry);
    if (results.length > 0) {
      generateSchedule(results);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manutenção Preditiva ONNX</h2>
          <p className="text-muted-foreground">
            Análise de falhas com ML local e telemetria em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearPredictions}
            disabled={predictions.length === 0}
          >
            Limpar
          </Button>
          <Button onClick={handleRunAnalysis} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Executar Análise
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Analisados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risco Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {predictions.filter(p => p.riskLevel === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Ação imediata</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedule.length}</div>
            <p className="text-xs text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiabilidade</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictions.length > 0 
                ? Math.round(predictions.reduce((acc, p) => acc + (100 - p.failureProbability), 0) / predictions.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Média da frota</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="schedule">Cronograma</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predictions" className="space-y-4">
          {predictions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Clique em "Executar Análise" para analisar equipamentos
                </p>
              </CardContent>
            </Card>
          ) : (
            predictions.map((prediction: FailurePrediction) => (
              <Card key={prediction.equipmentId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {prediction.equipmentId}
                        <Badge className={getRiskColor(prediction.riskLevel)}>
                          {getRiskIcon(prediction.riskLevel)}
                          <span className="ml-1">{prediction.riskLevel.toUpperCase()}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Previsão: {prediction.daysUntilFailure ?? "N/A"} dias até falha potencial
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {prediction.failureProbability}%
                      </div>
                      <p className="text-xs text-muted-foreground">Prob. de Falha</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Probabilidade de Falha</span>
                      <span>{prediction.failureProbability}%</span>
                    </div>
                    <Progress 
                      value={prediction.failureProbability} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Componentes Afetados:</p>
                    <div className="flex flex-wrap gap-2">
                      {prediction.affectedComponents.map((component: string, idx: number) => (
                        <Badge key={idx} variant="outline">{component}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Ações Recomendadas:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {prediction.recommendedActions.map((action: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          {schedule.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Execute a análise para gerar o cronograma de manutenção
                </p>
              </CardContent>
            </Card>
          ) : (
            schedule.map((item) => (
              <Card key={item.equipmentId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{item.equipmentId}</CardTitle>
                    <Badge variant={item.priority === "urgent" ? "destructive" : "secondary"}>
                      {item.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    {item.maintenanceType} - {item.estimatedDuration}h estimadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Data Agendada</p>
                      <p className="text-sm text-muted-foreground">
                        {item.scheduledDate.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Custo Estimado</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.estimatedCost.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Peças Necessárias</p>
                      <div className="flex flex-wrap gap-1">
                        {item.requiredParts.slice(0, 3).map((part: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {part}
                          </Badge>
                        ))}
                        {item.requiredParts.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.requiredParts.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
