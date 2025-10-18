/**
 * LIVE COMPLIANCE DASHBOARD - Admin page for continuous compliance monitoring
 * ETAPA 33 - Módulo de Conformidade Viva
 * 
 * Features:
 * - Timeline of corrections and verifications
 * - Evidence grouped by normative clause
 * - Training status by vessel
 * - Dynamic compliance score
 * - AI-powered status explainer
 */

import React, { useState, useEffect } from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  FileCheck,
  TrendingUp,
  Activity,
  Brain,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  calculateComplianceScore,
  generateComplianceStatusExplanation
} from '@/services/compliance-engine';

interface NonConformity {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  norm_type: string;
  norm_reference: string;
  norm_clause?: string;
  detected_at: string;
  vessel_id?: string;
}

interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  planned_completion_date: string;
  responsible_role?: string;
}

interface Evidence {
  id: string;
  title: string;
  evidence_type: string;
  norm_reference: string;
  norm_clause?: string;
  is_verified: boolean;
  uploaded_at: string;
}

interface TrainingAssignment {
  id: string;
  training_title: string;
  status: string;
  crew_member_id: string;
  vessel_id?: string;
  due_date: string;
  completed_at?: string;
  certificate_issued: boolean;
}

export default function LiveCompliancePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [complianceScore, setComplianceScore] = useState<number>(0);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [trainings, setTrainings] = useState<TrainingAssignment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load non-conformities
      const { data: ncData = [] } = await supabase
        .from('compliance_non_conformities')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(100);
      setNonConformities(ncData);

      // Load corrective actions
      const { data: actionsData = [] } = await supabase
        .from('compliance_corrective_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setActions(actionsData);

      // Load evidence
      const { data: evidenceData = [] } = await supabase
        .from('compliance_evidence')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(100);
      setEvidence(evidenceData);

      // Load training assignments
      const { data: trainingData = [] } = await supabase
        .from('compliance_training_assignments')
        .select('*')
        .order('assigned_at', { ascending: false })
        .limit(100);
      setTrainings(trainingData);

      // Calculate compliance score
      const scoreResult = await calculateComplianceScore();
      setComplianceScore(scoreResult.score);
      setScoreBreakdown(scoreResult.breakdown);

      // Generate AI status explanation
      const statusResult = await generateComplianceStatusExplanation();
      setAiStatus(statusResult);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'default';
      case 'in_progress':
      case 'analyzing':
        return 'secondary';
      case 'detected':
      case 'planned':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Group evidence by norm reference
  const evidenceByNorm = evidence.reduce((acc, ev) => {
    const key = ev.norm_reference || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {} as Record<string, Evidence[]>);

  // Group trainings by vessel
  const trainingsByVessel = trainings.reduce((acc, tr) => {
    const key = tr.vessel_id || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tr);
    return acc;
  }, {} as Record<string, TrainingAssignment[]>);

  if (loading) {
    return (
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Activity}
          title="Conformidade Viva"
          description="Monitoramento contínuo de conformidade"
          gradient="indigo"
        />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando dados de conformidade...</p>
            </div>
          </div>
        </div>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Activity}
        title="Conformidade Viva"
        description="Sistema de conformidade contínua com detecção, correlação e automação"
        gradient="indigo"
        badges={[
          { icon: CheckCircle2, label: 'Automação IA' },
          { icon: FileCheck, label: 'Evidências' },
          { icon: BookOpen, label: 'Treinamentos' }
        ]}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Dashboard de Conformidade</h2>
            <p className="text-muted-foreground">
              Visão em tempo real do status de conformidade
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Compliance Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score de Conformidade Dinâmico
            </CardTitle>
            <CardDescription>
              Score calculado automaticamente baseado em não-conformidades e ações corretivas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-5xl font-bold ${getScoreColor(complianceScore)}`}>
                    {complianceScore}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Score geral de conformidade
                  </p>
                </div>
                <div className="w-1/2">
                  <Progress value={complianceScore} className="h-3" />
                </div>
              </div>
              
              {scoreBreakdown && (
                <div className="grid grid-cols-5 gap-4 mt-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{scoreBreakdown.total_non_conformities}</div>
                    <div className="text-xs text-muted-foreground">Não-conformidades</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{scoreBreakdown.total_conformities}</div>
                    <div className="text-xs text-muted-foreground">Resolvidas</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{scoreBreakdown.open_actions}</div>
                    <div className="text-xs text-muted-foreground">Ações Abertas</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{scoreBreakdown.closed_actions}</div>
                    <div className="text-xs text-muted-foreground">Ações Concluídas</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{scoreBreakdown.overdue_actions}</div>
                    <div className="text-xs text-muted-foreground">Ações Atrasadas</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Status Explainer */}
        {aiStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Status IA - Explicação Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Status Geral</h4>
                <p className="text-muted-foreground">{aiStatus.overall_status}</p>
              </div>
              
              {aiStatus.critical_items?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Itens Críticos Pendentes
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {aiStatus.critical_items.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {aiStatus.items_in_correction?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Itens em Correção Automática
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {aiStatus.items_in_correction.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {aiStatus.human_actions_needed?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                    Ações Humanas Necessárias
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {aiStatus.human_actions_needed.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Separator />
              
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{aiStatus.summary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="evidence">Evidências por Norma</TabsTrigger>
            <TabsTrigger value="trainings">Treinamentos por Embarcação</TabsTrigger>
            <TabsTrigger value="actions">Ações Corretivas</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Timeline de Correções e Verificações</CardTitle>
                <CardDescription>
                  Histórico cronológico de não-conformidades e ações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {nonConformities.map((nc) => (
                      <div key={nc.id} className="border-l-4 border-blue-500 pl-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(nc.severity)}>
                                {nc.severity}
                              </Badge>
                              <Badge variant={getStatusColor(nc.status)}>
                                {nc.status}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{nc.title}</h4>
                            <p className="text-sm text-muted-foreground">{nc.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <FileCheck className="h-3 w-3" />
                                {nc.norm_reference}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(nc.detected_at).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evidências Agrupadas por Cláusula Normativa</CardTitle>
                <CardDescription>
                  Evidências organizadas por norma e cláusula para auditoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {Object.entries(evidenceByNorm).map(([norm, items]) => (
                      <div key={norm} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold">{norm}</h4>
                          <Badge variant="outline">{items.length} evidências</Badge>
                        </div>
                        <div className="ml-7 space-y-2">
                          {items.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-sm">{ev.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {ev.evidence_type} {ev.norm_clause && `• ${ev.norm_clause}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(ev.uploaded_at).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                                {ev.is_verified && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainings Tab */}
          <TabsContent value="trainings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status de Capacitação por Embarcação</CardTitle>
                <CardDescription>
                  Treinamentos vinculados a não-conformidades por vessel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {Object.entries(trainingsByVessel).map(([vessel, items]) => (
                      <div key={vessel} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold">{vessel}</h4>
                          <Badge variant="outline">{items.length} treinamentos</Badge>
                        </div>
                        <div className="ml-7 space-y-2">
                          {items.map((tr) => (
                            <div
                              key={tr.id}
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{tr.training_title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={getStatusColor(tr.status)} className="text-xs">
                                      {tr.status}
                                    </Badge>
                                    {tr.certificate_issued && (
                                      <Badge variant="default" className="text-xs">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Certificado
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Prazo: {new Date(tr.due_date).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ações Corretivas</CardTitle>
                <CardDescription>
                  Planos de ação gerados automaticamente por IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {actions.map((action) => (
                      <div
                        key={action.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getSeverityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                              <Badge variant={getStatusColor(action.status)}>
                                {action.status}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{action.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {action.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              {action.responsible_role && (
                                <span>Responsável: {action.responsible_role}</span>
                              )}
                              <span>
                                Prazo: {new Date(action.planned_completion_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModulePageWrapper>
  );
}
