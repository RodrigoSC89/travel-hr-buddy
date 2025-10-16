/**
 * IMCA DP Technical Audit Generator Component
 * 
 * Multi-tab interface for generating AI-powered IMCA DP technical audit reports.
 * Evaluates vessel DP systems against international standards.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Ship, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  generateIMCAAudit, 
  saveIMCAAudit, 
  exportIMCAAudit 
} from '@/services/imca-audit-service';
import type { 
  IMCAAuditInput, 
  IMCAAuditReport,
  DPClass,
  DPModule,
  NonConformity
} from '@/types/imca-audit';
import { 
  getRiskLevelColor, 
  getPriorityLevelColor,
  isValidDPClass 
} from '@/types/imca-audit';
import { toast } from 'sonner';

export function IMCAAuditGenerator() {
  const [activeTab, setActiveTab] = useState('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditReport, setAuditReport] = useState<IMCAAuditReport | null>(null);

  // Form state
  const [vesselName, setVesselName] = useState('');
  const [dpClass, setDpClass] = useState<DPClass>('DP2');
  const [location, setLocation] = useState('');
  const [auditObjective, setAuditObjective] = useState('');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [environmentalConditions, setEnvironmentalConditions] = useState('');
  const [systemStatus, setSystemStatus] = useState('');

  // Validation
  const isBasicDataValid = vesselName.trim() !== '' && 
                          location.trim() !== '' && 
                          auditObjective.trim() !== '';

  const handleGenerate = async () => {
    if (!isBasicDataValid) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsGenerating(true);
    try {
      const input: IMCAAuditInput = {
        vesselName,
        dpClass,
        location,
        auditObjective,
        incidentDetails: incidentDetails || undefined,
        environmentalConditions: environmentalConditions || undefined,
        systemStatus: systemStatus || undefined
      };

      const report = await generateIMCAAudit(input);
      setAuditReport(report);
      setActiveTab('results');
      toast.success('Auditoria gerada com sucesso!');
    } catch (error) {
      console.error('Error generating audit:', error);
      toast.error('Erro ao gerar auditoria. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!auditReport) return;

    setIsSaving(true);
    try {
      await saveIMCAAudit(auditReport, 'completed');
      toast.success('Auditoria salva com sucesso!');
    } catch (error) {
      console.error('Error saving audit:', error);
      toast.error('Erro ao salvar auditoria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!auditReport) return;

    try {
      await exportIMCAAudit(auditReport);
      toast.success('Auditoria exportada com sucesso!');
    } catch (error) {
      console.error('Error exporting audit:', error);
      toast.error('Erro ao exportar auditoria');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ship className="h-6 w-6 text-blue-600" />
            <CardTitle>Gerador de Auditoria Técnica DP IMCA</CardTitle>
          </div>
          <CardDescription>
            Sistema de auditoria técnica para embarcações DP seguindo normas IMCA, IMO e MTS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="operational">Dados Operacionais</TabsTrigger>
              <TabsTrigger value="results" disabled={!auditReport}>Resultados</TabsTrigger>
            </TabsList>

            {/* Basic Data Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vesselName">
                    Nome da Embarcação <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vesselName"
                    placeholder="Ex: DP Construction Vessel Delta"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dpClass">
                    Classe DP <span className="text-red-500">*</span>
                  </Label>
                  <Select value={dpClass} onValueChange={(value) => setDpClass(value as DPClass)}>
                    <SelectTrigger id="dpClass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP1">DP1</SelectItem>
                      <SelectItem value="DP2">DP2</SelectItem>
                      <SelectItem value="DP3">DP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">
                    Localização <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Santos Basin, Brazil"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="auditObjective">
                    Objetivo da Auditoria <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="auditObjective"
                    placeholder="Ex: Avaliação técnica pós-incidente"
                    value={auditObjective}
                    onChange={(e) => setAuditObjective(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={() => setActiveTab('operational')}
                  disabled={!isBasicDataValid}
                  className="w-full"
                >
                  Continuar para Dados Operacionais
                </Button>
              </div>
            </TabsContent>

            {/* Operational Data Tab */}
            <TabsContent value="operational" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Os campos abaixo são opcionais, mas fornecem contexto adicional para a análise.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="incidentDetails">Detalhes do Incidente (se aplicável)</Label>
                  <Textarea
                    id="incidentDetails"
                    placeholder="Ex: Falha no thruster #3 durante operações de lançamento de ROV"
                    value={incidentDetails}
                    onChange={(e) => setIncidentDetails(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="environmentalConditions">Condições Ambientais</Label>
                  <Textarea
                    id="environmentalConditions"
                    placeholder="Ex: Vento 25 knots, corrente 1.5 knots, altura de onda 2.5m"
                    value={environmentalConditions}
                    onChange={(e) => setEnvironmentalConditions(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="systemStatus">Status dos Sistemas</Label>
                  <Textarea
                    id="systemStatus"
                    placeholder="Ex: Todos os sistemas operacionais, exceto thruster de proa"
                    value={systemStatus}
                    onChange={(e) => setSystemStatus(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('basic')}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleGenerate}
                    disabled={!isBasicDataValid || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando Auditoria...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Gerar Auditoria
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {auditReport && (
                <>
                  {/* Header with actions */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">{auditReport.vesselName}</h3>
                      <p className="text-muted-foreground">
                        {auditReport.location} • {new Date(auditReport.auditDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pontuação Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-center">
                        {auditReport.overallScore}/100
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo Executivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{auditReport.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Modules */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliação dos Módulos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {auditReport.modules.map((module: DPModule) => (
                          <div key={module.id} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">{module.name}</h4>
                              <Badge variant="secondary">{module.score}/100</Badge>
                            </div>
                            {module.findings.length > 0 && (
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {module.findings.map((finding, idx) => (
                                  <li key={idx}>{finding}</li>
                                ))}
                              </ul>
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
                        {auditReport.nonConformities.length} não conformidade(s) identificada(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {auditReport.nonConformities.map((nc: NonConformity, idx) => (
                          <div key={nc.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{nc.module}</h4>
                              <Badge className={getRiskLevelColor(nc.riskLevel)}>
                                {nc.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Norma:</strong> {nc.standard}
                            </p>
                            <p className="text-sm mb-2">{nc.description}</p>
                            <div className="bg-blue-50 border border-blue-200 rounded p-2">
                              <p className="text-sm">
                                <strong>Recomendação:</strong> {nc.recommendation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Plano de Ação</CardTitle>
                      <CardDescription>
                        {auditReport.actionPlan.length} ação(ões) prioritizada(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditReport.actionPlan.map((action, idx) => (
                          <div key={action.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                            <span className="font-bold text-muted-foreground">{idx + 1}.</span>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-medium">{action.description}</p>
                                <Badge className={getPriorityLevelColor(action.priority)}>
                                  {action.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Prazo: {new Date(action.deadline).toLocaleDateString('pt-BR')} • 
                                Responsável: {action.responsible}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
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
}
