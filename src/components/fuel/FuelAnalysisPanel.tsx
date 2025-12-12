import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Fuel, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Target,
  Droplets,
  Gauge,
  Ship
} from "lucide-react";

interface VesselFuelData {
  id: string;
  name: string;
  currentConsumption: number;
  targetConsumption: number;
  efficiency: number;
  status: "optimal" | "warning" | "critical";
}

interface FuelAnalysisPanelProps {
  vesselData?: VesselFuelData[];
  averageEfficiency: number;
  totalConsumption: number;
  targetReduction: number;
}

const defaultVesselData: VesselFuelData[] = [
  { id: "1", name: "MV Atlantic Pioneer", currentConsumption: 2.3, targetConsumption: 2.0, efficiency: 87, status: "warning" },
  { id: "2", name: "MV Pacific Explorer", currentConsumption: 1.8, targetConsumption: 2.0, efficiency: 95, status: "optimal" },
  { id: "3", name: "MV Ocean Voyager", currentConsumption: 2.5, targetConsumption: 2.0, efficiency: 80, status: "critical" },
  { id: "4", name: "MV Sea Guardian", currentConsumption: 1.9, targetConsumption: 2.0, efficiency: 92, status: "optimal" },
];

export const FuelAnalysisPanel: React.FC<FuelAnalysisPanelProps> = ({
  vesselData = defaultVesselData,
  averageEfficiency = 88.5,
  totalConsumption = 8500,
  targetReduction = 12,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
    case "optimal":
      return "bg-green-500";
    case "warning":
      return "bg-yellow-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "optimal":
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Ótimo</Badge>;
    case "warning":
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Atenção</Badge>;
    case "critical":
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Crítico</Badge>;
    default:
      return null;
    }
  };

  const getTrendIcon = (current: number, target: number) => {
    if (current < target) return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (current > target) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-500" />
              Eficiência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEfficiency.toFixed(1)}%</div>
            <Progress value={averageEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              Consumo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumption.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Meta de Redução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{targetReduction}%</div>
            <p className="text-xs text-muted-foreground mt-1">Economia planejada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ship className="h-4 w-4 text-purple-500" />
              Embarcações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vesselData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {vesselData.filter(v => v.status === "optimal").length} em nível ótimo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vessel Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Análise por Embarcação
          </CardTitle>
          <CardDescription>
            Consumo e eficiência de combustível por embarcação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vesselData.map((vessel) => (
              <div
                key={vessel.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${getStatusColor(vessel.status)}`} />
                  <div>
                    <p className="font-medium">{vessel.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Consumo: {vessel.currentConsumption.toFixed(1)} MT/dia</span>
                      {getTrendIcon(vessel.currentConsumption, vessel.targetConsumption)}
                      <span>Meta: {vessel.targetConsumption.toFixed(1)} MT/dia</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{vessel.efficiency}%</p>
                    <p className="text-xs text-muted-foreground">Eficiência</p>
                  </div>
                  {getStatusBadge(vessel.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
