import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ship, 
  Anchor, 
  Users, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Radio,
  Heart,
  Shield,
  FileText,
  Globe,
  Compass
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  currentPort: string;
  nextPort: string;
  eta: string;
  crew: CrewMember[];
  status: 'at_sea' | 'in_port' | 'maintenance' | 'emergency';
  coordinates: { lat: number; lng: number };
}

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  contractStart: string;
  contractEnd: string;
  certificationsStatus: 'valid' | 'expiring' | 'expired';
  onboard: boolean;
  workHours: number;
  restHours: number;
}

export const VesselManagement: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Mock data para demonstração
  useEffect(() => {
    const mockVessels: Vessel[] = [
      {
        id: '1',
        name: 'MV Ocean Pioneer',
        imo: 'IMO9876543',
        type: 'Container Ship',
        flag: 'Brazil',
        currentPort: 'Santos, BR',
        nextPort: 'Hamburg, DE',
        eta: '2024-01-15T14:30:00Z',
        status: 'at_sea',
        coordinates: { lat: -12.9714, lng: -38.5014 },
        crew: [
          {
            id: '1',
            name: 'João Silva',
            rank: 'Captain',
            nationality: 'Brazilian',
            contractStart: '2024-01-01',
            contractEnd: '2024-06-01',
            certificationsStatus: 'valid',
            onboard: true,
            workHours: 8,
            restHours: 16
          },
          {
            id: '2',
            name: 'Maria Santos',
            rank: 'Chief Engineer',
            nationality: 'Brazilian',
            contractStart: '2024-01-01',
            contractEnd: '2024-04-01',
            certificationsStatus: 'expiring',
            onboard: true,
            workHours: 10,
            restHours: 14
          }
        ]
      },
      {
        id: '2',
        name: 'MV Atlantic Star',
        imo: 'IMO9876544',
        type: 'Bulk Carrier',
        flag: 'Brazil',
        currentPort: 'Rio de Janeiro, BR',
        nextPort: 'New York, US',
        eta: '2024-01-20T08:00:00Z',
        status: 'in_port',
        coordinates: { lat: -22.9068, lng: -43.1729 },
        crew: []
      }
    ];
    setVessels(mockVessels);
    setSelectedVessel(mockVessels[0]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'at_sea': return 'bg-primary';
      case 'in_port': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'emergency': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'at_sea': return 'Em Navegação';
      case 'in_port': return 'No Porto';
      case 'maintenance': return 'Manutenção';
      case 'emergency': return 'Emergência';
      default: return 'Desconhecido';
    }
  };

  const getCertificationBadge = (status: string) => {
    switch (status) {
      case 'valid': return <Badge className="bg-green-500 text-azure-50">Válido</Badge>;
      case 'expiring': return <Badge className="bg-yellow-500 text-azure-900">Vencendo</Badge>;
      case 'expired': return <Badge variant="destructive">Vencido</Badge>;
      default: return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const handleCrewRotation = (vesselId: string) => {
    toast({
      title: "Rotação de Tripulação",
      description: "Planejamento de rotação iniciado para " + selectedVessel?.name,
    });
  };

  const handleEmergencyAlert = (vesselId: string) => {
    toast({
      title: "🚨 Alerta de Emergência",
      description: "Protocolo de emergência ativado para " + selectedVessel?.name,
      variant: "destructive",
    });
  };

  if (!selectedVessel) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ship className="h-8 w-8 text-primary" />
            Gestão de Embarcações
          </h1>
          <p className="text-muted-foreground">
            Controle total da frota e tripulação em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleCrewRotation(selectedVessel.id)}>
            <Users className="h-4 w-4 mr-2" />
            Planejar Rotação
          </Button>
          <Button variant="destructive" onClick={() => handleEmergencyAlert(selectedVessel.id)}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergência
          </Button>
        </div>
      </div>

      {/* Seletor de Embarcação */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Embarcação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vessels.map((vessel) => (
              <Card 
                key={vessel.id} 
                className={`cursor-pointer transition-all ${
                  selectedVessel?.id === vessel.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedVessel(vessel)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{vessel.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(vessel.status)}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{vessel.type}</p>
                  <p className="text-sm">{getStatusLabel(vessel.status)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {vessel.currentPort}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Embarcação */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Informações da Embarcação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IMO:</span>
                  <span className="font-medium">{selectedVessel.imo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{selectedVessel.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bandeira:</span>
                  <span className="font-medium">{selectedVessel.flag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="secondary">{getStatusLabel(selectedVessel.status)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Posição e Rota
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Porto Atual:</span>
                  <span className="font-medium">{selectedVessel.currentPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Próximo Porto:</span>
                  <span className="font-medium">{selectedVessel.nextPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ETA:</span>
                  <span className="font-medium">
                    {new Date(selectedVessel.eta).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Coordenadas:</span>
                  <span className="font-medium text-xs">
                    {selectedVessel.coordinates.lat.toFixed(4)}, {selectedVessel.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Status da Tripulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total a Bordo:</span>
                  <span className="font-medium">{selectedVessel.crew.filter(c => c.onboard).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cert. Válidas:</span>
                  <span className="font-medium text-green-600">
                    {selectedVessel.crew.filter(c => c.certificationsStatus === 'valid').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cert. Vencendo:</span>
                  <span className="font-medium text-yellow-600">
                    {selectedVessel.crew.filter(c => c.certificationsStatus === 'expiring').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cert. Vencidas:</span>
                  <span className="font-medium text-red-600">
                    {selectedVessel.crew.filter(c => c.certificationsStatus === 'expired').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew">
          <Card>
            <CardHeader>
              <CardTitle>Tripulação a Bordo</CardTitle>
              <CardDescription>
                Gestão completa da tripulação e rotações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedVessel.crew.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.rank}</p>
                      <p className="text-xs text-muted-foreground">
                        Contrato: {new Date(member.contractStart).toLocaleDateString('pt-BR')} - {new Date(member.contractEnd).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Certificações</p>
                        {getCertificationBadge(member.certificationsStatus)}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Trabalho/Descanso</p>
                        <p className="text-sm font-medium">{member.workHours}h / {member.restHours}h</p>
                      </div>
                      <Badge variant={member.onboard ? "default" : "secondary"}>
                        {member.onboard ? "A Bordo" : "Em Terra"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Certificações STCW
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Basic Safety Training</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Medical First Aid</span>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Security Awareness</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compliance MLC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Work Hours Compliance</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rest Hours Compliance</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Medical Certificates</span>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  Comunicação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Radio className="h-4 w-4 mr-2" />
                  Comunicação Sat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Internet Marítimo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergência
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Wellness da Tripulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Moral da Tripulação</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Saúde Mental</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-600">94.5%</h3>
                    <p className="text-sm text-blue-600">Eficiência Operacional</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">98.2%</h3>
                    <p className="text-sm text-green-600">Compliance Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Previsões IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">
                      ⚠️ Rotação necessária em 15 dias
                    </p>
                    <p className="text-xs text-yellow-600">
                      2 oficiais com contratos vencendo
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">
                      📊 Otimização sugerida
                    </p>
                    <p className="text-xs text-blue-600">
                      Reduzir custos de rotação em 12%
                    </p>
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