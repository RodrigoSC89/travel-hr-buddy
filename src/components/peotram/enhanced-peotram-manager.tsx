import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  FileText, 
  Ship, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  BarChart3,
  Download,
  Upload,
  Save,
  Eye,
  Edit,
  Brain,
  Loader2,
  Plus,
  Award
} from 'lucide-react';

interface PeotramAudit {
  id: string;
  organization_id: string;
  vessel_id: string;
  audit_period: string;
  audit_date: string;
  status: string;
  predicted_score: number;
  final_score: number;
  auditor_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

interface AIAnalysis {
  overall_score: number;
  compliance_level: string;
  critical_findings: string[];
  recommendations: Array<{
    requirement_code: string;
    priority: string;
    recommendation: string;
    compliance_gap: string;
    action_plan: string[];
    timeline: string;
    resources_needed: string[];
  }>;
  improvement_opportunities: string[];
  regulatory_alerts: string[];
  next_steps: string[];
}

// Elementos PEOTRAM baseados no documento oficial 2024
const peotramElements = [
  {
    code: 'ELEMENT_01',
    name: 'SISTEMA DE GESTÃO',
    description: 'Avaliação do sistema de gestão da empresa'
  },
  {
    code: 'ELEMENT_02',
    name: 'CONFORMIDADE LEGAL',
    description: 'Verificação do atendimento às normas regulamentadoras e convenções'
  },
  {
    code: 'ELEMENT_03',
    name: 'GESTÃO DE RISCOS',
    description: 'Identificação, avaliação e gerenciamento de riscos'
  },
  {
    code: 'ELEMENT_04',
    name: 'OPERAÇÃO',
    description: 'Procedimentos operacionais e operações críticas'
  },
  {
    code: 'ELEMENT_05',
    name: 'CONTROLE OPERACIONAL',
    description: 'Controles operacionais e procedimentos de trabalho'
  },
  {
    code: 'ELEMENT_06',
    name: 'MANUTENÇÃO',
    description: 'Gestão da manutenção de equipamentos e sistemas'
  },
  {
    code: 'ELEMENT_07',
    name: 'GESTÃO DE MUDANÇAS',
    description: 'Processo de gestão de mudanças organizacionais e técnicas'
  },
  {
    code: 'ELEMENT_08',
    name: 'GESTÃO DE FORNECEDORES',
    description: 'Qualificação e gestão de fornecedores'
  },
  {
    code: 'ELEMENT_09',
    name: 'GESTÃO DE RECURSOS HUMANOS',
    description: 'Recrutamento, treinamento e gestão de pessoas'
  },
  {
    code: 'ELEMENT_10',
    name: 'GESTÃO DA INFORMAÇÃO & COMUNICAÇÃO',
    description: 'Controle de documentos, registros e comunicação'
  },
  {
    code: 'ELEMENT_11',
    name: 'PREPARAÇÃO E RESPOSTAS À EMERGÊNCIAS',
    description: 'Planos de contingência e resposta a emergências'
  },
  {
    code: 'ELEMENT_12',
    name: 'INVESTIGAÇÃO DE ACIDENTES E INCIDENTES',
    description: 'Processo de investigação e análise de ocorrências'
  },
  {
    code: 'ELEMENT_13',
    name: 'AUDITORIA INTERNA E ANÁLISE CRÍTICA',
    description: 'Sistema de auditoria interna e análise crítica'
  }
];

export const EnhancedPeotramManager: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [audits, setAudits] = useState<PeotramAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<PeotramAudit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysis | null>(null);
  const [newAudit, setNewAudit] = useState({
    audit_period: '',
    auditor_name: '',
    vessel_id: ''
  });

