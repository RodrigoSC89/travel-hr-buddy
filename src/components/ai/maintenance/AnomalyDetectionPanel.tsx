/**
 * Anomaly Detection Panel - Real-time IoT anomaly detection
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, CheckCircle, Radio, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Anomaly {
  timestamp: Date;
  sensorId: string;
  sensorName?: string;
  value: number;
  expectedRange: { min: number; max: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  acknowledged: boolean;
}

interface AnomalyDetectionPanelProps {
  anomalies?: Anomaly[];
  isStreaming?: boolean;
  onClear?: () => void;
  onAcknowledge?: (index: number) => void;
  className?: string;
}

const SEVERITY_STYLES = {
  low: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  critical: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

export function AnomalyDetectionPanel({ 
  anomalies = [], 
  isStreaming = false,
  onClear,
  onAcknowledge,
  className 
}: AnomalyDetectionPanelProps) {
  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const unacknowledgedCount = anomalies.filter(a => !a.acknowledged).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className={cn("h-5 w-5", isStreaming && "animate-pulse text-green-500")} />
              Anomaly Detection IoT
            </CardTitle>
            <CardDescription>Detecção em tempo real de sensores</CardDescription>
          </div>
          <div className="flex gap-2">
            {isStreaming && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Streaming
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge variant="destructive">
                {criticalCount} crítico(s)
              </Badge>
            )}
            {onClear && anomalies.length > 0 && (
              <Button size="sm" variant="outline" onClick={onClear}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p>Nenhuma anomalia detectada</p>
            <p className="text-xs mt-1">Sistema operando normalmente</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {anomalies.map((anomaly, index) => {
                const style = SEVERITY_STYLES[anomaly.severity];
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      style.bg,
                      style.border,
                      anomaly.acknowledged && "opacity-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={cn("h-4 w-4 mt-0.5", style.color)} />
                        <div>
                          <p className="text-sm font-medium">{anomaly.sensorName || anomaly.sensorId}</p>
                          <p className="text-xs text-muted-foreground">{anomaly.message}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className={style.color}>
                              Valor: {anomaly.value.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">
                              (esperado: {anomaly.expectedRange.min}-{anomaly.expectedRange.max})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={cn("text-xs", style.color)}>
                          {anomaly.severity}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(anomaly.timestamp, { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    {!anomaly.acknowledged && onAcknowledge && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-full mt-2 h-7 text-xs"
                        onClick={() => onAcknowledge(index)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirmar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Summary */}
        {anomalies.length > 0 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
            <span className="text-muted-foreground">
              {anomalies.length} anomalia(s) detectada(s)
            </span>
            <span className={cn(
              unacknowledgedCount > 0 ? "text-yellow-500" : "text-green-500"
            )}>
              {unacknowledgedCount} não confirmada(s)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AnomalyDetectionPanel;
