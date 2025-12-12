import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Wind, Waves, Eye, AlertTriangle } from "lucide-react";
import type { WeatherCondition } from "../types";

interface WeatherPanelProps {
  conditions: WeatherCondition[];
}

const WeatherPanel: React.FC<WeatherPanelProps> = ({ conditions }) => {
  const getRiskStyle = (risk: WeatherCondition["risk"]) => {
    const styles = {
      low: "bg-green-500/10 text-green-500 border-green-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      high: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[risk];
  });

  const getRiskLabel = (risk: WeatherCondition["risk"]) => {
    const labels = { low: "Baixo Risco", medium: "Médio Risco", high: "Alto Risco" };
    return labels[risk];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Condições Meteorológicas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{condition.location}</h4>
                  <Badge variant="outline" className={getRiskStyle(condition.risk)}>
                    {condition.risk === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {getRiskLabel(condition.risk)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{condition.condition}</p>
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1" title="Velocidade do vento">
                  <Wind className="w-4 h-4" />
                  <span>{condition.windSpeed} nós</span>
                </div>
                <div className="flex items-center gap-1" title="Altura das ondas">
                  <Waves className="w-4 h-4" />
                  <span>{condition.waveHeight}m</span>
                </div>
                <div className="flex items-center gap-1" title="Visibilidade">
                  <Eye className="w-4 h-4" />
                  <span>{condition.visibility}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherPanel;
