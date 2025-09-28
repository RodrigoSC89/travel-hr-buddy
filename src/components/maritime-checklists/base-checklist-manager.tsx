import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Ship, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Edit, 
  Download, 
  Upload,
  QrCode,
  Wifi,
  WifiOff,
  Brain,
  Camera,
  FileText,
  Calendar,
  MapPin,
  Users,
  Settings,
  Filter,
  ArrowUpDown,
  Search,
  Plus,
  Trash2,
  Copy,
  Archive,
  RefreshCw,
  Bell,
  Shield,
  Activity,
  BarChart3,
  Zap,
  Award,
  Target
} from 'lucide-react';
import type { Checklist, ChecklistTemplate, ChecklistSchedule, VesselInfo } from './checklist-types';

interface BaseChecklistManagerProps {
  vesselId?: string;
  userId: string;
  userRole: string;
  onChecklistSelect?: (checklist: Checklist) => void;
  onTemplateSelect?: (template: ChecklistTemplate) => void;
}

export const BaseChecklistManager: React.FC<BaseChecklistManagerProps> = ({
  vesselId,
  userId,
  userRole,
  onChecklistSelect,
  onTemplateSelect
}) => {
  const { toast } = useToast();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [schedules, setSchedules] = useState<ChecklistSchedule[]>([]);
  const [vessels, setVessels] = useState<VesselInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [vesselFilter, setVesselFilter] = useState(vesselId || 'all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadData();
    setupRealtimeSubscription();
  }, [vesselId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load from cache if offline
      if (isOffline) {
        await loadFromCache();
      } else {
        await loadFromAPI();
      }
    } catch (error) {
      console.error('Error loading checklist data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os checklists. Tentando cache local...",
        variant: "destructive"
      });
      await loadFromCache();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromAPI = async () => {
    // TODO: Implement Supabase API calls
    setChecklists(getDemoChecklists());
    setTemplates(getDemoTemplates());
    setSchedules(getDemoSchedules());
    setVessels(getDemoVessels());
    
    // Cache data for offline use
    await cacheData();
  };

  const loadFromCache = async () => {
    try {
      const cachedChecklists = localStorage.getItem('cachedChecklists');
      const cachedTemplates = localStorage.getItem('cachedTemplates');
      
      if (cachedChecklists) setChecklists(JSON.parse(cachedChecklists));
      if (cachedTemplates) setTemplates(JSON.parse(cachedTemplates));
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
  };

  const cacheData = async () => {
    try {
      localStorage.setItem('cachedChecklists', JSON.stringify(checklists));
      localStorage.setItem('cachedTemplates', JSON.stringify(templates));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    // TODO: Implement Supabase realtime subscription
  };

  const getDemoChecklists = (): Checklist[] => {
    return [
      {
        id: 'CL001',
        title: 'DP System Pre-Operation Check',
        type: 'dp',
        version: '2.1',
        description: 'Comprehensive DP system verification before operation',
        vessel: {
          id: 'VSL001',
          name: 'MV Ocean Pioneer',
          type: 'AHTS',
          imo: 'IMO1234567',
          flag: 'Brazil',
          classification: 'DNV',
          operator: 'Petrobras'
        },
        inspector: {
          id: 'INS001',
          name: 'Carlos Silva',
          license: 'DPO-001',
          company: 'Petrobras',
          email: 'carlos.silva@petrobras.com.br',
          phone: '+55 11 99999-0001',
          certifications: ['DP Operator', 'Chief Officer']
        },
        status: 'in_progress',
        items: [],
        createdAt: '2024-01-22T08:00:00Z',
        updatedAt: '2024-01-22T10:30:00Z',
        priority: 'high',
        scheduledFor: '2024-01-22T06:00:00Z',
        dueDate: '2024-01-22T18:00:00Z',
        estimatedDuration: 120,
        actualDuration: 90,
        complianceScore: 87.5,
        workflow: [
          {
            id: 'WF001',
            name: 'Creation',
            type: 'creation',
            status: 'completed',
            completedBy: 'Carlos Silva',
            completedAt: '2024-01-22T08:00:00Z',
            requiredRole: 'inspector'
          },
          {
            id: 'WF002',
            name: 'Inspection',
            type: 'inspection',
            status: 'in_progress',
            assignedTo: 'Carlos Silva',
            requiredRole: 'inspector'
          },
          {
            id: 'WF003',
            name: 'Review',
            type: 'review',
            status: 'pending',
            assignedTo: 'João Santos',
            requiredRole: 'supervisor'
          }
        ],
        tags: ['DP', 'Critical', 'Daily'],
        template: false,
        syncStatus: 'synced'
      },
      {
        id: 'CL002',
        title: 'Engine Room Daily Routine',
        type: 'machine_routine',
        version: '1.8',
        description: 'Daily engine room inspection and maintenance checks',
        vessel: {
          id: 'VSL001',
          name: 'MV Ocean Pioneer',
          type: 'AHTS',
          imo: 'IMO1234567',
          flag: 'Brazil',
          classification: 'DNV',
          operator: 'Petrobras'
        },
        inspector: {
          id: 'INS002',
          name: 'Roberto Lima',
          license: 'ENG-002',
          company: 'Petrobras',
          email: 'roberto.lima@petrobras.com.br',
          phone: '+55 11 99999-0002',
          certifications: ['Chief Engineer', 'Marine Engineer']
        },
        status: 'pending_review',
        items: [],
        createdAt: '2024-01-22T06:00:00Z',
        updatedAt: '2024-01-22T14:00:00Z',
        completedAt: '2024-01-22T14:00:00Z',
        priority: 'medium',
        scheduledFor: '2024-01-22T06:00:00Z',
        dueDate: '2024-01-22T18:00:00Z',
        estimatedDuration: 180,
        actualDuration: 165,
        complianceScore: 94.2,
        workflow: [
          {
            id: 'WF004',
            name: 'Creation',
            type: 'creation',
            status: 'completed',
            completedBy: 'Roberto Lima',
            completedAt: '2024-01-22T06:00:00Z',
            requiredRole: 'inspector'
          },
          {
            id: 'WF005',
            name: 'Inspection',
            type: 'inspection',
            status: 'completed',
            completedBy: 'Roberto Lima',
            completedAt: '2024-01-22T14:00:00Z',
            requiredRole: 'inspector'
          },
          {
            id: 'WF006',
            name: 'Review',
            type: 'review',
            status: 'in_progress',
            assignedTo: 'Maria Santos',
            requiredRole: 'chief_engineer'
          }
        ],
        tags: ['Engine', 'Daily', 'Routine'],
        template: false,
        syncStatus: 'synced'
      }
    ];
  };

  const getDemoTemplates = (): ChecklistTemplate[] => {
    return [
      {
        id: 'TPL001',
        name: 'DP System Standard Check',
        type: 'dp',
        version: '2.1',
        description: 'Standard template for DP system verification',
        items: [],
        estimatedDuration: 120,
        frequency: 'daily',
        applicableVesselTypes: ['AHTS', 'PSV', 'MPSV'],
        requiredCertifications: ['DP Operator'],
        dependencies: [],
        active: true,
        createdBy: 'System Admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ];
  };

  const getDemoSchedules = (): ChecklistSchedule[] => {
    return [
      {
        id: 'SCH001',
        templateId: 'TPL001',
        vesselId: 'VSL001',
        frequency: 'daily',
        nextDueDate: '2024-01-23T06:00:00Z',
        lastCompleted: '2024-01-22T14:00:00Z',
        autoAssign: true,
        assignedTo: 'Carlos Silva',
        reminderSettings: {
          enabled: true,
          daysBeforeDue: [1, 0],
          emailNotification: true,
          pushNotification: true,
          smsNotification: false
        },
        active: true
      }
    ];
  };

  const getDemoVessels = (): VesselInfo[] => {
    return [
      {
        id: 'VSL001',
        name: 'MV Ocean Pioneer',
        type: 'AHTS',
        imo: 'IMO1234567',
        flag: 'Brazil',
        classification: 'DNV',
        operator: 'Petrobras'
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'approved': return 'bg-info/20 text-info border-info/30';
      case 'in_progress': return 'bg-warning/20 text-warning border-warning/30';
      case 'pending_review': return 'bg-primary/20 text-primary border-primary/30';
      case 'rejected': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'draft': return 'bg-muted/20 text-muted-foreground border-muted/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'approved': return <Award className="w-4 h-4 text-info" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-warning" />;
      case 'pending_review': return <Eye className="w-4 h-4 text-primary" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'draft': return <Edit className="w-4 h-4 text-muted-foreground" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dp': return <Target className="w-4 h-4" />;
      case 'machine_routine': return <Settings className="w-4 h-4" />;
      case 'nautical_routine': return <Ship className="w-4 h-4" />;
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'environmental': return <Activity className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-warning/20 text-warning border-warning/30';
      case 'medium': return 'bg-info/20 text-info border-info/30';
      case 'low': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.inspector.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || checklist.status === statusFilter;
    const matchesType = typeFilter === 'all' || checklist.type === typeFilter;
    const matchesVessel = vesselFilter === 'all' || checklist.vessel.id === vesselFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesVessel;
  });

  const getOverviewStats = () => {
    const total = checklists.length;
    const completed = checklists.filter(c => c.status === 'completed').length;
    const overdue = checklists.filter(c => 
      c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'completed'
    ).length;
    const inProgress = checklists.filter(c => c.status === 'in_progress').length;
    const avgCompliance = checklists.reduce((acc, c) => acc + (c.complianceScore || 0), 0) / total || 0;
    
    return { total, completed, overdue, inProgress, avgCompliance };
  };

  const stats = getOverviewStats();

  const handleCreateChecklist = async (templateId: string) => {
    try {
      // TODO: Implement checklist creation from template
      toast({
        title: "Checklist criado",
        description: "Novo checklist criado com sucesso"
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o checklist",
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      // TODO: Implement bulk actions
      toast({
        title: "Ação executada",
        description: `${action} aplicado a ${selectedChecklists.length} checklists`
      });
      setSelectedChecklists([]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível executar a ação",
        variant: "destructive"
      });
    }
  };

  const handleAIAnalysis = async () => {
    try {
      // TODO: Implement AI analysis
      setIsAIAnalysisOpen(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível executar análise de IA",
        variant: "destructive"
      });
    }
  };

  const handleSyncOfflineData = async () => {
    try {
      // TODO: Implement offline data sync
      toast({
        title: "Sincronização concluída",
        description: "Dados offline sincronizados com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar dados offline",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema de Checklists Marítimos</h1>
          <p className="text-muted-foreground">
            Gestão profissional de checklists com IA e automação
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isOffline && (
            <Alert className="w-auto">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>Modo Offline</AlertDescription>
            </Alert>
          )}
          
          <Button variant="outline" onClick={handleSyncOfflineData} disabled={!isOffline}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar
          </Button>
          
          <Button variant="outline" onClick={handleAIAnalysis}>
            <Brain className="w-4 h-4 mr-2" />
            Análise IA
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Checklist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Checklist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel">Embarcação</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a embarcação" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels.map(vessel => (
                        <SelectItem key={vessel.id} value={vessel.id}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => handleCreateChecklist('TPL001')}>
                    Criar Checklist
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/20">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/20">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/20">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-info/20">
                <BarChart3 className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Médio</p>
                <p className="text-2xl font-bold text-info">{Math.round(stats.avgCompliance)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar checklists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="pending_review">Aguardando revisão</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="dp">DP System</SelectItem>
                <SelectItem value="machine_routine">Rotina de Máquinas</SelectItem>
                <SelectItem value="nautical_routine">Rotina Náutica</SelectItem>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="environmental">Ambiental</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vesselFilter} onValueChange={setVesselFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as embarcações</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {vessel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedChecklists.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedChecklists.length} checklist(s) selecionado(s)
              </span>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Aprovar
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                <Archive className="w-3 h-3 mr-1" />
                Arquivar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedChecklists([])}>
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar Seleção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChecklists.map((checklist) => (
          <Card key={checklist.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(checklist.type)}
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className={getStatusColor(checklist.status)}>
                    {getStatusIcon(checklist.status)}
                    <span className="ml-1">{checklist.status}</span>
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(checklist.priority)}>
                    {checklist.priority}
                  </Badge>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Ship className="w-4 h-4" />
                {checklist.vessel.name}
                <span className="text-muted-foreground">•</span>
                <Users className="w-4 h-4" />
                {checklist.inspector.name}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {checklist.complianceScore && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance Score</span>
                    <span className="font-medium">{checklist.complianceScore}%</span>
                  </div>
                  <Progress value={checklist.complianceScore} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>
                    {checklist.dueDate ? 
                      new Date(checklist.dueDate).toLocaleDateString() : 
                      'Sem prazo'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span>{checklist.estimatedDuration} min</span>
                </div>
              </div>

              {checklist.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {checklist.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {checklist.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{checklist.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onChecklistSelect?.(checklist)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Abrir
                </Button>
                <Button variant="outline" size="sm">
                  <QrCode className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChecklists.length === 0 && !isLoading && (
        <div className="text-center p-8">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum checklist encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros ou criar um novo checklist
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Checklist
          </Button>
        </div>
      )}
    </div>
  );
};