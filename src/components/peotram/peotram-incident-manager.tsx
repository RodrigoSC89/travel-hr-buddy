import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  FileText, 
  Clock, 
  CheckCircle,
  Eye,
  Edit,
  Filter,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Plus,
  Search,
  Activity
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'safety' | 'environmental' | 'operational' | 'security' | 'technical' | 'human-error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'action-required' | 'resolved' | 'closed';
  location: string;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  rootCause?: string;
  correctiveActions: string[];
  preventiveActions: string[];
  impact: {
    personnel: number;
    environment: 'none' | 'minor' | 'moderate' | 'major';
    operations: 'none' | 'minor' | 'moderate' | 'major';
    financial: number;
  };
  witnesses: string[];
  attachments: string[];
}

interface Investigation {
  id: string;
  incidentId: string;
  investigator: string;
  startDate: string;
  endDate?: string;
  findings: string[];
  recommendations: string[];
  status: 'ongoing' | 'completed' | 'pending-review';
}

export const PeotramIncidentManager: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(getDemoIncidents());
  const [investigations, setInvestigations] = useState<Investigation[]>(getDemoInvestigations());
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  function getDemoIncidents(): Incident[] {
    return [
      {
        id: 'INC2024001',
        title: 'Derramamento de Óleo no Convés',
        description: 'Pequeno vazamento de óleo hidráulico detectado durante operação de guindaste',
        type: 'environmental',
        severity: 'medium',
        status: 'investigating',
        location: 'Convés Principal - Seção 2',
        reportedBy: 'João Silva',
        reportedAt: '2024-01-22T14:30:00Z',
        assignedTo: 'Maria Santos',
        rootCause: 'Desgaste de vedação hidráulica',
        correctiveActions: [
          'Substituição imediata da vedação',
          'Limpeza da área contaminada',
          'Verificação de outros pontos similares'
        ],
        preventiveActions: [
          'Inspeção mensal de vedações hidráulicas',
          'Treinamento sobre detecção precoce'
        ],
        impact: {
          personnel: 0,
          environment: 'minor',
          operations: 'minor',
          financial: 2500
        },
        witnesses: ['Carlos Lima', 'Ana Costa'],
        attachments: ['foto_vazamento.jpg', 'relatorio_inicial.pdf']
      },
      {
        id: 'INC2024002',
        title: 'Queda de Tripulante',
        description: 'Tripulante escorregou em superfície molhada resultando em lesão no joelho',
        type: 'safety',
        severity: 'high',
        status: 'action-required',
        location: 'Praça de Máquinas',
        reportedBy: 'Pedro Oliveira',
        reportedAt: '2024-01-21T09:15:00Z',
        assignedTo: 'Dr. Carlos Eduardo',
        rootCause: 'Ausência de sinalização em área molhada',
        correctiveActions: [
          'Atendimento médico imediato',
          'Instalação de sinalização adequada',
          'Melhoria na drenagem da área'
        ],
        preventiveActions: [
          'Inspeção diária de superfícies',
          'Treinamento sobre uso de EPI antiderrapante',
          'Procedimento para limpeza de superfícies'
        ],
        impact: {
          personnel: 1,
          environment: 'none',
          operations: 'moderate',
          financial: 5000
        },
        witnesses: ['Roberto Santos', 'Luis Felipe'],
        attachments: ['relatorio_medico.pdf', 'fotos_local.jpg']
      }
    ];
  }

  function getDemoInvestigations(): Investigation[] {
    return [
      {
        id: 'INV2024001',
        incidentId: 'INC2024001',
        investigator: 'Maria Santos',
        startDate: '2024-01-22T15:00:00Z',
        status: 'ongoing',
        findings: [
          'Vedação hidráulica com 18 meses de uso',
          'Última manutenção preventiva há 6 meses',
          'Pressão do sistema dentro dos parâmetros normais'
        ],
        recommendations: [
          'Reduzir intervalo de substituição de vedações',
          'Implementar monitoramento contínuo de pressão',
          'Revisar procedimentos de manutenção preventiva'
        ]
      }
    ];
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-info/20 text-info border-info/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': case 'closed': return 'bg-success/20 text-success border-success/30';
      case 'action-required': return 'bg-warning/20 text-warning border-warning/30';
      case 'investigating': return 'bg-info/20 text-info border-info/30';
      case 'reported': return 'bg-muted/20 text-muted-foreground border-muted/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safety': return <AlertTriangle className="w-4 h-4" />;
      case 'environmental': return <Activity className="w-4 h-4" />;
      case 'operational': return <Clock className="w-4 h-4" />;
      case 'security': return <Eye className="w-4 h-4" />;
      case 'technical': return <FileText className="w-4 h-4" />;
      case 'human-error': return <Users className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredIncidents = filterStatus === 'all' 
    ? incidents 
    : incidents.filter(incident => incident.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Incidentes</h2>
          <p className="text-muted-foreground">
            Registro, investigação e acompanhamento de incidentes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isNewIncidentOpen} onOpenChange={setIsNewIncidentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Reportar Incidente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Reportar Novo Incidente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-title">Título</Label>
                    <Input id="incident-title" placeholder="Título do incidente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de incidente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safety">Segurança</SelectItem>
                        <SelectItem value="environmental">Ambiental</SelectItem>
                        <SelectItem value="operational">Operacional</SelectItem>
                        <SelectItem value="security">Segurança Patrimonial</SelectItem>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="human-error">Erro Humano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-severity">Severidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Nível de severidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-location">Localização</Label>
                    <Input id="incident-location" placeholder="Local do incidente" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident-description">Descrição Detalhada</Label>
                  <Textarea id="incident-description" placeholder="Descreva o incidente em detalhes" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident-witnesses">Testemunhas</Label>
                  <Input id="incident-witnesses" placeholder="Nomes das testemunhas (separados por vírgula)" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewIncidentOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewIncidentOpen(false)}>
                    Reportar Incidente
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="investigations">Investigações</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="reported">Reportados</SelectItem>
                  <SelectItem value="investigating">Em Investigação</SelectItem>
                  <SelectItem value="action-required">Ação Requerida</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                  <SelectItem value="closed">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input placeholder="Buscar incidentes..." className="pl-10" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="cursor-pointer hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(incident.type)}
                      <div>
                        <CardTitle className="text-lg">{incident.title}</CardTitle>
                        <CardDescription className="text-sm">{incident.id}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{incident.reportedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(incident.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {incident.impact && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Impacto:</p>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Pessoal:</span>
                          <p className="font-medium">{incident.impact.personnel} pessoa(s)</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ambiental:</span>
                          <p className="font-medium">{incident.impact.environment}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Operacional:</span>
                          <p className="font-medium">{incident.impact.operations}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Financeiro:</span>
                          <p className="font-medium">R$ {incident.impact.financial.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="w-3 h-3 mr-1" />
                      Investigar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="investigations" className="space-y-4">
          <div className="space-y-4">
            {investigations.map((investigation) => {
              const relatedIncident = incidents.find(i => i.id === investigation.incidentId);
              return (
                <Card key={investigation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Investigação {investigation.id}
                        </CardTitle>
                        <CardDescription>
                          {relatedIncident?.title} - {investigation.investigator}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={
                        investigation.status === 'completed' ? 'bg-success/20 text-success border-success/30' :
                        investigation.status === 'ongoing' ? 'bg-info/20 text-info border-info/30' :
                        'bg-warning/20 text-warning border-warning/30'
                      }>
                        {investigation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Início:</p>
                        <p className="font-medium">{new Date(investigation.startDate).toLocaleDateString()}</p>
                      </div>
                      {investigation.endDate && (
                        <div>
                          <p className="text-muted-foreground">Conclusão:</p>
                          <p className="font-medium">{new Date(investigation.endDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {investigation.findings.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Descobertas:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {investigation.findings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {investigation.recommendations.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Recomendações:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {investigation.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{incidents.length}</p>
                    <p className="text-sm text-muted-foreground">Total Incidentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">{incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length}</p>
                    <p className="text-sm text-muted-foreground">Alta Severidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold">{incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}</p>
                    <p className="text-sm text-muted-foreground">Resolvidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center p-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Relatórios de Incidentes</h3>
            <p className="text-muted-foreground mb-4">
              Gere relatórios detalhados sobre tendências e padrões de incidentes
            </p>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};