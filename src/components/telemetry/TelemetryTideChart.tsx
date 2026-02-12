/**
 * TelemetryTideChart - Component for displaying tidal data from StormGlass
 * PATCH 861: StormGlass Integration
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getTidalData } from "@/services/weather/weather-fallback.service";
import { 
  Waves, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Clock,
  Anchor,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from '@/lib/logger';

interface TideExtreme {
  time: string;
  type: 'high' | 'low';
  height: number;
}

interface TelemetryTideChartProps {
  lat?: number;
  lon?: number;
  locationName?: string;
  className?: string;
}

export function TelemetryTideChart({ 
  lat = -22.9068, 
  lon = -43.1729,
  locationName = "Rio de Janeiro",
  className 
}: TelemetryTideChartProps) {
  const [tides, setTides] = useState<TideExtreme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchTides = async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      const endDate = addDays(startDate, 7);
      
      const data = await getTidalData(lat, lon, startDate, endDate);
      setTides(data.extremes || []);
      setLastUpdate(new Date());
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tidal data';
      setError(message);
      logger.error('[TideChart] Error:', err);
      
      // Use mock data as fallback
      setTides(generateMockTides());
      
      toast({
        title: "Dados de marés indisponíveis",
        description: "Usando dados simulados. StormGlass API pode estar offline.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTides();
    // Refresh every 6 hours
    const interval = setInterval(fetchTides, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  const getNextTide = () => {
    const now = new Date();
    return tides.find(tide => parseISO(tide.time) > now);
  };

  const nextTide = getNextTide();

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Waves className="h-5 w-5 text-primary" />
              Previsão de Marés
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Anchor className="h-3 w-3" />
              {locationName}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchTides}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 p-2 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            <span>Dados simulados - API indisponível</span>
          </div>
        )}

        {/* Next Tide Highlight */}
        {nextTide && (
          <div className={cn(
            "p-4 rounded-lg border-2",
            nextTide.type === 'high' 
              ? "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40" 
              : "bg-info/10 border-info/30 dark:bg-info/20 dark:border-info/40"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {nextTide.type === 'high' ? (
                  <TrendingUp className="h-8 w-8 text-primary" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-info" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Próxima Maré</p>
                  <p className="text-2xl font-bold">
                    {nextTide.type === 'high' ? 'ALTA' : 'BAIXA'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{nextTide.height.toFixed(2)}m</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" />
                  {format(parseISO(nextTide.time), "HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tide Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Próximas 24h</h4>
          <div className="space-y-2">
            {tides.slice(0, 6).map((tide) => (
              <div 
                key={`${tide.time}-${tide.type}`}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={tide.type === 'high' ? 'default' : 'secondary'}
                    className={cn(
                      "w-16 justify-center",
                      tide.type === 'high' 
                        ? "bg-primary hover:bg-primary/90" 
                        : "bg-info hover:bg-info/90 text-white"
                    )}
                  >
                    {tide.type === 'high' ? 'Alta' : 'Baixa'}
                  </Badge>
                  <span className="text-sm">
                    {format(parseISO(tide.time), "EEE, dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <span className="font-mono font-medium">
                  {tide.height.toFixed(2)}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <p className="text-xs text-muted-foreground text-center">
            Atualizado: {format(lastUpdate, "dd/MM HH:mm", { locale: ptBR })} • Fonte: StormGlass
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Generate mock tidal data when API is unavailable
 */
function generateMockTides(): TideExtreme[] {
  const tides: TideExtreme[] = [];
  const now = new Date();
  
  // Generate alternating high/low tides every ~6 hours
  for (let i = 0; i < 14; i++) {
    const time = new Date(now.getTime() + (i * 6 * 60 * 60 * 1000));
    tides.push({
      time: time.toISOString(),
      type: i % 2 === 0 ? 'high' : 'low',
      height: i % 2 === 0 
        ? 1.2 + Math.abs(Math.sin(i * 0.7)) * 0.5  // High tide: 1.2-1.7m
        : 0.3 + Math.abs(Math.cos(i * 0.9)) * 0.3,  // Low tide: 0.3-0.6m
    });
  }
  
  return tides;
}

export default TelemetryTideChart;
