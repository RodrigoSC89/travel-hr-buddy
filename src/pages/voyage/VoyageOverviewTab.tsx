/**
 * Voyage Command Center - Overview Tab
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Sparkles, CheckCircle2, Cloud, Wind, Waves, RefreshCw } from "lucide-react";
import type { VoyageRoute, WeatherCondition } from "./types";
import { getStatusColor, getWeatherColor, getWeatherBgColor } from "./types";

interface Props {
  voyages: VoyageRoute[];
  weather: WeatherCondition[];
  weatherLoading: boolean;
}

export function VoyageOverviewTab({ voyages, weather, weatherLoading }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Viagens em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {voyages.filter(v => v.status === "active").map(voyage => (
              <div key={voyage.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{voyage.name}</h4>
                    <p className="text-sm text-muted-foreground">{voyage.vesselName}</p>
                  </div>
                  <Badge className={getStatusColor(voyage.status)}>Em Andamento</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Distância</p>
                    <p className="font-medium">{voyage.distanceNm} nm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ETA</p>
                    <p className="font-medium">{voyage.arrivalDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Combustível</p>
                    <p className="font-medium">{voyage.fuelConsumption}t</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clima</p>
                    <p className={`font-medium ${getWeatherColor(voyage.weatherRisk)}`}>
                      {voyage.weatherRisk === "low" ? "Bom" : voyage.weatherRisk === "medium" ? "Moderado" : "Adverso"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recomendações IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {voyages.flatMap(v => v.aiRecommendations || []).slice(0, 5).map((rec) => (
              <div key={rec} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Condições Meteorológicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {weather.length > 0 ? weather.map((w, idx) => (
              <div key={`wx-${w.location}-${idx}`} className={`p-4 rounded-lg ${getWeatherBgColor(w.risk)}`}>
                <p className="font-medium text-sm">{w.location}</p>
                <p className="text-xs text-muted-foreground mt-1">{w.condition}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Wind className={`h-4 w-4 ${getWeatherColor(w.risk)}`} />
                  <span className="text-sm">{w.windSpeed} nós</span>
                </div>
                <div className="flex items-center gap-2">
                  <Waves className={`h-4 w-4 ${getWeatherColor(w.risk)}`} />
                  <span className="text-sm">{w.waveHeight}m</span>
                </div>
              </div>
            )) : weatherLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-2 animate-spin text-primary" />
                <p>Carregando dados meteorológicos...</p>
              </div>
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Cloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Dados meteorológicos indisponíveis no momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
