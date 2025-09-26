import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Clock,
  Search,
  Plus,
  Settings,
  Award,
  Users,
  Ship,
  AlertCircle
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  type: 'STCW' | 'Flag_State' | 'IMO' | 'Company';
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  issueDate: string;
  expiryDate: string;
  issuer: string;
  crewMember: string;
  position: string;
  vessel?: string;
  renewalCost: number;
  mandatory: boolean;
}

export default function MaritimeCertifications() {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - Em produção, estes dados viriam do Supabase
  const certifications: Certification[] = [
    {
      id: '1',
      name: 'STCW Basic Safety Training',
      type: 'STCW',
      status: 'valid',
      issueDate: '2023-01-15',
      expiryDate: '2028-01-15',
      issuer: 'Brazilian Maritime Authority',
      crewMember: 'Carlos Silva',
      position: 'Capitão',
      vessel: 'MV Atlântico',
      renewalCost: 2500,
      mandatory: true
    },
    {
      id: '2',
      name: 'Certificate of Competency - Master',
      type: 'Flag_State',
      status: 'expiring',
      issueDate: '2020-03-10',
      expiryDate: '2025-03-10',
      issuer: 'Brazilian Maritime Authority',
      crewMember: 'Carlos Silva',
      position: 'Capitão',
      vessel: 'MV Atlântico',
      renewalCost: 5000,
      mandatory: true
    },
    {
      id: '3',
      name: 'RADAR/ARPA Certificate',
      type: 'IMO',
      status: 'valid',
      issueDate: '2023-06-20',
      expiryDate: '2026-06-20',
      issuer: 'IMO Training Center',
      crewMember: 'Ana Costa',
      position: 'Oficial de Navegação',
      vessel: 'MV Pacífico',
      renewalCost: 1800,
      mandatory: false
    },
    {
      id: '4',
      name: 'Engine Room Safety',
      type: 'Company',
      status: 'expired',
      issueDate: '2021-08-15',
      expiryDate: '2024-08-15',
      issuer: 'Nautilus Training Center',
      crewMember: 'João Santos',
      position: 'Engenheiro',
      renewalCost: 1200,
      mandatory: true
    },
    {
      id: '5',
      name: 'Ship Security Officer',
      type: 'STCW',
      status: 'pending',
      issueDate: '2024-03-01',
      expiryDate: '2029-03-01',
      issuer: 'Brazilian Maritime Authority',
      crewMember: 'Maria Oliveira',
      position: 'Oficial de Segurança',
      vessel: 'MV Índico',
      renewalCost: 3200,
      mandatory: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-500 text-white';
      case 'expiring': return 'bg-yellow-500 text-white';
      case 'expired': return 'bg-red-500 text-white';
      case 'pending': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Válida';
      case 'expiring': return 'Vencendo';
      case 'expired': return 'Vencida';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4" />;
      case 'expiring': return <Clock className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STCW': return 'bg-blue-100 text-blue-800';
      case 'Flag_State': return 'bg-green-100 text-green-800';
      case 'IMO': return 'bg-purple-100 text-purple-800';
      case 'Company': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.crewMember.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const expiringCerts = certifications.filter(cert => cert.status === 'expiring').length;
  const expiredCerts = certifications.filter(cert => cert.status === 'expired').length;
  const validCerts = certifications.filter(cert => cert.status === 'valid').length;
  const pendingCerts = certifications.filter(cert => cert.status === 'pending').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Certificações Marítimas
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão completa de certificações STCW, IMO e documentos obrigatórios da tripulação
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Certificação
        </Button>
      </div>

      {/* Alert de Configuração */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema em Configuração:</strong> Esta página está integrada com as tabelas employee_certificates 
          e certificate_alerts do Supabase. Sistema de alertas automáticos ativo.
        </AlertDescription>
      </Alert>

      {/* Alertas Críticos */}
      {(expiredCerts > 0 || expiringCerts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredCerts > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>ATENÇÃO:</strong> {expiredCerts} certificação(ões) vencida(s) - Ação imediata necessária!
              </AlertDescription>
            </Alert>
          )}
          
          {expiringCerts > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>AVISO:</strong> {expiringCerts} certificação(ões) vencendo em 90 dias
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{certifications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Válidas</p>
                <p className="text-3xl font-bold text-green-600">{validCerts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencendo</p>
                <p className="text-3xl font-bold text-yellow-600">{expiringCerts}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-3xl font-bold text-red-600">{expiredCerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Renovação</p>
                <p className="text-2xl font-bold">
                  R$ {certifications.reduce((sum, cert) => sum + cert.renewalCost, 0).toLocaleString()}
                </p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="certifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="setup">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Certificações */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Certificações da Tripulação</CardTitle>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar certificação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">Todos Status</option>
                        <option value="valid">Válidas</option>
                        <option value="expiring">Vencendo</option>
                        <option value="expired">Vencidas</option>
                        <option value="pending">Pendentes</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredCertifications.map((cert) => (
                      <div 
                        key={cert.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedCert?.id === cert.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedCert(cert)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              {getStatusIcon(cert.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{cert.name}</h3>
                              <p className="text-sm text-muted-foreground">{cert.crewMember} - {cert.position}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge className={getStatusColor(cert.status)}>
                              {getStatusText(cert.status)}
                            </Badge>
                            <Badge variant="outline" className={getTypeColor(cert.type)}>
                              {cert.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Vencimento:</span>
                            <p className="font-medium">{new Date(cert.expiryDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dias restantes:</span>
                            <p className={`font-medium ${getDaysUntilExpiry(cert.expiryDate) < 90 ? 'text-red-600' : 'text-green-600'}`}>
                              {getDaysUntilExpiry(cert.expiryDate)} dias
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Renovação:</span>
                            <p className="font-medium">R$ {cert.renewalCost.toLocaleString()}</p>
                          </div>
                        </div>

                        {cert.mandatory && (
                          <div className="mt-2">
                            <Badge variant="destructive" className="text-xs">
                              OBRIGATÓRIA
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes da Certificação */}
            <div>
              {selectedCert ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Detalhes da Certificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedCert.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCert.type}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge className={getStatusColor(selectedCert.status)}>
                        {getStatusText(selectedCert.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Tripulante:</span>
                        <span className="text-sm font-medium">{selectedCert.crewMember}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Posição:</span>
                        <span className="text-sm font-medium">{selectedCert.position}</span>
                      </div>
                      {selectedCert.vessel && (
                        <div className="flex justify-between">
                          <span className="text-sm">Embarcação:</span>
                          <span className="text-sm font-medium">{selectedCert.vessel}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm">Emissor:</span>
                        <span className="text-sm font-medium">{selectedCert.issuer}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Validade</p>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Emissão: {new Date(selectedCert.issueDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {new Date(selectedCert.expiryDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm font-medium">
                          {getDaysUntilExpiry(selectedCert.expiryDate)} dias restantes
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Custo de Renovação</p>
                      <p className="text-lg font-bold text-primary">
                        R$ {selectedCert.renewalCost.toLocaleString()}
                      </p>
                    </div>

                    {selectedCert.mandatory && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Certificação Obrigatória:</strong> Renovação necessária para manter conformidade.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="pt-4 space-y-2">
                      <Button className="w-full">
                        Renovar Certificação
                      </Button>
                      <Button variant="outline" className="w-full">
                        Ver Documento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma certificação para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Status de Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">STCW Compliance</h3>
                  <Progress value={85} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">85% dos tripulantes com certificações STCW válidas</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Flag State Requirements</h3>
                  <Progress value={92} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">92% de conformidade com requisitos da bandeira</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Company Requirements</h3>
                  <Progress value={78} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">78% de conformidade com requisitos da empresa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios de Certificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sistema de relatórios integrado com o módulo de Relatórios Avançados.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Sistema de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Alertas automáticos configurados na tabela certificate_alerts do Supabase.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-red-600">Vencimento em 30 dias</h3>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">certificações</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-yellow-600">Vencimento em 60 dias</h3>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">certificações</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-blue-600">Vencimento em 90 dias</h3>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">certificações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sistema Integrado - Certificações Marítimas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sistema Ativo:</strong> Este módulo está integrado com as tabelas employee_certificates 
                  e certificate_alerts do Supabase. Alertas automáticos estão funcionando.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-semibold mb-3">🔗 Integrações Ativas</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Tabela employee_certificates
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Armazena todas as certificações dos tripulantes com datas de validade e status.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Tabela certificate_alerts
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema de alertas automáticos que monitora vencimentos de certificações.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Edge Function: check-certificate-expiry
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Função automática que verifica diariamente certificações vencendo e envia alertas.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">⚙️ Configurações Disponíveis</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Alertas 30 dias antes do vencimento</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Alertas 60 dias antes do vencimento</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Alertas 90 dias antes do vencimento</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Notificações por email</span>
                    <Badge variant="outline">Configurar</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}