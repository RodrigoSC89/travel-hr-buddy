/**
 * Voyage Command Center - Weather Tab
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Wind, Waves, Eye, ThermometerSun, AlertTriangle, RefreshCw } from "lucide-react";
import type { WeatherCondition } from "./types";
import { getWeatherColor, getWeatherBgColor } from "./types";

interface Props {
  weather: WeatherCondition[];
  weatherLoading: boolean;
  onRefresh: () => void;
}

export function VoyageWeatherTab({ weather, weatherLoading, onRefresh }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Condições Meteorológicas — Portos Brasileiros
        </h3>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={weatherLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${weatherLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weatherLoading ? (
          <div className="col-span-full text-center py-12">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando dados meteorológicos em tempo real...</p>
          </div>
        ) : weather.length > 0 ? weather.map((w, idx) => (
          <Card key={`wx-card-${w.location}-${idx}`} className={getWeatherBgColor(w.risk)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {w.risk === "low" && <ThermometerSun className="h-5 w-5 text-green-500" />}
                {w.risk === "medium" && <Cloud className="h-5 w-5 text-amber-500" />}
                {w.risk === "high" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                {w.location}
              </CardTitle>
              <CardDescription>{w.condition}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className={`h-4 w-4 ${getWeatherColor(w.risk)}`} />
                  <span>Vento</span>
                </div>
                <span className="font-bold">{w.windSpeed} nós</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className={`h-4 w-4 ${getWeatherColor(w.risk)}`} />
                  <span>Ondas</span>
                </div>
                <span className="font-bold">{w.waveHeight}m</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className={`h-4 w-4 ${getWeatherColor(w.risk)}`} />
                  <span>Visibilidade</span>
                </div>
                <span className="font-bold">{w.visibility}</span>
              </div>
              <Badge className={`w-full justify-center ${
                w.risk === "low" ? "bg-green-500/20 text-green-600" :
                w.risk === "medium" ? "bg-amber-500/20 text-amber-600" :
                "bg-red-500/20 text-red-600"
              }`}>
                Risco {w.risk === "low" ? "Baixo" : w.risk === "medium" ? "Médio" : "Alto"}
              </Badge>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum dado disponível. Clique em Atualizar para tentar novamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
