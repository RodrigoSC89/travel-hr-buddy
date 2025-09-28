import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, FileText, Plus, Search, Ship, Building, Calendar, Users, BarChart3, TrendingUp, Download, Upload, Eye, Edit, Trash2, Star, Clock, Target, Activity, Shield, Zap, Settings, UserCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrganizationPermissions } from '@/hooks/use-organization-permissions';
import { PeotramTemplateManager } from './peotram-template-manager';
import { PeotramNonConformities } from './peotram-non-conformities';
import { PeotramPermissionsManager } from './peotram-permissions-manager';

interface PeotramTemplate {
  id: string;
  year: number;
  version: string;
  template_data: {
    elements: Array<{
      number: string;
      name: string;
      requirements: string[];
    }>;
  };
  is_active: boolean;
  checklist_type: 'vessel' | 'shore';
  created_at: string;
}

interface PeotramAudit {
  id: string;
  audit_date: string;
  audit_period: string;
  audit_type: 'vessel' | 'shore';
  vessel_name?: string;
  vessel_id?: string;
  shore_location?: string;
  auditor_name: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved';
  compliance_score: number;
  elements_evaluated: number;
  non_conformities_count: number;
  template_id?: string;
  created_at: string;
  vessels?: {
    id: string;
    name: string;
    imo_number?: string;
  };
}

interface NonConformity {
  id: string;
  element_number: string;
  element_name: string;
  non_conformity_type: 'major' | 'minor' | 'observation';
  description: string;
  corrective_action?: string;
  responsible_person?: string;
  target_date?: string;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
  severity_score: number;
  peotram_audits?: {
    audit_period: string;
    vessel_name?: string;
    shore_location?: string;
  };
}

// Dados de demonstração
const getDemoAudits = (): PeotramAudit[] => [
  {
    id: 'demo-1',
    audit_period: 'Janeiro 2024',
    audit_date: '2024-01-15',
    audit_type: 'vessel',
    vessel_name: 'MV Nautilus',
    vessel_id: 'vessel-1',
    auditor_name: 'João Silva',
    status: 'completed',
    compliance_score: 85,
    elements_evaluated: 13,
    non_conformities_count: 2,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'demo-2',
    audit_period: 'Fevereiro 2024',
    audit_date: '2024-02-10',
    audit_type: 'shore',
    shore_location: 'Base Santos',
    auditor_name: 'Maria Santos',
    status: 'in_progress',
    compliance_score: 0,
    elements_evaluated: 7,
    non_conformities_count: 0,
    created_at: '2024-02-10T08:00:00Z'
  }
];

