import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  FileText, 
  Ship, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Shield,
  Wrench,
  BarChart3,
  Download,
  Upload,
  Save,
  Eye,
  Edit,
  Star,
  Award
} from 'lucide-react';

// Estrutura baseada no documento PEOTRAM 2024 real
interface PeotramElement {
  id: string;
  name: string;
  description: string;
  requirements: PeotramRequirement[];
}

interface PeotramRequirement {
  id: string;
  code: string;
  description: string;
  evidences: string;
  score: number;
  classification: 'N/A' | '0' | '1' | '2' | '3' | '4';
  criticality: 'N/A' | 'A' | 'B' | 'C' | 'D' | '✓' | '✓✓';
  comments: string;
  element_id: string;
}

interface PeotramAudit {
  id: string;
  company_base: string;
  vessel_petrobras_code: string;
  vessel_name: string;
  audit_date: string;
  scope: string;
  operations_summary: string;
  observations: string;
  auditors: string;
  audited: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved';
  total_score: number;
  created_by: string;
  organization_id: string;
}

export const EnhancedPeotramManager: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [audits, setAudits] = useState<PeotramAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<PeotramAudit | null>(null);
  const [elements, setElements] = useState<PeotramElement[]>([]);
  const [requirements, setRequirements] = useState<PeotramRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentElement, setCurrentElement] = useState<PeotramElement | null>(null);

  // Elementos do PEOTRAM 2024 baseados no documento real
  const peotramElements: PeotramElement[] = [
    {
      id: 'element_01',
      name: 'ELEMENTO 01 - SISTEMA DE GESTÃO',
      description: 'Avaliação do sistema de gestão da empresa',
      requirements: []
    },
    {
      id: 'element_02', 
      name: 'ELEMENTO 02 - CONFORMIDADE LEGAL',
      description: 'Verificação do atendimento às normas regulamentadoras e convenções',
      requirements: []
    },
    {
      id: 'element_03',
      name: 'ELEMENTO 03 - GESTÃO DE RISCOS',
      description: 'Identificação, avaliação e gerenciamento de riscos',
      requirements: []
    },
    {
      id: 'element_04',
      name: 'ELEMENTO 04 - OPERAÇÃO', 
      description: 'Procedimentos operacionais e operações críticas',
      requirements: []
    },
    {
      id: 'element_05',
      name: 'ELEMENTO 05 - CONTROLE OPERACIONAL',
      description: 'Controles operacionais e procedimentos de trabalho',
      requirements: []
    },
    {
      id: 'element_06',
      name: 'ELEMENTO 06 - MANUTENÇÃO',
      description: 'Gestão da manutenção de equipamentos e sistemas',
      requirements: []
    },
    {
      id: 'element_07',
      name: 'ELEMENTO 07 - GESTÃO DE MUDANÇAS',
      description: 'Processo de gestão de mudanças organizacionais e técnicas',
      requirements: []
    },
    {
      id: 'element_08',
      name: 'ELEMENTO 08 - GESTÃO DE FORNECEDORES',
      description: 'Qualificação e gestão de fornecedores',
      requirements: []
    },
    {
      id: 'element_09',
      name: 'ELEMENTO 09 - GESTÃO DE RECURSOS HUMANOS',
      description: 'Recrutamento, treinamento e gestão de pessoas',
      requirements: []
    },
    {
      id: 'element_10',
      name: 'ELEMENTO 10 - GESTÃO DA INFORMAÇÃO & COMUNICAÇÃO',
      description: 'Controle de documentos, registros e comunicação',
      requirements: []
    },
    {
      id: 'element_11',
      name: 'ELEMENTO 11 - PREPARAÇÃO E RESPOSTAS À EMERGÊNCIAS',
      description: 'Planos de contingência e resposta a emergências',
      requirements: []
    },
    {
      id: 'element_12',
      name: 'ELEMENTO 12 - INVESTIGAÇÃO DE ACIDENTES E INCIDENTES',
      description: 'Processo de investigação e análise de ocorrências',
      requirements: []
    },
    {
      id: 'element_13',
      name: 'ELEMENTO 13 - AUDITORIA INTERNA E ANÁLISE CRÍTICA',
      description: 'Sistema de auditoria interna e análise crítica',
      requirements: []
    }
  ];

  useEffect(() => {
    if (currentOrganization) {
      loadPeotramData();
    }
  }, [currentOrganization]);

  const loadPeotramData = async () => {
    try {
      // Por enquanto, usar dados mock até as tabelas estarem prontas
      const mockAudits: PeotramAudit[] = [
        {
          id: '1',
          company_base: 'Empresa Marítima Exemplo',
          vessel_petrobras_code: 'PBR-001',
          vessel_name: 'Navio Exemplo Alpha',
          audit_date: '2024-01-15',
          scope: 'Auditoria completa dos 13 elementos PEOTRAM',
          operations_summary: 'Operações de apoio marítimo realizadas conforme procedimentos',
          observations: 'Observações gerais da auditoria',
          auditors: 'João Silva, Maria Santos',
          audited: 'Equipe de bordo e gestão',
          status: 'completed',
          total_score: 89,
          created_by: 'auditor-1',
          organization_id: currentOrganization?.id || ''
        },
        {
          id: '2',
          company_base: 'Empresa Marítima Exemplo',
          vessel_petrobras_code: 'PBR-002',
          vessel_name: 'Navio Exemplo Beta',
          audit_date: '2024-02-10',
          scope: 'Auditoria focada em elementos críticos',
          operations_summary: 'Operações de segurança e manutenção',
          observations: 'Melhorias necessárias em alguns pontos',
          auditors: 'Carlos Oliveira, Ana Costa',
          audited: 'Tripulação técnica',
          status: 'in_progress',
          total_score: 92,
          created_by: 'auditor-2',
          organization_id: currentOrganization?.id || ''
        }
      ];

      setAudits(mockAudits);
      setElements(peotramElements);

    } catch (error: any) {
      console.error('Erro ao carregar dados PEOTRAM:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do PEOTRAM",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewAudit = async () => {
    if (!currentOrganization) return;

    try {
  const createNewAudit = async () => {
    if (!currentOrganization) return;

    try {
      // Por enquanto, criar auditoria mock
      const newAuditId = `audit-${Date.now()}`;
      const newAudit: PeotramAudit = {
        id: newAuditId,
        company_base: '',
        vessel_name: '',
        vessel_petrobras_code: '',
        audit_date: new Date().toISOString().split('T')[0],
        scope: '',
        operations_summary: '',
        observations: '',
        auditors: '',
        audited: '',
        status: 'draft',
        total_score: 0,
        created_by: 'current-user',
        organization_id: currentOrganization.id
      };

      toast({
        title: "Sucesso",
        description: "Nova auditoria PEOTRAM criada"
      });

      // Adicionar à lista local
      setAudits(prev => [newAudit, ...prev]);
      setSelectedAudit(newAudit);
      setActiveTab('audit-form');

    } catch (error: any) {
      console.error('Erro ao criar auditoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a auditoria",
        variant: "destructive"
      });
    }
  };

    } catch (error: any) {
      console.error('Erro ao criar auditoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a auditoria",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      in_progress: { label: 'Em Andamento', variant: 'default' as const },
      completed: { label: 'Concluída', variant: 'outline' as const },
      approved: { label: 'Aprovada', variant: 'default' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateElementScore = (elementId: string) => {
    const elementReqs = requirements.filter(req => req.element_id === elementId);
    if (elementReqs.length === 0) return 0;
    
    const totalScore = elementReqs.reduce((sum, req) => {
      const scoreMap = { 'N/A': 0, '0': 0, '1': 20, '2': 50, '3': 90, '4': 100 };
      return sum + (scoreMap[req.classification as keyof typeof scoreMap] || 0);
    }, 0);
    
    return Math.round(totalScore / elementReqs.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            PEOTRAM - Ciclo 2024
          </h1>
          <p className="text-muted-foreground mt-2">
            Programa de Excelência Operacional no Transporte Aéreo e Marítimo
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={createNewAudit} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Nova Auditoria
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Template 2024
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
          <TabsTrigger value="audit-form">Formulário</TabsTrigger>
          <TabsTrigger value="elements">Elementos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{audits.length}</p>
                    <p className="text-sm text-muted-foreground">Auditorias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {audits.filter(a => a.status === 'completed' || a.status === 'approved').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Concluídas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{elements.length}</p>
                    <p className="text-sm text-muted-foreground">Elementos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critérios de Pontuação */}
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Pontuação PEOTRAM 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Notas de Desempenho:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                      <span>N/A - Não Aplicável</span>
                      <Badge variant="secondary">0%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-red-50">
                      <span>0 - Não Evidenciado</span>
                      <Badge variant="destructive">0%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-orange-50">
                      <span>1 - Falhas Sistemáticas</span>
                      <Badge variant="secondary">20%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-yellow-50">
                      <span>2 - Falhas Pontuais</span>
                      <Badge variant="outline">50%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-green-50">
                      <span>3 - Sem Falhas</span>
                      <Badge variant="default">90%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-blue-50">
                      <span>4 - Além do Requerido</span>
                      <Badge variant="default">100%</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Criticidade das NC:</h4>
                  <div className="space-y-2">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Crítica (A):</strong> Risco iminente - 10 dias para ação
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Grave (B):</strong> Falha relevante - 15 dias para ação
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Moderada (C):</strong> Atendimento parcial - 30 dias
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Leve (D):</strong> Falhas isoladas - 60 dias
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle>Auditorias PEOTRAM</CardTitle>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhuma auditoria PEOTRAM encontrada
                  </p>
                  <Button onClick={createNewAudit}>
                    Criar primeira auditoria
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <div
                      key={audit.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedAudit(audit);
                        setActiveTab('audit-form');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Ship className="w-5 h-5 text-blue-500" />
                            <h4 className="font-semibold">
                              {audit.vessel_name || 'Embarcação não informada'}
                            </h4>
                            {getStatusBadge(audit.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <strong>Empresa:</strong> {audit.company_base || 'Não informado'}
                            </div>
                            <div>
                              <strong>Data:</strong> {new Date(audit.audit_date).toLocaleDateString('pt-BR')}
                            </div>
                            <div>
                              <strong>Código Petrobras:</strong> {audit.vessel_petrobras_code || 'Não informado'}
                            </div>
                            <div>
                              <strong>Score:</strong> 
                              <span className={`ml-2 px-2 py-1 rounded ${getScoreColor(audit.total_score)}`}>
                                {audit.total_score}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Form Tab */}
        <TabsContent value="audit-form">
          {selectedAudit ? (
            <Card>
              <CardHeader>
                <CardTitle>Formulário de Auditoria PEOTRAM</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Empresa (base/data)</Label>
                      <Input
                        id="company"
                        value={selectedAudit.company_base}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          company_base: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedAudit.audit_date}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          audit_date: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vessel-name">Nome da Embarcação</Label>
                      <Input
                        id="vessel-name"
                        value={selectedAudit.vessel_name}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          vessel_name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vessel-code">Código Petrobras</Label>
                      <Input
                        id="vessel-code"
                        value={selectedAudit.vessel_petrobras_code}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          vessel_petrobras_code: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Escopo e Resumo */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="scope">Escopo</Label>
                      <Textarea
                        id="scope"
                        value={selectedAudit.scope}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          scope: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="operations">Resumo das Operações</Label>
                      <Textarea
                        id="operations"
                        value={selectedAudit.operations_summary}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          operations_summary: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea
                        id="observations"
                        value={selectedAudit.observations}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          observations: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Equipe */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auditors">Auditores</Label>
                      <Textarea
                        id="auditors"
                        value={selectedAudit.auditors}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          auditors: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="audited">Auditados</Label>
                      <Textarea
                        id="audited"
                        value={selectedAudit.audited}
                        onChange={(e) => setSelectedAudit({
                          ...selectedAudit,
                          audited: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar Auditoria
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma auditoria para editar ou crie uma nova
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Elements Tab */}
        <TabsContent value="elements">
          <div className="space-y-4">
            {elements.map((element) => (
              <Card key={element.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{element.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {calculateElementScore(element.id)}%
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentElement(element)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {element.description}
                  </p>
                  <Progress 
                    value={calculateElementScore(element.id)} 
                    className="mt-3"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};