/**
 * IMCA Audit Generator Component
 * Comprehensive UI for generating IMCA DP Technical Audits
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Save,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  generateAudit,
  saveAudit,
  exportAuditToMarkdown,
} from '@/services/imca-audit-service';
import type {
  IMCAAuditFormState,
  IMCAAuditResult,
  DP_MODULES,
} from '@/types/imca-audit';
import {
  DP_CLASSES,
  getRiskLevelColor,
  getPriorityColor,
} from '@/types/imca-audit';

const IMCAAuditGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'operational' | 'results'>('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditResult, setAuditResult] = useState<IMCAAuditResult | null>(null);
  const [showStandardsModal, setShowStandardsModal] = useState(false);

  const [formData, setFormData] = useState<IMCAAuditFormState>({
    vessel_name: '',
    dp_class: '',
    location: '',
    audit_objective: '',
    operational_context: '',
    incident_details: '',
    environmental_conditions: '',
    system_status: '',
  });

  const handleInputChange = (field: keyof IMCAAuditFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isBasicDataComplete = () => {
    return (
      formData.vessel_name.trim() !== '' &&
      formData.dp_class !== '' &&
      formData.location.trim() !== '' &&
      formData.audit_objective.trim() !== ''
    );
  };

  const handleGenerateAudit = async () => {
    if (!isBasicDataComplete()) {
      toast.error('Dados básicos incompletos', {
        description: 'Preencha todos os campos obrigatórios na aba Dados Básicos.',
      });
      return;
    }

    setIsGenerating(true);
    setAuditResult(null);

    try {
      const response = await generateAudit({
        vessel_name: formData.vessel_name,
        dp_class: formData.dp_class as 'DP1' | 'DP2' | 'DP3',
        location: formData.location,
        audit_objective: formData.audit_objective,
        operational_context: formData.operational_context || undefined,
        incident_details: formData.incident_details || undefined,
        environmental_conditions: formData.environmental_conditions || undefined,
        system_status: formData.system_status || undefined,
      });

      if (response.success && response.audit) {
        setAuditResult(response.audit);
        setActiveTab('results');
        toast.success('Auditoria gerada com sucesso!', {
          description: 'Confira os resultados na aba Resultados.',
        });
      } else {
        toast.error('Erro ao gerar auditoria', {
          description: response.message || response.error,
        });
      }
    } catch (error) {
      console.error('Error generating audit:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao gerar a auditoria. Tente novamente.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!auditResult) {
      toast.error('Nenhuma auditoria para salvar');
      return;
    }

    setIsSaving(true);

    try {
      const response = await saveAudit({
        audit_data: {
          vessel_name: formData.vessel_name,
          dp_class: formData.dp_class as 'DP1' | 'DP2' | 'DP3',
          location: formData.location,
          audit_objective: formData.audit_objective,
          operational_context: formData.operational_context || undefined,
          incident_details: formData.incident_details || undefined,
          environmental_conditions: formData.environmental_conditions || undefined,
          system_status: formData.system_status || undefined,
          findings: auditResult,
          audit_date: new Date().toISOString(),
          status: 'completed',
          score: auditResult.overall_score,
        },
      });

      if (response.success) {
        toast.success('Auditoria salva com sucesso!', {
          description: 'A auditoria foi salva no banco de dados.',
        });
      } else {
        toast.error('Erro ao salvar auditoria', {
          description: response.message || response.error,
        });
      }
    } catch (error) {
      console.error('Error saving audit:', error);
      toast.error('Erro inesperado ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!auditResult) {
      toast.error('Nenhuma auditoria para exportar');
      return;
    }

    const markdown = exportAuditToMarkdown(auditResult, {
      vessel_name: formData.vessel_name,
      dp_class: formData.dp_class,
      location: formData.location,
      audit_date: new Date().toLocaleDateString('pt-BR'),
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMCA-Audit-${formData.vessel_name}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Auditoria exportada', {
      description: 'Arquivo Markdown baixado com sucesso.',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auditoria Técnica IMCA DP</h1>
          <p className="text-muted-foreground mt-1">
            Geração automatizada de auditorias técnicas para sistemas de Dynamic Positioning
          </p>
        </div>
        <Dialog open={showStandardsModal} onOpenChange={setShowStandardsModal}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Normas IMCA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Normas e Padrões IMCA/IMO</DialogTitle>
              <DialogDescription>
                Referências internacionais para sistemas de Dynamic Positioning
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {Object.entries({
                  'IMCA M103': 'Guidelines for Design and Operation of DP Vessels',
                  'IMCA M117': 'Training and Experience of Key DP Personnel',
                  'IMCA M190': 'DP Annual Trials Programmes',
                  'IMCA M166': 'Failure Modes and Effects Analysis',
                  'IMCA M109': 'DP-related Documentation',
                  'IMCA M220': 'Operational Activity Planning',
                  'IMCA M140': 'DP Capability Plots',
                  'MSF 182': 'Safe Operation of DP Offshore Supply Vessels',
                  'MTS DP Operations': 'Marine Technology Society DP Operations Guidance',
                  'IMO MSC.1/Circ.1580': 'IMO Guidelines for DP Systems',
                }).map(([code, description]) => (
                  <div key={code} className="border-b pb-3">
                    <h4 className="font-semibold">{code}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerador de Auditoria</CardTitle>
          <CardDescription>
            Preencha os dados da embarcação e objetivo da auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="operational">Dados Operacionais</TabsTrigger>
              <TabsTrigger value="results" disabled={!auditResult}>
                Resultados
              </TabsTrigger>
            </TabsList>

            {/* Basic Data Tab */}
            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel_name">Nome da Embarcação *</Label>
                  <Input
                    id="vessel_name"
                    placeholder="Ex: DP Drillship Alpha"
                    value={formData.vessel_name}
                    onChange={(e) => handleInputChange('vessel_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dp_class">Classe DP *</Label>
                  <Select
                    value={formData.dp_class}
                    onValueChange={(value) => handleInputChange('dp_class', value)}
                  >
                    <SelectTrigger id="dp_class">
                      <SelectValue placeholder="Selecione a classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {DP_CLASSES.map((dpClass) => (
                        <SelectItem key={dpClass} value={dpClass}>
                          {dpClass}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Local da Operação *</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Bacia de Campos, Brasil"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="audit_objective">Objetivo da Auditoria *</Label>
                  <Textarea
                    id="audit_objective"
                    placeholder="Descreva o objetivo principal da auditoria..."
                    value={formData.audit_objective}
                    onChange={(e) => handleInputChange('audit_objective', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Os campos marcados com * são obrigatórios para gerar a auditoria.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setActiveTab('operational')}
                  variant="outline"
                  disabled={!isBasicDataComplete()}
                >
                  Avançar para Dados Operacionais
                </Button>
                <Button
                  onClick={handleGenerateAudit}
                  disabled={!isBasicDataComplete() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Auditoria
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Operational Data Tab */}
            <TabsContent value="operational" className="space-y-4 mt-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Estes campos são opcionais e fornecem contexto adicional para uma auditoria mais
                  detalhada.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operational_context">Contexto Operacional</Label>
                  <Textarea
                    id="operational_context"
                    placeholder="Descreva o contexto da operação, tipo de atividade, etc..."
                    value={formData.operational_context}
                    onChange={(e) => handleInputChange('operational_context', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident_details">Detalhes de Incidentes (se aplicável)</Label>
                  <Textarea
                    id="incident_details"
                    placeholder="Descreva qualquer incidente relacionado que motivou a auditoria..."
                    value={formData.incident_details}
                    onChange={(e) => handleInputChange('incident_details', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmental_conditions">Condições Ambientais</Label>
                  <Textarea
                    id="environmental_conditions"
                    placeholder="Condições de mar, vento, corrente, etc..."
                    value={formData.environmental_conditions}
                    onChange={(e) =>
                      handleInputChange('environmental_conditions', e.target.value)
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system_status">Status dos Sistemas</Label>
                  <Textarea
                    id="system_status"
                    placeholder="Status atual dos sistemas DP, thrusters, sensores, etc..."
                    value={formData.system_status}
                    onChange={(e) => handleInputChange('system_status', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => setActiveTab('basic')} variant="outline">
                  Voltar
                </Button>
                <Button
                  onClick={handleGenerateAudit}
                  disabled={!isBasicDataComplete() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Auditoria
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6 mt-6">
              {auditResult && (
                <>
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSaveAudit} disabled={isSaving} variant="outline">
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                    <Button onClick={handleExportMarkdown}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Markdown
                    </Button>
                  </div>

                  {/* Overall Score */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Pontuação Geral</span>
                        <Badge
                          className={`text-lg px-4 py-1 ${
                            auditResult.overall_score >= 80
                              ? 'bg-green-500'
                              : auditResult.overall_score >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        >
                          {auditResult.overall_score}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{auditResult.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Standards Compliance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Conformidade com Normas</CardTitle>
                      <CardDescription>
                        Avaliação de conformidade com padrões IMCA/IMO
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {auditResult.standards_compliance.standards.map((standard) => (
                        <div key={standard.code} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              {standard.code} - {standard.name}
                            </h4>
                            <Badge
                              className={
                                standard.compliance_level === 'compliant'
                                  ? 'bg-green-500'
                                  : standard.compliance_level === 'partial'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }
                            >
                              {standard.compliance_level === 'compliant'
                                ? '✅ Conforme'
                                : standard.compliance_level === 'partial'
                                  ? '⚠️ Parcial'
                                  : '❌ Não Conforme'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{standard.findings}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Modules Evaluation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliação de Módulos</CardTitle>
                      <CardDescription>Análise detalhada dos 12 módulos DP</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {auditResult.modules_evaluation.map((module) => (
                          <div key={module.module_code} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{module.module_name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    module.status === 'adequate'
                                      ? 'bg-green-500'
                                      : module.status === 'attention'
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  }
                                >
                                  {module.score}/100
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {module.findings}
                            </p>
                            {module.recommendations.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold mb-1">Recomendações:</p>
                                <ul className="text-xs space-y-1">
                                  {module.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-muted-foreground">
                                      • {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Non-Conformities */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Não Conformidades</CardTitle>
                      <CardDescription>
                        Lista de não conformidades identificadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {auditResult.non_conformities.map((nc) => (
                        <div key={nc.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getRiskLevelColor(nc.risk_level)}>
                                  {nc.risk_level === 'alto'
                                    ? '🔴 Alto'
                                    : nc.risk_level === 'medio'
                                      ? '🟡 Médio'
                                      : '⚪ Baixo'}
                                </Badge>
                                <h4 className="font-semibold">{nc.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {nc.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="text-muted-foreground">
                                  Módulo: {nc.affected_module}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-muted-foreground">
                                  Normas: {nc.related_standards.join(', ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Action Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Plano de Ação</CardTitle>
                      <CardDescription>Ações priorizadas para correção</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {auditResult.action_plan.map((action) => (
                        <div key={action.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getPriorityColor(action.priority)}>
                                  {action.priority === 'critico'
                                    ? '🔥 Crítico'
                                    : action.priority === 'alto'
                                      ? '⚡ Alto'
                                      : action.priority === 'medio'
                                        ? '📋 Médio'
                                        : '📝 Baixo'}
                                </Badge>
                                <h4 className="font-semibold">{action.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {action.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="text-muted-foreground">
                                  Prazo: {action.deadline_days} dias
                                </span>
                                {action.responsible && (
                                  <>
                                    <Separator orientation="vertical" className="h-4" />
                                    <span className="text-muted-foreground">
                                      Responsável: {action.responsible}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IMCAAuditGenerator;
