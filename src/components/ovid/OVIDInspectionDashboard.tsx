import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Ship, FileText, CheckCircle, AlertTriangle, XCircle, 
  Plus, Download, Filter, Calendar, User, 
  ClipboardCheck, BarChart3, Settings,
  Brain, FileCheck, Clock, Target, Shield, Loader2, History, TrendingUp, GitCompare
} from 'lucide-react';
import { OVIQ4_SECTIONS, VESSEL_TYPES, getTotalQuestions } from '@/data/oviq4-checklist';
import { OVIDChecklist } from './OVIDChecklist';
import { OVIDNonConformities } from './OVIDNonConformities';
import { OVIDAIAssistant } from './OVIDAIAssistant';
import { OVIDReports } from './OVIDReports';
import { PreOVIDChapterTabs, OVIQ4_CHAPTERS, ChapterProgress } from './PreOVIDChapterTabs';
import { PreOVIDAIChat } from './PreOVIDAIChat';
import { PreOVIDVoiceChat } from './PreOVIDVoiceChat';
import { PreOVIDEvidenceGenerator } from './PreOVIDEvidenceGenerator';
import { PreOVIDReportGenerator } from './PreOVIDReportGenerator';
import { PreOVIDCompleteChecklist } from './PreOVIDCompleteChecklist';
import { OVIDInspectionHistory } from './OVIDInspectionHistory';
import { OVIDAnalyticsDashboard } from './OVIDAnalyticsDashboard';
import { OVIDFinalizeInspection } from './OVIDFinalizeInspection';
import { OVIDInspectionComparison } from './OVIDInspectionComparison';
import { OVIDHistoricalEvolution } from './OVIDHistoricalEvolution';
import { OVIQ4_CHAPTERS as COMPLETE_CHAPTERS } from '@/data/oviq4-complete-data';
import { useOVIDInspection } from '@/hooks/useOVIDInspection';

interface InspectionStatus {
  compliant: number;
  nonCompliant: number;
  notApplicable: number;
  pending: number;
}

