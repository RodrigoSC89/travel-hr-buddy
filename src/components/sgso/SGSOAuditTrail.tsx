/**
 * PATCH 910 - SGSO Audit Trail (Trilhas de Auditoria Inteligentes)
 * Based on ANP Resolution 46/2016 - 17 Management Practices
 * Smart checklists with evidence tracking and conformity classification
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Eye,
  Download,
  Play,
  Save,
  Brain,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// 17 Práticas de Gestão SGSO - ANP 46/2016
export interface SGSOPractice {
  id: string;
  number: number;
  title: string;
  category: 'leadership' | 'facilities' | 'operations';
  description: string;
  items: SGSOChecklistItem[];
  critical: boolean;
}

export interface SGSOChecklistItem {
  id: string;
  code: string;
  question: string;
  expectedEvidence: string;
  regulatoryReference: string;
  conformity?: 'sim' | 'nao' | 'parcial' | 'na';
  observations?: string;
  evidenceFiles?: string[];
}

export interface AuditSession {
  id: string;
  title: string;
  type: 'internal' | 'anp' | 'ibp' | 'third_party';
  status: 'planned' | 'in_progress' | 'completed' | 'closed';
  scope: string[];
  auditors: string[];
  scheduledDate: string;
  completedDate?: string;
  overallScore: number;
  findings: AuditFinding[];
}

export interface AuditFinding {
  id: string;
  practiceId: string;
  itemId: string;
  classification: 'critica' | 'grave' | 'moderada' | 'leve';
  description: string;
  rootCause?: string;
  actionPlan?: string;
  deadline?: string;
  responsible?: string;
  status: 'open' | 'in_treatment' | 'closed';
}

// 17 Práticas de Gestão
const SGSO_PRACTICES: SGSOPractice[] = [
  {
    id: 'pg1',
    number: 1,
    title: 'Cultura de Segurança, Compromisso e Responsabilidade Gerencial',
    category: 'leadership',
    description: 'O Operador definirá valores e política de segurança operacional, estrutura organizacional e disponibilização de recursos.',
    critical: true,
    items: [
      { id: 'pg1-1', code: 'PG1.1', question: 'Existe política formal de segurança operacional assinada pela alta direção?', expectedEvidence: 'Documento publicado e comunicado à força de trabalho', regulatoryReference: 'ANP 46/2016 Art. 5º' },
      { id: 'pg1-2', code: 'PG1.2', question: 'A estrutura organizacional define responsabilidades para SGSO?', expectedEvidence: 'Organograma, matriz de responsabilidade', regulatoryReference: 'ANP 46/2016 Art. 5º §1º' },
      { id: 'pg1-3', code: 'PG1.3', question: 'Existem recursos adequados para implementação do SGSO?', expectedEvidence: 'Orçamento, pessoal dedicado, ferramentas', regulatoryReference: 'ANP 46/2016 Art. 5º §2º' },
      { id: 'pg1-4', code: 'PG1.4', question: 'As metas de segurança são comunicadas à força de trabalho?', expectedEvidence: 'Atas de reunião, murais, DDS', regulatoryReference: 'ANP 46/2016 Art. 5º §3º' },
      { id: 'pg1-5', code: 'PG1.5', question: 'A liderança demonstra compromisso visível com segurança?', expectedEvidence: 'Participação em auditorias, inspeções, reuniões', regulatoryReference: 'ANP 46/2016 Art. 5º §4º' },
    ],
  },
  {
    id: 'pg2',
    number: 2,
    title: 'Envolvimento de Pessoal',
    category: 'leadership',
    description: 'Promover envolvimento, conscientização e participação da força de trabalho no SGSO.',
    critical: false,
    items: [
      { id: 'pg2-1', code: 'PG2.1', question: 'Existem canais de comunicação para relato de preocupações de segurança?', expectedEvidence: 'Sistema de relatos, ouvidoria, CIPA', regulatoryReference: 'ANP 46/2016 Art. 6º' },
      { id: 'pg2-2', code: 'PG2.2', question: 'Os trabalhadores participam das análises de risco?', expectedEvidence: 'Listas de presença, atas', regulatoryReference: 'ANP 46/2016 Art. 6º §1º' },
      { id: 'pg2-3', code: 'PG2.3', question: 'Existe programa de sugestões de melhoria?', expectedEvidence: 'Registros POST, caixa de sugestões', regulatoryReference: 'ANP 46/2016 Art. 6º §2º' },
    ],
  },
  {
    id: 'pg3',
    number: 3,
    title: 'Qualificação, Treinamento e Desempenho de Pessoal',
    category: 'leadership',
    description: 'Garantir que a força de trabalho exerça suas funções de maneira segura.',
    critical: false,
    items: [
      { id: 'pg3-1', code: 'PG3.1', question: 'Existe matriz de treinamento por função?', expectedEvidence: 'Matriz de treinamento, descrições de cargo', regulatoryReference: 'ANP 46/2016 Art. 7º' },
      { id: 'pg3-2', code: 'PG3.2', question: 'Os treinamentos são realizados conforme programação?', expectedEvidence: 'Certificados, listas de presença', regulatoryReference: 'ANP 46/2016 Art. 7º §1º' },
      { id: 'pg3-3', code: 'PG3.3', question: 'Existe avaliação de eficácia dos treinamentos?', expectedEvidence: 'Avaliações, testes práticos', regulatoryReference: 'ANP 46/2016 Art. 7º §2º' },
    ],
  },
  {
    id: 'pg4',
    number: 4,
    title: 'Ambiente de Trabalho e Fatores Humanos',
    category: 'leadership',
    description: 'Promover ambiente de trabalho adequado considerando fatores humanos.',
    critical: false,
    items: [
      { id: 'pg4-1', code: 'PG4.1', question: 'Existem programas de saúde ocupacional (PPRA, PCMSO)?', expectedEvidence: 'Documentos PPRA, PCMSO atualizados', regulatoryReference: 'ANP 46/2016 Art. 8º' },
      { id: 'pg4-2', code: 'PG4.2', question: 'Os fatores humanos são considerados nas análises de risco?', expectedEvidence: 'Análises ergonômicas, AET', regulatoryReference: 'ANP 46/2016 Art. 8º §1º' },
    ],
  },
  {
    id: 'pg5',
    number: 5,
    title: 'Seleção, Controle e Gerenciamento de Contratadas',
    category: 'leadership',
    description: 'Garantir que contratadas atendam requisitos de segurança operacional.',
    critical: false,
    items: [
      { id: 'pg5-1', code: 'PG5.1', question: 'Existe processo de qualificação de contratadas?', expectedEvidence: 'Critérios de qualificação, auditorias prévias', regulatoryReference: 'ANP 46/2016 Art. 9º' },
      { id: 'pg5-2', code: 'PG5.2', question: 'Os contratos incluem requisitos de segurança?', expectedEvidence: 'Cláusulas contratuais, anexos de SMS', regulatoryReference: 'ANP 46/2016 Art. 9º §1º' },
    ],
  },
  {
    id: 'pg6',
    number: 6,
    title: 'Monitoramento e Melhoria Contínua do Desempenho',
    category: 'leadership',
    description: 'Estabelecer indicadores e promover melhoria contínua.',
    critical: false,
    items: [
      { id: 'pg6-1', code: 'PG6.1', question: 'Existem indicadores de desempenho de segurança?', expectedEvidence: 'Dashboard, relatórios mensais', regulatoryReference: 'ANP 46/2016 Art. 10' },
      { id: 'pg6-2', code: 'PG6.2', question: 'As análises críticas são realizadas periodicamente?', expectedEvidence: 'Atas de reunião de análise crítica', regulatoryReference: 'ANP 46/2016 Art. 10 §1º' },
    ],
  },
  {
    id: 'pg7',
    number: 7,
    title: 'Auditorias',
    category: 'leadership',
    description: 'Realizar auditorias internas e gerenciar auditorias externas.',
    critical: true,
    items: [
      { id: 'pg7-1', code: 'PG7.1', question: 'Existe programa de auditorias internas?', expectedEvidence: 'Cronograma anual de auditorias', regulatoryReference: 'ANP 46/2016 Art. 11' },
      { id: 'pg7-2', code: 'PG7.2', question: 'As não conformidades são tratadas com planos de ação?', expectedEvidence: 'Planos de ação, evidências de fechamento', regulatoryReference: 'ANP 46/2016 Art. 11 §1º' },
    ],
  },
  {
    id: 'pg8',
    number: 8,
    title: 'Gestão da Informação e da Documentação',
    category: 'leadership',
    description: 'Controlar documentos e registros do SGSO.',
    critical: false,
    items: [
      { id: 'pg8-1', code: 'PG8.1', question: 'Existe controle de documentos do SGSO?', expectedEvidence: 'Lista mestra, controle de versões', regulatoryReference: 'ANP 46/2016 Art. 12' },
      { id: 'pg8-2', code: 'PG8.2', question: 'Os documentos estão acessíveis à força de trabalho?', expectedEvidence: 'Sistema de gestão documental', regulatoryReference: 'ANP 46/2016 Art. 12 §1º' },
    ],
  },
  {
    id: 'pg9',
    number: 9,
    title: 'Investigação de Incidentes',
    category: 'leadership',
    description: 'Investigar incidentes e implementar ações preventivas.',
    critical: true,
    items: [
      { id: 'pg9-1', code: 'PG9.1', question: 'Existe procedimento de investigação de incidentes?', expectedEvidence: 'Procedimento, metodologia (ex: árvore de causas)', regulatoryReference: 'ANP 46/2016 Art. 13' },
      { id: 'pg9-2', code: 'PG9.2', question: 'Os incidentes são comunicados à ANP conforme prazos?', expectedEvidence: 'Registros de comunicação', regulatoryReference: 'ANP 44/2009' },
    ],
  },
  {
    id: 'pg10',
    number: 10,
    title: 'Projeto, Construção, Instalação e Desativação',
    category: 'facilities',
    description: 'Garantir segurança em todas as fases do ciclo de vida.',
    critical: false,
    items: [
      { id: 'pg10-1', code: 'PG10.1', question: 'As análises de risco de projeto estão documentadas?', expectedEvidence: 'HAZID, HAZOP de projeto', regulatoryReference: 'ANP 46/2016 Art. 14' },
    ],
  },
  {
    id: 'pg11',
    number: 11,
    title: 'Elementos Críticos de Segurança Operacional',
    category: 'facilities',
    description: 'Identificar e gerenciar elementos críticos de segurança.',
    critical: true,
    items: [
      { id: 'pg11-1', code: 'PG11.1', question: 'Os elementos críticos de segurança estão identificados?', expectedEvidence: 'Lista de ECSO, hierarquia de controle', regulatoryReference: 'ANP 46/2016 Art. 15' },
      { id: 'pg11-2', code: 'PG11.2', question: 'Existe monitoramento da integridade dos ECSO?', expectedEvidence: 'Plano de inspeção, relatórios', regulatoryReference: 'ANP 46/2016 Art. 15 §1º' },
    ],
  },
  {
    id: 'pg12',
    number: 12,
    title: 'Identificação e Análise de Riscos',
    category: 'facilities',
    description: 'Identificar perigos e analisar riscos sistematicamente.',
    critical: true,
    items: [
      { id: 'pg12-1', code: 'PG12.1', question: 'Existem análises de risco atualizadas (HAZOP, APR)?', expectedEvidence: 'Estudos HAZOP, matriz de risco', regulatoryReference: 'ANP 46/2016 Art. 16' },
      { id: 'pg12-2', code: 'PG12.2', question: 'As recomendações das análises são implementadas?', expectedEvidence: 'Plano de ação, evidências de implementação', regulatoryReference: 'ANP 46/2016 Art. 16 §1º' },
    ],
  },
  {
    id: 'pg13',
    number: 13,
    title: 'Integridade Mecânica',
    category: 'facilities',
    description: 'Garantir integridade de equipamentos e sistemas.',
    critical: true,
    items: [
      { id: 'pg13-1', code: 'PG13.1', question: 'Existe plano de manutenção preventiva?', expectedEvidence: 'Planos, ordens de serviço', regulatoryReference: 'ANP 46/2016 Art. 17' },
      { id: 'pg13-2', code: 'PG13.2', question: 'Os equipamentos rotativos são monitorados?', expectedEvidence: 'Relatórios de vibração, análise de óleo', regulatoryReference: 'ANP 46/2016 Art. 17 §1º' },
      { id: 'pg13-3', code: 'PG13.3', question: 'Os sistemas estáticos têm plano de inspeção?', expectedEvidence: 'RBI, inspeções programadas', regulatoryReference: 'ANP 46/2016 Art. 17 §2º' },
    ],
  },
  {
    id: 'pg14',
    number: 14,
    title: 'Planejamento e Gerenciamento de Grandes Emergências',
    category: 'facilities',
    description: 'Preparar para resposta a emergências.',
    critical: true,
    items: [
      { id: 'pg14-1', code: 'PG14.1', question: 'Existe plano de emergência atualizado?', expectedEvidence: 'PEI, PEVO', regulatoryReference: 'ANP 46/2016 Art. 18' },
      { id: 'pg14-2', code: 'PG14.2', question: 'Os simulados são realizados periodicamente?', expectedEvidence: 'Registros de simulados, lições aprendidas', regulatoryReference: 'ANP 46/2016 Art. 18 §1º' },
    ],
  },
  {
    id: 'pg15',
    number: 15,
    title: 'Procedimentos Operacionais',
    category: 'operations',
    description: 'Documentar e controlar procedimentos operacionais.',
    critical: false,
    items: [
      { id: 'pg15-1', code: 'PG15.1', question: 'Os procedimentos operacionais estão atualizados?', expectedEvidence: 'Procedimentos com controle de revisão', regulatoryReference: 'ANP 46/2016 Art. 19' },
      { id: 'pg15-2', code: 'PG15.2', question: 'Os operadores são treinados nos procedimentos?', expectedEvidence: 'Registros de treinamento', regulatoryReference: 'ANP 46/2016 Art. 19 §1º' },
    ],
  },
  {
    id: 'pg16',
    number: 16,
    title: 'Gerenciamento de Mudanças',
    category: 'operations',
    description: 'Controlar mudanças que afetam segurança operacional.',
    critical: true,
    items: [
      { id: 'pg16-1', code: 'PG16.1', question: 'Existe procedimento de gestão de mudanças?', expectedEvidence: 'Procedimento de GM, formulários', regulatoryReference: 'ANP 46/2016 Art. 20' },
      { id: 'pg16-2', code: 'PG16.2', question: 'As mudanças são avaliadas antes de implementadas?', expectedEvidence: 'Pareceres técnicos, análise de risco', regulatoryReference: 'ANP 46/2016 Art. 20 §1º' },
    ],
  },
  {
    id: 'pg17',
    number: 17,
    title: 'Práticas de Trabalho Seguro e Controle em Atividades Especiais',
    category: 'operations',
    description: 'Controlar atividades de alto risco.',
    critical: true,
    items: [
      { id: 'pg17-1', code: 'PG17.1', question: 'Existe sistema de permissão de trabalho (PT)?', expectedEvidence: 'Procedimento de PT, formulários', regulatoryReference: 'ANP 46/2016 Art. 21' },
      { id: 'pg17-2', code: 'PG17.2', question: 'As atividades especiais têm análise de risco específica?', expectedEvidence: 'APR de tarefa, AST', regulatoryReference: 'ANP 46/2016 Art. 21 §1º' },
    ],
  },
];

const classificationColors: Record<string, string> = {
  critica: 'bg-destructive/20 text-destructive border-destructive',
  grave: 'bg-warning/20 text-warning border-warning',
  moderada: 'bg-warning/10 text-warning border-warning/50',
  leve: 'bg-primary/20 text-primary border-primary',
};

const classificationDeadlines: Record<string, string> = {
  critica: 'Interdição imediata',
  grave: '30 dias',
  moderada: '90 dias',
  leve: '180 dias',
};

export const SGSOAuditTrail: React.FC = () => {
  const [selectedPractice, setSelectedPractice] = useState<SGSOPractice | null>(null);
  const [checklistResponses, setChecklistResponses] = useState<Record<string, SGSOChecklistItem>>({});
  const [activeCategory, setActiveCategory] = useState<'leadership' | 'facilities' | 'operations'>('leadership');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveAudit = async () => {
    setIsSaving(true);
    try {
      const auditData = {
        audit_type: 'sgso_anp_46',
        responses: checklistResponses,
        overall_score: calculateOverallScore(),
        maturity_level: getMaturityLevel(calculateOverallScore()).level,
        practices_audited: SGSO_PRACTICES.length,
        items_answered: Object.keys(checklistResponses).filter(k => checklistResponses[k]?.conformity).length,
        timestamp: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('ai_audit_logs')
        .insert({
          user_input: JSON.stringify(auditData),
          interaction_type: 'sgso_audit',
          module_name: 'SGSO',
          ai_response: `Score: ${auditData.overall_score}% - ${auditData.maturity_level}`,
        });
      if (error) throw error;
      toast.success('Trilha de auditoria salva com sucesso', {
        description: `${auditData.items_answered} itens respondidos — Score: ${auditData.overall_score}%`
      });
    } catch (error: unknown) {
      toast.error('Erro ao salvar auditoria', { description: error instanceof Error ? error.message : 'Erro desconhecido' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportReport = () => {
    setIsExporting(true);
    try {
      const headers = ['Prática', 'Código', 'Questão', 'Conformidade', 'Observações'];
      const rows: string[][] = [];
      SGSO_PRACTICES.forEach(practice => {
        practice.items.forEach(item => {
          const response = checklistResponses[item.id];
          rows.push([
            `PG ${practice.number} - ${practice.title}`,
            item.code,
            item.question,
            response?.conformity || 'Não respondido',
            response?.observations || '',
          ]);
        });
      });
      const csv = [headers.join(';'), ...rows.map(r => r.map(c => `"${c}"`).join(';'))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SGSO_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Relatório SGSO exportado', {
        description: `${rows.length} itens exportados — Score: ${calculateOverallScore()}%`
      });
    } catch (error: unknown) {
      toast.error('Erro ao gerar relatório', { description: error instanceof Error ? error.message : 'Erro desconhecido' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConformityChange = (itemId: string, value: 'sim' | 'nao' | 'parcial' | 'na') => {
    setChecklistResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], conformity: value },
    }));
  };

  const handleObservationChange = (itemId: string, value: string) => {
    setChecklistResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], observations: value },
    }));
  };

  const calculatePracticeScore = (practice: SGSOPractice): number => {
    const answered = practice.items.filter(item => checklistResponses[item.id]?.conformity);
    if (answered.length === 0) return 0;
    
    const conforming = answered.filter(item => 
      checklistResponses[item.id]?.conformity === 'sim' || 
      checklistResponses[item.id]?.conformity === 'na'
    );
    return Math.round((conforming.length / answered.length) * 100);
  };

  const calculateOverallScore = (): number => {
    const allItems = SGSO_PRACTICES.flatMap(p => p.items);
    const answered = allItems.filter(item => checklistResponses[item.id]?.conformity);
    if (answered.length === 0) return 0;
    
    const conforming = answered.filter(item => 
      checklistResponses[item.id]?.conformity === 'sim' || 
      checklistResponses[item.id]?.conformity === 'na'
    );
    return Math.round((conforming.length / answered.length) * 100);
  };

  const getMaturityLevel = (score: number): { level: string; color: string } => {
    if (score >= 90) return { level: 'Excelência', color: 'text-green-600' };
    if (score >= 75) return { level: 'Maduro', color: 'text-blue-600' };
    if (score >= 60) return { level: 'Em Desenvolvimento', color: 'text-yellow-600' };
    if (score >= 40) return { level: 'Inicial', color: 'text-orange-600' };
    return { level: 'Crítico', color: 'text-red-600' };
  };

  const practicesByCategory = {
    leadership: SGSO_PRACTICES.filter(p => p.category === 'leadership'),
    facilities: SGSO_PRACTICES.filter(p => p.category === 'facilities'),
    operations: SGSO_PRACTICES.filter(p => p.category === 'operations'),
  };

  const overallScore = calculateOverallScore();
  const maturity = getMaturityLevel(overallScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trilha de Auditoria SGSO</h2>
          <p className="text-muted-foreground">17 Práticas de Gestão - ANP 46/2016</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveAudit} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button onClick={handleExportReport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {isExporting ? 'Exportando...' : 'Gerar Relatório'}
          </Button>
        </div>
      </div>

      {/* Maturity Score Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Curva de Maturidade SGSO</h3>
              <p className="text-sm text-muted-foreground">
                Baseado nas respostas do checklist
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${maturity.color}`}>{overallScore}%</div>
              <Badge className="mt-1">{maturity.level}</Badge>
            </div>
          </div>
          <Progress value={overallScore} className="mt-4 h-3" />
          <div className="grid grid-cols-5 gap-2 mt-4 text-xs text-center">
            <div className={overallScore < 40 ? 'font-bold text-red-600' : 'text-muted-foreground'}>Crítico<br/>&lt;40%</div>
            <div className={overallScore >= 40 && overallScore < 60 ? 'font-bold text-orange-600' : 'text-muted-foreground'}>Inicial<br/>40-59%</div>
            <div className={overallScore >= 60 && overallScore < 75 ? 'font-bold text-yellow-600' : 'text-muted-foreground'}>Em Dev.<br/>60-74%</div>
            <div className={overallScore >= 75 && overallScore < 90 ? 'font-bold text-blue-600' : 'text-muted-foreground'}>Maduro<br/>75-89%</div>
            <div className={overallScore >= 90 ? 'font-bold text-green-600' : 'text-muted-foreground'}>Excelência<br/>≥90%</div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as typeof activeCategory)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="leadership" className="gap-2">
            <Shield className="h-4 w-4" />
            Liderança e Pessoal (PG 1-9)
          </TabsTrigger>
          <TabsTrigger value="facilities" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Instalações (PG 10-14)
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Práticas Operacionais (PG 15-17)
          </TabsTrigger>
        </TabsList>

        {(['leadership', 'facilities', 'operations'] as const).map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Practice List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Práticas de Gestão</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-2">
                      {practicesByCategory[category].map((practice) => {
                        const score = calculatePracticeScore(practice);
                        return (
                          <div
                            key={practice.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedPractice?.id === practice.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedPractice(practice)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">PG {practice.number}</Badge>
                                  {practice.critical && (
                                    <Badge variant="destructive" className="text-xs">Crítico</Badge>
                                  )}
                                </div>
                                <h4 className="font-medium text-sm">{practice.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{practice.items.length} itens</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${getMaturityLevel(score).color}`}>{score}%</div>
                              </div>
                            </div>
                            <Progress value={score} className="mt-2 h-1" />
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Checklist Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedPractice ? `PG ${selectedPractice.number}: ${selectedPractice.title}` : 'Selecione uma Prática'}
                  </CardTitle>
                  {selectedPractice && (
                    <CardDescription>{selectedPractice.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedPractice ? (
                    <ScrollArea className="h-[450px] pr-4">
                      <Accordion type="multiple" className="w-full">
                        {selectedPractice.items.map((item) => (
                          <AccordionItem key={item.id} value={item.id}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{item.code}</Badge>
                                <span className="text-sm">{item.question}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <div>
                                <label className="text-sm font-medium">Evidência Esperada:</label>
                                <p className="text-sm text-muted-foreground">{item.expectedEvidence}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Referência:</label>
                                <p className="text-sm text-muted-foreground">{item.regulatoryReference}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Conformidade:</label>
                                <Select
                                  value={checklistResponses[item.id]?.conformity || ''}
                                  onValueChange={(v) => handleConformityChange(item.id, v as "sim" | "parcial" | "nao" | "na")}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sim">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Sim - Conforme
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="parcial">
                                      <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                        Parcial
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="nao">
                                      <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        Não - Não Conforme
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="na">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        N/A - Não Aplicável
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Observações:</label>
                                <Textarea
                                  placeholder="Adicione observações, justificativas..."
                                  value={checklistResponses[item.id]?.observations || ''}
                                  onChange={(e) => handleObservationChange(item.id, e.target.value)}
                                />
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Anexar Evidência
                              </Button>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  ) : (
                    <div className="h-[450px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Selecione uma prática para iniciar a auditoria</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* NC Classification Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classificação de Não Conformidades ANP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(classificationColors).map(([key, color]) => (
              <div key={key} className={`p-4 border rounded-lg ${color}`}>
                <h4 className="font-bold capitalize">{key}</h4>
                <p className="text-sm mt-1">Prazo: {classificationDeadlines[key]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SGSOAuditTrail;
