import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wifi, WifiOff, Activity, Signal, Clock, Zap } from "lucide-react";

interface VoiceConnectionMonitorProps {
  isConnected: boolean;
  latency: number;
  signalStrength: number;
  sessionDuration: number;
}

const VoiceConnectionMonitor: React.FC<VoiceConnectionMonitorProps> = ({
  isConnected,
  latency = 0,
  signalStrength = 0,
  sessionDuration = 0,
}) => {
  const [networkType, setNetworkType] = useState<string>("unknown");
  const [effectiveType, setEffectiveType] = useState<string>("unknown");

  useEffect(() => {
    // Check network connection info if available
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      setNetworkType(connection.type || "unknown");
      setEffectiveType(connection.effectiveType || "unknown");

      const updateConnection = () => {
        setNetworkType(connection.type || "unknown");
        setEffectiveType(connection.effectiveType || "unknown");
      };

      connection.addEventListener("change", updateConnection);
      return () => connection.removeEventListener("change", updateConnection);
    }
  }, []);

  const getConnectionQuality = () => {
    if (!isConnected) return { label: "Desconectado", color: "text-muted-foreground", value: 0 };
    if (latency < 100 && signalStrength > 80)
      return { label: "Excelente", color: "text-green-500", value: 95 };
    if (latency < 200 && signalStrength > 60)
      return { label: "Boa", color: "text-yellow-500", value: 75 };
    if (latency < 500 && signalStrength > 40)
      return { label: "Regular", color: "text-orange-500", value: 50 };
    return { label: "Ruim", color: "text-red-500", value: 25 };
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const quality = getConnectionQuality();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
          Monitor de Conexão
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>

        {/* Connection Quality */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Qualidade</span>
            <span className={`text-sm font-semibold ${quality.color}`}>{quality.label}</span>
          </div>
          <Progress value={quality.value} className="h-2" />
        </div>

        {isConnected && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Latency */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Latência</span>
                </div>
                <div className="text-lg font-semibold">{latency}ms</div>
              </div>

              {/* Signal Strength */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Signal className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Sinal</span>
                </div>
                <div className="text-lg font-semibold">{signalStrength}%</div>
              </div>

              {/* Session Duration */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Duração</span>
                </div>
                <div className="text-lg font-semibold">{formatDuration(sessionDuration)}</div>
              </div>

              {/* Network Type */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Rede</span>
                </div>
                <div className="text-sm font-semibold capitalize">
                  {effectiveType !== "unknown" ? effectiveType : networkType}
                </div>
              </div>
            </div>

            {/* Connection Details */}
            <div className="border-t pt-3 space-y-2">
              <div className="text-xs text-muted-foreground">
                <strong>Detalhes da Conexão</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Tipo: {networkType}</div>
                <div>Velocidade: {effectiveType}</div>
              </div>
            </div>

            {/* Performance Tips */}
            {quality.value < 50 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    💡 Dica para Melhorar
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    {latency > 500 ? "Alta latência detectada. " : ""}
                    {signalStrength < 50 ? "Sinal fraco. " : ""}
                    Tente se aproximar do roteador ou usar uma conexão cabeada.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceConnectionMonitor;
