/**
 * BunkerPriceWidget Component
 * Compact widget for dashboard showing live bunker prices with opportunity alerts
 * Includes push notification integration for savings > $10k
 */

import { useState, useEffect } from "react";
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
  Bell,
  BellRing,
  CheckCircle2,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { useBunkerPrices } from "@/hooks/useBunkerPrices";
import { useBunkerForecast } from "@/hooks/useBunkerForecast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { bunkerSavingsNotificationService } from "@/lib/notifications/bunker-savings-notification-service";
import { toast } from "sonner";

interface BunkerPriceWidgetProps {
  compact?: boolean;
  showForecast?: boolean;
}

const TrendIcon = ({ trend, className = "h-4 w-4" }: { trend?: "up" | "down" | "stable"; className?: string }) => {
  if (trend === "up") return <TrendingUp className={`${className} text-destructive`} />;
  if (trend === "down") return <TrendingDown className={`${className} text-success`} />;
  return <Minus className={`${className} text-muted-foreground`} />;
};

export function BunkerPriceWidget({ compact = false, showForecast = true }: BunkerPriceWidgetProps) {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastAlertShown, setLastAlertShown] = useState<string | null>(null);
  
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

  // Initialize notification service and check for opportunities
  useEffect(() => {
    const initNotifications = async () => {
      const success = await bunkerSavingsNotificationService.initialize();
      setNotificationsEnabled(success && Notification.permission === "granted");
    };
    initNotifications();
  }, []);

  // Check for savings opportunities when prices update
  useEffect(() => {
    if (!pricesLoading && prices.length > 0 && notificationsEnabled) {
      const checkOpportunities = async () => {
        const alerts = await bunkerSavingsNotificationService.checkOpportunities(
          prices,
          globalAverage,
          500 // estimated tonnage
        );
        
        if (alerts.length > 0 && alerts[0].id !== lastAlertShown) {
          setLastAlertShown(alerts[0].id);
        }
      };
      checkOpportunities();
    }
  }, [prices, globalAverage, pricesLoading, notificationsEnabled, lastAlertShown]);

  const handleEnableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast.success("Notificações de economia bunker ativadas!");
      } else {
        toast.error("Permissão de notificações negada");
      }
    }
  };

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
          hasOpportunity ? "border-success/50 bg-success/5" : ""
        }`}
        onClick={() => navigate("/fuel-manager")}
      >
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${hasOpportunity ? "bg-success/20" : "bg-primary/10"}`}>
                <Fuel className={`h-4 w-4 ${hasOpportunity ? "text-success" : "text-primary"}`} />
              </div>
              <div>
                <p className="text-sm font-medium">VLSFO</p>
                <p className="text-xs text-muted-foreground">Bunker</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">${globalAverage.vlsfo}/MT</p>
              {hasOpportunity && (
                <Badge variant="default" className="bg-success text-xs">
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
    <Card className={hasOpportunity ? "border-success/30" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="h-4 w-4 text-primary" />
            Preços de Bunker
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Notification toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${notificationsEnabled ? "text-success" : "text-muted-foreground"}`}
              onClick={handleEnableNotifications}
              title={notificationsEnabled ? "Alertas ativos (>$10k)" : "Ativar alertas de economia"}
            >
              {notificationsEnabled ? (
                <BellRing className="h-3 w-3" />
              ) : (
                <Bell className="h-3 w-3" />
              )}
            </Button>
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
          <div className="p-2 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-success">
                  Melhor Preço: {cheapestPort.port}
                </p>
                <p className="text-[11px] text-success/80">
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
                  ? "bg-info/10 border-info/20"
                  : bestOpportunity.trend === "up"
                    ? "bg-warning/10 border-warning/20"
                    : "bg-muted/50 border-muted"
              }`}
            >
              <div className="flex items-start gap-2">
                <Sparkles className={`h-4 w-4 mt-0.5 ${
                  bestOpportunity.trend === "down" ? "text-info" : 
                  bestOpportunity.trend === "up" ? "text-warning" : "text-muted-foreground"
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
          <div className="flex items-center justify-between text-xs p-2 bg-success/10 rounded-lg">
            <span className="text-success font-medium">
              💰 Economia potencial (500 MT):
            </span>
            <span className="font-bold text-success">
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
