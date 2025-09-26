import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { 
  Ship, 
  Anchor, 
  MapPin, 
  Calendar,
  Users,
  Fuel,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Navigation,
  FileText,
  Plus
} from 'lucide-react';

interface Vessel {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'docked';
  location: string;
  capacity: number;
  crewCount: number;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  route?: string;
  operationalHours: number;
}

export default function FleetManagement() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  // Mock data - Em produção, estes dados viriam do Supabase
  const vessels: Vessel[] = [
    {
      id: '1',
      name: 'MV Atlântico',
      type: 'Cargueiro',
      status: 'active',
      location: 'Porto de Santos',
      capacity: 500,
      crewCount: 12,
      fuelLevel: 85,
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      route: 'Santos - Rio de Janeiro',
      operationalHours: 2450
    },
    {
      id: '2',
      name: 'MV Pacífico',
      type: 'Petroleiro',
      status: 'maintenance',
      location: 'Estaleiro Naval',
      capacity: 800,
      crewCount: 8,
      fuelLevel: 60,
      lastMaintenance: '2024-02-20',
      nextMaintenance: '2024-05-20',
      operationalHours: 3200
    },
    {
      id: '3',
      name: 'MV Índico',
      type: 'Passageiros',
      status: 'docked',
      location: 'Porto do Recife',
      capacity: 200,
      crewCount: 15,
      fuelLevel: 92,
      lastMaintenance: '2024-03-01',
      nextMaintenance: '2024-06-01',
      operationalHours: 1800
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'docked': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Em Operação';
      case 'maintenance': return 'Manutenção';
      case 'docked': return 'Atracado';
      default: return 'Desconhecido';
    }
  };

  return (
    <OrganizationLayout title="Gestão de Frota Marítima">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ship className="h-8 w-8 text-primary" />
            Gestão de Frota Marítima
          </h1>
          <p className="text-muted-foreground mt-2">
            Controle completo da frota de embarcações, monitoramento em tempo real e gestão operacional
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Embarcação
        </Button>
      </div>

      {/* Alert de Configuração */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema em Configuração:</strong> Esta página está pronta para integração com dados reais. 
          Configure as tabelas: vessels, fleet_tracking, maintenance_schedules no Supabase.
        </AlertDescription>
      </Alert>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Embarcações</p>
                <p className="text-3xl font-bold">{vessels.length}</p>
              </div>
              <Ship className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Operação</p>
                <p className="text-3xl font-bold text-green-600">
                  {vessels.filter(v => v.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manutenção</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {vessels.filter(v => v.status === 'maintenance').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tripulantes</p>
                <p className="text-3xl font-bold">
                  {vessels.reduce((sum, v) => sum + v.crewCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="fleet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet">Frota</TabsTrigger>
          <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
          <TabsTrigger value="setup">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Embarcações */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Embarcações da Frota</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vessels.map((vessel) => (
                      <div 
                        key={vessel.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedVessel?.id === vessel.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedVessel(vessel)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(vessel.status)}`} />
                            <div>
                              <h3 className="font-semibold">{vessel.name}</h3>
                              <p className="text-sm text-muted-foreground">{vessel.type}</p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {getStatusText(vessel.status)}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{vessel.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{vessel.crewCount} tripulantes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <span>{vessel.fuelLevel}% combustível</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes da Embarcação */}
            <div>
              {selectedVessel ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      {selectedVessel.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge className={`${getStatusColor(selectedVessel.status)} text-white`}>
                        {getStatusText(selectedVessel.status)}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Nível de Combustível</p>
                      <Progress value={selectedVessel.fuelLevel} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{selectedVessel.fuelLevel}%</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Capacidade:</span>
                        <span className="text-sm font-medium">{selectedVessel.capacity} ton</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tripulantes:</span>
                        <span className="text-sm font-medium">{selectedVessel.crewCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Horas Operacionais:</span>
                        <span className="text-sm font-medium">{selectedVessel.operationalHours}h</span>
                      </div>
                    </div>

                    {selectedVessel.route && (
                      <div>
                        <p className="text-sm font-medium">Rota Atual</p>
                        <p className="text-sm text-muted-foreground">{selectedVessel.route}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium">Próxima Manutenção</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedVessel.nextMaintenance).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Ship className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma embarcação para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Rastreamento em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sistema de rastreamento GPS não configurado. Integre com APIs de localização marítima.
                </AlertDescription>
              </Alert>
              <div className="mt-4 h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Mapa de Rastreamento (A ser implementado)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Cronograma de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vessels.map((vessel) => (
                  <div key={vessel.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{vessel.name}</h3>
                        <p className="text-sm text-muted-foreground">Última: {new Date(vessel.lastMaintenance).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Próxima Manutenção</p>
                        <p className="text-sm text-muted-foreground">{new Date(vessel.nextMaintenance).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Gestão de Rotas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sistema de rotas não configurado. Configure tabelas de rotas e portos no Supabase.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Guia de Configuração - Gestão de Frota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">📋 Passo a Passo para Configuração</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">1. Criar Tabelas no Supabase</h4>
                    <p className="text-sm text-muted-foreground mb-3">Execute os SQLs no editor do Supabase:</p>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      <div>-- Tabela de Embarcações</div>
                      <div>CREATE TABLE vessels (</div>
                      <div>&nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),</div>
                      <div>&nbsp;&nbsp;name TEXT NOT NULL,</div>
                      <div>&nbsp;&nbsp;vessel_type TEXT NOT NULL,</div>
                      <div>&nbsp;&nbsp;status TEXT DEFAULT 'docked',</div>
                      <div>&nbsp;&nbsp;capacity INTEGER,</div>
                      <div>&nbsp;&nbsp;current_location TEXT,</div>
                      <div>&nbsp;&nbsp;created_at TIMESTAMP DEFAULT NOW()</div>
                      <div>);</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">2. Configurar RLS (Row Level Security)</h4>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      <div>ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;</div>
                      <div>CREATE POLICY "Users can view vessels" ON vessels FOR SELECT USING (true);</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">3. Integrar com APIs</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• MarineTraffic API - Rastreamento GPS</li>
                      <li>• OpenWeather API - Condições Climáticas</li>
                      <li>• Port Authority APIs - Informações dos Portos</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">4. Configurar Edge Functions</h4>
                    <p className="text-sm text-muted-foreground">Crie functions para:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• update-vessel-location</li>
                      <li>• calculate-eta</li>
                      <li>• maintenance-scheduler</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Documentação:</strong> Consulte o manual técnico completo na seção de Documentos ou 
                  acesse a Central de Ajuda para tutoriais detalhados.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </OrganizationLayout>
  );
}