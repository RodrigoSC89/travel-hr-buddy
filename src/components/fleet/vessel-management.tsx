import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Ship, 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  flag_state?: string;
  status: string;
  current_location?: any;
  next_port?: string;
  eta?: string;
  created_at: string;
}

export const VesselManagement: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Form state for new vessel
  const [newVessel, setNewVessel] = useState({
    name: '',
    imo_number: '',
    vessel_type: '',
    flag_state: '',
    next_port: '',
    eta: ''
  });

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for now since vessels table is newly created
      const mockVessels: Vessel[] = [
        {
          id: '1',
          name: 'MV Atlântico',
          imo_number: '1234567',
          vessel_type: 'Container Ship',
          flag_state: 'Brasil',
          status: 'active',
          current_location: { port: 'Santos', country: 'Brasil' },
          next_port: 'Rio de Janeiro',
          eta: '2024-01-15T10:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'MV Pacífico',
          imo_number: '2345678',
          vessel_type: 'Bulk Carrier',
          flag_state: 'Brasil',
          status: 'active',
          current_location: { port: 'Paranaguá', country: 'Brasil' },
          next_port: 'Salvador',
          eta: '2024-01-18T14:30:00Z',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'MV Índico',
          imo_number: '3456789',
          vessel_type: 'Tanker',
          flag_state: 'Brasil',
          status: 'maintenance',
          current_location: { port: 'Suape', country: 'Brasil' },
          next_port: 'Fortaleza',
          eta: '2024-01-22T08:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      
      setVessels(mockVessels);
    } catch (error) {
      console.error('Erro ao carregar embarcações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as embarcações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVessel = async () => {
    try {
      // Mock implementation - in production this would create in database
      const vessel: Vessel = {
        id: Math.random().toString(),
        ...newVessel,
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      setVessels([...vessels, vessel]);
      setNewVessel({
        name: '',
        imo_number: '',
        vessel_type: '',
        flag_state: '',
        next_port: '',
        eta: ''
      });
      setShowAddDialog(false);
      
      toast({
        title: "Embarcação Adicionada",
        description: `${vessel.name} foi adicionada com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a embarcação",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'maintenance': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'maintenance': return 'Manutenção';
      case 'inactive': return 'Inativa';
      default: return 'Desconhecido';
    }
  };

  const filteredVessels = vessels.filter(vessel =>
    vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.vessel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.imo_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 text-primary" />
            Gestão de Frota
          </h2>
          <p className="text-muted-foreground">
            Controle e monitoramento de embarcações da frota
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Embarcação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Embarcação</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome da Embarcação</Label>
                <Input
                  id="name"
                  value={newVessel.name}
                  onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
                  placeholder="Ex: MV Atlântico"
                />
              </div>
              <div>
                <Label htmlFor="imo">Número IMO</Label>
                <Input
                  id="imo"
                  value={newVessel.imo_number}
                  onChange={(e) => setNewVessel({ ...newVessel, imo_number: e.target.value })}
                  placeholder="Ex: 1234567"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Embarcação</Label>
                <Select 
                  value={newVessel.vessel_type} 
                  onValueChange={(value) => setNewVessel({ ...newVessel, vessel_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Container Ship">Navio Porta-contêineres</SelectItem>
                    <SelectItem value="Bulk Carrier">Graneleiro</SelectItem>
                    <SelectItem value="Tanker">Petroleiro</SelectItem>
                    <SelectItem value="Cargo Ship">Navio de Carga</SelectItem>
                    <SelectItem value="Passenger Ship">Navio de Passageiros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="flag">Bandeira</Label>
                <Input
                  id="flag"
                  value={newVessel.flag_state}
                  onChange={(e) => setNewVessel({ ...newVessel, flag_state: e.target.value })}
                  placeholder="Ex: Brasil"
                />
              </div>
              <div>
                <Label htmlFor="port">Próximo Porto</Label>
                <Input
                  id="port"
                  value={newVessel.next_port}
                  onChange={(e) => setNewVessel({ ...newVessel, next_port: e.target.value })}
                  placeholder="Ex: Santos"
                />
              </div>
              <div>
                <Label htmlFor="eta">ETA</Label>
                <Input
                  id="eta"
                  type="datetime-local"
                  value={newVessel.eta}
                  onChange={(e) => setNewVessel({ ...newVessel, eta: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddVessel} className="flex-1">
                Adicionar Embarcação
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
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
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
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
                <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {vessels.filter(v => v.status === 'maintenance').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas</p>
                <p className="text-3xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Embarcações da Frota</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar embarcação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando embarcações...</div>
              ) : (
                <div className="space-y-4">
                  {filteredVessels.map((vessel) => (
                    <div 
                      key={vessel.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedVessel?.id === vessel.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedVessel(vessel)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ship className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="font-semibold">{vessel.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {vessel.vessel_type} • IMO: {vessel.imo_number}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(vessel.status)}>
                          {getStatusText(vessel.status)}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {vessel.current_location?.port || 'Localização não informada'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            ETA: {vessel.eta ? new Date(vessel.eta).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vessel Details */}
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
                  <Badge className={getStatusColor(selectedVessel.status)}>
                    {getStatusText(selectedVessel.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tipo:</span>
                    <span className="text-sm font-medium">{selectedVessel.vessel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IMO:</span>
                    <span className="text-sm font-medium">{selectedVessel.imo_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bandeira:</span>
                    <span className="text-sm font-medium">{selectedVessel.flag_state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Próximo Porto:</span>
                    <span className="text-sm font-medium">{selectedVessel.next_port}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Localização Atual</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVessel.current_location?.port}, {selectedVessel.current_location?.country}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver no Mapa
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Ver Tripulação
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Histórico
                  </Button>
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
    </div>
  );
};