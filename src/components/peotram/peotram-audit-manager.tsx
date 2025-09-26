import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Brain,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Award,
  Target,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PeotramAudit {
  id: string;
  audit_period: string;
  audit_date: string;
  status: 'preparacao' | 'em_andamento' | 'concluido' | 'aprovado';
  predicted_score?: number;
  final_score?: number;
  vessel_id?: string;
  created_by: string;
}

interface PeotramDocument {
  id: string;
  category: string;
  document_name: string;
  compliance_status: 'pendente' | 'conforme' | 'nao_conforme' | 'parcialmente_conforme';
  ai_confidence?: number;
}

interface ScorePrediction {
  predicted_score: number;
  improvement_scenarios: any[];
  score_breakdown: any;
}

export const PeotramAuditManager: React.FC = () => {
  const [audits, setAudits] = useState<PeotramAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<PeotramAudit | null>(null);
  const [documents, setDocuments] = useState<PeotramDocument[]>([]);
  const [scorePrediction, setScorePrediction] = useState<ScorePrediction | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data para demonstração
  const mockAudits: PeotramAudit[] = [
    {
      id: '1',
      audit_period: '2024-Q1',
      audit_date: '2024-03-15',
      status: 'concluido',
      predicted_score: 87,
      final_score: 89,
      vessel_id: 'vessel_001',
      created_by: 'Auditor PEOTRAM'
    },
    {
      id: '2', 
      audit_period: '2024-Q2',
      audit_date: '2024-06-15',
      status: 'em_andamento',
      predicted_score: 92,
      vessel_id: 'vessel_001',
      created_by: 'Auditor PEOTRAM'
    }
  ];

  const mockDocuments: PeotramDocument[] = [
    {
      id: '1',
      category: 'seguranca',
      document_name: 'Plano de Segurança Operacional',
      compliance_status: 'conforme',
      ai_confidence: 0.95
    },
    {
      id: '2',
      category: 'qualidade',
      document_name: 'Manual de Qualidade',
      compliance_status: 'parcialmente_conforme', 
      ai_confidence: 0.78
    }
  ];

  useEffect(() => {
    setAudits(mockAudits);
    setDocuments(mockDocuments);
    setScorePrediction({
      predicted_score: 92,
      improvement_scenarios: [
        {
          action: 'Completar documentação de segurança',
          potential_improvement: 5,
          impact: 'medio'
        },
        {
          action: 'Revisar manual de qualidade',
          potential_improvement: 3,
          impact: 'baixo'
        }
      ],
      score_breakdown: {
        seguranca: { score: 95 },
        qualidade: { score: 88 },
        ambiental: { score: 92 },
        operacional: { score: 94 }
      }
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-500';
      case 'concluido': return 'bg-blue-500';
      case 'em_andamento': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'conforme': return 'text-green-600 bg-green-50';
      case 'nao_conforme': return 'text-red-600 bg-red-50';
      case 'parcialmente_conforme': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const runPeotramAnalysis = async (auditId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('peotram-ai-analysis', {
        body: { auditId }
      });

      if (error) throw error;

      toast({
        title: "Análise PEOTRAM Concluída",
        description: `Score preditivo: ${data.analysis.overall_compliance}%`
      });

      // Atualizar dados locais
      setAudits(prev => prev.map(audit => 
        audit.id === auditId 
          ? { ...audit, predicted_score: data.analysis.overall_compliance }
          : audit
      ));

    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Falha ao processar análise PEOTRAM",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateScoreImprovement = (scenario: any) => {
    const currentScore = scorePrediction?.predicted_score || 0;
    const newScore = Math.min(100, currentScore + scenario.potential_improvement);
    
    toast({
      title: "Simulação de Melhoria",
      description: `Se ${scenario.action.toLowerCase()}, o score subiria para ${newScore}%`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo PEOTRAM</h1>
          <p className="text-muted-foreground">
            Análise e auditoria PEOTRAM com IA e score preditivo
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Nova Auditoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Auditoria PEOTRAM</DialogTitle>
                <DialogDescription>
                  Configure uma nova auditoria PEOTRAM
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Input placeholder="Período da auditoria (ex: 2024-Q3)" />
                <Input type="date" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar embarcação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vessel_001">Navio Alpha</SelectItem>
                    <SelectItem value="vessel_002">Navio Beta</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full">Criar Auditoria</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Melhoria Prevista</p>
                <p className="text-2xl font-bold">+8%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Não Conformidades</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conformidade IA</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {audits.map((audit) => (
              <Card key={audit.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedAudit(audit)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">Auditoria {audit.audit_period}</h3>
                        <Badge variant="outline" className={getStatusColor(audit.status)}>
                          {audit.status}
                        </Badge>
                        {audit.predicted_score && (
                          <Badge variant="secondary">
                            Score Previsto: {audit.predicted_score}%
                          </Badge>
                        )}
                        {audit.final_score && (
                          <Badge className="bg-green-100 text-green-800">
                            Score Final: {audit.final_score}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>Data: {new Date(audit.audit_date).toLocaleDateString()}</span>
                        <span>Embarcação: {audit.vessel_id || 'N/A'}</span>
                        <span>Auditor: {audit.created_by}</span>
                      </div>

                      {audit.predicted_score && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso de Conformidade</span>
                            <span>{audit.predicted_score}%</span>
                          </div>
                          <Progress value={audit.predicted_score} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                runPeotramAnalysis(audit.id);
                              }}
                              disabled={isLoading}>
                        <Brain className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{doc.document_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{doc.category}</Badge>
                        <Badge className={getComplianceColor(doc.compliance_status)}>
                          {doc.compliance_status}
                        </Badge>
                        {doc.ai_confidence && (
                          <span className="text-sm text-muted-foreground">
                            Confiança IA: {Math.round(doc.ai_confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {scorePrediction && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Score Preditivo PEOTRAM
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary">
                      {scorePrediction.predicted_score}%
                    </div>
                    <p className="text-muted-foreground">Score estimado da auditoria</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(scorePrediction.score_breakdown).map(([category, data]: [string, any]) => (
                      <div key={category} className="text-center">
                        <div className="text-2xl font-semibold">{data.score}%</div>
                        <div className="text-sm text-muted-foreground capitalize">{category}</div>
                        <Progress value={data.score} className="h-2 mt-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cenários de Melhoria</CardTitle>
                  <CardDescription>
                    Simule melhorias no score adicionando documentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scorePrediction.improvement_scenarios.map((scenario, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{scenario.action}</p>
                          <p className="text-sm text-muted-foreground">
                            Melhoria potencial: +{scenario.potential_improvement}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={scenario.impact === 'alto' ? 'default' : 'secondary'}>
                            {scenario.impact}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => simulateScoreImprovement(scenario)}
                          >
                            Simular
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { period: '2024-Q1', score: 89, trend: 'up' },
                    { period: '2023-Q4', score: 85, trend: 'up' },
                    { period: '2023-Q3', score: 82, trend: 'down' },
                    { period: '2023-Q2', score: 87, trend: 'up' }
                  ].map((item) => (
                    <div key={item.period} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.score}%</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conformidade por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: 'Segurança', score: 95, color: 'bg-green-500' },
                    { category: 'Qualidade', score: 88, color: 'bg-blue-500' },
                    { category: 'Ambiental', score: 92, color: 'bg-emerald-500' },
                    { category: 'Operacional', score: 94, color: 'bg-purple-500' }
                  ].map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium">{item.score}%</span>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};