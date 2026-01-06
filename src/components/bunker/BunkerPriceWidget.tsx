/**
 * BunkerPriceWidget Component
 * Compact widget for dashboard showing live bunker prices with opportunity alerts
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  ExternalLink,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { useBunkerPrices } from "@/hooks/useBunkerPrices";
import { useBunkerForecast } from "@/hooks/useBunkerForecast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface BunkerPriceWidgetProps {
  compact?: boolean;
  showForecast?: boolean;
}

const TrendIcon = ({ trend, className = "h-4 w-4" }: { trend?: "up" | "down" | "stable"; className?: string }) => {
  if (trend === "up") return <TrendingUp className={`${className} text-destructive`} />;
  if (trend === "down") return <TrendingDown className={`${className} text-green-500`} />;
  return <Minus className={`${className} text-muted-foreground`} />;
};

export function BunkerPriceWidget({ compact = false, showForecast = true }: BunkerPriceWidgetProps) {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    globalAverage, 
    prices, 
    isLoading: pricesLoading, 
    lastUpdated,
    source,
    refetch: refetchPrices,
    getCheapestPort
  } = useBunkerPrices();

  const {
    forecasts,
    isLoading: forecastLoading,
    getBestOpportunity,
    refetch: refetchForecast
  } = useBunkerForecast({ enabled: showForecast });

  const isLoading = pricesLoading || (showForecast && forecastLoading);
  const cheapestPort = getCheapestPort("vlsfo");
  const bestOpportunity = showForecast ? getBestOpportunity() : null;

  // Calculate potential savings
  const avgVLSFO = globalAverage.vlsfo;
  const cheapestVLSFO = cheapestPort?.vlsfo ?? avgVLSFO;
  const savingsPerTon = avgVLSFO - cheapestVLSFO;
  const potentialSavings = savingsPerTon * 500; // Assume 500 MT typical bunker

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchPrices(), showForecast && refetchForecast()]);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Determine if there's a savings opportunity
  const hasOpportunity = savingsPerTon > 10 || bestOpportunity?.trend === "down";

  if (compact) {
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          hasOpportunity ? "border-green-500/50 bg-green-500/5" : ""
        }`}
        onClick={() => navigate("/fuel-manager")}
      >
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${hasOpportunity ? "bg-green-500/20" : "bg-primary/10"}`}>
                <Fuel className={`h-4 w-4 ${hasOpportunity ? "text-green-600" : "text-primary"}`} />
              </div>
              <div>
                <p className="text-sm font-medium">VLSFO</p>
                <p className="text-xs text-muted-foreground">Bunker</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">${globalAverage.vlsfo}/MT</p>
              {hasOpportunity && (
                <Badge variant="default" className="bg-green-500 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Economia
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={hasOpportunity ? "border-green-500/30" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="h-4 w-4 text-primary" />
            Preços de Bunker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Badge variant="outline" className="text-xs">
              {source === "Nautilus Market Data" ? "Tempo Real" : source}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Main Prices */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-primary/5 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase">VLSFO</p>
            <p className="text-lg font-bold">${globalAverage.vlsfo}</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase">MGO</p>
            <p className="text-lg font-bold">${globalAverage.mgo}</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase">HFO</p>
            <p className="text-lg font-bold">${globalAverage.hfo}</p>
          </div>
        </div>

        {/* Cheapest Port Alert */}
        {cheapestPort && savingsPerTon > 5 && (
          <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  Melhor Preço: {cheapestPort.port}
                </p>
                <p className="text-[11px] text-green-600">
                  VLSFO ${cheapestPort.vlsfo}/MT • Economia de ${savingsPerTon}/MT
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Forecast Alert */}
        <AnimatePresence>
          {showForecast && bestOpportunity && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-2 rounded-lg border ${
                bestOpportunity.trend === "down"
                  ? "bg-blue-500/10 border-blue-500/20"
                  : bestOpportunity.trend === "up"
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-muted/50 border-muted"
              }`}
            >
              <div className="flex items-start gap-2">
                <Sparkles className={`h-4 w-4 mt-0.5 ${
                  bestOpportunity.trend === "down" ? "text-blue-600" : 
                  bestOpportunity.trend === "up" ? "text-amber-600" : "text-muted-foreground"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium flex items-center gap-1">
                    Previsão IA (7 dias)
                    <TrendIcon trend={bestOpportunity.trend} className="h-3 w-3" />
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {bestOpportunity.trend === "down" 
                      ? `Queda esperada em ${bestOpportunity.port} - aguardar`
                      : bestOpportunity.trend === "up"
                        ? `Alta prevista - antecipar bunker`
                        : `Mercado estável`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Potential Savings */}
        {potentialSavings > 1000 && (
          <div className="flex items-center justify-between text-xs p-2 bg-emerald-500/10 rounded-lg">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              💰 Economia potencial (500 MT):
            </span>
            <span className="font-bold text-emerald-600">
              ${potentialSavings.toLocaleString()}
            </span>
          </div>
        )}

        {/* View More */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => navigate("/fuel-manager")}
        >
          Ver análise completa
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default BunkerPriceWidget;
