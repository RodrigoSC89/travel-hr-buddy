import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Mic, 
  Download,
  BarChart3,
  Eye,
  Brain,
  Clock,
  Shield,
  Users,
  Ship,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  evidenceUrls?: string[];
  criticality: 'baixa' | 'media' | 'alta' | 'critica';
}

interface Checklist {
  id: string;
  title: string;
  type: 'dp_dpo' | 'dp_maquinas' | 'rotina_maquinas' | 'rotina_nautica' | 'outro';
  vessel_id?: string;
  created_by: string;
  created_at: string;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'auditado';
  compliance_score?: number;
  ai_analysis?: any;
  items: ChecklistItem[];
}

interface AIAnalysis {
  overall_score: number;
  issues_found: number;
  critical_issues: number;
  recommendations: string[];
  missing_fields: string[];
  inconsistencies: string[];
}

export const IntelligentChecklistManager: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'pdf' | 'image' | 'manual'>('manual');
  const { toast } = useToast();

  const mockChecklists: Checklist[] = [
    {
      id: '1',
      title: 'DP para DPO - Navio Alpha',
      type: 'dp_dpo',
      vessel_id: 'vessel_001',
      created_by: 'João Silva',
      created_at: '2024-01-15T10:00:00Z',
      status: 'concluido',
      compliance_score: 87,
      ai_analysis: {
        overall_score: 87,
        issues_found: 3,
        critical_issues: 1,
        recommendations: [
          'Verificar sistema de alarme no item 15',
          'Incluir assinatura digital nos documentos',
          'Adicionar foto do painel de controle'
        ]
      },
      items: [
        {
          id: 'item_1',
          title: 'Verificação do Sistema de Posicionamento Dinâmico',
          description: 'Verificar funcionamento completo do sistema DP',
          required: true,
          completed: true,
          completedAt: '2024-01-15T10:30:00Z',
          completedBy: 'João Silva',
          notes: 'Sistema funcionando normalmente',
          criticality: 'critica'
        },
        {
          id: 'item_2',
          title: 'Teste de Redundância dos Thrusters',
          description: 'Verificar operação individual de cada thruster',
          required: true,
          completed: true,
          completedAt: '2024-01-15T11:00:00Z',
          completedBy: 'João Silva',
          criticality: 'alta'
        },
        {
          id: 'item_3',
          title: 'Calibração dos Sensores de Referência',
          description: 'Verificar precisão dos sensores DGPS e gyro',
          required: true,
          completed: false,
          criticality: 'media'
        }
      ]
    }
  ];

  useEffect(() => {
    setChecklists(mockChecklists);
  }, [mockChecklists]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'auditado': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critica': return 'text-red-600 bg-red-50';
      case 'alta': return 'text-orange-600 bg-orange-50';
      case 'media': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      // Simular upload e processamento OCR
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload Concluído",
        description: "Checklist processado com OCR e adicionado ao sistema",
      });
      
      setIsUploadDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro no Upload",
        description: "Falha ao processar o arquivo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAIAnalysis = async (checklistId: string) => {
    setIsLoading(true);
    try {
      // Simular análise de IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysis: AIAnalysis = {
        overall_score: Math.floor(Math.random() * 30) + 70,
        issues_found: Math.floor(Math.random() * 5) + 1,
        critical_issues: Math.floor(Math.random() * 2),
        recommendations: [
          'Adicionar evidência fotográfica para itens críticos',
          'Verificar assinatura digital nos documentos',
          'Incluir horário preciso nas verificações'
        ],
        missing_fields: ['Assinatura do responsável', 'Foto do equipamento'],
        inconsistencies: ['Horário inconsistente no item 3']
      };

      setChecklists(prev => prev.map(checklist => 
        checklist.id === checklistId 
          ? { ...checklist, ai_analysis: analysis, compliance_score: analysis.overall_score }
          : checklist
      ));

      toast({
        title: "Análise IA Concluída",
        description: `Score de conformidade: ${analysis.overall_score}%`,
      });
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Falha ao processar análise de IA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Checklists Operacionais Inteligentes</h1>
          <p className="text-muted-foreground">
            Gestão técnica e operacional com IA e OCR
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Novo Checklist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Checklist</DialogTitle>
                <DialogDescription>
                  Escolha como criar seu checklist
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Select value={uploadType} onValueChange={(value: any) => setUploadType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de entrada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (Formulário)</SelectItem>
                    <SelectItem value="pdf">Upload PDF</SelectItem>
                    <SelectItem value="image">Upload Imagem</SelectItem>
                  </SelectContent>
                </Select>

                {uploadType === 'manual' && (
                  <div className="space-y-3">
                    <Input placeholder="Título do checklist" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de checklist" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dp_dpo">DP para DPO</SelectItem>
                        <SelectItem value="dp_maquinas">DP para Máquinas</SelectItem>
                        <SelectItem value="rotina_maquinas">Rotina de Máquinas</SelectItem>
                        <SelectItem value="rotina_nautica">Rotina Náutica</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(uploadType === 'pdf' || uploadType === 'image') && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Arraste arquivos aqui ou clique para selecionar
                    </p>
                    <Input type="file" className="mt-2" accept={uploadType === 'pdf' ? '.pdf' : 'image/*'} />
                  </div>
                )}

                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processando...' : 'Criar Checklist'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Checklists</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conformidade</p>
                <p className="text-2xl font-bold">87%</p>
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
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score IA Médio</p>
                <p className="text-2xl font-bold">85</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="active">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {checklists.map((checklist) => (
              <Card key={checklist.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedChecklist(checklist)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{checklist.title}</h3>
                        <Badge variant="outline" className={getStatusColor(checklist.status)}>
                          {checklist.status}
                        </Badge>
                        {checklist.compliance_score && (
                          <Badge variant="secondary">
                            Score: {checklist.compliance_score}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Ship className="h-4 w-4" />
                          {checklist.vessel_id || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {checklist.created_by}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(checklist.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {checklist.compliance_score && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso de Conformidade</span>
                            <span>{checklist.compliance_score}%</span>
                          </div>
                          <Progress value={checklist.compliance_score} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                runAIAnalysis(checklist.id);
                              }}>
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conformidade por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'DP para DPO', score: 92 },
                    { type: 'Rotina Máquinas', score: 87 },
                    { type: 'Rotina Náutica', score: 83 },
                    { type: 'DP para Máquinas', score: 89 }
                  ].map((item) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={item.score} className="w-20 h-2" />
                        <span className="text-sm font-medium">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Preenchimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'DP para DPO', time: '45 min' },
                    { type: 'Rotina Máquinas', time: '32 min' },
                    { type: 'Rotina Náutica', time: '28 min' },
                    { type: 'DP para Máquinas', time: '38 min' }
                  ].map((item) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm">{item.type}</span>
                      <Badge variant="outline">{item.time}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Checklist Detail Modal */}
      {selectedChecklist && (
        <Dialog open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedChecklist.title}</DialogTitle>
              <DialogDescription>
                Detalhes e análise do checklist
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* AI Analysis Summary */}
              {selectedChecklist.ai_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Análise de IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedChecklist.ai_analysis.overall_score}%
                        </p>
                        <p className="text-sm text-muted-foreground">Score Geral</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {selectedChecklist.ai_analysis.issues_found}
                        </p>
                        <p className="text-sm text-muted-foreground">Problemas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {selectedChecklist.ai_analysis.critical_issues}
                        </p>
                        <p className="text-sm text-muted-foreground">Críticos</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Recomendações:</h4>
                      {selectedChecklist.ai_analysis.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          {rec}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Checklist Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Itens do Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedChecklist.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Checkbox checked={item.completed} disabled />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge className={getCriticalityColor(item.criticality)}>
                              {item.criticality}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}
                          {item.notes && (
                            <p className="text-sm bg-muted p-2 rounded">{item.notes}</p>
                          )}
                          {item.completedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Concluído em {new Date(item.completedAt).toLocaleString()} por {item.completedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};