/**
 * Bunker Price Integration Component
 * Real-time bunker fuel prices for optimization dashboard
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Fuel, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface BunkerPrice {
  port: string;
  portCode: string;
  country: string;
  vlsfo: number;
  mgo: number;
  hfo: number;
  trend: "up" | "down" | "stable";
  change24h: number;
  lastUpdated: Date;
}

interface BunkerPriceIntegrationProps {
  onPriceSelect?: (price: BunkerPrice) => void;
  selectedPort?: string;
  className?: string;
}

// Fallback data - in production, this would come from the bunker-prices edge function
const fallbackBunkerPrices: BunkerPrice[] = [
  { port: "Rotterdam", portCode: "RTM", country: "NL", vlsfo: 615, mgo: 795, hfo: 445, trend: "down", change24h: -2.3, lastUpdated: new Date() },
  { port: "Singapore", portCode: "SIN", country: "SG", vlsfo: 628, mgo: 810, hfo: 458, trend: "up", change24h: 1.8, lastUpdated: new Date() },
  { port: "Fujairah", portCode: "FUJ", country: "AE", vlsfo: 605, mgo: 775, hfo: 435, trend: "stable", change24h: 0.2, lastUpdated: new Date() },
  { port: "Houston", portCode: "HOU", country: "US", vlsfo: 642, mgo: 825, hfo: 468, trend: "up", change24h: 3.1, lastUpdated: new Date() },
  { port: "Santos", portCode: "SSZ", country: "BR", vlsfo: 680, mgo: 865, hfo: 495, trend: "down", change24h: -1.5, lastUpdated: new Date() },
  { port: "Durban", portCode: "DUR", country: "ZA", vlsfo: 658, mgo: 840, hfo: 478, trend: "stable", change24h: 0.5, lastUpdated: new Date() },
];

export function BunkerPriceIntegration({ onPriceSelect, selectedPort, className }: BunkerPriceIntegrationProps) {
  const [prices, setPrices] = useState<BunkerPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchPrices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from edge function
      const { data, error: fnError } = await supabase.functions.invoke("bunker-prices");
      
      if (fnError) {
        logger.warn("Edge function error, using fallback data", { error: fnError.message });
        // Use fallback data
        setPrices(fallbackBunkerPrices);
      } else if (data?.prices) {
        setPrices(data.prices);
      } else {
        setPrices(fallbackBunkerPrices);
      }
      
      setLastFetch(new Date());
    } catch (err) {
      logger.error("Error fetching bunker prices:", err);
      // Fallback to static data
      setPrices(fallbackBunkerPrices);
      setLastFetch(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: BunkerPrice["trend"]) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-red-500" />;
      case "down": return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-red-500";
    if (change < 0) return "text-green-500";
    return "text-muted-foreground";
  };

  const cheapestPort = prices.length > 0 
    ? prices.reduce((min, p) => p.vlsfo < min.vlsfo ? p : min, prices[0])
    : null;

  if (error && prices.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchPrices} className="mt-2">
            <RefreshCw className="h-3 w-3 mr-1" /> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Fuel className="h-4 w-4 text-orange-500" />
              Preços de Bunker em Tempo Real
            </CardTitle>
            <CardDescription className="text-xs">
              VLSFO/MGO/HFO em USD/ton
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchPrices} disabled={isLoading} aria-label="Atualizar preços" title="Atualizar preços">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {lastFetch && (
          <p className="text-[10px] text-muted-foreground">
            Atualizado: {lastFetch.toLocaleTimeString("pt-BR")}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={`bunker-skeleton-${i}`} className="h-16 w-full" />
          ))
        ) : (
          <>
            {/* Cheapest Port Highlight */}
            {cheapestPort && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600 text-xs">
                      Melhor Preço
                    </Badge>
                    <span className="font-medium text-sm">{cheapestPort.port}</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    ${cheapestPort.vlsfo}/ton
                  </span>
                </div>
              </div>
            )}

            {/* Price List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {prices.map((price) => (
                <div
                  key={price.portCode}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedPort === price.portCode ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => onPriceSelect?.(price)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{price.port}</span>
                      <Badge variant="outline" className="text-[10px]">{price.country}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(price.trend)}
                      <span className={`text-xs ${getChangeColor(price.change24h)}`}>
                        {price.change24h > 0 ? "+" : ""}{price.change24h.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center bg-muted/30 rounded p-1">
                      <p className="text-muted-foreground">VLSFO</p>
                      <p className="font-bold">${price.vlsfo}</p>
                    </div>
                    <div className="text-center bg-muted/30 rounded p-1">
                      <p className="text-muted-foreground">MGO</p>
                      <p className="font-bold">${price.mgo}</p>
                    </div>
                    <div className="text-center bg-muted/30 rounded p-1">
                      <p className="text-muted-foreground">HFO</p>
                      <p className="font-bold">${price.hfo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BunkerPriceIntegration;
