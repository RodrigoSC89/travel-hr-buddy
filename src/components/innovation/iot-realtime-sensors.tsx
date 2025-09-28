import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Thermometer, Zap, Waves, Activity, Radio, Gauge, 
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown 
} from 'lucide-react';

interface SensorData {
  id: string;
  name: string;
  type: 'temperature' | 'pressure' | 'vibration' | 'energy' | 'connectivity' | 'flow';
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  trend: 'up' | 'down' | 'stable';
  lastUpdate: string;
  minRange: number;
  maxRange: number;
  icon: React.ElementType;
  color: string;
}

const IoTRealtimeSensors: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([
    {
      id: 'TEMP_001',
      name: 'Motor Principal',
      type: 'temperature',
      value: 78,
      unit: '°C',
      status: 'normal',
      trend: 'stable',
      lastUpdate: 'Agora',
      minRange: 60,
      maxRange: 85,
      icon: Thermometer,
      color: 'text-red-500'
    },
    {
      id: 'PRESS_001',
      name: 'Sistema Hidráulico',
      type: 'pressure',
      value: 3.2,
      unit: 'bar',
      status: 'warning',
      trend: 'up',
      lastUpdate: 'Há 5s',
      minRange: 2.0,
      maxRange: 3.5,
      icon: Waves,
      color: 'text-blue-500'
    },
    {
      id: 'VIB_001',
      name: 'Motor Auxiliar',
      type: 'vibration',
      value: 2.1,
      unit: 'mm/s',
      status: 'normal',
      trend: 'down',
      lastUpdate: 'Há 2s',
      minRange: 0,
      maxRange: 4,
      icon: Activity,
      color: 'text-green-500'
    },
    {
      id: 'POW_001',
      name: 'Consumo Energia',
      type: 'energy',
      value: 245,
      unit: 'kW',
      status: 'normal',
      trend: 'stable',
      lastUpdate: 'Agora',
      minRange: 200,
      maxRange: 300,
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      id: 'CONN_001',
      name: 'Conectividade 5G',
      type: 'connectivity',
      value: -65,
      unit: 'dBm',
      status: 'normal',
      trend: 'stable',
      lastUpdate: 'Há 1s',
      minRange: -80,
      maxRange: -50,
      icon: Radio,
      color: 'text-purple-500'
    },
    {
      id: 'FLOW_001',
      name: 'Fluxo Combustível',
      type: 'flow',
      value: 12.5,
      unit: 'L/min',
      status: 'normal',
      trend: 'up',
      lastUpdate: 'Há 3s',
      minRange: 10,
      maxRange: 15,
      icon: Gauge,
      color: 'text-cyan-500'
    }
  ]);

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prevSensors => 
        prevSensors.map(sensor => ({
          ...sensor,
          value: sensor.value + (Math.random() - 0.5) * 2,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdate: Math.random() > 0.7 ? 'Agora' : `Há ${Math.floor(Math.random() * 10)}s`,
          status: sensor.value > sensor.maxRange * 0.9 ? 'warning' : 
                   sensor.value > sensor.maxRange ? 'critical' : 'normal'
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge className="bg-green-100 text-green-700">Normal</Badge>;
      case 'warning': return <Badge className="bg-orange-100 text-orange-700">Atenção</Badge>;
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'offline': return <Badge variant="outline">Offline</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const calculateProgress = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sensores em Tempo Real</h2>
          <p className="text-muted-foreground">Monitoramento contínuo de dispositivos IoT</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700">Sistema Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => {
          const IconComponent = sensor.icon;
          const progress = calculateProgress(sensor.value, sensor.minRange, sensor.maxRange);
          
          return (
            <Card key={sensor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconComponent className={`h-4 w-4 ${sensor.color}`} />
                  {sensor.name}
                  <div className="ml-auto flex items-center gap-1">
                    {getTrendIcon(sensor.trend)}
                    {getStatusBadge(sensor.status)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{sensor.value.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">{sensor.unit}</div>
                </div>
                
                <Progress 
                  value={Math.min(100, Math.max(0, progress))} 
                  className="w-full h-2"
                />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {sensor.minRange}{sensor.unit}</span>
                  <span>Max: {sensor.maxRange}{sensor.unit}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">ID: {sensor.id}</span>
                  <span className={`${getStatusColor(sensor.status)} font-medium`}>
                    {sensor.lastUpdate}
                  </span>
                </div>

                {sensor.status === 'warning' && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                    <AlertTriangle className="h-3 w-3" />
                    Valor próximo ao limite máximo
                  </div>
                )}

                {sensor.status === 'critical' && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-xs text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    Valor acima do limite - Verificação necessária
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium text-green-700">Normais</div>
                <div className="text-lg font-bold text-green-600">
                  {sensors.filter(s => s.status === 'normal').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium text-orange-700">Atenção</div>
                <div className="text-lg font-bold text-orange-600">
                  {sensors.filter(s => s.status === 'warning').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-sm font-medium text-red-700">Críticos</div>
                <div className="text-lg font-bold text-red-600">
                  {sensors.filter(s => s.status === 'critical').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">Offline</div>
                <div className="text-lg font-bold text-gray-600">
                  {sensors.filter(s => s.status === 'offline').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IoTRealtimeSensors;