export const OVIDInspectionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVesselType, setSelectedVesselType] = useState<string>('Offshore Supply Vessel (OSV)');
  const [inspectionStarted, setInspectionStarted] = useState(false);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const [vesselName, setVesselName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [operator, setOperator] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { createInspection, loadInspection, inspection, answers, completeInspection } = useOVIDInspection();
  
  const totalQuestions = COMPLETE_CHAPTERS.reduce((acc, ch) => acc + ch.questions.length, 0);
  
  const [status, setStatus] = useState<InspectionStatus>({
    compliant: 0,
    nonCompliant: 0,
    notApplicable: 0,
    pending: totalQuestions,
  });

  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, { 
    answer: 'yes' | 'no' | 'na' | null;
    observation: string;
    evidence: string[];
  }>>({});

  const answeredQuestions = status.compliant + status.nonCompliant + status.notApplicable;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  
  const complianceScore = answeredQuestions > 0 
    ? Math.round(((status.compliant + status.notApplicable) / answeredQuestions) * 100) 
    : 0;

  // Create new inspection in Supabase
  const handleStartInspection = async () => {
    if (!vesselName || !imoNumber || !inspectorName) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newId = await createInspection({
        vessel_name: vesselName,
        imo_number: imoNumber,
        vessel_type: selectedVesselType,
        inspector_name: inspectorName,
        inspection_date: inspectionDate,
        operator: operator || undefined,
        location: location || undefined,
        total_questions: totalQuestions,
      });
      
      if (newId) {
        setCurrentInspectionId(newId);
        setInspectionStarted(true);
        setActiveTab('checklist');
        toast.success('Inspeção OVID criada e salva no banco');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar inspeção');
    } finally {
      setIsCreating(false);
    }
  };

  // Resume inspection from history
  const handleResumeInspection = useCallback(async (inspectionId: string) => {
    setIsCreating(true);
    
    try {
      await loadInspection(inspectionId);
      setCurrentInspectionId(inspectionId);
      setInspectionStarted(true);
      setActiveTab('checklist');
      toast.success('Inspeção retomada com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar inspeção');
    } finally {
      setIsCreating(false);
    }
  }, [loadInspection]);

  // Update status from inspection data
  React.useEffect(() => {
    if (inspection) {
      setVesselName(inspection.vessel_name);
      setImoNumber(inspection.imo_number);
      setInspectorName(inspection.inspector_name);
      setInspectionDate(inspection.inspection_date);
      setSelectedVesselType(inspection.vessel_type);
      setStatus({
        compliant: inspection.compliant_count,
        nonCompliant: inspection.non_compliant_count,
        notApplicable: inspection.not_applicable_count,
        pending: totalQuestions - (inspection.compliant_count + inspection.non_compliant_count + inspection.not_applicable_count),
      });
    }
  }, [inspection, totalQuestions]);

  const handleAnswerChange = (questionId: string, answer: 'yes' | 'no' | 'na', observation?: string) => {
    const prevAnswer = checklistAnswers[questionId]?.answer;
    
    setChecklistAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer,
        observation: observation || prev[questionId]?.observation || '',
        evidence: prev[questionId]?.evidence || [],
      }
    }));

    setStatus(prev => {
      const newStatus = { ...prev };
      
      if (prevAnswer === 'yes') newStatus.compliant--;
      else if (prevAnswer === 'no') newStatus.nonCompliant--;
      else if (prevAnswer === 'na') newStatus.notApplicable--;
      else newStatus.pending--;
      
      if (answer === 'yes') newStatus.compliant++;
      else if (answer === 'no') newStatus.nonCompliant++;
      else if (answer === 'na') newStatus.notApplicable++;
      
      return newStatus;
    });
  };

  const handleExport = () => {
    toast.success('Exportando relatório OVID...');
  };

  const handleFilter = () => {
    toast.success('Filtros aplicados com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">OVID Inspection Dashboard</h2>
          <p className="text-muted-foreground">
            OCIMF Offshore Vessel Inspection Database - OVIQ4 (7300)
          </p>
        </div>
        <div className="flex gap-2">
          {!inspectionStarted ? (
            <Button onClick={() => setActiveTab('new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Inspeção
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleFilter}>
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Vessel Type Selection */}
      <Card className="border-primary/20">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-primary" />
              <span className="font-medium">Tipo de Embarcação:</span>
            </div>
            <Select value={selectedVesselType} onValueChange={setSelectedVesselType}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VESSEL_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {inspectionStarted && (
              <div className="flex items-center gap-4 ml-auto">
                <Badge variant="outline" className="text-sm">
                  <User className="w-3 h-3 mr-1" />
                  {inspectorName}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Calendar className="w-3 h-3 mr-1" />
                  {inspectionDate}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" 
              onClick={() => setActiveTab('overview')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{complianceScore}%</p>
              </div>
              <Target className={`w-8 h-8 ${complianceScore >= 85 ? 'text-green-500' : complianceScore >= 70 ? 'text-yellow-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-500/50 transition-colors"
              onClick={() => setActiveTab('checklist')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conforme</p>
                <p className="text-2xl font-bold text-green-500">{status.compliant}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-red-500/50 transition-colors"
              onClick={() => setActiveTab('ncs')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Conforme</p>
                <p className="text-2xl font-bold text-red-500">{status.nonCompliant}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => setActiveTab('checklist')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">N/A</p>
                <p className="text-2xl font-bold text-muted-foreground">{status.notApplicable}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-yellow-500/50 transition-colors"
              onClick={() => setActiveTab('checklist')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-500">{status.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-blue-500/50 transition-colors"
              onClick={() => setActiveTab('checklist')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold text-blue-500">{progressPercent}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {inspectionStarted && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da Inspeção</span>
                <span>{answeredQuestions} de {totalQuestions} questões ({progressPercent}%)</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-11 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Visão</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-1">
            <ClipboardCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Check</span>
          </TabsTrigger>
          <TabsTrigger value="ncs" className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">NCs</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Evolução</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-1">
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Comparar</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  Sobre o OVID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O Offshore Vessel Inspection Database (OVID) foi desenvolvido pelo OCIMF para 
                  fornecer inspeções offshore de acordo com o formato SIRE. O programa permite 
                  que membros do OCIMF submetam relatórios de inspeção para distribuição.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Benefícios:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Banco de dados centralizado de relatórios de inspeção</li>
                    <li>Padronização de procedimentos de inspeção</li>
                    <li>Verificações de garantia aceleradas</li>
                    <li>Documento de inspeção comum (OVIQ4)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Estrutura OVIQ4
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {OVIQ4_SECTIONS.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{section.id}</Badge>
                          <span className="text-sm font-medium">{section.name}</span>
                        </div>
                        <Badge variant="secondary">{section.questions.length} questões</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Referências Normativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'SOLAS', desc: 'Safety of Life at Sea' },
                    { name: 'MARPOL', desc: 'Marine Pollution Prevention' },
                    { name: 'ISM Code', desc: 'International Safety Management' },
                    { name: 'ISPS Code', desc: 'Ship and Port Facility Security' },
                    { name: 'STCW 2010', desc: 'Training, Certification and Watchkeeping' },
                    { name: 'MLC 2006', desc: 'Maritime Labour Convention' },
                    { name: 'IMCA M103', desc: 'DP Vessels Guidelines' },
                    { name: 'GOMO', desc: 'Guidelines for Offshore Marine Operations' },
                  ].map((ref) => (
                    <div key={ref.name} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm">{ref.name}</p>
                      <p className="text-xs text-muted-foreground">{ref.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* New Inspection Tab */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Inspeção OVID
              </CardTitle>
              <CardDescription>
                Preencha os dados para iniciar uma nova inspeção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vesselName">Nome da Embarcação *</Label>
                    <Input 
                      id="vesselName"
                      placeholder="Ex: SKANDI NEPTUNE"
                      value={vesselName}
                      onChange={(e) => setVesselName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imoNumber">Número IMO *</Label>
                    <Input 
                      id="imoNumber"
                      placeholder="Ex: 9876543"
                      value={imoNumber}
                      onChange={(e) => setImoNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="operator">Operador</Label>
                    <Input 
                      id="operator"
                      placeholder="Nome do operador"
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inspectorName">Nome do Inspetor *</Label>
                    <Input 
                      id="inspectorName"
                      placeholder="Seu nome completo"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inspectionDate">Data da Inspeção</Label>
                    <Input 
                      id="inspectionDate"
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Porto de Inspeção</Label>
                    <Input 
                      id="port"
                      placeholder="Porto e país"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setActiveTab('history')}>
                  <History className="w-4 h-4 mr-2" />
                  Ver Histórico
                </Button>
                <Button size="lg" onClick={handleStartInspection} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-4 h-4 mr-2" />
                      Iniciar Inspeção
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          {inspectionStarted ? (
            <PreOVIDCompleteChecklist
              vesselType={selectedVesselType}
              inspectionId={currentInspectionId || undefined}
              onProgressChange={(progress) => {
                let compliant = 0, nonCompliant = 0, notApplicable = 0, pending = 0;
                Object.values(progress).forEach(p => {
                  compliant += p.compliant;
                  nonCompliant += p.nonCompliant;
                  pending += (p.total - p.completed);
                });
                setStatus({ compliant, nonCompliant, notApplicable, pending });
              }}
            />
          ) : (
            <Card className="p-8 text-center">
              <Ship className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma Inspeção Ativa</h3>
              <p className="text-muted-foreground mb-4">
                Inicie uma nova inspeção ou retome uma existente do histórico
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setActiveTab('history')}>
                  <History className="w-4 h-4 mr-2" />
                  Ver Histórico
                </Button>
                <Button onClick={() => setActiveTab('new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Inspeção
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Non-Conformities Tab */}
        <TabsContent value="ncs">
          <OVIDNonConformities 
            answers={checklistAnswers}
            onGenerateActionPlan={(questionId) => {
              toast.success(`Gerando plano de ação para ${questionId}...`);
            }}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OVIDReports 
              vesselName={vesselName}
              imoNumber={imoNumber}
              inspectorName={inspectorName}
              inspectionDate={inspectionDate}
              status={status}
              answers={checklistAnswers}
            />
            <PreOVIDReportGenerator
              inspectionData={{
                vesselName: vesselName || 'N/A',
                imoNumber: imoNumber || 'N/A',
                vesselType: selectedVesselType,
                inspectorName: inspectorName || 'N/A',
                inspectionDate: inspectionDate,
              }}
              chapterResults={COMPLETE_CHAPTERS.map(ch => ({
                id: ch.id.toString(),
                name: ch.name,
                total: ch.questions.length,
                compliant: 0,
                nonCompliant: 0,
                notApplicable: 0,
                observations: [],
              }))}
              totalQuestions={COMPLETE_CHAPTERS.reduce((acc, ch) => acc + ch.questions.length, 0)}
              answers={checklistAnswers}
            />
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PreOVIDAIChat 
                vesselType={selectedVesselType}
                mode="chat"
              />
            </div>
            <div className="space-y-6">
              <PreOVIDVoiceChat 
                vesselType={selectedVesselType}
                chapterName="OVIQ4 Assistant"
              />
              <PreOVIDEvidenceGenerator
                questionId="Geral"
                questionText="Geração de evidências para itens de inspeção OVID"
                vesselType={selectedVesselType}
                chapterId="1"
              />
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <OVIDInspectionHistory
            onSelectInspection={handleResumeInspection}
            onNewInspection={() => setActiveTab('new')}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Preferências de Inspeção</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Salvar automaticamente</span>
                    <Button variant="outline" size="sm">Ativar</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Notificações de prazo</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Idioma do relatório</span>
                    <Select defaultValue="pt-BR">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Formato de exportação</span>
                    <Select defaultValue="pdf">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <OVIDAnalyticsDashboard />
        </TabsContent>

        {/* Finalize Section in Reports or as separate card */}
        {inspectionStarted && currentInspectionId && (
          <div className="mt-6">
            <OVIDFinalizeInspection 
              inspection={inspection}
              answers={answers}
              onFinalize={completeInspection}
              isFinalized={inspection?.status === 'completed'}
            />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default OVIDInspectionDashboard;
