/**
 * Compliance Audit Manager
 * Full audit workflow: templates, execution, findings, NC management, export
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Search, Edit, Trash2, Download, Loader2, Play, CheckCircle,
  Clock, FileText, AlertTriangle, XCircle, Eye, RefreshCw, Shield,
  ClipboardList, FileCheck, AlertCircle, ChevronRight, Upload, Flag
} from 'lucide-react';

interface AuditTemplate {
  id: string;
  name: string;
  standard: string;
  description: string;
  version: number;
  sections: AuditSection[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface AuditSection {
  id: string;
  title: string;
  items: AuditItem[];
}

interface AuditItem {
  id: string;
  code: string;
  requirement: string;
  guidance?: string;
  critical: boolean;
}

interface AuditRun {
  id: string;
  templateId: string;
  templateName: string;
  standard: string;
  vesselId?: string;
  vesselName: string;
  status: 'scheduled' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  auditor: string;
  findings: AuditFinding[];
  score: number;
  progress: number;
}

interface AuditFinding {
  id: string;
  itemCode: string;
  itemRequirement: string;
  status: 'conforming' | 'non_conforming' | 'observation' | 'not_applicable';
  severity?: 'minor' | 'major' | 'critical';
  evidence?: string;
  notes?: string;
  correctiveAction?: string;
  dueDate?: string;
  responsiblePerson?: string;
}

const AUDIT_STANDARDS = [
  { value: 'ism', label: 'ISM Code' },
  { value: 'isps', label: 'ISPS Code' },
  { value: 'marpol', label: 'MARPOL' },
  { value: 'solas', label: 'SOLAS' },
  { value: 'mlc', label: 'MLC 2006' },
  { value: 'iso9001', label: 'ISO 9001' },
  { value: 'iso14001', label: 'ISO 14001' },
  { value: 'psc', label: 'Port State Control' },
  { value: 'imca', label: 'IMCA' },
  { value: 'ocimf', label: 'OCIMF/SIRE' },
];

export function ComplianceAuditManager() {
  const { toast } = useToast();
  
  // State
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [audits, setAudits] = useState<AuditRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStandard, setFilterStandard] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('audits');
  
  // Modal states
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [isAuditFormOpen, setIsAuditFormOpen] = useState(false);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isFindingsOpen, setIsFindingsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AuditTemplate | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditRun | null>(null);
  
  // Form state
  const [templateForm, setTemplateForm] = useState<Partial<AuditTemplate>>({
    name: '',
    standard: 'ism',
    description: '',
    sections: [],
  });
  const [auditForm, setAuditForm] = useState<Partial<AuditRun>>({
    vesselName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    auditor: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Demo templates
      const demoTemplates: AuditTemplate[] = [
        {
          id: 't1',
          name: 'Auditoria ISM Completa',
          standard: 'ism',
          description: 'Auditoria completa do Sistema de Gestão de Segurança conforme ISM Code',
          version: 2,
          sections: [
            {
              id: 's1',
              title: 'Política de Segurança e Proteção Ambiental',
              items: [
                { id: 'i1', code: 'ISM-1.1', requirement: 'A empresa possui uma política documentada de segurança e proteção ambiental?', critical: true },
                { id: 'i2', code: 'ISM-1.2', requirement: 'A política é comunicada a todos os funcionários?', critical: false },
              ]
            },
            {
              id: 's2',
              title: 'Responsabilidade e Autoridade',
              items: [
                { id: 'i3', code: 'ISM-2.1', requirement: 'Há uma pessoa designada em terra para assuntos de segurança?', critical: true },
                { id: 'i4', code: 'ISM-2.2', requirement: 'O comandante tem autoridade documentada para decisões de segurança?', critical: true },
              ]
            },
          ],
          status: 'published',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 't2',
          name: 'Inspeção ISPS Code',
          standard: 'isps',
          description: 'Verificação de conformidade com o Código ISPS',
          version: 1,
          sections: [
            {
              id: 's3',
              title: 'Plano de Proteção do Navio',
              items: [
                { id: 'i5', code: 'ISPS-1.1', requirement: 'O Plano de Proteção do Navio está aprovado e a bordo?', critical: true },
                { id: 'i6', code: 'ISPS-1.2', requirement: 'A tripulação conhece suas responsabilidades de proteção?', critical: false },
              ]
            },
          ],
          status: 'published',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Demo audits
      const demoAudits: AuditRun[] = [
        {
          id: 'a1',
          templateId: 't1',
          templateName: 'Auditoria ISM Completa',
          standard: 'ism',
          vesselName: 'MV Santos Explorer',
          status: 'completed',
          scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          auditor: 'João Auditor',
          score: 92,
          progress: 100,
          findings: [
            { id: 'f1', itemCode: 'ISM-1.1', itemRequirement: 'Política documentada', status: 'conforming' },
            { id: 'f2', itemCode: 'ISM-1.2', itemRequirement: 'Comunicação da política', status: 'observation', notes: 'Melhorar frequência de treinamentos' },
            { id: 'f3', itemCode: 'ISM-2.1', itemRequirement: 'Pessoa designada', status: 'conforming' },
            { id: 'f4', itemCode: 'ISM-2.2', itemRequirement: 'Autoridade do comandante', status: 'conforming' },
          ],
        },
        {
          id: 'a2',
          templateId: 't2',
          templateName: 'Inspeção ISPS Code',
          standard: 'isps',
          vesselName: 'MV Atlantic Pioneer',
          status: 'in_progress',
          scheduledDate: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          auditor: 'Maria Inspetora',
          score: 0,
          progress: 50,
          findings: [
            { id: 'f5', itemCode: 'ISPS-1.1', itemRequirement: 'Plano de Proteção aprovado', status: 'conforming' },
          ],
        },
        {
          id: 'a3',
          templateId: 't1',
          templateName: 'Auditoria ISM Completa',
          standard: 'ism',
          vesselName: 'MV Pacific Guardian',
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          auditor: 'Carlos Auditor',
          score: 0,
          progress: 0,
          findings: [],
        },
      ];

      setTemplates(demoTemplates);
      setAudits(demoAudits);
    } catch (error) {
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter audits
  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.vesselName.toLowerCase().includes(search.toLowerCase()) ||
                         a.templateName.toLowerCase().includes(search.toLowerCase());
    const matchesStandard = filterStandard === 'all' || a.standard === filterStandard;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStandard && matchesStatus;
  });

  // Handlers
  const handleCreateTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      standard: 'ism',
      description: '',
      sections: [],
    });
    setIsTemplateFormOpen(true);
  }, []);

  const handleScheduleAudit = useCallback((template?: AuditTemplate) => {
    setSelectedTemplate(template || null);
    setAuditForm({
      templateId: template?.id,
      templateName: template?.name,
      standard: template?.standard,
      vesselName: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      auditor: '',
    });
    setIsAuditFormOpen(true);
  }, []);

  const handleSaveTemplate = async () => {
    if (!templateForm.name?.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setActionLoading('save-template');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newTemplate: AuditTemplate = {
        id: `t-${Date.now()}`,
        name: templateForm.name!,
        standard: templateForm.standard || 'ism',
        description: templateForm.description || '',
        version: 1,
        sections: templateForm.sections || [],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setIsTemplateFormOpen(false);
      toast({ title: 'Sucesso', description: 'Template criado com sucesso' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar template', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveAudit = async () => {
    if (!auditForm.vesselName?.trim()) {
      toast({ title: 'Erro', description: 'Nome da embarcação é obrigatório', variant: 'destructive' });
      return;
    }
    if (!auditForm.auditor?.trim()) {
      toast({ title: 'Erro', description: 'Auditor é obrigatório', variant: 'destructive' });
      return;
    }

    setActionLoading('save-audit');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const template = templates.find(t => t.id === selectedTemplate?.id);

      const newAudit: AuditRun = {
        id: `a-${Date.now()}`,
        templateId: selectedTemplate?.id || 't1',
        templateName: selectedTemplate?.name || 'Auditoria Geral',
        standard: selectedTemplate?.standard || 'ism',
        vesselName: auditForm.vesselName!,
        status: 'scheduled',
        scheduledDate: new Date(auditForm.scheduledDate!).toISOString(),
        auditor: auditForm.auditor!,
        score: 0,
        progress: 0,
        findings: [],
      };

      setAudits(prev => [newAudit, ...prev]);
      setIsAuditFormOpen(false);
      toast({ title: 'Sucesso', description: 'Auditoria agendada com sucesso' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao agendar auditoria', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartAudit = async (audit: AuditRun) => {
    setActionLoading(audit.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAudits(prev => prev.map(a => 
        a.id === audit.id 
          ? { ...a, status: 'in_progress' as const, startedAt: new Date().toISOString() }
          : a
      ));
      toast({ title: 'Sucesso', description: 'Auditoria iniciada' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao iniciar auditoria', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteAudit = async (audit: AuditRun) => {
    setActionLoading(audit.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate score
      const conforming = audit.findings.filter(f => f.status === 'conforming').length;
      const total = audit.findings.filter(f => f.status !== 'not_applicable').length;
      const score = total > 0 ? Math.round((conforming / total) * 100) : 0;

      setAudits(prev => prev.map(a => 
        a.id === audit.id 
          ? { 
              ...a, 
              status: 'completed' as const, 
              completedAt: new Date().toISOString(),
              progress: 100,
              score
            }
          : a
      ));
      toast({ title: 'Sucesso', description: 'Auditoria finalizada' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao finalizar auditoria', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewFindings = (audit: AuditRun) => {
    setSelectedAudit(audit);
    setIsFindingsOpen(true);
  };

  const handleDeleteAudit = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta auditoria?')) return;

    setActionLoading(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAudits(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Sucesso', description: 'Auditoria excluída' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = (audit: AuditRun) => {
    const data = {
      auditoria: audit.templateName,
      embarcacao: audit.vesselName,
      padrao: AUDIT_STANDARDS.find(s => s.value === audit.standard)?.label,
      auditor: audit.auditor,
      dataAgendada: new Date(audit.scheduledDate).toLocaleDateString('pt-BR'),
      status: audit.status,
      score: `${audit.score}%`,
      constatacoes: audit.findings.map(f => ({
        codigo: f.itemCode,
        requisito: f.itemRequirement,
        status: f.status,
        severidade: f.severity || 'N/A',
        observacoes: f.notes || '',
        acaoCorretiva: f.correctiveAction || '',
      })),
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${audit.vesselName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    toast({ title: 'Exportado', description: 'Relatório de auditoria exportado' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">Em Andamento</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Agendada</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-500">Revisão Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getFindingStatusBadge = (status: string) => {
    switch (status) {
      case 'conforming':
        return <Badge className="bg-green-500">Conforme</Badge>;
      case 'non_conforming':
        return <Badge variant="destructive">Não Conforme</Badge>;
      case 'observation':
        return <Badge className="bg-yellow-500">Observação</Badge>;
      case 'not_applicable':
        return <Badge variant="outline">N/A</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
            <Shield className="h-6 w-6" />
            Gerenciador de Auditorias de Compliance
          </h2>
          <p className="text-muted-foreground">
            Templates, execução de auditorias, constatações e não conformidades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleCreateTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={() => handleScheduleAudit()}>
            <Plus className="h-4 w-4 mr-2" />
            Agendar Auditoria
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Auditorias ({audits.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar auditorias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStandard} onValueChange={setFilterStandard}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os padrões</SelectItem>
                {AUDIT_STANDARDS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audits List */}
          {filteredAudits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma auditoria encontrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Agende uma nova auditoria para começar
                </p>
                <Button onClick={() => handleScheduleAudit()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Primeira Auditoria
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAudits.map((audit) => (
                <Card key={audit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{audit.vesselName}</h4>
                          {getStatusBadge(audit.status)}
                          <Badge variant="outline">
                            {AUDIT_STANDARDS.find(s => s.value === audit.standard)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{audit.templateName}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Auditor: {audit.auditor}</span>
                          <span>•</span>
                          <span>Data: {new Date(audit.scheduledDate).toLocaleDateString('pt-BR')}</span>
                          {audit.status === 'completed' && (
                            <>
                              <span>•</span>
                              <span className={`font-medium ${getScoreColor(audit.score)}`}>
                                Score: {audit.score}%
                              </span>
                            </>
                          )}
                        </div>
                        {audit.status === 'in_progress' && (
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={audit.progress} className="w-32" />
                            <span className="text-sm">{audit.progress}%</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {audit.status === 'scheduled' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartAudit(audit)}
                            disabled={actionLoading === audit.id}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {audit.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleCompleteAudit(audit)}
                            disabled={actionLoading === audit.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Finalizar
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewFindings(audit)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        {audit.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleExport(audit)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteAudit(audit.id)}
                          disabled={actionLoading === audit.id}
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

        <TabsContent value="templates" className="space-y-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie templates de auditoria para padronizar suas verificações
                </p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {AUDIT_STANDARDS.find(s => s.value === template.standard)?.label}
                      </Badge>
                      <Badge variant="outline">v{template.version}</Badge>
                      <Badge className={template.status === 'published' ? 'bg-green-500' : 'bg-gray-500'}>
                        {template.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-3">
                      {template.sections.length} seções • {template.sections.reduce((acc, s) => acc + s.items.length, 0)} itens
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleScheduleAudit(template)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Usar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Form Dialog */}
      <Dialog open={isTemplateFormOpen} onOpenChange={setIsTemplateFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Template de Auditoria</DialogTitle>
            <DialogDescription>
              Crie um template reutilizável para auditorias
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={templateForm.name || ''}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Auditoria ISM Anual"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Padrão/Norma</label>
              <Select
                value={templateForm.standard}
                onValueChange={(value) => setTemplateForm(prev => ({ ...prev, standard: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_STANDARDS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={templateForm.description || ''}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito deste template"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={actionLoading === 'save-template'}>
              {actionLoading === 'save-template' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Form Dialog */}
      <Dialog open={isAuditFormOpen} onOpenChange={setIsAuditFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Nova Auditoria</DialogTitle>
            <DialogDescription>
              {selectedTemplate 
                ? `Usando template: ${selectedTemplate.name}`
                : 'Selecione um template e preencha os dados'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedTemplate && (
              <div>
                <label className="text-sm font-medium">Template</label>
                <Select
                  value={auditForm.templateId}
                  onValueChange={(value) => {
                    const template = templates.find(t => t.id === value);
                    setSelectedTemplate(template || null);
                    setAuditForm(prev => ({
                      ...prev,
                      templateId: value,
                      templateName: template?.name,
                      standard: template?.standard,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.status === 'published').map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Embarcação *</label>
              <Input
                value={auditForm.vesselName || ''}
                onChange={(e) => setAuditForm(prev => ({ ...prev, vesselName: e.target.value }))}
                placeholder="Nome da embarcação"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Data Agendada *</label>
              <Input
                type="date"
                value={auditForm.scheduledDate || ''}
                onChange={(e) => setAuditForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Auditor Responsável *</label>
              <Input
                value={auditForm.auditor || ''}
                onChange={(e) => setAuditForm(prev => ({ ...prev, auditor: e.target.value }))}
                placeholder="Nome do auditor"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuditFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAudit} disabled={actionLoading === 'save-audit'}>
              {actionLoading === 'save-audit' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agendar Auditoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Findings Dialog */}
      <Dialog open={isFindingsOpen} onOpenChange={setIsFindingsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Auditoria</DialogTitle>
            <DialogDescription>
              {selectedAudit?.vesselName} - {selectedAudit?.templateName}
            </DialogDescription>
          </DialogHeader>

          {selectedAudit && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {getStatusBadge(selectedAudit.status)}
                <Badge variant="outline">
                  {AUDIT_STANDARDS.find(s => s.value === selectedAudit.standard)?.label}
                </Badge>
                {selectedAudit.status === 'completed' && (
                  <Badge className={getScoreColor(selectedAudit.score)}>
                    Score: {selectedAudit.score}%
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Auditor:</span>
                  <span className="ml-2 font-medium">{selectedAudit.auditor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedAudit.scheduledDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {selectedAudit.findings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Constatações ({selectedAudit.findings.length})</h4>
                  <div className="space-y-2">
                    {selectedAudit.findings.map((finding) => (
                      <div key={finding.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{finding.itemCode}</Badge>
                            {getFindingStatusBadge(finding.status)}
                            {finding.severity && (
                              <Badge variant={finding.severity === 'critical' ? 'destructive' : 'secondary'}>
                                {finding.severity}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mt-2">{finding.itemRequirement}</p>
                        {finding.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Observação: {finding.notes}
                          </p>
                        )}
                        {finding.correctiveAction && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Ação Corretiva:</span> {finding.correctiveAction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFindingsOpen(false)}>
              Fechar
            </Button>
            {selectedAudit?.status === 'completed' && (
              <Button onClick={() => selectedAudit && handleExport(selectedAudit)}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComplianceAuditManager;
