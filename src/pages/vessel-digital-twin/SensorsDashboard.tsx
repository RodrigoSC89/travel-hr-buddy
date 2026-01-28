/**
 * Sensors Dashboard Component
 * Real-time IoT sensor monitoring
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Gauge,
  Thermometer,
  Droplet,
  Waves,
  Wind,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVesselSensors, type VesselSensor } from '@/hooks/use-vessel-digital-twin';

interface SensorsDashboardProps {
  vesselId: string;
}

const SENSOR_ICONS: Record<string, React.ElementType> = {
  temperature: Thermometer,
  pressure: Gauge,
  vibration: Activity,
  fuel_level: Droplet,
  rpm: Gauge,
  speed: Wind,
  draft: Waves,
  default: Gauge,
};

const STATUS_CONFIG = {
  normal: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  critical: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

function SensorCard({ sensor }: { sensor: VesselSensor }) {
  const Icon = SENSOR_ICONS[sensor.sensor_type] || SENSOR_ICONS.default;
  const status = sensor.latest_reading?.status || 'normal';
  const StatusIcon = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.icon || CheckCircle;
  const statusColor = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || 'text-gray-500';
  const statusBg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.bg || 'bg-gray-50';

  const value = sensor.latest_reading?.value;
  const min = sensor.min_value || 0;
  const max = sensor.max_value || 100;
  const percent = value != null ? ((value - min) / (max - min)) * 100 : 0;

  const isInWarningZone = value != null && (
    (sensor.warning_threshold_low != null && value <= sensor.warning_threshold_low) ||
    (sensor.warning_threshold_high != null && value >= sensor.warning_threshold_high)
  );

  const isInCriticalZone = value != null && (
    (sensor.critical_threshold_low != null && value <= sensor.critical_threshold_low) ||
    (sensor.critical_threshold_high != null && value >= sensor.critical_threshold_high)
  );

  return (
    <Card className={status !== 'normal' ? statusBg : ''}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-lg ${status === 'normal' ? 'bg-primary/10' : statusBg} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${status === 'normal' ? 'text-primary' : statusColor}`} />
            </div>
            <div>
              <p className="font-medium text-sm">{sensor.name}</p>
              <p className="text-xs text-muted-foreground">{sensor.location || sensor.sensor_type}</p>
            </div>
          </div>
          <StatusIcon className={`h-5 w-5 ${statusColor}`} />
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold">
              {value != null ? value.toFixed(1) : '--'}
            </span>
            <span className="text-sm text-muted-foreground">{sensor.unit}</span>
          </div>

          <div className="relative">
            <Progress 
              value={Math.min(100, Math.max(0, percent))} 
              className={`h-2 ${isInCriticalZone ? 'bg-red-200' : isInWarningZone ? 'bg-amber-200' : ''}`}
            />
            
            {/* Threshold markers */}
            {sensor.warning_threshold_low != null && (
              <div 
                className="absolute top-0 h-2 w-0.5 bg-amber-500"
                style={{ left: `${((sensor.warning_threshold_low - min) / (max - min)) * 100}%` }}
              />
            )}
            {sensor.warning_threshold_high != null && (
              <div 
                className="absolute top-0 h-2 w-0.5 bg-amber-500"
                style={{ left: `${((sensor.warning_threshold_high - min) / (max - min)) * 100}%` }}
              />
            )}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min} {sensor.unit}</span>
            <span>{max} {sensor.unit}</span>
          </div>
        </div>

        {sensor.latest_reading && (
          <p className="text-xs text-muted-foreground mt-3">
            Atualizado: {new Date(sensor.latest_reading.recorded_at).toLocaleTimeString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SensorsDashboard({ vesselId }: SensorsDashboardProps) {
  const { data: sensors, isLoading, refetch, isFetching } = useVesselSensors(vesselId);

  // Group by type
  const groupedSensors = sensors?.reduce((acc, sensor) => {
    const type = sensor.sensor_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(sensor);
    return acc;
  }, {} as Record<string, VesselSensor[]>) || {};

  const sensorTypes = Object.keys(groupedSensors);

  // Count by status
  const statusCounts = sensors?.reduce((acc, s) => {
    const status = s.latest_reading?.status || 'normal';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!sensors || sensors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Gauge className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Sem sensores configurados</p>
          <p className="text-sm">Configure sensores IoT para monitorar a embarcação em tempo real</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4">
        <Card className="flex-1 min-w-[200px]">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.normal || 0}</p>
              <p className="text-sm text-muted-foreground">Normal</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.warning || 0}</p>
              <p className="text-sm text-muted-foreground">Alerta</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.critical || 0}</p>
              <p className="text-sm text-muted-foreground">Crítico</p>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Sensors by type */}
      {sensorTypes.map(type => (
        <div key={type}>
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {type.replace('_', ' ')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedSensors[type].map(sensor => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
