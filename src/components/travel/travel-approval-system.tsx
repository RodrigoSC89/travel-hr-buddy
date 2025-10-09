import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  Eye,
  DollarSign,
  Calendar,
  MapPin,
  User,
  FileText,
  Filter,
  RefreshCw,
  Download,
  ArrowRight,
  MessageSquare,
  History
} from 'lucide-react';

interface TravelRequest {
  id: string;
  title: string;
  description: string;
  requestor: {
    name: string;
    department: string;
    position: string;
  };
  destination: string;
  startDate: Date;
  endDate: Date;
  estimatedCost: number;
  purpose: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submittedAt: Date;
  approvalChain: Array<{
    approver: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    timestamp?: Date;
  }>;
  attachments?: string[];
  comments: Array<{
    author: string;
    message: string;
    timestamp: Date;
  }>;
}

export const TravelApprovalSystem: React.FC = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    priority: '',
    dateRange: '',
    costRange: ''
  });

  // Mock data for demonstration
  const mockRequests: TravelRequest[] = [
    {
      id: '1',
      title: 'Inspeção Técnica - Porto de Santos',
      description: 'Inspeção técnica obrigatória de embarcação para renovação de certificados',
      requestor: {
        name: 'Carlos Silva',
        department: 'Operações',
        position: 'Capitão'
      },
      destination: 'Santos, SP',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-17'),
      estimatedCost: 2500,
      purpose: 'Inspeção Obrigatória',
      priority: 'high',
      status: 'pending',
      submittedAt: new Date('2024-02-28'),
      approvalChain: [
        { approver: 'Ana Costa', role: 'Supervisor Operacional', status: 'approved', timestamp: new Date('2024-03-01') },
        { approver: 'Roberto Lima', role: 'Gerente de Operações', status: 'pending' },
        { approver: 'Maria Santos', role: 'Diretor Financeiro', status: 'pending' }
      ],
      comments: [
        { author: 'Carlos Silva', message: 'Inspeção urgente para evitar multas regulatórias', timestamp: new Date('2024-02-28') }
      ]
    },
    {
      id: '2',
      title: 'Conferência Marítima Internacional',
      description: 'Participação na conferência anual de tecnologia marítima e sustentabilidade',
      requestor: {
        name: 'Fernanda Oliveira',
        department: 'Engenharia',
        position: 'Engenheira Naval'
      },
      destination: 'Hamburg, Alemanha',
      startDate: new Date('2024-04-20'),
      endDate: new Date('2024-04-25'),
      estimatedCost: 8500,
      purpose: 'Desenvolvimento Profissional',
      priority: 'medium',
      status: 'in_review',
      submittedAt: new Date('2024-02-20'),
      approvalChain: [
        { approver: 'João Pereira', role: 'Coordenador de Engenharia', status: 'approved', timestamp: new Date('2024-02-22') },
        { approver: 'Patricia Rodrigues', role: 'Gerente de RH', status: 'approved', timestamp: new Date('2024-02-25') },
        { approver: 'Maria Santos', role: 'Diretor Financeiro', status: 'pending' }
      ],
      comments: [
        { author: 'Fernanda Oliveira', message: 'Oportunidade única para networking e conhecimento das últimas tecnologias', timestamp: new Date('2024-02-20') },
        { author: 'Patricia Rodrigues', message: 'Alinhado com plano de desenvolvimento da equipe', timestamp: new Date('2024-02-25') }
      ]
    },
    {
      id: '3',
      title: 'Treinamento STCW Avançado',
      description: 'Curso de atualização STCW para certificação internacional',
      requestor: {
        name: 'Miguel Torres',
        department: 'Tripulação',
        position: 'Oficial de Máquinas'
      },
      destination: 'Rio de Janeiro, RJ',
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-03-14'),
      estimatedCost: 1800,
      purpose: 'Certificação Obrigatória',
      priority: 'urgent',
      status: 'approved',
      submittedAt: new Date('2024-02-15'),
      approvalChain: [
        { approver: 'Carlos Mendes', role: 'Chefe de Máquinas', status: 'approved', timestamp: new Date('2024-02-16') },
        { approver: 'Roberto Lima', role: 'Gerente de Operações', status: 'approved', timestamp: new Date('2024-02-18') },
        { approver: 'Maria Santos', role: 'Diretor Financeiro', status: 'approved', timestamp: new Date('2024-02-20') }
      ],
      comments: [
        { author: 'Miguel Torres', message: 'Certificação expira em maio, treinamento urgente', timestamp: new Date('2024-02-15') },
        { author: 'Carlos Mendes', message: 'Aprovado com prioridade máxima', timestamp: new Date('2024-02-16') }
      ]
    }
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from Supabase
      // const { data, error } = await supabase.from('travel_requests').select('*');
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean, comments?: string) => {
    try {
      // In a real implementation, update via Supabase
      setRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          const updatedChain = req.approvalChain.map(approval => {
            if (approval.status === 'pending') {
              return {
                ...approval,
                status: (approved ? 'approved' : 'rejected') as 'approved' | 'rejected' | 'pending',
                comments,
                timestamp: new Date()
              };
            }
            return approval;
          });
          
          return {
            ...req,
            status: (approved ? 'approved' : 'rejected') as 'pending' | 'approved' | 'rejected' | 'in_review',
            approvalChain: updatedChain
          };
        }
        return req;
      }));

      toast({
        title: approved ? "Solicitação Aprovada" : "Solicitação Rejeitada",
        description: `A solicitação foi ${approved ? 'aprovada' : 'rejeitada'} com sucesso`,
      });
    } catch (error) {
      console.error('Error updating approval:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar aprovação",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_review': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab !== 'all' && request.status !== activeTab) return false;
    if (filters.department && !request.requestor.department.toLowerCase().includes(filters.department.toLowerCase())) return false;
    if (filters.priority && request.priority !== filters.priority) return false;
    return true;
  });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold text-warning">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprovadas</p>
                <p className="text-3xl font-bold text-success">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Análise</p>
                <p className="text-3xl font-bold text-info">
                  {requests.filter(r => r.status === 'in_review').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(requests.reduce((sum, r) => sum + r.estimatedCost, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                placeholder="Filtrar por departamento"
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={loadRequests} className="btn-travel">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" className="btn-travel">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-14 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="in_review" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Em Análise
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aprovadas
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejeitadas
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Todas
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="travel-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{request.title}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(request.priority)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {request.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{request.requestor.name} - {request.requestor.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{request.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(request.estimatedCost)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {request.startDate.toLocaleDateString('pt-BR')} - {request.endDate.toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-muted-foreground">{request.description}</p>

                      {/* Cadeia de Aprovação */}
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Cadeia de Aprovação:</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {request.approvalChain.map((approval, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(approval.status)}`}>
                                {getStatusIcon(approval.status)}
                                <span>{approval.approver}</span>
                              </div>
                              {index < request.approvalChain.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="btn-travel">
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{request.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Informações da Solicitação */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Solicitante</Label>
                                <p className="text-sm">{request.requestor.name} - {request.requestor.position}</p>
                              </div>
                              <div>
                                <Label>Departamento</Label>
                                <p className="text-sm">{request.requestor.department}</p>
                              </div>
                              <div>
                                <Label>Destino</Label>
                                <p className="text-sm">{request.destination}</p>
                              </div>
                              <div>
                                <Label>Valor Estimado</Label>
                                <p className="text-sm">{formatCurrency(request.estimatedCost)}</p>
                              </div>
                            </div>

                            <div>
                              <Label>Descrição</Label>
                              <p className="text-sm mt-1">{request.description}</p>
                            </div>

                            <div>
                              <Label>Finalidade</Label>
                              <p className="text-sm mt-1">{request.purpose}</p>
                            </div>

                            {/* Comentários */}
                            <div>
                              <Label className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comentários
                              </Label>
                              <div className="space-y-2 mt-2">
                                {request.comments.map((comment, index) => (
                                  <div key={index} className="p-3 bg-muted rounded-lg">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                      <span>{comment.author}</span>
                                      <span>{comment.timestamp.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <p className="text-sm">{comment.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Ações de Aprovação */}
                            {request.status === 'pending' && (
                              <div className="flex gap-2 pt-4 border-t">
                                <Button 
                                  onClick={() => handleApproval(request.id, true)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </Button>
                                <Button 
                                  onClick={() => handleApproval(request.id, false)}
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rejeitar
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {request.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproval(request.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApproval(request.id, false)}
                            className="text-xs px-2 py-1"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};