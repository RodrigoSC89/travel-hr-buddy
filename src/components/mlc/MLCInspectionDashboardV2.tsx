/**
 * MLC Inspection Dashboard V2
 * Complete maritime labour convention inspection module
 * Layout V2 with AI integration
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Shield, FileText, CheckCircle, AlertTriangle, XCircle, 
  Plus, Download, Filter, Brain, Clock, Target, BarChart3,
  Users, Ship, Scale, MessageSquare, Settings, ClipboardCheck,
  ChevronDown, ChevronRight, Search, Mic, FileCheck, Globe,
  AlertCircle, Star, Sparkles, Calendar, FileDown, Eye
} from 'lucide-react';
import { MLC_2022_TITLES, getTotalMLC2022Items, getCriticalMLC2022Items, type MLCCheckItem } from '@/data/mlc-2022-checklist';
import { MLCEvidenceGenerator } from './MLCEvidenceGenerator';
import { MLCVoiceChat } from './MLCVoiceChat';
import { MLCReportGenerator } from './MLCReportGenerator';
import { MLCOfflineIndicator } from './MLCOfflineIndicator';
import { MLCInspectionOverview } from './MLCInspectionOverview';
import { ComplianceMapWithGeofencing } from '@/components/compliance/ComplianceMapWithGeofencing';
import { PushNotificationSettingsPanel } from '@/components/notifications/PushNotificationSettingsPanel';
import { useMLCOffline } from '@/hooks/use-mlc-offline';

type ChecklistStatus = 'compliant' | 'non-compliant' | 'na' | null;

interface ChecklistAnswer {
  status: ChecklistStatus;
  observation: string;
  evidence: string[];
  photos: string[];
  aiAssisted: boolean;
}

interface InspectionData {
  vesselName: string;
  imo: string;
  flag: string;
  port: string;
  inspectorName: string;
  startDate: string;
  answers: Record<string, ChecklistAnswer>;
}

export const MLCInspectionDashboardV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    vesselName: '',
    imo: '',
    flag: '',
    port: '',
    inspectorName: '',
    startDate: new Date().toISOString().split('T')[0],
    answers: {}
  });
  const [inspectionStarted, setInspectionStarted] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({});
  const [expandedRegs, setExpandedRegs] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCritical, setFilterCritical] = useState(false);

  // Offline storage hook
  const { isOnline, saveInspection, pendingSyncCount } = useMLCOffline();

  // Statistics
  const totalItems = getTotalMLC2022Items();
  const criticalItems = getCriticalMLC2022Items();
  const answeredItems = Object.values(inspectionData.answers).filter(a => a.status !== null).length;
  const compliantItems = Object.values(inspectionData.answers).filter(a => a.status === 'compliant').length;
  const nonCompliantItems = Object.values(inspectionData.answers).filter(a => a.status === 'non-compliant').length;
  const progressPercent = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;
  const complianceScore = answeredItems > 0 ? Math.round((compliantItems / (answeredItems - Object.values(inspectionData.answers).filter(a => a.status === 'na').length)) * 100) : 0;

  const handleAnswerChange = useCallback((itemId: string, status: ChecklistStatus) => {
    setInspectionData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [itemId]: {
          ...prev.answers[itemId],
          status,
          observation: prev.answers[itemId]?.observation || '',
          evidence: prev.answers[itemId]?.evidence || [],
          photos: prev.answers[itemId]?.photos || [],
          aiAssisted: false
        }
      }
    }));
  }, []);

  const toggleTitle = (titleId: string) => {
    setExpandedTitles(prev => ({ ...prev, [titleId]: !prev[titleId] }));
  };

  const toggleReg = (regId: string) => {
    setExpandedRegs(prev => ({ ...prev, [regId]: !prev[regId] }));
  };

  const startInspection = async () => {
    if (!inspectionData.vesselName) {
      toast.error('Informe o nome da embarcação');
      return;
    }
    
    // Save to offline storage
    const inspectionId = `mlc-${Date.now()}`;
    await saveInspection({
      id: inspectionId,
      vesselName: inspectionData.vesselName,
      imo: inspectionData.imo,
      flag: inspectionData.flag,
      port: inspectionData.port,
      inspectorName: inspectionData.inspectorName,
      startDate: inspectionData.startDate,
      status: 'in_progress',
      answers: inspectionData.answers,
    });
    
    setInspectionStarted(true);
    setActiveTab('checklist');
    toast.success('Inspeção MLC iniciada!', {
      description: isOnline ? 'Dados sincronizados' : 'Salvo localmente (offline)',
    });
  };

  const getStatusIcon = (status: ChecklistStatus) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'non-compliant': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'na': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ChecklistStatus) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'non-compliant': return 'bg-red-500';
      case 'na': return 'bg-gray-400';
      default: return 'bg-muted';
    }
  };

  // Filter items based on search and critical filter
  const filterItems = (items: MLCCheckItem[]) => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCritical = !filterCritical || item.critical;
      return matchesSearch && matchesCritical;
    });
  };

  const exportReport = () => {
    toast.info('Gerando relatório PDF...');
    // Implementation would generate PDF report
    setTimeout(() => {
      toast.success('Relatório gerado!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* AI Banner with Offline Indicator */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-blue-500/20">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  MLCGuard AI Ativo
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" /> MLC 2006 + Emendas 2022
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Assistente especializado em Maritime Labour Convention
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Offline Status Indicator */}
              <MLCOfflineIndicator />
              
              <Button variant="outline" size="sm" onClick={() => setActiveTab('ai')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat IA
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('evidence')}>
                <FileCheck className="h-4 w-4 mr-2" />
                Evidências
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('overview')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <p className="text-2xl font-bold">{complianceScore}%</p>
            <Progress value={complianceScore} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-500/50 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Conforme</p>
            </div>
            <p className="text-2xl font-bold text-green-500">{compliantItems}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-red-500/50 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Não Conforme</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{nonCompliantItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-500" />
              <p className="text-sm text-muted-foreground">Críticos</p>
            </div>
            <p className="text-2xl font-bold text-orange-500">{criticalItems.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Total Itens</p>
            </div>
            <p className="text-2xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-muted-foreground">Progresso</p>
            </div>
            <p className="text-2xl font-bold text-purple-500">{progressPercent}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar when inspection started */}
      {inspectionStarted && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                {inspectionData.vesselName}
              </span>
              <span>{answeredItems}/{totalItems} itens verificados</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
          <TabsTrigger value="ncs" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">NCs</span>
          </TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Evidências</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Relatório</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Always show map and dashboard */}
        <TabsContent value="overview" className="space-y-6">
          {/* Interactive Map with Geofencing - Always visible */}
          <ComplianceMapWithGeofencing 
            height="h-[400px]"
            showControls={true}
            onVesselClick={(vessel) => {
              toast.info(`Embarcação: ${vessel.vesselName}`, {
                description: `Status: ${vessel.status} | Próxima inspeção: ${new Date(vessel.dueDate).toLocaleDateString('pt-BR')}`
              });
            }}
            onGeofenceAlert={(vessel, geofence) => {
              toast.warning(`${vessel.vesselName} entrou na zona: ${geofence.name}`, {
                description: geofence.type === 'inspection-required' 
                  ? 'Inspeção MLC obrigatória nesta região'
                  : 'Atenção: área com restrições'
              });
            }}
          />

          {/* Start Inspection or Continue */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* About MLC */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  Sobre a MLC 2006
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A Convenção do Trabalho Marítimo (MLC) 2006 da OIT estabelece direitos e 
                  condições mínimas de trabalho para marítimos, garantindo trabalho digno e 
                  concorrência justa entre armadores.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Emendas 2022 incluídas:</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Proteção reforçada contra taxas de recrutamento</li>
                    <li>Garantias financeiras atualizadas</li>
                    <li>Requisitos de bem-estar melhorados</li>
                    <li>Procedimentos de reclamação aprimorados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Start Inspection Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-blue-500" />
                  {inspectionStarted ? 'Inspeção em Andamento' : 'Nova Inspeção MLC'}
                </CardTitle>
                <CardDescription>
                  {inspectionStarted 
                    ? `${inspectionData.vesselName} - ${progressPercent}% concluído`
                    : 'Preencha os dados para iniciar a inspeção'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!inspectionStarted ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome da Embarcação *</label>
                        <Input
                          placeholder="M/V Example"
                          value={inspectionData.vesselName}
                          onChange={(e) => setInspectionData(prev => ({ ...prev, vesselName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">IMO</label>
                        <Input
                          placeholder="1234567"
                          value={inspectionData.imo}
                          onChange={(e) => setInspectionData(prev => ({ ...prev, imo: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bandeira</label>
                        <Input
                          placeholder="Estado de bandeira"
                          value={inspectionData.flag}
                          onChange={(e) => setInspectionData(prev => ({ ...prev, flag: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Porto</label>
                        <Input
                          placeholder="Porto de inspeção"
                          value={inspectionData.port}
                          onChange={(e) => setInspectionData(prev => ({ ...prev, port: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Inspetor</label>
                      <Input
                        placeholder="Nome do inspetor"
                        value={inspectionData.inspectorName}
                        onChange={(e) => setInspectionData(prev => ({ ...prev, inspectorName: e.target.value }))}
                      />
                    </div>
                    <Button className="w-full" onClick={startInspection}>
                      <Plus className="h-4 w-4 mr-2" />
                      Iniciar Inspeção
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Embarcação</p>
                        <p className="font-medium">{inspectionData.vesselName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">IMO</p>
                        <p className="font-medium">{inspectionData.imo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bandeira</p>
                        <p className="font-medium">{inspectionData.flag || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Porto</p>
                        <p className="font-medium">{inspectionData.port || 'N/A'}</p>
                      </div>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => setActiveTab('checklist')}>
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Continuar Checklist
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('report')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Relatório
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats if inspection started */}
          {inspectionStarted && (
            <MLCInspectionOverview 
              vesselName={inspectionData.vesselName}
              imoNumber={inspectionData.imo}
              inspectionDate={inspectionData.startDate}
              flagState={inspectionData.flag}
              inspector={inspectionData.inspectorName}
              stats={{
                inspectionsConducted: answeredItems,
                shipsInspected: 1,
                deficienciesFound: nonCompliantItems,
                reportsPending: totalItems - answeredItems > 0 ? 1 : 0,
                upcomingInspections: totalItems - answeredItems,
                completedInspections: answeredItems,
              }}
              findings={Object.entries(inspectionData.answers)
                .filter(([_, answer]) => answer.status === 'non-compliant')
                .slice(0, 5)
                .map(([id, answer], index) => ({
                  id,
                  name: `Finding ${index + 1}`,
                  category: 'Labor Standards',
                  status: 'open' as const,
                  correctiveAction: answer.observation || 'Action required',
                }))}
              onAddFinding={() => setActiveTab('checklist')}
            />
          )}
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="py-3">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por item, título ou descrição..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant={filterCritical ? "default" : "outline"}
                  onClick={() => setFilterCritical(!filterCritical)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Críticos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Items */}
          <ScrollArea className="h-[600px]">
            {MLC_2022_TITLES.map(title => {
              const filteredRegs = title.regulations.map(reg => ({
                ...reg,
                items: filterItems(reg.items)
              })).filter(reg => reg.items.length > 0);

              if (filteredRegs.length === 0) return null;

              return (
                <Collapsible
                  key={title.id}
                  open={expandedTitles[title.id]}
                  onOpenChange={() => toggleTitle(title.id)}
                >
                  <Card className="mb-4">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedTitles[title.id] ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                            <Badge className="bg-blue-500">Título {title.number}</Badge>
                            <CardTitle className="text-base">{title.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {filteredRegs.reduce((acc, reg) => 
                              acc + reg.items.filter(item => item.critical).length, 0
                            ) > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Críticos
                              </Badge>
                            )}
                            <Badge variant="secondary">
                              {filteredRegs.reduce((acc, reg) => acc + reg.items.length, 0)} itens
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {filteredRegs.map(reg => (
                          <Collapsible
                            key={reg.id}
                            open={expandedRegs[reg.id]}
                            onOpenChange={() => toggleReg(reg.id)}
                          >
                            <div className="border rounded-lg">
                              <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50">
                                <div className="flex items-center gap-2">
                                  {expandedRegs[reg.id] ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <Badge variant="outline">{reg.code}</Badge>
                                  <span className="font-medium text-sm">{reg.title}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {reg.items.length} itens
                                </Badge>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="p-3 pt-0 space-y-3">
                                  {reg.items.map(item => {
                                    const answer = inspectionData.answers[item.id];
                                    
                                    return (
                                      <div 
                                        key={item.id}
                                        className={`p-3 rounded-lg border ${
                                          answer?.status === 'non-compliant' 
                                            ? 'border-red-500/50 bg-red-500/5' 
                                            : answer?.status === 'compliant'
                                            ? 'border-green-500/50 bg-green-500/5'
                                            : ''
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge variant="outline" className="text-xs">
                                                {item.id}
                                              </Badge>
                                              {item.critical && (
                                                <Badge variant="destructive" className="text-xs">
                                                  <Star className="h-3 w-3 mr-1" />
                                                  Crítico
                                                </Badge>
                                              )}
                                              {getStatusIcon(answer?.status || null)}
                                            </div>
                                            <p className="font-medium text-sm">{item.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {item.description}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                              {item.legalBasis}
                                            </p>
                                          </div>

                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant={answer?.status === 'compliant' ? 'default' : 'outline'}
                                              className={answer?.status === 'compliant' ? 'bg-green-500 hover:bg-green-600' : ''}
                                              onClick={() => handleAnswerChange(item.id, 'compliant')}
                                            >
                                              <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={answer?.status === 'non-compliant' ? 'destructive' : 'outline'}
                                              onClick={() => handleAnswerChange(item.id, 'non-compliant')}
                                            >
                                              <XCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant={answer?.status === 'na' ? 'secondary' : 'outline'}
                                              onClick={() => handleAnswerChange(item.id, 'na')}
                                            >
                                              N/A
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Guidance tooltip */}
                                        {item.guidance && (
                                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                            <span className="font-medium">Orientação:</span> {item.guidance}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </ScrollArea>
        </TabsContent>

        {/* Non-Conformities Tab */}
        <TabsContent value="ncs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Não Conformidades Identificadas
              </CardTitle>
              <CardDescription>
                {nonCompliantItems} item(s) marcado(s) como não conforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nonCompliantItems === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma não conformidade registrada</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {Object.entries(inspectionData.answers)
                      .filter(([, a]) => a.status === 'non-compliant')
                      .map(([itemId, answer]) => {
                        let foundItem: MLCCheckItem | undefined;
                        let foundTitle: typeof MLC_2022_TITLES[0] | undefined;
                        
                        for (const title of MLC_2022_TITLES) {
                          for (const reg of title.regulations) {
                            const item = reg.items.find(i => i.id === itemId);
                            if (item) {
                              foundItem = item;
                              foundTitle = title;
                              break;
                            }
                          }
                          if (foundItem) break;
                        }

                        if (!foundItem) return null;

                        return (
                          <Card key={itemId} className="border-red-500/50">
                            <CardContent className="py-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="destructive">{itemId}</Badge>
                                    <Badge variant="outline">T{foundTitle?.number}</Badge>
                                    {foundItem.critical && (
                                      <Badge variant="destructive" className="text-xs">
                                        <Star className="h-3 w-3 mr-1" /> Crítico
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium">{foundItem.title}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {foundItem.description}
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    {foundItem.legalBasis}
                                  </p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setActiveTab('evidence');
                                  }}
                                >
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Gerar Evidência
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Generator Tab */}
        <TabsContent value="evidence">
          <MLCEvidenceGenerator />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="h-[600px]">
          <MLCVoiceChat />
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-4">
          <MLCReportGenerator inspectionData={inspectionData} />
        </TabsContent>

        {/* Settings Tab - Push Notifications */}
        <TabsContent value="settings" className="space-y-4">
          <PushNotificationSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLCInspectionDashboardV2;
