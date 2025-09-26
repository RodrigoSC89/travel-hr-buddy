import React, { useState } from 'react';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserCheck, 
  UserX,
  Calendar,
  Ship,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Settings,
  Plus,
  Search
} from 'lucide-react';

interface CrewMember {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'shore_leave' | 'training' | 'medical';
  vessel: string;
  contractStart: string;
  contractEnd: string;
  certifications: string[];
  nationality: string;
  phone: string;
  email: string;
  experience: number;
}

export default function CrewManagement() {
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - Em produção, estes dados viriam do Supabase
  const crewMembers: CrewMember[] = [
    {
      id: '1',
      name: 'Carlos Silva',
      position: 'Capitão',
      status: 'active',
      vessel: 'MV Atlântico',
      contractStart: '2024-01-01',
      contractEnd: '2024-12-31',
      certifications: ['COC - Chief Officer Certificate', 'STCW Basic Safety', 'Leadership & Management'],
      nationality: 'Brasileiro',
      phone: '+55 11 99999-9999',
      email: 'carlos.silva@nautilus.com',
      experience: 15
    },
    {
      id: '2',
      name: 'Ana Costa',
      position: 'Oficial de Navegação',
      status: 'active',
      vessel: 'MV Pacífico',
      contractStart: '2024-02-01',
      contractEnd: '2024-08-01',
      certifications: ['OOW - Officer of the Watch', 'STCW Basic Safety', 'RADAR/ARPA'],
      nationality: 'Brasileira',
      phone: '+55 21 98888-8888',
      email: 'ana.costa@nautilus.com',
      experience: 8
    },
    {
      id: '3',
      name: 'João Santos',
      position: 'Engenheiro',
      status: 'shore_leave',
      vessel: '-',
      contractStart: '2023-06-01',
      contractEnd: '2024-06-01',
      certifications: ['COE - Chief Engineer Certificate', 'STCW Basic Safety', 'Engine Room Safety'],
      nationality: 'Brasileiro',
      phone: '+55 85 97777-7777',
      email: 'joao.santos@nautilus.com',
      experience: 12
    },
    {
      id: '4',
      name: 'Maria Oliveira',
      position: 'Oficial de Segurança',
      status: 'training',
      vessel: 'MV Índico',
      contractStart: '2024-03-01',
      contractEnd: '2024-09-01',
      certifications: ['SSO - Ship Security Officer', 'STCW Basic Safety', 'Fire Fighting'],
      nationality: 'Brasileira',
      phone: '+55 71 96666-6666',
      email: 'maria.oliveira@nautilus.com',
      experience: 6
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'shore_leave': return 'bg-blue-500 text-white';
      case 'training': return 'bg-yellow-500 text-white';
      case 'medical': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'shore_leave': return 'Licença';
      case 'training': return 'Treinamento';
      case 'medical': return 'Médico';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4" />;
      case 'shore_leave': return <MapPin className="h-4 w-4" />;
      case 'training': return <FileText className="h-4 w-4" />;
      case 'medical': return <UserX className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const filteredCrew = crewMembers.filter(crew =>
    crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crew.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crew.vessel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <OrganizationLayout title="Gestão de Tripulação">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Tripulação
          </h1>
          <p className="text-muted-foreground mt-2">
            Controle completo da tripulação, certificações, contratos e escalas de trabalho
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Tripulante
        </Button>
      </div>

      {/* Alert de Configuração */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema em Configuração:</strong> Esta página está pronta para integração com dados reais. 
          Configure as tabelas: crew_members, contracts, certifications no Supabase.
        </AlertDescription>
      </Alert>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tripulantes</p>
                <p className="text-3xl font-bold">{crewMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-3xl font-bold text-green-600">
                  {crewMembers.filter(c => c.status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Licença</p>
                <p className="text-3xl font-bold text-blue-600">
                  {crewMembers.filter(c => c.status === 'shore_leave').length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificações Ativas</p>
                <p className="text-3xl font-bold">
                  {crewMembers.reduce((sum, c) => sum + c.certifications.length, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="crew" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="schedules">Escalas</TabsTrigger>
          <TabsTrigger value="setup">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="crew" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Tripulantes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Membros da Tripulação</CardTitle>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar tripulante..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredCrew.map((crew) => (
                      <div 
                        key={crew.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedCrew?.id === crew.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedCrew(crew)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              {getStatusIcon(crew.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{crew.name}</h3>
                              <p className="text-sm text-muted-foreground">{crew.position}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(crew.status)}>
                            {getStatusText(crew.status)}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Ship className="h-4 w-4 text-muted-foreground" />
                            <span>{crew.vessel || 'Sem embarcação'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{crew.certifications.length} certificações</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes do Tripulante */}
            <div>
              {selectedCrew ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {selectedCrew.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge className={getStatusColor(selectedCrew.status)}>
                        {getStatusText(selectedCrew.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Posição:</span>
                        <span className="text-sm font-medium">{selectedCrew.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Embarcação:</span>
                        <span className="text-sm font-medium">{selectedCrew.vessel || 'Sem embarcação'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Experiência:</span>
                        <span className="text-sm font-medium">{selectedCrew.experience} anos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nacionalidade:</span>
                        <span className="text-sm font-medium">{selectedCrew.nationality}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Contato</p>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedCrew.email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedCrew.phone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Contrato</p>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Início: {new Date(selectedCrew.contractStart).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Término: {new Date(selectedCrew.contractEnd).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Certificações ({selectedCrew.certifications.length})</p>
                      <div className="space-y-1">
                        {selectedCrew.certifications.slice(0, 3).map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {selectedCrew.certifications.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{selectedCrew.certifications.length - 3} mais
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um tripulante para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contratos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewMembers.map((crew) => (
                  <div key={crew.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{crew.name}</h3>
                        <p className="text-sm text-muted-foreground">{crew.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(crew.contractStart).toLocaleDateString('pt-BR')} - {new Date(crew.contractEnd).toLocaleDateString('pt-BR')}
                        </p>
                        <Badge variant={new Date(crew.contractEnd) < new Date() ? "destructive" : "default"}>
                          {new Date(crew.contractEnd) < new Date() ? "Vencido" : "Ativo"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Certificações da Tripulação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sistema de certificações integrado com o módulo Marítimo - Certificações.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Escalas de Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sistema de escalas não configurado. Configure tabelas de shifts e rotations no Supabase.
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
                Guia de Configuração - Gestão de Tripulação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">📋 Passo a Passo para Configuração</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">1. Criar Tabelas no Supabase</h4>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      <div>-- Tabela de Tripulantes</div>
                      <div>CREATE TABLE crew_members (</div>
                      <div>&nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),</div>
                      <div>&nbsp;&nbsp;name TEXT NOT NULL,</div>
                      <div>&nbsp;&nbsp;position TEXT NOT NULL,</div>
                      <div>&nbsp;&nbsp;status TEXT DEFAULT 'active',</div>
                      <div>&nbsp;&nbsp;vessel_id UUID REFERENCES vessels(id),</div>
                      <div>&nbsp;&nbsp;nationality TEXT,</div>
                      <div>&nbsp;&nbsp;created_at TIMESTAMP DEFAULT NOW()</div>
                      <div>);</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">2. Integrar com RH Existente</h4>
                    <p className="text-sm text-muted-foreground">
                      Conecte com as tabelas employees e certificates já existentes no sistema.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">3. Configurar Escalas e Rotações</h4>
                    <p className="text-sm text-muted-foreground">
                      Implemente sistema de turnos com base nas regulamentações marítimas internacionais.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </OrganizationLayout>
  );
}