  const loadAudits = useCallback(async () => {
    if (!currentOrganization?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('peotram_audits')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading audits:', error);
        toast({
          title: "Erro ao carregar auditorias",
          description: "Não foi possível carregar as auditorias PEOTRAM.",
          variant: "destructive",
        });
        return;
      }

      setAudits(data || []);
    } catch (error) {
      console.error('Error in loadAudits:', error);
    }
  }, [currentOrganization?.id, toast]);

  useEffect(() => {
    const initializeData = async () => {
      if (currentOrganization?.id) {
        setIsLoading(true);
        await loadAudits();
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [currentOrganization?.id, loadAudits]);

  const createNewAudit = async () => {
    if (!currentOrganization?.id) return;

    try {
      const auditData = {
        organization_id: currentOrganization.id,
        audit_period: newAudit.audit_period,
        audit_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        predicted_score: 0,
        final_score: 0,
        auditor_name: newAudit.auditor_name,
        created_by: currentOrganization.id, // Usando organization_id como placeholder
        vessel_id: newAudit.vessel_id || null,
        metadata: {}
      };

      const { data, error } = await supabase
        .from('peotram_audits')
        .insert([auditData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Auditoria criada",
        description: "Nova auditoria PEOTRAM criada com sucesso.",
      });

      setSelectedAudit(data);
      setNewAudit({
        audit_period: '',
        auditor_name: '',
        vessel_id: ''
      });
      await loadAudits();
      setActiveTab('form');
    } catch (error) {
      console.error('Error creating audit:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar auditoria.",
        variant: "destructive",
      });
    }
  };

  const runAIAnalysis = async (elementCode: string) => {
    if (!selectedAudit) return;

    setIsAnalyzing(true);
    try {
      // Mock data para demonstração da análise IA
      const mockRequirementsData = [
        {
          code: `${elementCode.split('_')[1]}.1.1`,
          description: `Requisito principal do ${elementCode}`,
          score_classification: Math.random() > 0.3 ? '3' : '1',
          criticality_level: Math.random() > 0.5 ? 'B' : 'A',
          auditor_comments: 'Comentário do auditor sobre este requisito',
          evidence_provided: 'Evidências fornecidas durante a auditoria'
        },
        {
          code: `${elementCode.split('_')[1]}.1.2`,
          description: `Segundo requisito do ${elementCode}`,
          score_classification: Math.random() > 0.3 ? '4' : '2',
          criticality_level: Math.random() > 0.5 ? 'C' : 'B',
          auditor_comments: 'Análise detalhada do requisito',
          evidence_provided: 'Documentos e registros verificados'
        }
      ];

      const response = await supabase.functions.invoke('peotram-ai-analysis', {
        body: {
          audit_id: selectedAudit.id,
          element_code: elementCode,
          requirements_data: mockRequirementsData
        }
      });

      if (response.error) throw response.error;

      setAnalysisResults(response.data.analysis);
      toast({
        title: "Análise IA Concluída",
        description: "A análise inteligente do elemento foi concluída com sucesso.",
      });
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast({
        title: "Erro na Análise",
        description: "Erro ao executar análise IA do elemento.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'approved': return 'default';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'approved': return 'Aprovada';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando sistema PEOTRAM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Sistema PEOTRAM</h1>
          <p className="text-muted-foreground">
            Programa de Excelência Operacional em Transporte Aquaviário de Produtos Perigosos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Auditorias
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="elements" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Elementos
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Análise IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Auditorias</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{audits.length}</div>
                <p className="text-xs text-muted-foreground">Auditorias registradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {audits.filter(a => a.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">Auditorias ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {audits.filter(a => a.status === 'completed' || a.status === 'approved').length}
                </div>
                <p className="text-xs text-muted-foreground">Auditorias finalizadas</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>13 Elementos PEOTRAM 2024</CardTitle>
              <p className="text-sm text-muted-foreground">
                Elementos baseados no documento oficial da Petrobras
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peotramElements.map((element) => (
                    <Card key={element.code} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Badge variant="outline">{element.code}</Badge>
                            <h4 className="font-medium text-sm">{element.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {element.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab('elements')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Auditorias PEOTRAM</h2>
            <Button onClick={() => setActiveTab('form')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Auditoria
            </Button>
          </div>

          <div className="grid gap-4">
            {audits.map((audit) => (
              <Card key={audit.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{audit.audit_period || 'Período não informado'}</h3>
                        <Badge variant={getStatusBadgeVariant(audit.status)}>
                          {getStatusText(audit.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Auditor: {audit.auditor_name || 'Não informado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Data: {new Date(audit.audit_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">Score: {audit.final_score || audit.predicted_score}%</p>
                        <Progress value={audit.final_score || audit.predicted_score} className="w-20" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAudit(audit);
                          setActiveTab('form');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedAudit ? 'Editar Auditoria' : 'Nova Auditoria PEOTRAM'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audit_period">Período da Auditoria</Label>
                  <Input
                    id="audit_period"
                    value={newAudit.audit_period}
                    onChange={(e) => setNewAudit(prev => ({ ...prev, audit_period: e.target.value }))}
                    placeholder="Ex: 2024 - 1º Trimestre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditor_name">Nome do Auditor</Label>
                  <Input
                    id="auditor_name"
                    value={newAudit.auditor_name}
                    onChange={(e) => setNewAudit(prev => ({ ...prev, auditor_name: e.target.value }))}
                    placeholder="Nome do auditor responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel_id">ID da Embarcação</Label>
                  <Input
                    id="vessel_id"
                    value={newAudit.vessel_id}
                    onChange={(e) => setNewAudit(prev => ({ ...prev, vessel_id: e.target.value }))}
                    placeholder="Identificador da embarcação (opcional)"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createNewAudit} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {selectedAudit ? 'Atualizar' : 'Criar'} Auditoria
                </Button>
                {selectedAudit && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAudit(null);
                      setNewAudit({
                        audit_period: '',
                        auditor_name: '',
                        vessel_id: ''
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Elementos PEOTRAM 2024</CardTitle>
              <p className="text-sm text-muted-foreground">
                {peotramElements.length} elementos baseados no documento oficial
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {peotramElements.map((element) => (
                    <Card key={element.code} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{element.code}</Badge>
                              <h4 className="font-medium">{element.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {element.description}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('ai-analysis')}
                          >
                            Analisar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise Inteligente PEOTRAM
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Utilize IA para análise avançada dos elementos PEOTRAM
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedAudit ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Selecione uma auditoria na aba "Auditorias" para usar a análise IA.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auditoria Selecionada</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedAudit.audit_period} - {selectedAudit.auditor_name}
                      </p>
                    </div>
                    <Badge variant="outline">{getStatusText(selectedAudit.status)}</Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {peotramElements.map((element) => (
                      <Card key={element.code} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <Badge variant="outline" className="text-xs">
                              {element.code}
                            </Badge>
                            <h5 className="font-medium text-sm line-clamp-2">
                              {element.name}
                            </h5>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => runAIAnalysis(element.code)}
                              disabled={isAnalyzing}
                              className="w-full"
                            >
                              {isAnalyzing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Brain className="h-4 w-4 mr-2" />
                              )}
                              Analisar IA
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {analysisResults && (
                    <>
                      <Separator />
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Resultados da Análise IA
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {analysisResults.overall_score}%
                                </div>
                                <p className="text-sm text-muted-foreground">Score Geral</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-lg font-medium capitalize">
                                  {analysisResults.compliance_level}
                                </div>
                                <p className="text-sm text-muted-foreground">Nível de Conformidade</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-destructive">
                                  {analysisResults.critical_findings.length}
                                </div>
                                <p className="text-sm text-muted-foreground">Achados Críticos</p>
                              </CardContent>
                            </Card>
                          </div>

                          <ScrollArea className="h-[300px]">
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-medium mb-2">Recomendações Prioritárias</h5>
                                <div className="space-y-2">
                                  {analysisResults.recommendations.slice(0, 5).map((rec, index) => (
                                    <div key={index} className="p-3 bg-accent/50 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                          variant={rec.priority === 'alta' ? 'destructive' : 
                                                 rec.priority === 'media' ? 'default' : 'secondary'}
                                        >
                                          {rec.priority}
                                        </Badge>
                                        <code className="text-xs">{rec.requirement_code}</code>
                                      </div>
                                      <p className="text-sm">{rec.recommendation}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPeotramManager;