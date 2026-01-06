/**
 * Sensor Fusion Dashboard
 * PATCH AUTONOMOUS: Real-time sensor monitoring with data fusion charts
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Gauge, 
  Thermometer, 
  Navigation, 
  Radio, 
  Waves, 
  Wind,
  Compass,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { sensorFusionEngine, type SensorReading, type FusedData, type SensorType } from '@/lib/ai/autonomous';
import { cn } from '@/lib/utils';

interface SensorDataPoint {
  time: string;
  timestamp: number;
  gps: number;
  gyro: number;
  ais: number;
  weather: number;
  radar: number;
  fused: number;
  confidence: number;
}

interface SensorStatus {
  sensorType: SensorType;
  name: string;
  icon: React.ReactNode;
  status: 'active' | 'degraded' | 'offline';
  lastUpdate: Date;
  readings: number;
  confidence: number;
}

export function SensorFusionDashboard() {
  const [fusedData, setFusedData] = useState<FusedData | null>(null);
  const [history, setHistory] = useState<SensorDataPoint[]>([]);
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize sensor statuses
  useEffect(() => {
    const initialSensors: SensorStatus[] = [
      { sensorType: 'gps', name: 'GPS Primário', icon: <Navigation className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.98 },
      { sensorType: 'gps', name: 'GPS Backup', icon: <Navigation className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.95 },
      { sensorType: 'gyro', name: 'Giroscópio', icon: <Compass className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.97 },
      { sensorType: 'ais', name: 'AIS Transponder', icon: <Radio className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.99 },
      { sensorType: 'wind_sensor', name: 'Estação Meteo', icon: <Wind className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.92 },
      { sensorType: 'radar', name: 'Radar Principal', icon: <Waves className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.96 },
      { sensorType: 'temperature', name: 'Sensor Temp', icon: <Thermometer className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.94 },
      { sensorType: 'vibration', name: 'Vibração Motor', icon: <Activity className="h-4 w-4" />, status: 'active', lastUpdate: new Date(), readings: 0, confidence: 0.91 },
    ];
    setSensors(initialSensors);
  }, []);

  // Simulate sensor readings
  const simulateSensorReading = useCallback((): SensorReading => {
    const sensorTypes: SensorType[] = ['gps', 'gyro', 'ais', 'wind_sensor', 'radar', 'temperature', 'vibration', 'pressure'];
    const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
    
    return {
      sensorId: `${sensorType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sensorType,
      source: `${sensorType}-primary`,
      value: 50 + Math.random() * 50,
      unit: sensorType === 'temperature' ? '°C' : sensorType === 'pressure' ? 'bar' : 'units',
      timestamp: new Date(),
      quality: 0.8 + Math.random() * 0.2,
    };
  }, []);

  // Start simulation
  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    sensorFusionEngine.start();
  }, []);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    sensorFusionEngine.stop();
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Generate multiple sensor readings
      const readings: SensorReading[] = Array.from({ length: 5 }, () => simulateSensorReading());
      
      // Process through fusion engine
      readings.forEach(reading => {
        sensorFusionEngine.ingestReading(reading);
      });
      
      // Get fused data
      const fused = sensorFusionEngine.getFusedData();
      setFusedData(fused);
      setLastUpdate(new Date());
      
      // Update history
      const newPoint: SensorDataPoint = {
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        gps: 70 + Math.random() * 30,
        gyro: 65 + Math.random() * 35,
        ais: 80 + Math.random() * 20,
        weather: 60 + Math.random() * 40,
        radar: 75 + Math.random() * 25,
        fused: fused?.confidence || 85,
        confidence: fused?.confidence || 85,
      };
      
      setHistory(prev => [...prev.slice(-30), newPoint]);
      
      // Update sensor statuses
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        lastUpdate: new Date(),
        readings: sensor.readings + 1,
        confidence: 0.85 + Math.random() * 0.15,
        status: Math.random() > 0.05 ? 'active' : Math.random() > 0.5 ? 'degraded' : 'offline',
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simulateSensorReading]);

  // Radar chart data for sensor confidence
  const radarData = useMemo(() => {
    return sensors.slice(0, 6).map(sensor => ({
      sensor: sensor.name.split(' ')[0],
      confidence: sensor.confidence * 100,
      fullMark: 100,
    }));
  }, [sensors]);

  // Get status color
  const getStatusColor = (status: 'active' | 'degraded' | 'offline') => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Sensor Fusion Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real com fusão de dados multi-sensor
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isSimulating ? 'default' : 'secondary'}>
            {isSimulating ? (
              <><Zap className="h-3 w-3 mr-1" /> Simulando</>
            ) : (
              'Parado'
            )}
          </Badge>
          <Button
            onClick={isSimulating ? stopSimulation : startSimulation}
            variant={isSimulating ? 'destructive' : 'default'}
          >
            {isSimulating ? 'Parar' : 'Iniciar Simulação'}
          </Button>
        </div>
      </div>

      {/* Sensor Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {sensors.map((sensor, idx) => (
          <Card key={idx} className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={cn('h-2 w-2 rounded-full animate-pulse', getStatusColor(sensor.status))} />
                {sensor.icon}
              </div>
              <p className="text-xs font-medium truncate">{sensor.name}</p>
              <p className="text-lg font-bold">{(sensor.confidence * 100).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">{sensor.readings} leituras</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="fusion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fusion">Fusão de Dados</TabsTrigger>
          <TabsTrigger value="position">Navegação</TabsTrigger>
          <TabsTrigger value="environment">Ambiente</TabsTrigger>
          <TabsTrigger value="confidence">Confiança</TabsTrigger>
        </TabsList>

        {/* Data Fusion Chart */}
        <TabsContent value="fusion" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados Brutos vs Fusionados</CardTitle>
                <CardDescription>Comparação de leituras individuais com resultado fusionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Area type="monotone" dataKey="gps" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="GPS" />
                      <Area type="monotone" dataKey="gyro" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Gyro" />
                      <Area type="monotone" dataKey="ais" stackId="3" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} name="AIS" />
                      <Line type="monotone" dataKey="fused" stroke="hsl(var(--primary))" strokeWidth={3} name="Fusionado" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confiança por Sensor</CardTitle>
                <CardDescription>Qualidade das leituras de cada fonte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="sensor" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Confiança" dataKey="confidence" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fusion Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas de Qualidade da Fusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Confiança Geral</p>
                  <div className="flex items-center gap-2">
                    <Progress value={fusedData?.confidence || 0} className="flex-1" />
                    <span className="text-sm font-medium">{fusedData?.confidence?.toFixed(0) || 0}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Sensores Ativos</p>
                  <p className="text-2xl font-bold">{sensors.filter(s => s.status === 'active').length}/{sensors.length}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Taxa de Atualização</p>
                  <p className="text-2xl font-bold">1 Hz</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Última Atualização</p>
                  <p className="text-sm font-medium">{lastUpdate.toLocaleTimeString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Data */}
        <TabsContent value="position" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Posição Fusionada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="text-xl font-mono">{fusedData?.position?.latitude?.toFixed(6) || '-23.550500'}°</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="text-xl font-mono">{fusedData?.position?.longitude?.toFixed(6) || '-46.633300'}°</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Precisão: {fusedData?.position?.accuracy?.toFixed(0) || 10}m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Navegação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Rumo</p>
                    <p className="text-xl font-mono">{fusedData?.navigation?.heading?.toFixed(1) || '045.0'}°</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Velocidade SOG</p>
                    <p className="text-xl font-mono">{fusedData?.navigation?.speedOverGround?.toFixed(1) || '12.5'} nós</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Giro</p>
                    <p className="text-xl font-mono">{fusedData?.navigation?.rateOfTurn?.toFixed(2) || '0.05'}°/min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Propulsão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">RPM Motor Principal</p>
                    <p className="text-xl font-mono">{fusedData?.propulsion?.mainEngineRPM?.[0]?.toFixed(0) || '850'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consumo</p>
                    <p className="text-xl font-mono">{fusedData?.propulsion?.fuelConsumption?.toFixed(1) || '12.5'} L/h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Eficiência</p>
                    <p className="text-xl font-mono">{fusedData?.propulsion?.efficiency?.toFixed(1) || '85.0'}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Position History Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Velocidade e Rumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="gps" stroke="hsl(var(--chart-1))" name="Velocidade (nós)" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="gyro" stroke="hsl(var(--chart-2))" name="Rumo (°)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wind className="h-5 w-5" />
                  Vento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Velocidade</p>
                    <p className="text-xl font-mono">{fusedData?.environment?.windSpeed?.toFixed(1) || '15.5'} nós</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Direção</p>
                    <p className="text-xl font-mono">{fusedData?.environment?.windDirection?.toFixed(0) || '225'}°</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  Mar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Altura de Onda</p>
                    <p className="text-xl font-mono">{fusedData?.environment?.waveHeight?.toFixed(1) || '1.5'}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Corrente</p>
                    <p className="text-xl font-mono">{fusedData?.environment?.currentSpeed?.toFixed(1) || '0.8'} nós</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Ar</p>
                    <p className="text-xl font-mono">{fusedData?.environment?.airTemperature?.toFixed(1) || '28.0'}°C</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Água</p>
                    <p className="text-xl font-mono">{fusedData?.environment?.waterTemperature?.toFixed(1) || '24.5'}°C</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pressão</p>
                    <p className="text-xl font-mono">{fusedData?.environment?.barometricPressure?.toFixed(0) || '1013'} hPa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Confidence Tab */}
        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análise de Confiança por Sensor</CardTitle>
              <CardDescription>Qualidade e disponibilidade das fontes de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensors.map((sensor, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 flex items-center gap-2">
                      {sensor.icon}
                      <span className="text-sm font-medium truncate">{sensor.name}</span>
                    </div>
                    <div className="flex-1">
                      <Progress value={sensor.confidence * 100} className="h-3" />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-bold">{(sensor.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Badge variant={
                      sensor.status === 'active' ? 'default' :
                      sensor.status === 'degraded' ? 'secondary' : 'destructive'
                    }>
                      {sensor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sensors.filter(s => s.status !== 'active').length > 0 ? (
                <div className="space-y-2">
                  {sensors.filter(s => s.status !== 'active').map((sensor, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50">
                      <div className="flex items-center gap-2">
                        {sensor.icon}
                        <span className="font-medium">{sensor.name}</span>
                        <Badge variant={sensor.status === 'degraded' ? 'secondary' : 'destructive'}>
                          {sensor.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sensor com qualidade reduzida. Dados sendo compensados por fusão.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Todos os sensores operando normalmente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SensorFusionDashboard;