const getDemoTemplates = (): PeotramTemplate[] => [
  {
    id: 'template-1',
    year: 2024,
    version: '1.0',
    checklist_type: 'vessel',
    template_data: {
      elements: [
        { number: '01', name: 'Política de Segurança', requirements: ['Política documentada', 'Divulgação adequada'] },
        { number: '02', name: 'Responsabilidade e Autoridade', requirements: ['Organograma atualizado', 'Descrição de cargos'] }
      ]
    },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const getDemoVessels = () => [
  { id: 'vessel-1', name: 'MV Nautilus', imo_number: '9876543' },
  { id: 'vessel-2', name: 'MV Atlantic', imo_number: '9876544' },
  { id: 'vessel-3', name: 'MV Pacific', imo_number: '9876545' }
];

export const EnhancedPeotramManager: React.FC = () => {
  const { hasFeature, canManageData, isAdmin } = useOrganizationPermissions();
  const [audits, setAudits] = useState<PeotramAudit[]>([]);
  const [templates, setTemplates] = useState<PeotramTemplate[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAudit, setSelectedAudit] = useState<PeotramAudit | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PeotramTemplate | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [activeView, setActiveView] = useState<'dashboard' | 'audits' | 'non-conformities' | 'templates' | 'permissions'>('dashboard');

  useEffect(() => {
    // Carregar dados de demonstração inicialmente
    setLoading(true);
    setAudits(getDemoAudits());
    setTemplates(getDemoTemplates());
    setVessels(getDemoVessels());
    setNonConformities([]);
    setLoading(false);
    
    // Se a feature PEOTRAM estiver habilitada, tentar carregar dados reais
    if (hasFeature('peotram')) {
      fetchAudits();
    }
  }, []); // Fixed: removed hasFeature from dependencies to prevent infinite loop

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('peotram_audits')
        .select(`
          *,
          vessels (
            id,
            name,
            imo_number
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.log('Erro ao carregar dados do banco, usando dados de demonstração');
        return; // Manter os dados de demonstração que já foram carregados
      }

      if (data && data.length > 0) {
        const mappedAudits = data.map((audit: any) => ({
          ...audit,
          elements_evaluated: audit.elements_evaluated || 0,
          non_conformities_count: audit.non_conformities_count || 0,
          compliance_score: audit.compliance_score || 0
        }));
        setAudits(mappedAudits);
      }
    } catch (error) {
      console.log('Erro ao conectar com banco, usando dados de demonstração:', error);
      // Manter os dados de demonstração
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('peotram_templates')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      
      const mappedTemplates = (data || []).map((template: any) => ({
        ...template,
        template_data: typeof template.template_data === 'string' 
          ? JSON.parse(template.template_data)
          : template.template_data
      }));
      
      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchVessels = async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, imo_number, vessel_type')
        .order('name');

      if (error) throw error;
      setVessels(data || []);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    }
  };

  const fetchNonConformities = async () => {
    try {
      const { data, error } = await supabase
        .from('peotram_non_conformities')
        .select(`
          *,
          peotram_audits (
            audit_period,
            vessel_name,
            shore_location
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const mappedNCs = (data || []).map((nc: any) => ({
        ...nc,
        non_conformity_type: nc.non_conformity_type as 'major' | 'minor' | 'observation'
      }));
      
      setNonConformities(mappedNCs);
    } catch (error) {
      console.error('Error fetching non-conformities:', error);
    }
  };

  const createNewAudit = async (auditData: any) => {
    try {
      const { data, error } = await supabase
        .from('peotram_audits')
        .insert([{
          ...auditData,
          compliance_score: 0,
          elements_evaluated: 0,
          non_conformities_count: 0
        }])
        .select()
        .single();

      if (error) throw error;

      const mappedAudit: PeotramAudit = {
        ...data,
        audit_type: data.audit_type as 'vessel' | 'shore',
        elements_evaluated: 0,
        non_conformities_count: 0,
        status: data.status as 'draft' | 'in_progress' | 'completed' | 'approved'
      };

      setAudits(prev => [mappedAudit, ...prev]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Nova auditoria PEOTRAM criada com sucesso!",
      });
    } catch (error) {
      console.error('Error creating audit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a auditoria.",
        variant: "destructive",
      });
    }
  };

  const createTemplate = async (templateData: any) => {
    try {
      const { data, error } = await supabase
        .from('peotram_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;

      const mappedTemplate: PeotramTemplate = {
        ...data,
        template_data: typeof data.template_data === 'string' 
          ? JSON.parse(data.template_data)
          : data.template_data,
        checklist_type: data.checklist_type as 'vessel' | 'shore'
      };

      setTemplates(prev => [mappedTemplate, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Template PEOTRAM criado com sucesso!",
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      });
    }
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.audit_period.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.vessel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.shore_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || audit.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const activeTemplates = templates.filter(t => t.is_active);
  const currentYear = new Date().getFullYear();
  const vesselTemplate = activeTemplates.find(t => t.checklist_type === 'vessel' && t.year === currentYear);
  const shoreTemplate = activeTemplates.find(t => t.checklist_type === 'shore' && t.year === currentYear);

  if (!hasFeature('peotram')) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Acesso Restrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar o módulo PEOTRAM. Entre em contato com o administrador do sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Modo Demonstração Ativo</h4>
              <p className="text-sm text-blue-700">
                Sistema funcionando com dados de demonstração. Todas as funcionalidades estão disponíveis para teste como administrador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema PEOTRAM</h1>
          <p className="text-muted-foreground">
            Programa de Gerenciamento da Segurança Operacional
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button 
              variant={activeView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <Button 
              variant={activeView === 'audits' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('audits')}
            >
              <FileText className="h-4 w-4 mr-1" />
              Auditorias
            </Button>
            <Button 
              variant={activeView === 'non-conformities' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('non-conformities')}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Não Conformidades
            </Button>
            {isAdmin() && (
              <>
                <Button 
                  variant={activeView === 'templates' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('templates')}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Templates
                </Button>
                <Button 
                  variant={activeView === 'permissions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('permissions')}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Permissões
                </Button>
              </>
            )}
          </div>
          
          {canManageData() && activeView === 'audits' && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Auditoria
            </Button>
          )}
          
          {isAdmin() && activeView === 'templates' && (
            <Button onClick={() => setIsTemplateManagerOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          )}
        </div>
      </div>

      {/* Render based on active view */}
      {activeView === 'dashboard' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Auditorias</p>
                    <p className="text-2xl font-bold">{audits.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold">{audits.filter(a => a.status === 'in_progress').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Não Conformidades</p>
                    <p className="text-2xl font-bold text-red-600">
                      {audits.reduce((acc, audit) => acc + (audit.non_conformities_count || 0), 0)}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Médio</p>
                    <p className="text-2xl font-bold">
                      {audits.length > 0 
                        ? Math.round(audits.reduce((acc, audit) => acc + audit.compliance_score, 0) / audits.length)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Template Embarcações {currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vesselTemplate ? (
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo v{vesselTemplate.version}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {vesselTemplate.template_data.elements?.length || 0} elementos
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum template ativo para {currentYear}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Template Base Terrestre {currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shoreTemplate ? (
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo v{shoreTemplate.version}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {shoreTemplate.template_data.elements?.length || 0} elementos
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum template ativo para {currentYear}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audits.slice(0, 5).map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {audit.vessel_name ? (
                        <Ship className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Building className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{audit.audit_period}</p>
                        <p className="text-xs text-muted-foreground">
                          {audit.vessel_name || audit.shore_location} • {audit.auditor_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{audit.compliance_score}%</Badge>
                      <Badge variant={
                        audit.status === 'completed' ? 'default' :
                        audit.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {audit.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeView === 'audits' && (
        <>
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar auditorias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audits Grid */}
          <div className="grid gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Carregando auditorias...</p>
                </div>
              </div>
            ) : filteredAudits.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhuma auditoria encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {audits.length === 0 
                      ? "Comece criando sua primeira auditoria PEOTRAM."
                      : "Ajuste os filtros para ver outras auditorias."
                    }
                  </p>
                  {audits.length === 0 && canManageData() && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeira auditoria
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredAudits.map((audit) => (
                <Card key={audit.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{audit.audit_period}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {audit.vessel_name ? (
                                <>
                                  <Ship className="h-4 w-4" />
                                  <span>{audit.vessel_name}</span>
                                </>
                              ) : (
                                <>
                                  <Building className="h-4 w-4" />
                                  <span>{audit.shore_location || 'Base Terrestre'}</span>
                                </>
                              )}
                              <Separator orientation="vertical" className="h-4" />
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(audit.audit_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          
                          <Badge 
                            variant={
                              audit.status === 'completed' ? 'default' :
                              audit.status === 'in_progress' ? 'secondary' :
                              audit.status === 'approved' ? 'outline' : 'destructive'
                            }
                          >
                            {audit.status === 'draft' ? 'Rascunho' :
                             audit.status === 'in_progress' ? 'Em andamento' :
                             audit.status === 'completed' ? 'Concluído' : 'Aprovado'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{audit.auditor_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{audit.elements_evaluated} elementos</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{audit.compliance_score}% compliance</span>
                          </div>

                          {audit.non_conformities_count > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">{audit.non_conformities_count} NC</span>
                            </div>
                          )}
                        </div>
                        
                        <Progress value={audit.compliance_score} className="w-full" />
                      </div>
                      
                      <div className="flex flex-col justify-between items-end gap-2">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Criado em {new Date(audit.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManageData() && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {activeView === 'non-conformities' && (
        <PeotramNonConformities 
          nonConformities={nonConformities}
          onUpdate={fetchNonConformities}
        />
      )}

      {activeView === 'templates' && isAdmin() && (
        <PeotramTemplateManager 
          templates={templates}
          onTemplateUpdate={fetchTemplates}
        />
      )}

      {activeView === 'permissions' && isAdmin() && (
        <PeotramPermissionsManager />
      )}

      {/* Create Audit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Auditoria PEOTRAM</DialogTitle>
            <DialogDescription>
              Crie uma nova auditoria do Programa de Gerenciamento da Segurança Operacional
            </DialogDescription>
          </DialogHeader>
          
          <CreateAuditForm 
            onSubmit={createNewAudit}
            onCancel={() => setIsCreateDialogOpen(false)}
            templates={activeTemplates}
            vessels={vessels}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Audit Form Component  
const CreateAuditForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  templates: any[];
  vessels: any[];
}> = ({ onSubmit, onCancel, templates, vessels }) => {
  const [formData, setFormData] = useState({
    audit_period: '',
    audit_type: 'vessel',
    vessel_id: '',
    shore_location: '',
    auditor_name: '',
    audit_date: new Date().toISOString().split('T')[0],
    template_id: '',
    status: 'draft'
  });

  return (
    <div className="space-y-4">
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="audit_period">Período da Auditoria</Label>
            <Input
              id="audit_period"
              value={formData.audit_period}
              onChange={(e) => setFormData(prev => ({ ...prev, audit_period: e.target.value }))}
              placeholder="Ex: Janeiro 2024"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="audit_type">Tipo de Auditoria</Label>
            <Select 
              value={formData.audit_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, audit_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vessel">Embarcação</SelectItem>
                <SelectItem value="shore">Base Terrestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.audit_type === 'vessel' ? (
            <div className="space-y-2">
              <Label htmlFor="vessel_id">Embarcação</Label>
              <Select 
                value={formData.vessel_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vessel_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name} {vessel.imo_number && `(IMO: ${vessel.imo_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="shore_location">Local da Base</Label>
              <Input
                id="shore_location"
                value={formData.shore_location}
                onChange={(e) => setFormData(prev => ({ ...prev, shore_location: e.target.value }))}
                placeholder="Ex: Escritório São Paulo"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="template_id">Template PEOTRAM</Label>
            <Select 
              value={formData.template_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o template" />
              </SelectTrigger>
              <SelectContent>
                {templates
                  .filter(t => t.checklist_type === formData.audit_type)
                  .map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.year} v{template.version} ({template.template_data.elements?.length || 0} elementos)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="auditor_name">Nome do Auditor</Label>
            <Input
              id="auditor_name"
              value={formData.auditor_name}
              onChange={(e) => setFormData(prev => ({ ...prev, auditor_name: e.target.value }))}
              placeholder="Ex: João Silva"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="audit_date">Data da Auditoria</Label>
            <Input
              id="audit_date"
              type="date"
              value={formData.audit_date}
              onChange={(e) => setFormData(prev => ({ ...prev, audit_date: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              const selectedVessel = vessels.find(v => v.id === formData.vessel_id);
              onSubmit({
                ...formData,
                vessel_name: selectedVessel?.name || null,
                compliance_score: 0,
                elements_evaluated: 0
              });
            }}
            disabled={
              !formData.audit_period || 
              !formData.auditor_name || 
              !formData.template_id ||
              (formData.audit_type === 'vessel' && !formData.vessel_id) ||
              (formData.audit_type === 'shore' && !formData.shore_location)
            }
          >
            Criar Auditoria
          </Button>
        </div>
      </form>
    </div>
  );
};