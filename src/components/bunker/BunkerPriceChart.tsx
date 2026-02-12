/**
 * BunkerPriceChart Component
 * Displays 30-day historical bunker price trends with interactive charts
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus, Fuel, Calendar, DollarSign } from "lucide-react";
import { useBunkerPriceHistory } from "@/hooks/useBunkerPriceHistory";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BunkerPriceChartProps {
  defaultPort?: string;
  showPortSelector?: boolean;
  height?: number;
}

const FUEL_COLORS = {
  vlsfo: "hsl(var(--primary))",
  mgo: "hsl(var(--chart-2))",
  hfo: "hsl(var(--chart-3))",
};

const FUEL_LABELS = {
  vlsfo: "VLSFO",
  mgo: "MGO",
  hfo: "HFO",
};

export function BunkerPriceChart({ 
  defaultPort = "Singapore", 
  showPortSelector = true,
  height = 300 
}: BunkerPriceChartProps) {
  const [selectedPort, setSelectedPort] = useState(defaultPort);
  const [selectedFuel, setSelectedFuel] = useState<"vlsfo" | "mgo" | "hfo">("vlsfo");

  const { 
    history, 
    isLoading, 
    availablePorts,
    stats,
    getTrendIcon 
  } = useBunkerPriceHistory({ port: selectedPort });

  const TrendIcon = getTrendIcon(selectedFuel);

  const formatTooltipValue = (value: number) => `$${value.toFixed(0)}/MT`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Recharts tooltip props are untyped
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {format(new Date(label ?? ''), "dd MMM yyyy", { locale: ptBR })}
        </p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">{FUEL_LABELS[entry.dataKey as keyof typeof FUEL_LABELS]}</span>
            </span>
            <span className="font-mono font-medium">${entry.value}/MT</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentStats = stats[selectedFuel];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Histórico de Preços - Bunker
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3" />
              Tendência de 30 dias por porto
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {showPortSelector && (
              <Select value={selectedPort} onValueChange={setSelectedPort}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Porto" />
                </SelectTrigger>
                <SelectContent>
                  {availablePorts.map((port) => (
                    <SelectItem key={port} value={port}>
                      {port}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedFuel} onValueChange={(v) => setSelectedFuel(v as "vlsfo" | "mgo" | "hfo")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Combustível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vlsfo">VLSFO</SelectItem>
                <SelectItem value="mgo">MGO</SelectItem>
                <SelectItem value="hfo">HFO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Atual</p>
            <p className="text-lg font-bold flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {currentStats?.current ?? 0}
              <span className="text-xs text-muted-foreground">/MT</span>
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Variação 30d</p>
            <p className={`text-lg font-bold flex items-center gap-1 ${
              (currentStats?.change30d ?? 0) > 0 
                 ? "text-destructive" 
                : (currentStats?.change30d ?? 0) < 0 
                  ? "text-success" 
                  : ""
            }`}>
              <TrendIcon className="h-4 w-4" />
              {(currentStats?.change30d ?? 0) > 0 ? "+" : ""}
              {(currentStats?.changePercent ?? 0).toFixed(1)}%
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Mínimo 30d</p>
            <p className="text-lg font-bold text-success">
              ${currentStats?.min ?? 0}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Máximo 30d</p>
            <p className="text-lg font-bold text-destructive">
              ${currentStats?.max ?? 0}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart 
            data={history} 
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), "dd/MM")}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => FUEL_LABELS[value as keyof typeof FUEL_LABELS]}
            />
            
            {/* Reference line for average */}
            {currentStats?.avg && (
              <ReferenceLine 
                y={currentStats.avg} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                label={{ 
                  value: `Média: $${currentStats.avg}`, 
                  position: "insideTopRight",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11
                }}
              />
            )}

            <Line 
              type="monotone" 
              dataKey="vlsfo" 
              stroke={FUEL_COLORS.vlsfo}
              strokeWidth={selectedFuel === "vlsfo" ? 3 : 1.5}
              dot={false}
              activeDot={{ r: 6 }}
              opacity={selectedFuel === "vlsfo" ? 1 : 0.4}
            />
            <Line 
              type="monotone" 
              dataKey="mgo" 
              stroke={FUEL_COLORS.mgo}
              strokeWidth={selectedFuel === "mgo" ? 3 : 1.5}
              dot={false}
              activeDot={{ r: 6 }}
              opacity={selectedFuel === "mgo" ? 1 : 0.4}
            />
            <Line 
              type="monotone" 
              dataKey="hfo" 
              stroke={FUEL_COLORS.hfo}
              strokeWidth={selectedFuel === "hfo" ? 3 : 1.5}
              dot={false}
              activeDot={{ r: 6 }}
              opacity={selectedFuel === "hfo" ? 1 : 0.4}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Trend Badge */}
        <div className="flex items-center justify-center mt-4">
          <Badge 
            variant={
              currentStats?.trend === "down" ? "default" : 
              currentStats?.trend === "up" ? "destructive" : 
              "secondary"
            }
            className="gap-1"
          >
            <TrendIcon className="h-3 w-3" />
            {currentStats?.trend === "down" && "Tendência de queda - Momento favorável para bunker"}
            {currentStats?.trend === "up" && "Tendência de alta - Considere antecipar abastecimento"}
            {currentStats?.trend === "stable" && "Mercado estável"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default BunkerPriceChart;
