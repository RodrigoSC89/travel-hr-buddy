/**
 * Bunker Optimizer Panel - Fuel optimization recommendations
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, DollarSign, MapPin, TrendingDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BunkerPlan {
  vesselId: string;
  totalSavings: number;
  stops: Array<{
    port: string;
    eta: Date;
    quantity: number;
    pricePerTon: number;
    totalCost: number;
    recommended: boolean;
  }>;
  alternativeOptions: number;
  confidence: number;
}

interface BunkerOptimizerPanelProps {
  plan?: BunkerPlan;
  isLoading?: boolean;
  onOptimize?: () => void;
  className?: string;
}

export function BunkerOptimizerPanel({ plan, isLoading, onOptimize, className }: BunkerOptimizerPanelProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded" />)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Bunker Optimizer
          </CardTitle>
          <CardDescription>Otimização de compras de combustível</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configure a rota para otimização</p>
            {onOptimize && (
              <Button onClick={onOptimize} className="mt-4">
                Otimizar Bunkering
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Bunker Optimizer
            </CardTitle>
            <CardDescription>Plano otimizado de bunkering</CardDescription>
          </div>
          <Badge className="bg-green-500 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            ${plan.totalSavings.toLocaleString()} economia
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stops */}
        <div className="space-y-2">
          {plan.stops.map((stop, i) => (
            <div 
              key={i}
              className={cn(
                "p-3 rounded-lg border",
                stop.recommended && "bg-green-500/10 border-green-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stop.port}</span>
                  {stop.recommended && (
                    <Badge className="bg-green-500 text-xs">Recomendado</Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(stop.eta, 'dd/MM HH:mm', { locale: ptBR })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Quantidade</p>
                  <p className="font-medium">{stop.quantity} MT</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Preço/Ton</p>
                  <p className="font-medium">${stop.pricePerTon}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total</p>
                  <p className="font-medium">${stop.totalCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center p-3 bg-muted/50 rounded">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold text-green-500">
              ${plan.totalSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Economia Total</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded">
            <CheckCircle className="h-4 w-4 mx-auto mb-1" />
            <div className="text-lg font-bold">{plan.alternativeOptions}</div>
            <p className="text-xs text-muted-foreground">Opções Analisadas</p>
          </div>
        </div>

        <Button className="w-full" onClick={onOptimize}>
          <Fuel className="h-4 w-4 mr-2" />
          Recalcular Otimização
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Confiança da otimização: {plan.confidence}%
        </p>
      </CardContent>
    </Card>
  );
}

export default BunkerOptimizerPanel;
