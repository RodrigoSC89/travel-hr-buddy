import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalLow, 
  SignalMedium, 
  SignalHigh,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  signalStrength: 'low' | 'medium' | 'high';
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  lastConnected?: Date;
  reconnectAttempts: number;
}

interface VoiceConnectionMonitorProps {
  isActive: boolean;
  onReconnect: () => void;
  connectionData: {
    isConnected: boolean;
    responseTime: number;
  };
}

const VoiceConnectionMonitor: React.FC<VoiceConnectionMonitorProps> = ({
  isActive,
  onReconnect,
  connectionData
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    signalStrength: 'medium',
    latency: 0,
    quality: 'good',
    reconnectAttempts: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isActive && connectionData.isConnected) {
      setIsMonitoring(true);
      const interval = setInterval(() => {
        updateConnectionStatus();
      }, 2000);

      return () => {
        clearInterval(interval);
        setIsMonitoring(false);
      };
    }
  }, [isActive, connectionData.isConnected]);

  const updateConnectionStatus = () => {
    const latency = connectionData.responseTime || Math.random() * 1000;
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    let signalStrength: 'low' | 'medium' | 'high';

    if (latency < 200) {
      quality = 'excellent';
      signalStrength = 'high';
    } else if (latency < 500) {
      quality = 'good';
      signalStrength = 'medium';
    } else if (latency < 1000) {
      quality = 'fair';
      signalStrength = 'medium';
    } else {
      quality = 'poor';
      signalStrength = 'low';
    }

    setStatus(prev => ({
      ...prev,
      isConnected: connectionData.isConnected,
      signalStrength,
      latency: Math.round(latency),
      quality,
      lastConnected: connectionData.isConnected ? new Date() : prev.lastConnected
    }));
  };

  const getSignalIcon = (strength: string) => {
    switch (strength) {
      case 'high': return <SignalHigh className="h-4 w-4 text-emerald-500" />;
      case 'medium': return <SignalMedium className="h-4 w-4 text-yellow-500" />;
      case 'low': return <SignalLow className="h-4 w-4 text-red-500" />;
      default: return <Signal className="h-4 w-4 text-muted" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-emerald-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getQualityProgress = (quality: string) => {
    switch (quality) {
      case 'excellent': return 95;
      case 'good': return 75;
      case 'fair': return 50;
      case 'poor': return 25;
      default: return 0;
    }
  };

  const handleReconnect = () => {
    setStatus(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
    onReconnect();
    
    toast({
      title: "Reconectando...",
      description: "Tentando restabelecer conexão com o assistente",
    });
  };

  if (!isActive) return null;

  return (
    <Card className="p-4 space-y-4 border-l-4 border-l-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status.isConnected ? (
            <Wifi className="h-4 w-4 text-emerald-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium text-sm">Status da Conexão</span>
        </div>
        
        <div className="flex items-center gap-2">
          {getSignalIcon(status.signalStrength)}
          <Badge variant={status.isConnected ? "default" : "destructive"}>
            {status.isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
      </div>

      {status.isConnected ? (
        <div className="space-y-3">
          {/* Quality Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Latência</div>
              <div className="font-medium">{status.latency}ms</div>
            </div>
            <div>
              <div className="text-muted-foreground">Qualidade</div>
              <div className={`font-medium capitalize ${getQualityColor(status.quality)}`}>
                {status.quality}
              </div>
            </div>
          </div>

          {/* Quality Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Qualidade da Conexão</span>
              <span>{getQualityProgress(status.quality)}%</span>
            </div>
            <Progress value={getQualityProgress(status.quality)} className="h-2" />
          </div>

          {/* Connection Health */}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span className="text-muted-foreground">
              Conexão estável • {isMonitoring ? 'Monitorando' : 'Inativo'}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Disconnected State */}
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-3 w-3 text-red-500" />
            <span className="text-muted-foreground">
              Conexão perdida
              {status.lastConnected && (
                <span> • Última conexão: {status.lastConnected.toLocaleTimeString()}</span>
              )}
            </span>
          </div>

          {/* Reconnect Attempts */}
          {status.reconnectAttempts > 0 && (
            <div className="text-xs text-muted-foreground">
              Tentativas de reconexão: {status.reconnectAttempts}
            </div>
          )}

          {/* Reconnect Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReconnect}
            className="w-full"
          >
            Tentar Reconectar
          </Button>

          {/* Troubleshooting */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">
                  Problemas de Conexão
                </div>
                <div className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Verifique sua conexão com a internet e tente novamente.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VoiceConnectionMonitor;