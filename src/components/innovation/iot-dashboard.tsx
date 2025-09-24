import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Wind, 
  Gauge,
  Wifi,
  WifiOff,
  Battery,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Radio,
  Anchor,
  Navigation,
  Fuel,
  Activity,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface IoTSensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'pressure' | 'fuel' | 'speed' | 'vibration' | 'position';
  location: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastUpdate: string;
  batteryLevel: number;
  signalStrength: number;
  minValue: number;
  maxValue: number;
  threshold?: {
    min: number;
    max: number;
  };
}

interface IoTDevice {
  id: string;
  name: string;
  type: 'vessel' | 'port' | 'cargo' | 'engine' | 'navigation';
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  sensors: string[];
  lastMaintenance: string;
  nextMaintenance: string;
}

interface IoTAlert {
  id: string;
  sensorId: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export const IoTDashboard: React.FC = () => {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const [sensors, setSensors] = useState<IoTSensor[]>([
    {
      id: '1',
      name: 'Temperatura Motor Principal',
      type: 'temperature',
      location: 'Embarcação A-001 - Sala de Máquinas',
      value: 78.5,
      unit: '°C',
      status: 'online',
      lastUpdate: '2024-01-20T10:30:00Z',
      batteryLevel: 85,
      signalStrength: 92,
      minValue: 20,
      maxValue: 120,
      threshold: { min: 60, max: 90 }
    },
    {
      id: '2',
      name: 'Nível de Combustível',
      type: 'fuel',
      location: 'Embarcação A-001 - Tanque Principal',
      value: 72.3,
      unit: '%',
      status: 'online',
      lastUpdate: '2024-01-20T10:29:45Z',
      batteryLevel: 92,
      signalStrength: 88,
      minValue: 0,
      maxValue: 100,
      threshold: { min: 20, max: 95 }
    },
    {
      id: '3',
      name: 'Vibração do Motor',
      type: 'vibration',
      location: 'Embarcação A-001 - Motor Principal',
      value: 15.2,
      unit: 'Hz',
      status: 'warning',
      lastUpdate: '2024-01-20T10:30:15Z',
      batteryLevel: 78,
      signalStrength: 95,
      minValue: 0,
      maxValue: 50,
      threshold: { min: 5, max: 25 }
    },
    {
      id: '4',
      name: 'GPS Posição',
      type: 'position',
      location: 'Embarcação A-001 - Bridge',
      value: 1,
      unit: 'fix',
      status: 'online',
      lastUpdate: '2024-01-20T10:30:00Z',
      batteryLevel: 98,
      signalStrength: 85,
      minValue: 0,
      maxValue: 1
    },
    {
      id: '5',
      name: 'Pressão do Sistema',
      type: 'pressure',
      location: 'Porto Santos - Terminal 1',
      value: 12.8,
      unit: 'bar',
      status: 'online',
      lastUpdate: '2024-01-20T10:29:30Z',
      batteryLevel: 89,
      signalStrength: 76,
      minValue: 0,
      maxValue: 20,
      threshold: { min: 8, max: 16 }
    },
    {
      id: '6',
      name: 'Umidade do Ar',
      type: 'humidity',
      location: 'Armazém B-15 - Setor 3',
      value: 68.4,
      unit: '%',
      status: 'offline',
      lastUpdate: '2024-01-20T09:45:00Z',
      batteryLevel: 23,
      signalStrength: 0,
      minValue: 0,
      maxValue: 100,
      threshold: { min: 40, max: 80 }
    }
  ]);

  const [devices] = useState<IoTDevice[]>([
    {
      id: '1',
      name: 'Embarcação A-001',
      type: 'vessel',
      location: 'Santos - SP',
      status: 'active',
      sensors: ['1', '2', '3', '4'],
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-03-01'
    },
    {
      id: '2',
      name: 'Terminal Santos T1',
      type: 'port',
      location: 'Santos - SP',
      status: 'active',
      sensors: ['5'],
      lastMaintenance: '2023-12-15',
      nextMaintenance: '2024-02-15'
    },
    {
      id: '3',
      name: 'Armazém B-15',
      type: 'cargo',
      location: 'Santos - SP',
      status: 'maintenance',
      sensors: ['6'],
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-01-25'
    }
  ]);

  const [alerts] = useState<IoTAlert[]>([
    {
      id: '1',
      sensorId: '3',
      level: 'warning',
      message: 'Vibração acima do normal detectada no motor principal',
      timestamp: '2024-01-20T10:30:15Z',
      acknowledged: false
    },
    {
      id: '2',
      sensorId: '6',
      level: 'critical',
      message: 'Sensor de umidade offline - bateria baixa',
      timestamp: '2024-01-20T09:45:00Z',
      acknowledged: false
    },
    {
      id: '3',
      sensorId: '2',
      level: 'info',
      message: 'Nível de combustível atingiu 75%',
      timestamp: '2024-01-20T09:30:00Z',
      acknowledged: true
    }
  ]);

  // Dados simulados para gráficos em tempo real
  const [temperatureData, setTemperatureData] = useState([
    { time: '10:25', value: 76.2 },
    { time: '10:26', value: 77.1 },
    { time: '10:27', value: 77.8 },
    { time: '10:28', value: 78.2 },
    { time: '10:29', value: 78.1 },
    { time: '10:30', value: 78.5 }
  ]);

  const [fuelData, setFuelData] = useState([
    { time: '10:25', level: 73.1 },
    { time: '10:26', level: 72.9 },
    { time: '10:27', level: 72.7 },
    { time: '10:28', level: 72.5 },
    { time: '10:29', level: 72.4 },
    { time: '10:30', level: 72.3 }
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simular atualização de dados
        setSensors(prevSensors => 
          prevSensors.map(sensor => ({
            ...sensor,
            value: sensor.value + (Math.random() - 0.5) * 2,
            lastUpdate: new Date().toISOString()
          }))
        );
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      case 'humidity': return <Droplets className="h-5 w-5" />;
      case 'pressure': return <Gauge className="h-5 w-5" />;
      case 'fuel': return <Fuel className="h-5 w-5" />;
      case 'speed': return <Navigation className="h-5 w-5" />;
      case 'vibration': return <Activity className="h-5 w-5" />;
      case 'position': return <MapPin className="h-5 w-5" />;
      default: return <Radio className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    toast({
      title: "Alerta Confirmado",
      description: "O alerta foi marcado como reconhecido",
    });
  };

  const toggleSensorStatus = (sensorId: string) => {
    setSensors(prevSensors =>
      prevSensors.map(sensor =>
        sensor.id === sensorId
          ? { ...sensor, status: sensor.status === 'online' ? 'offline' : 'online' }
          : sensor
      )
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Radio className="h-8 w-8 text-blue-500" />
            Dashboard IoT Avançado
          </h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de sensores e dispositivos conectados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <span className="text-sm">Auto-refresh</span>
          </div>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm max-w-24"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          >
            <option value={1}>1s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={30}>30s</option>
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-green-100">
                <Radio className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sensors.filter(s => s.status === 'online').length}</div>
                <div className="text-sm text-muted-foreground">Sensores Online</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Anchor className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{devices.filter(d => d.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">Dispositivos Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{alerts.filter(a => !a.acknowledged).length}</div>
                <div className="text-sm text-muted-foreground">Alertas Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-purple-100">
                <Battery className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(sensors.reduce((acc, s) => acc + s.batteryLevel, 0) / sensors.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Bateria Média</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sensors">Sensores</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors.map((sensor) => (
              <Card key={sensor.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(sensor.type)}
                      <CardTitle className="text-lg">{sensor.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(sensor.status)}>
                      {sensor.status === 'online' ? 'Online' :
                       sensor.status === 'offline' ? 'Offline' :
                       sensor.status === 'warning' ? 'Alerta' : 'Erro'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{sensor.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {sensor.value.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">{sensor.unit}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4" />
                      <span>{sensor.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sensor.signalStrength > 0 ? (
                        <Wifi className="h-4 w-4" />
                      ) : (
                        <WifiOff className="h-4 w-4" />
                      )}
                      <span>{sensor.signalStrength}%</span>
                    </div>
                  </div>

                  {sensor.threshold && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Limites: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            sensor.value < sensor.threshold.min || sensor.value > sensor.threshold.max
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (sensor.value / sensor.maxValue) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Última atualização: {new Date(sensor.lastUpdate).toLocaleTimeString()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSensorStatus(sensor.id)}
                    className="w-full"
                  >
                    {sensor.status === 'online' ? 'Desativar' : 'Ativar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Anchor className="h-5 w-5" />
                      {device.name}
                    </CardTitle>
                    <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                      {device.status === 'active' ? 'Ativo' :
                       device.status === 'inactive' ? 'Inativo' : 'Manutenção'}
                    </Badge>
                  </div>
                  <CardDescription>{device.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <p className="text-muted-foreground capitalize">{device.type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Sensores:</span>
                      <p className="text-muted-foreground">{device.sensors.length} conectados</p>
                    </div>
                    <div>
                      <span className="font-medium">Última Manutenção:</span>
                      <p className="text-muted-foreground">
                        {new Date(device.lastMaintenance).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Próxima Manutenção:</span>
                      <p className="text-muted-foreground">
                        {new Date(device.nextMaintenance).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Sensores Conectados:</h4>
                    <div className="flex flex-wrap gap-1">
                      {device.sensors.map((sensorId) => {
                        const sensor = sensors.find(s => s.id === sensorId);
                        return sensor ? (
                          <Badge key={sensorId} variant="outline" className="text-xs">
                            {sensor.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Temperatura em Tempo Real</CardTitle>
                <CardDescription>Motor principal - Embarcação A-001</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[70, 85]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nível de Combustível</CardTitle>
                <CardDescription>Tanque principal - Embarcação A-001</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fuelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[70, 75]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="level" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
              <CardDescription>
                Notificações e alertas de todos os dispositivos IoT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const sensor = sensors.find(s => s.id === alert.sensorId);
                  return (
                    <div 
                      key={alert.id} 
                      className={`p-4 border rounded-lg ${
                        alert.acknowledged ? 'bg-muted/30' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.level)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{sensor?.name}</h4>
                              <Badge variant={
                                alert.level === 'info' ? 'secondary' :
                                alert.level === 'warning' ? 'destructive' : 'destructive'
                              }>
                                {alert.level === 'info' ? 'Info' :
                                 alert.level === 'warning' ? 'Alerta' : 'Crítico'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.message}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Uptime dos Dispositivos</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{device.name}</span>
                      <span>99.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.2%' }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consumo de Energia</CardTitle>
                <CardDescription>Por tipo de dispositivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sensores de Temperatura</span>
                    <span className="text-sm font-medium">45 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sensores de Posição</span>
                    <span className="text-sm font-medium">32 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sensores de Pressão</span>
                    <span className="text-sm font-medium">28 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Outros Sensores</span>
                    <span className="text-sm font-medium">19 kWh</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>124 kWh</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};