import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  MapPin, 
  Fuel, 
  Users, 
  Calendar,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';

interface VesselPerformance {
  fuelEfficiency: number;
  averageSpeed: number;
  uptime: number;
  maintenanceScore: number;
  safetyScore: number;
  emissions: number;
}

interface VesselDetails {
  id: string;
  name: string;
  type: string;
  imo: string;
  flag: string;
  built: number;
  capacity: number;
  crew: number;
  status: string;
  location: string;
  performance: VesselPerformance;
  lastMaintenance: Date;
  nextMaintenance: Date;
  certificates: string[];
  route: string;
}

export const VesselPerformanceDashboard = () => {
  const [vessels, setVessels] = useState<VesselDetails[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    loadVesselData();
  }, []);

  const loadVesselData = () => {
    // Mock data - in real implementation, this would come from Supabase
    const mockVessels: VesselDetails[] = [
      {
        id: '1',
        name: 'MV Atlantic Explorer',
        type: 'Container Ship',
        imo: 'IMO9876543',
        flag: 'Brazil',
        built: 2018,
        capacity: 14000,
        crew: 22,
        status: 'En Route',
        location: 'Santos - Rio de Janeiro',
        performance: {
          fuelEfficiency: 87,
          averageSpeed: 18.5,
          uptime: 94,
          maintenanceScore: 91,
          safetyScore: 98,
          emissions: 76
        },
        lastMaintenance: new Date('2024-11-15'),
        nextMaintenance: new Date('2024-12-20'),
        certificates: ['ISPS', 'ISM', 'MLC', 'MARPOL'],
        route: 'Santos-Rio-Vitória'
      },
      {
        id: '2',
        name: 'MV Pacific Navigator',
        type: 'Bulk Carrier',
        imo: 'IMO9876544',
        flag: 'Brazil',
        built: 2020,
        capacity: 180000,
        crew: 25,
        status: 'Loading',
        location: 'Porto de Paranaguá',
        performance: {
          fuelEfficiency: 92,
          averageSpeed: 16.2,
          uptime: 97,
          maintenanceScore: 88,
          safetyScore: 95,
          emissions: 82
        },
        lastMaintenance: new Date('2024-12-01'),
        nextMaintenance: new Date('2025-01-15'),
        certificates: ['ISPS', 'ISM', 'MLC', 'MARPOL', 'BWM'],
        route: 'Paranaguá-Suape-Santos'
      }
    ];

    setVessels(mockVessels);
    setSelectedVessel(mockVessels[0].id);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en route': return 'bg-blue-100 text-blue-800';
      case 'loading': return 'bg-yellow-100 text-yellow-800';
      case 'docked': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedVesselData = vessels.find(v => v.id === selectedVessel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Performance das Embarcações</h2>
        <p className="text-muted-foreground">
          Análise detalhada de performance, eficiência e status operacional
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {(['24h', '7d', '30d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '24h' ? '24 Horas' : range === '7d' ? '7 Dias' : '30 Dias'}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="space-y-4">
          {vessels.map((vessel) => (
            <Card 
              key={vessel.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedVessel === vessel.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedVessel(vessel.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {vessel.name}
                  </CardTitle>
                  <Badge className={getStatusColor(vessel.status)}>
                    {vessel.status}
                  </Badge>
                </div>
                <CardDescription>{vessel.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Eficiência</div>
                    <div className={`font-semibold ${getPerformanceColor(vessel.performance.fuelEfficiency)}`}>
                      {vessel.performance.fuelEfficiency}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Uptime</div>
                    <div className={`font-semibold ${getPerformanceColor(vessel.performance.uptime)}`}>
                      {vessel.performance.uptime}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vessel.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Performance View */}
        {selectedVesselData && (
          <div className="lg:col-span-2 space-y-6">
            {/* Vessel Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  {selectedVesselData.name}
                </CardTitle>
                <CardDescription>
                  {selectedVesselData.type} • {selectedVesselData.imo} • Bandeira: {selectedVesselData.flag}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Construído</div>
                    <div className="font-semibold">{selectedVesselData.built}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Capacidade</div>
                    <div className="font-semibold">{selectedVesselData.capacity.toLocaleString()} TEU</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tripulação</div>
                    <div className="font-semibold">{selectedVesselData.crew} pessoas</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Rota</div>
                    <div className="font-semibold">{selectedVesselData.route}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métricas de Performance
                </CardTitle>
                <CardDescription>
                  Indicadores de performance para os últimos {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Eficiência de Combustível</span>
                        <span className={getPerformanceColor(selectedVesselData.performance.fuelEfficiency)}>
                          {selectedVesselData.performance.fuelEfficiency}%
                        </span>
                      </div>
                      <Progress value={selectedVesselData.performance.fuelEfficiency} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uptime Operacional</span>
                        <span className={getPerformanceColor(selectedVesselData.performance.uptime)}>
                          {selectedVesselData.performance.uptime}%
                        </span>
                      </div>
                      <Progress value={selectedVesselData.performance.uptime} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score de Manutenção</span>
                        <span className={getPerformanceColor(selectedVesselData.performance.maintenanceScore)}>
                          {selectedVesselData.performance.maintenanceScore}%
                        </span>
                      </div>
                      <Progress value={selectedVesselData.performance.maintenanceScore} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score de Segurança</span>
                        <span className={getPerformanceColor(selectedVesselData.performance.safetyScore)}>
                          {selectedVesselData.performance.safetyScore}%
                        </span>
                      </div>
                      <Progress value={selectedVesselData.performance.safetyScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Ambiental</span>
                        <span className={getPerformanceColor(selectedVesselData.performance.emissions)}>
                          {selectedVesselData.performance.emissions}%
                        </span>
                      </div>
                      <Progress value={selectedVesselData.performance.emissions} className="h-2" />
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Velocidade Média</div>
                      <div className="text-lg font-bold text-blue-900">
                        {selectedVesselData.performance.averageSpeed} nós
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance & Certificates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Manutenção
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Última Manutenção</div>
                    <div className="font-semibold">
                      {selectedVesselData.lastMaintenance.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - selectedVesselData.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))} dias atrás
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Próxima Manutenção</div>
                    <div className="font-semibold">
                      {selectedVesselData.nextMaintenance.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Em {Math.floor((selectedVesselData.nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Certificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedVesselData.certificates.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{cert}</span>
                        <Badge variant="outline" className="text-xs">
                          Válido
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};