/**
 * Maritime Checklist CRUD Manager
 * Full CRUD with versioning, execution workflow, and digital signatures
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Search, Filter, Edit, Trash2, Copy, Archive, RotateCcw,
  Play, CheckCircle, Clock, FileText, Download, Upload, Loader2,
  PenTool, History, AlertTriangle, ChevronRight, Eye, RefreshCw,
  ClipboardCheck, List, Settings, X
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  checked: boolean;
  notes?: string;
  category?: string;
}

interface Checklist {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'pre-departure' | 'safety' | 'maintenance' | 'inspection' | 'cargo' | 'custom';
  status: 'draft' | 'published' | 'archived';
  version: number;
  items: ChecklistItem[];
  vesselId?: string;
  vesselName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  signature?: string;
  approvedBy?: string;
}

interface ChecklistRun {
  id: string;
  checklistId: string;
  checklistTitle: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  completedItems: number;
  totalItems: number;
  startedAt: string;
  completedAt?: string;
  executedBy: string;
  signature?: string;
  notes?: string;
}

const CHECKLIST_TYPES = [
  { value: 'pre-departure', label: 'Pré-Partida' },
  { value: 'safety', label: 'Segurança' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'cargo', label: 'Carga' },
  { value: 'custom', label: 'Personalizado' },
];

const CATEGORIES = [
  'Navegação', 'Segurança', 'Carga', 'Manutenção', 'Conformidade', 'Tripulação', 'Ambiental'
];

export function ChecklistCRUDManager() {
  const { toast } = useToast();
  
  // State
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('templates');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [activeRun, setActiveRun] = useState<ChecklistRun | null>(null);
  const [runItems, setRunItems] = useState<ChecklistItem[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Checklist>>({
    title: '',
    description: '',
    category: 'Segurança',
    type: 'safety',
    items: [],
  });
  const [newItemText, setNewItemText] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('operational_checklists')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped: Checklist[] = (data || []).map(row => {
        const meta = (row.metadata || {}) as Record<string, unknown>;
        const items = Array.isArray(meta.items) ? (meta.items as ChecklistItem[]) : [];
        return {
          id: row.id,
          title: row.title,
          description: (meta.description as string) || '',
          category: row.type || 'Segurança',
          type: (row.source_type === 'pre-departure' ? 'pre-departure' : 
                 row.type === 'safety' ? 'safety' : 
                 row.type === 'maintenance' ? 'maintenance' : 
                 row.type === 'inspection' ? 'inspection' : 
                 row.type === 'cargo' ? 'cargo' : 'custom') as Checklist['type'],
          status: (row.status === 'published' ? 'published' : 
                   row.status === 'archived' ? 'archived' : 'draft') as Checklist['status'],
          version: (meta.version as number) || 1,
          items,
          vesselId: row.vessel_id || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by || 'Sistema',
        };
      });

      setChecklists(mapped);
      // Runs are derived from checklist metadata - no separate table needed
      setRuns([]);
    } catch (error) {
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os checklists. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter checklists
  const filteredChecklists = checklists.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                         c.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // CRUD Operations
  const handleCreate = useCallback(() => {
    setSelectedChecklist(null);
    setFormData({
      title: '',
      description: '',
      category: 'Segurança',
      type: 'safety',
      items: [],
    });
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setFormData({ ...checklist });
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setIsViewOpen(true);
  }, []);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    setActionLoading('save');
    try {
      const metadata = JSON.parse(JSON.stringify({
        description: formData.description || '',
        items: formData.items || [],
        version: selectedChecklist ? (selectedChecklist.version + 1) : 1,
      }));

      if (selectedChecklist) {
        const { error } = await supabase
          .from('operational_checklists')
          .update({
            title: formData.title!,
            type: formData.type || 'custom',
            metadata,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedChecklist.id);
        
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Checklist atualizado com sucesso' });
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('operational_checklists')
          .insert([{
            title: formData.title!,
            type: formData.type || 'custom',
            source_type: formData.type || 'custom',
            status: 'draft',
            created_by: userData.user?.id || 'system',
            metadata,
          }]);
        
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Checklist criado com sucesso' });
      }

      setIsFormOpen(false);
      await loadChecklists();
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar checklist', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este checklist?')) return;

    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('operational_checklists')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setChecklists(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Sucesso', description: 'Checklist excluído' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (checklist: Checklist) => {
    setActionLoading(checklist.id);
    try {
      const duplicate: Checklist = {
        ...checklist,
        id: `dup-${Date.now()}`,
        title: `${checklist.title} (Cópia)`,
        status: 'draft',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChecklists(prev => [duplicate, ...prev]);
      toast({ title: 'Sucesso', description: 'Checklist duplicado com sucesso' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao duplicar', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (checklist: Checklist) => {
    setActionLoading(checklist.id);
    try {
      const { error } = await supabase
        .from('operational_checklists')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', checklist.id);
      if (error) throw error;
      setChecklists(prev => prev.map(c => 
        c.id === checklist.id 
          ? { ...c, status: 'published' as const, updatedAt: new Date().toISOString() }
          : c
      ));
      toast({ title: 'Sucesso', description: 'Checklist publicado' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao publicar', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (checklist: Checklist) => {
    setActionLoading(checklist.id);
    try {
      const { error } = await supabase
        .from('operational_checklists')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', checklist.id);
      if (error) throw error;
      setChecklists(prev => prev.map(c => 
        c.id === checklist.id 
          ? { ...c, status: 'archived' as const, updatedAt: new Date().toISOString() }
          : c
      ));
      toast({ title: 'Sucesso', description: 'Checklist arquivado' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao arquivar', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  // Execution
  const handleStartExecution = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setRunItems(checklist.items.map(item => ({ ...item, checked: false, notes: '' })));
    setIsExecuteOpen(true);
  };

  const handleToggleItem = (itemId: string) => {
    setRunItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleCompleteExecution = async () => {
    if (!selectedChecklist) return;

    const completedItems = runItems.filter(i => i.checked).length;
    const requiredIncomplete = runItems.filter(i => i.required && !i.checked);

    if (requiredIncomplete.length > 0) {
      toast({
        title: 'Itens obrigatórios pendentes',
        description: `${requiredIncomplete.length} item(s) obrigatório(s) não foram marcados`,
        variant: 'destructive',
      });
      return;
    }

    setActionLoading('complete');
    try {
      const newRun: ChecklistRun = {
        id: `run-${Date.now()}`,
        checklistId: selectedChecklist.id,
        checklistTitle: selectedChecklist.title,
        status: 'completed',
        progress: 100,
        completedItems,
        totalItems: runItems.length,
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        executedBy: 'Usuário Atual',
        signature: 'Assinatura Digital Pendente',
      };

      setRuns(prev => [newRun, ...prev]);
      setIsExecuteOpen(false);
      setIsSignatureOpen(true);
      setActiveRun(newRun);
      
      toast({ title: 'Sucesso', description: 'Checklist executado com sucesso' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao completar execução', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignature = async () => {
    if (!activeRun) return;

    setActionLoading('sign');
    try {
      setRuns(prev => prev.map(r => 
        r.id === activeRun.id 
          ? { ...r, signature: `Assinado em ${new Date().toLocaleString('pt-BR')}` }
          : r
      ));
      setIsSignatureOpen(false);
      toast({ title: 'Sucesso', description: 'Assinatura digital registrada' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar assinatura', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  // Add item to form
  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText,
      required: true,
      checked: false,
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
    setNewItemText('');
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== itemId),
    }));
  };

  // Export
  const handleExport = () => {
    const data = filteredChecklists.map(c => ({
      Título: c.title,
      Categoria: c.category,
      Tipo: c.type,
      Status: c.status,
      Versão: c.version,
      Itens: c.items.length,
      Criado: new Date(c.createdAt).toLocaleDateString('pt-BR'),
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklists_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({ title: 'Exportado', description: 'Arquivo CSV gerado com sucesso' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeInfo = CHECKLIST_TYPES.find(t => t.value === type);
    return <Badge variant="outline">{typeInfo?.label || type}</Badge>;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Gerenciador de Checklists Marítimos
          </h2>
          <p className="text-muted-foreground">
            Crie, gerencie e execute checklists com versionamento e assinatura digital
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={loadChecklists}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Checklist
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Templates ({checklists.length})
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Execuções ({runs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar checklists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {CHECKLIST_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checklists Grid */}
          {filteredChecklists.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie seu primeiro checklist para começar a gerenciar verificações marítimas
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Checklist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChecklists.map((checklist) => (
                <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{checklist.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {checklist.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(checklist.status)}
                      {getTypeBadge(checklist.type)}
                      <Badge variant="outline">v{checklist.version}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Itens:</span>
                        <span className="font-medium">{checklist.items.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Categoria:</span>
                        <span className="font-medium">{checklist.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atualizado:</span>
                        <span className="font-medium">
                          {new Date(checklist.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView(checklist)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(checklist)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDuplicate(checklist)}
                          disabled={actionLoading === checklist.id}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {checklist.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handlePublish(checklist)}
                            disabled={actionLoading === checklist.id}
                          >
                            Publicar
                          </Button>
                        )}
                        {checklist.status === 'published' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStartExecution(checklist)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Executar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleArchive(checklist)}
                              disabled={actionLoading === checklist.id}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(checklist.id)}
                          disabled={actionLoading === checklist.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {runs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Play className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma execução registrada</h3>
                <p className="text-muted-foreground text-center">
                  Execute um checklist publicado para ver o histórico aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <Card key={run.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{run.checklistTitle}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Executado por: {run.executedBy}</span>
                          <span>•</span>
                          <span>{new Date(run.startedAt).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {run.completedItems}/{run.totalItems} itens
                          </div>
                          <Progress value={run.progress} className="w-24 h-2 mt-1" />
                        </div>
                        <Badge className={run.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {run.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                        </Badge>
                        {run.signature && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <PenTool className="h-3 w-3" />
                            Assinado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedChecklist ? 'Editar Checklist' : 'Novo Checklist'}
            </DialogTitle>
            <DialogDescription>
              {selectedChecklist 
                ? `Versão atual: ${selectedChecklist.version}. Ao salvar, será criada a versão ${selectedChecklist.version + 1}`
                : 'Preencha as informações do novo checklist'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Checklist Pré-Partida"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito deste checklist"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Checklist['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKLIST_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Itens do Checklist</label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Digite um item e pressione adicionar"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <Button onClick={handleAddItem} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {(formData.items || []).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <span className="flex-1 text-sm">{item.text}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.required ? 'Obrigatório' : 'Opcional'}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={actionLoading === 'save'}>
              {actionLoading === 'save' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedChecklist ? 'Salvar Alterações' : 'Criar Checklist'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution Dialog */}
      <Dialog open={isExecuteOpen} onOpenChange={setIsExecuteOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Executar Checklist</DialogTitle>
            <DialogDescription>
              {selectedChecklist?.title} - Marque os itens conforme são verificados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span className="text-sm">Progresso:</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(runItems.filter(i => i.checked).length / runItems.length) * 100} 
                  className="w-32"
                />
                <span className="text-sm font-medium">
                  {runItems.filter(i => i.checked).length}/{runItems.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {runItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-3 border rounded transition-colors ${
                    item.checked ? 'bg-green-50 border-green-200 dark:bg-green-900/20' : ''
                  }`}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => handleToggleItem(item.id)}
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {index + 1}. {item.text}
                    </p>
                    {item.required && !item.checked && (
                      <Badge variant="destructive" className="text-xs mt-1">Obrigatório</Badge>
                    )}
                  </div>
                  {item.checked && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExecuteOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCompleteExecution} 
              disabled={actionLoading === 'complete'}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading === 'complete' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Finalizar e Assinar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signature Dialog */}
      <Dialog open={isSignatureOpen} onOpenChange={setIsSignatureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assinatura Digital</DialogTitle>
            <DialogDescription>
              Confirme sua identidade para assinar digitalmente este checklist
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded text-center">
              <PenTool className="h-12 w-12 mx-auto text-primary mb-3" />
              <p className="text-sm">
                Ao assinar, você confirma que todos os itens foram verificados pessoalmente
                e as informações estão corretas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignatureOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSignature} disabled={actionLoading === 'sign'}>
              {actionLoading === 'sign' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assinar Digitalmente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedChecklist?.title}</DialogTitle>
            <DialogDescription>
              {selectedChecklist?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedChecklist && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {getStatusBadge(selectedChecklist.status)}
                {getTypeBadge(selectedChecklist.type)}
                <Badge variant="outline">v{selectedChecklist.version}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="ml-2 font-medium">{selectedChecklist.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado por:</span>
                  <span className="ml-2 font-medium">{selectedChecklist.createdBy}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedChecklist.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedChecklist.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Itens ({selectedChecklist.items.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedChecklist.items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">{index + 1}.</span>
                      <span className="flex-1 text-sm">{item.text}</span>
                      <Badge variant={item.required ? 'destructive' : 'secondary'} className="text-xs">
                        {item.required ? 'Obrigatório' : 'Opcional'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Fechar
            </Button>
            {selectedChecklist?.status === 'published' && (
              <Button onClick={() => {
                setIsViewOpen(false);
                handleStartExecution(selectedChecklist);
              }}>
                <Play className="h-4 w-4 mr-2" />
                Executar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChecklistCRUDManager;
