/**
 * Voyage Command Center - Voyages List Tab
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Anchor, Navigation, Clock, Fuel, DollarSign, Calendar, Cloud, Sparkles, CheckCircle2, Brain, Eye, Trash2 } from "lucide-react";
import type { VoyageRoute } from "./types";
import { getStatusColor, getWeatherColor } from "./types";

interface Props {
  voyages: VoyageRoute[];
  isOptimizing: boolean;
  onOptimize: (id: string) => void;
  onViewDetails: (voyage: VoyageRoute) => void;
  onDelete: (id: string) => void;
}

export function VoyageListTab({ voyages, isOptimizing, onOptimize, onViewDetails, onDelete }: Props) {
  return (
    <div className="space-y-4">
      {voyages.map(voyage => (
        <Card key={voyage.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5" />
                  {voyage.name}
                </CardTitle>
                <CardDescription>{voyage.vesselName}</CardDescription>
              </div>
              <Badge className={getStatusColor(voyage.status)}>
                {voyage.status === "planned" && "Planejada"}
                {voyage.status === "active" && "Em Andamento"}
                {voyage.status === "completed" && "Concluída"}
                {voyage.status === "cancelled" && "Cancelada"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-medium">{voyage.distanceNm} nm</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="font-medium">{voyage.estimatedDays} dias</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Combustível</p>
                  <p className="font-medium">{voyage.fuelConsumption}t</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Custo Est.</p>
                  <p className="font-medium">R$ {((voyage.estimatedCost || 0) / 1000).toFixed(0)}k</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Partida</p>
                  <p className="font-medium">{voyage.departureDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className={`h-4 w-4 ${getWeatherColor(voyage.weatherRisk)}`} />
                <div>
                  <p className="text-xs text-muted-foreground">Risco Clima</p>
                  <p className={`font-medium ${getWeatherColor(voyage.weatherRisk)}`}>
                    {voyage.weatherRisk === "low" && "Baixo"}
                    {voyage.weatherRisk === "medium" && "Médio"}
                    {voyage.weatherRisk === "high" && "Alto"}
                  </p>
                </div>
              </div>
            </div>

            {voyage.aiRecommendations && voyage.aiRecommendations.length > 0 && (
              <>
                <Separator />
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Recomendações IA</span>
                  </div>
                  <ul className="space-y-1">
                    {voyage.aiRecommendations.map((rec, idx) => (
                      <li key={`voy-rec-${idx}-${rec.slice(0, 15)}`} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOptimize(voyage.id)}
                disabled={isOptimizing || voyage.status === "completed" || voyage.status === "cancelled"}
              >
                <Brain className="h-4 w-4 mr-2" />
                {isOptimizing ? "Otimizando..." : "Otimizar com IA"}
              </Button>
              <Button variant="outline" onClick={() => onViewDetails(voyage)}>
                <Eye className="h-4 w-4 mr-2" />
                Detalhes
              </Button>
              <Button variant="outline" className="text-destructive" onClick={() => onDelete(voyage.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
