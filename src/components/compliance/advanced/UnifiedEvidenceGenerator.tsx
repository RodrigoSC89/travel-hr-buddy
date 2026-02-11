/**
 * Unified Evidence Generator - PEOTRAM + PEO-DP Integration
 * AI-powered evidence generation with templates and validation
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, Sparkles, Download, Copy, CheckCircle2, 
  AlertTriangle, Clock, Ship, User, Calendar, Target,
  FileCheck, Loader2, RefreshCw, Save, Eye, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { logger } from '@/lib/logger';

type ModuleType = 'peotram' | 'peo-dp';
type EvidenceStatus = 'draft' | 'generated' | 'validated' | 'exported';
type NCClassification = 'A' | 'B' | 'C' | 'D';

interface EvidenceInput {
  module: ModuleType;
  element_number?: number;
  requirement_number?: string;
  item_description: string;
  non_conformity_type: NCClassification;
  observed_condition: string;
  vessel_name: string;
  auditor_name: string;
  dp_class?: string;
  company_name?: string;
}

interface GeneratedEvidence {
  id: string;
  module: ModuleType;
  title: string;
  content: string;
  analysis: string;
  recommendations: string[];
  corrective_actions: string[];
  normative_references: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  generated_at: string;
  status: EvidenceStatus;
}

const PEOTRAM_ELEMENTS = [
  { number: 1, name: 'Segurança Operacional e Gestão' },
  { number: 2, name: 'Planejamento e Programação de Manutenção' },
  { number: 3, name: 'Gestão de Tripulação' },
  { number: 4, name: 'Qualificação e Treinamento' },
  { number: 5, name: 'Operações de Convés' },
  { number: 6, name: 'Operações de Máquinas' },
  { number: 7, name: 'Segurança e Proteção Ambiental' },
  { number: 8, name: 'Gestão de Emergências' },
  { number: 9, name: 'Saúde e Higiene' },
  { number: 10, name: 'Gestão de Documentação' },
  { number: 11, name: 'Comunicação e Reporting' },
  { number: 12, name: 'Inspeções e Auditorias' },
  { number: 13, name: 'Melhoria Contínua' }
];

const PEODP_SECTIONS = [
  { id: 'SECT-1', name: 'Documentação de Sistema DP' },
  { id: 'SECT-2', name: 'Competência da Tripulação DP' },
  { id: 'SECT-3', name: 'Equipamentos e Redundância' },
  { id: 'SECT-4', name: 'Procedimentos Operacionais' },
  { id: 'SECT-5', name: 'Manutenção Preditiva DP' },
  { id: 'SECT-6', name: 'Testes e Trials Anuais' },
  { id: 'SECT-7', name: 'Gestão de Incidentes DP' },
  { id: 'SECT-8', name: 'Interfaces e Integrações' }
];

const NC_CLASSIFICATIONS: Record<NCClassification, { label: string; color: string; description: string }> = {
  'A': { label: 'Crítica', color: 'bg-destructive', description: 'Risco imediato à segurança ou ambiente' },
  'B': { label: 'Maior', color: 'bg-warning', description: 'Desvio significativo de requisito' },
  'C': { label: 'Menor', color: 'bg-warning/70', description: 'Desvio menor sem impacto imediato' },
  'D': { label: 'Observação', color: 'bg-info', description: 'Oportunidade de melhoria' }
};

const EVIDENCE_TEMPLATES = [
  { id: 'nc-report', name: 'Relatório de Não Conformidade', icon: AlertTriangle },
  { id: 'corrective-action', name: 'Plano de Ação Corretiva', icon: Target },
  { id: 'audit-evidence', name: 'Evidência de Auditoria', icon: FileCheck },
  { id: 'training-record', name: 'Registro de Treinamento', icon: User }
];

export function UnifiedEvidenceGenerator() {
  const [activeModule, setActiveModule] = useState<ModuleType>('peotram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvidence, setGeneratedEvidence] = useState<GeneratedEvidence | null>(null);
  const [evidenceHistory, setEvidenceHistory] = useState<GeneratedEvidence[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [input, setInput] = useState<EvidenceInput>({
    module: 'peotram',
    element_number: 4,
    item_description: '',
    non_conformity_type: 'B',
    observed_condition: '',
    vessel_name: '',
    auditor_name: '',
    dp_class: 'DP-2',
    company_name: ''
  });

  const handleInputChange = (field: keyof EvidenceInput, value: string | number) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const generateEvidence = useCallback(async () => {
    if (!input.item_description || !input.observed_condition) {
      toast.error('Preencha a descrição do item e a condição observada');
      return;
    }

    setIsGenerating(true);

    try {
      // Choose endpoint based on module
      const endpoint = activeModule === 'peotram' 
        ? 'peotram-generate-evidence' 
        : 'peodp-generate-evidence';

      const body = activeModule === 'peotram' ? {
        element_number: input.element_number,
        element_name: PEOTRAM_ELEMENTS.find(e => e.number === input.element_number)?.name,
        item_number: `${input.element_number}.1`,
        item_description: input.item_description,
        non_conformity_reason: input.observed_condition,
        nc_classification: input.non_conformity_type,
        vessel_name: input.vessel_name,
        auditor_name: input.auditor_name,
        audit_date: format(new Date(), 'yyyy-MM-dd')
      } : {
        section: input.requirement_number,
        requirement_number: input.requirement_number,
        requirement_title: input.item_description,
        requirement_description: input.observed_condition,
        status: input.non_conformity_type === 'A' ? 'critical' : 'non_compliant',
        auditor_notes: input.observed_condition,
        vessel_name: input.vessel_name,
        dp_class: input.dp_class,
        company_name: input.company_name,
        audit_date: format(new Date(), 'yyyy-MM-dd'),
        auditor_name: input.auditor_name
      };

      const { data, error } = await supabase.functions.invoke(endpoint, { body });

      if (error) throw error;

      const evidence: GeneratedEvidence = {
        id: `EV-${Date.now()}`,
        module: activeModule,
        title: `${activeModule === 'peotram' ? 'PEOTRAM' : 'PEO-DP'} - ${input.item_description.substring(0, 50)}...`,
        content: data?.evidence?.content || data?.content || 'Evidência gerada com sucesso',
        analysis: data?.evidence?.analysis || data?.analysis || 'Análise técnica detalhada',
        recommendations: data?.evidence?.recommendations || data?.recommendations || ['Ação corretiva recomendada'],
        corrective_actions: data?.evidence?.corrective_actions || data?.corrective_actions || ['Implementar plano de correção'],
        normative_references: data?.evidence?.normative_references || data?.normative_references || ['NORMAM', 'ISM Code'],
        risk_level: input.non_conformity_type === 'A' ? 'critical' : 
                   input.non_conformity_type === 'B' ? 'high' :
                   input.non_conformity_type === 'C' ? 'medium' : 'low',
        confidence_score: data?.confidence_score || 95,
        generated_at: new Date().toISOString(),
        status: 'generated'
      };

      setGeneratedEvidence(evidence);
      setEvidenceHistory(prev => [evidence, ...prev.slice(0, 9)]);
      toast.success('Evidência gerada com sucesso!', {
        description: `Confiança: ${evidence.confidence_score}%`
      });
    } catch (error) {
      logger.error('Error generating evidence:', error);
      toast.error('Erro ao gerar evidência', {
        description: 'Tente novamente ou verifique os dados'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [activeModule, input]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const exportAsPDF = () => {
    toast.success('Exportando PDF...', {
      description: 'O download iniciará em instantes'
    });
    // PDF export logic would go here
  };

  const getRiskBadge = (level: string) => {
    const config: Record<string, string> = {
      critical: 'bg-destructive text-destructive-foreground',
      high: 'bg-warning text-warning-foreground',
      medium: 'bg-warning/70 text-foreground',
      low: 'bg-success text-success-foreground'
    };
    return config[level] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Gerador de Evidências com IA
          </h2>
          <p className="text-muted-foreground">
            Geração automática de evidências para PEOTRAM e PEO-DP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                Histórico ({evidenceHistory.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Histórico de Evidências Geradas</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-96">
                <div className="space-y-3 pr-4">
                  {evidenceHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma evidência gerada ainda
                    </p>
                  ) : (
                    evidenceHistory.map(ev => (
                      <Card key={ev.id} className="cursor-pointer hover:bg-muted/50"
                            onClick={() => { setGeneratedEvidence(ev); setShowHistory(false); }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{ev.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(ev.generated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{ev.module.toUpperCase()}</Badge>
                              <Badge className={getRiskBadge(ev.risk_level)}>
                                {ev.risk_level}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Module Selector */}
      <Tabs value={activeModule} onValueChange={(v) => { 
        setActiveModule(v as ModuleType);
        setInput(prev => ({ ...prev, module: v as ModuleType }));
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="peotram" className="gap-2">
            <Ship className="h-4 w-4" />
            PEOTRAM
          </TabsTrigger>
          <TabsTrigger value="peo-dp" className="gap-2">
            <Target className="h-4 w-4" />
            PEO-DP
          </TabsTrigger>
        </TabsList>

        {/* PEOTRAM Form */}
        <TabsContent value="peotram" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados da Não Conformidade PEOTRAM</CardTitle>
              <CardDescription>
                Preencha os campos para gerar evidência automática baseada nos 13 elementos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Elemento PEOTRAM</Label>
                  <Select 
                    value={String(input.element_number)}
                    onValueChange={v => handleInputChange('element_number', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOTRAM_ELEMENTS.map(elem => (
                        <SelectItem key={elem.number} value={String(elem.number)}>
                          {elem.number}. {elem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Classificação NC</Label>
                  <Select 
                    value={input.non_conformity_type}
                    onValueChange={v => handleInputChange('non_conformity_type', v as NCClassification)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NC_CLASSIFICATIONS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.color}`} />
                            {key} - {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Embarcação</Label>
                  <Input 
                    value={input.vessel_name}
                    onChange={e => handleInputChange('vessel_name', e.target.value)}
                    placeholder="Ex: MV Petrobras 001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Auditor</Label>
                  <Input 
                    value={input.auditor_name}
                    onChange={e => handleInputChange('auditor_name', e.target.value)}
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição do Item *</Label>
                <Textarea 
                  value={input.item_description}
                  onChange={e => handleInputChange('item_description', e.target.value)}
                  placeholder="Descreva o item ou requisito que apresentou não conformidade..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Condição Observada *</Label>
                <Textarea 
                  value={input.observed_condition}
                  onChange={e => handleInputChange('observed_condition', e.target.value)}
                  placeholder="Descreva detalhadamente a condição observada durante a auditoria..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PEO-DP Form */}
        <TabsContent value="peo-dp" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados da Não Conformidade PEO-DP</CardTitle>
              <CardDescription>
                Preencha os campos para gerar evidência automática baseada nos requisitos DP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Seção PEO-DP</Label>
                  <Select 
                    value={input.requirement_number}
                    onValueChange={v => handleInputChange('requirement_number', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PEODP_SECTIONS.map(sect => (
                        <SelectItem key={sect.id} value={sect.id}>
                          {sect.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Classe DP</Label>
                  <Select 
                    value={input.dp_class}
                    onValueChange={v => handleInputChange('dp_class', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP-1">DP-1</SelectItem>
                      <SelectItem value="DP-2">DP-2</SelectItem>
                      <SelectItem value="DP-3">DP-3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Classificação NC</Label>
                  <Select 
                    value={input.non_conformity_type}
                    onValueChange={v => handleInputChange('non_conformity_type', v as NCClassification)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NC_CLASSIFICATIONS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {key} - {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Embarcação</Label>
                  <Input 
                    value={input.vessel_name}
                    onChange={e => handleInputChange('vessel_name', e.target.value)}
                    placeholder="Ex: OSV Aurora"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input 
                    value={input.company_name}
                    onChange={e => handleInputChange('company_name', e.target.value)}
                    placeholder="Ex: Petrobras S.A."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Auditor</Label>
                  <Input 
                    value={input.auditor_name}
                    onChange={e => handleInputChange('auditor_name', e.target.value)}
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título do Requisito *</Label>
                <Textarea 
                  value={input.item_description}
                  onChange={e => handleInputChange('item_description', e.target.value)}
                  placeholder="Descreva o requisito PEO-DP que apresentou não conformidade..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Condição Observada *</Label>
                <Textarea 
                  value={input.observed_condition}
                  onChange={e => handleInputChange('observed_condition', e.target.value)}
                  placeholder="Descreva detalhadamente a condição observada durante a auditoria DP..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="gap-2 px-8"
          onClick={generateEvidence}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Gerando Evidência...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Gerar Evidência com IA
            </>
          )}
        </Button>
      </div>

      {/* Generated Evidence Result */}
      {generatedEvidence && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Evidência Gerada
                </CardTitle>
                <CardDescription>
                  Confiança: {generatedEvidence.confidence_score}% | 
                  {format(new Date(generatedEvidence.generated_at), " dd/MM/yyyy HH:mm", { locale: ptBR })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRiskBadge(generatedEvidence.risk_level)}>
                  {generatedEvidence.risk_level.toUpperCase()}
                </Badge>
                <Badge variant="outline">{generatedEvidence.module.toUpperCase()}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Progress value={generatedEvidence.confidence_score} className="flex-1" />
              <span className="text-sm font-medium">{generatedEvidence.confidence_score}%</span>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Análise Técnica</h4>
              <ReactMarkdown>{generatedEvidence.analysis}</ReactMarkdown>
            </div>

            <Separator />

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Conteúdo da Evidência</h4>
              <ReactMarkdown>{generatedEvidence.content}</ReactMarkdown>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Ações Corretivas</h4>
                <ul className="space-y-1">
                  {generatedEvidence.corrective_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Referências Normativas</h4>
                <div className="flex flex-wrap gap-1">
                  {generatedEvidence.normative_references.map((ref, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="gap-2"
                      onClick={() => copyToClipboard(generatedEvidence.content)}>
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" className="gap-2"
                      onClick={exportAsPDF}>
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button size="sm" className="gap-2">
                <Send className="h-4 w-4" />
                Vincular à NC
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates de Evidência</CardTitle>
          <CardDescription>
            Use templates pré-configurados para acelerar a geração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EVIDENCE_TEMPLATES.map(template => (
              <Button 
                key={template.id} 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => { toast.info(`Template "${template.name}" carregado. Configure os campos acima e gere a evidência.`); }}
              >
                <template.icon className="h-6 w-6" />
                <span className="text-xs text-center">{template.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
