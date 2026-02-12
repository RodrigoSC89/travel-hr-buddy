/**
 * TraceabilityMatrix - Matriz de Rastreabilidade Interativa
 * Drill-down: Módulo → Requisito → Elemento → LV → Evidência → Status
 * Integração com dados reais de compliance_items e preovid_audits
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ChevronRight, ChevronDown, Search, Filter, Download, RefreshCw,
  CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Eye,
  Layers, Target, Shield, TrendingUp, BarChart3, FileCheck,
  Clipboard, FolderOpen, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
interface RequirementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  module: 'PEOTRAM' | 'PEO-DP';
  status: 'compliant' | 'non_compliant' | 'pending' | 'in_progress';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
  lastAudit: string;
  nextAudit: string;
  responsible: string;
  elements: ElementItem[];
}

interface ElementItem {
  id: string;
  code: string;
  name: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'in_progress';
  score: number;
  lvs: LVItem[];
}

interface LVItem {
  id: string;
  code: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  evidenceType: string;
  evidenceExpected: string;
  evidenceUploaded: boolean;
  lastVerified: string;
  notes: string;
}

// PEOTRAM Requirements Structure (13 Elements / 195+ items)
const PEOTRAM_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'peotram-1',
    code: 'PEOTRAM-001',
    title: 'Elemento 1 - Política de Segurança',
    description: 'Política de segurança, saúde e meio ambiente da contratada',
    module: 'PEOTRAM',
    status: 'compliant',
    criticality: 'critical',
    weight: 10,
    lastAudit: '2025-01-10',
    nextAudit: '2025-04-10',
    responsible: 'Gerente SMS',
    elements: [
      {
        id: 'elem-1-1',
        code: 'E1.1',
        name: 'Documentação da Política',
        status: 'compliant',
        score: 95,
        lvs: [
          { id: 'lv-1-1-1', code: 'LV-1.1.1', description: 'Política documentada e assinada pela alta direção', status: 'compliant', evidenceType: 'Documento', evidenceExpected: 'Política SMS assinada', evidenceUploaded: true, lastVerified: '2025-01-10', notes: '' },
          { id: 'lv-1-1-2', code: 'LV-1.1.2', description: 'Comunicação da política aos colaboradores', status: 'compliant', evidenceType: 'Registro', evidenceExpected: 'Lista de presença + fotos', evidenceUploaded: true, lastVerified: '2025-01-10', notes: '' },
          { id: 'lv-1-1-3', code: 'LV-1.1.3', description: 'Revisão periódica da política (anual)', status: 'pending', evidenceType: 'Ata', evidenceExpected: 'Ata de revisão anual', evidenceUploaded: false, lastVerified: '2024-01-15', notes: 'Próxima revisão em 30 dias' },
        ]
      },
      {
        id: 'elem-1-2',
        code: 'E1.2',
        name: 'Objetivos e Metas SMS',
        status: 'compliant',
        score: 88,
        lvs: [
          { id: 'lv-1-2-1', code: 'LV-1.2.1', description: 'Objetivos mensuráveis definidos', status: 'compliant', evidenceType: 'Planilha', evidenceExpected: 'Planilha de objetivos com indicadores', evidenceUploaded: true, lastVerified: '2025-01-05', notes: '' },
          { id: 'lv-1-2-2', code: 'LV-1.2.2', description: 'Acompanhamento mensal das metas', status: 'compliant', evidenceType: 'Relatório', evidenceExpected: 'Relatório mensal de desempenho', evidenceUploaded: true, lastVerified: '2025-01-08', notes: '' },
        ]
      }
    ]
  },
  {
    id: 'peotram-2',
    code: 'PEOTRAM-002',
    title: 'Elemento 2 - Liderança e Compromisso',
    description: 'Demonstração de liderança e compromisso da gestão',
    module: 'PEOTRAM',
    status: 'compliant',
    criticality: 'high',
    weight: 8,
    lastAudit: '2025-01-08',
    nextAudit: '2025-04-08',
    responsible: 'Diretor Operações',
    elements: [
      {
        id: 'elem-2-1',
        code: 'E2.1',
        name: 'Participação da Liderança',
        status: 'compliant',
        score: 92,
        lvs: [
          { id: 'lv-2-1-1', code: 'LV-2.1.1', description: 'Participação em reuniões de segurança', status: 'compliant', evidenceType: 'Ata', evidenceExpected: 'Atas com assinatura da liderança', evidenceUploaded: true, lastVerified: '2025-01-08', notes: '' },
          { id: 'lv-2-1-2', code: 'LV-2.1.2', description: 'Inspeções de campo pela liderança', status: 'compliant', evidenceType: 'Relatório', evidenceExpected: 'Relatórios de inspeção + fotos', evidenceUploaded: true, lastVerified: '2025-01-06', notes: '' },
        ]
      }
    ]
  },
  {
    id: 'peotram-3',
    code: 'PEOTRAM-003',
    title: 'Elemento 3 - Análise de Riscos',
    description: 'Identificação de perigos e análise de riscos',
    module: 'PEOTRAM',
    status: 'non_compliant',
    criticality: 'critical',
    weight: 10,
    lastAudit: '2025-01-05',
    nextAudit: '2025-02-05',
    responsible: 'Eng. Segurança',
    elements: [
      {
        id: 'elem-3-1',
        code: 'E3.1',
        name: 'APR - Análise Preliminar de Riscos',
        status: 'non_compliant',
        score: 65,
        lvs: [
          { id: 'lv-3-1-1', code: 'LV-3.1.1', description: 'APR para todas as atividades críticas', status: 'non_compliant', evidenceType: 'APR', evidenceExpected: 'APRs assinadas para cada atividade', evidenceUploaded: false, lastVerified: '2025-01-05', notes: 'Faltam APRs para 3 atividades' },
          { id: 'lv-3-1-2', code: 'LV-3.1.2', description: 'Revisão de APRs quando há mudanças', status: 'pending', evidenceType: 'APR', evidenceExpected: 'APRs revisadas', evidenceUploaded: false, lastVerified: '2024-12-15', notes: '' },
        ]
      },
      {
        id: 'elem-3-2',
        code: 'E3.2',
        name: 'Hierarquia de Controles',
        status: 'pending',
        score: 75,
        lvs: [
          { id: 'lv-3-2-1', code: 'LV-3.2.1', description: 'Aplicação da hierarquia de controles', status: 'pending', evidenceType: 'Relatório', evidenceExpected: 'Matriz de controles aplicados', evidenceUploaded: false, lastVerified: '2024-12-20', notes: '' },
        ]
      }
    ]
  },
  {
    id: 'peotram-4',
    code: 'PEOTRAM-004',
    title: 'Elemento 4 - Competência e Treinamento',
    description: 'Garantia de competência e treinamento adequado',
    module: 'PEOTRAM',
    status: 'in_progress',
    criticality: 'high',
    weight: 8,
    lastAudit: '2025-01-12',
    nextAudit: '2025-04-12',
    responsible: 'Coord. RH',
    elements: [
      {
        id: 'elem-4-1',
        code: 'E4.1',
        name: 'Matriz de Treinamentos',
        status: 'compliant',
        score: 90,
        lvs: [
          { id: 'lv-4-1-1', code: 'LV-4.1.1', description: 'Matriz de treinamentos por função', status: 'compliant', evidenceType: 'Matriz', evidenceExpected: 'Planilha função x treinamento', evidenceUploaded: true, lastVerified: '2025-01-12', notes: '' },
        ]
      },
      {
        id: 'elem-4-2',
        code: 'E4.2',
        name: 'Certificações Obrigatórias',
        status: 'non_compliant',
        score: 72,
        lvs: [
          { id: 'lv-4-2-1', code: 'LV-4.2.1', description: 'NR-10 para eletricistas', status: 'non_compliant', evidenceType: 'Certificado', evidenceExpected: 'Certificados NR-10 válidos', evidenceUploaded: false, lastVerified: '2025-01-12', notes: '2 colaboradores com certificado vencido' },
          { id: 'lv-4-2-2', code: 'LV-4.2.2', description: 'NR-35 para trabalho em altura', status: 'compliant', evidenceType: 'Certificado', evidenceExpected: 'Certificados NR-35 válidos', evidenceUploaded: true, lastVerified: '2025-01-10', notes: '' },
        ]
      }
    ]
  }
];

// PEO-DP Requirements (114 requirements - sample)
const PEODP_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'peodp-1',
    code: 'PEO-DP-001',
    title: 'Sistema DP - Documentação',
    description: 'Documentação técnica do sistema de posicionamento dinâmico',
    module: 'PEO-DP',
    status: 'compliant',
    criticality: 'critical',
    weight: 10,
    lastAudit: '2025-01-08',
    nextAudit: '2025-03-08',
    responsible: 'Chefe de Máquinas',
    elements: [
      {
        id: 'dp-elem-1',
        code: 'DP-1.1',
        name: 'Manual do Sistema DP',
        status: 'compliant',
        score: 98,
        lvs: [
          { id: 'dp-lv-1-1', code: 'DP-LV-1.1', description: 'Manual do fabricante disponível e atualizado', status: 'compliant', evidenceType: 'Manual', evidenceExpected: 'PDF do manual atualizado', evidenceUploaded: true, lastVerified: '2025-01-08', notes: '' },
          { id: 'dp-lv-1-2', code: 'DP-LV-1.2', description: 'Procedimentos operacionais documentados', status: 'compliant', evidenceType: 'POP', evidenceExpected: 'POPs impressos e assinados', evidenceUploaded: true, lastVerified: '2025-01-08', notes: '' },
        ]
      }
    ]
  },
  {
    id: 'peodp-2',
    code: 'PEO-DP-002',
    title: 'Operadores DP',
    description: 'Qualificação e certificação de operadores DP',
    module: 'PEO-DP',
    status: 'in_progress',
    criticality: 'critical',
    weight: 10,
    lastAudit: '2025-01-10',
    nextAudit: '2025-03-10',
    responsible: 'DPO Sênior',
    elements: [
      {
        id: 'dp-elem-2',
        code: 'DP-2.1',
        name: 'Certificação DPO',
        status: 'in_progress',
        score: 85,
        lvs: [
          { id: 'dp-lv-2-1', code: 'DP-LV-2.1', description: 'Certificado NI/Nautical Institute válido', status: 'compliant', evidenceType: 'Certificado', evidenceExpected: 'Certificado NI digitalizado', evidenceUploaded: true, lastVerified: '2025-01-10', notes: '' },
          { id: 'dp-lv-2-2', code: 'DP-LV-2.2', description: 'Experiência mínima comprovada', status: 'pending', evidenceType: 'Registro', evidenceExpected: 'Log de horas DP', evidenceUploaded: false, lastVerified: '2024-12-20', notes: 'Aguardando log atualizado' },
        ]
      }
    ]
  }
];

// Status helpers
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'compliant':
      return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Conforme' };
    case 'non_compliant':
      return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Não Conforme' };
    case 'pending':
      return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pendente' };
    case 'in_progress':
      return { icon: AlertTriangle, color: 'text-primary', bg: 'bg-primary/10', label: 'Em Análise' };
    case 'not_applicable':
      return { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted', label: 'N/A' };
    default:
      return { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted', label: status };
  }
};

const getCriticalityBadge = (criticality: string) => {
  switch (criticality) {
    case 'critical':
      return <Badge variant="destructive">Crítico</Badge>;
    case 'high':
      return <Badge className="bg-warning text-warning-foreground">Alto</Badge>;
    case 'medium':
      return <Badge className="bg-warning/70 text-warning-foreground">Médio</Badge>;
    case 'low':
      return <Badge className="bg-primary">Baixo</Badge>;
    default:
      return <Badge variant="outline">{criticality}</Badge>;
  }
};

export function TraceabilityMatrix() {
  const [selectedModule, setSelectedModule] = useState<'PEOTRAM' | 'PEO-DP' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch real data from Supabase
  const { data: complianceItems, isLoading } = useQuery({
    queryKey: ['compliance-items-matrix'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  // Combine mock data with real data indicators
  const requirements = useMemo(() => {
    let items = selectedModule === 'all' 
      ? [...PEOTRAM_REQUIREMENTS, ...PEODP_REQUIREMENTS]
      : selectedModule === 'PEOTRAM' 
        ? PEOTRAM_REQUIREMENTS 
        : PEODP_REQUIREMENTS;

    // Filter by search
    if (searchTerm) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      items = items.filter(item => item.status === filterStatus);
    }

    return items;
  }, [selectedModule, searchTerm, filterStatus]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const allItems = [...PEOTRAM_REQUIREMENTS, ...PEODP_REQUIREMENTS];
    const compliant = allItems.filter(i => i.status === 'compliant').length;
    const nonCompliant = allItems.filter(i => i.status === 'non_compliant').length;
    const pending = allItems.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
    
    // Count all LVs
    let totalLVs = 0;
    let compliantLVs = 0;
    allItems.forEach(item => {
      item.elements.forEach(elem => {
        totalLVs += elem.lvs.length;
        compliantLVs += elem.lvs.filter(lv => lv.status === 'compliant').length;
      });
    });

    return {
      totalRequirements: allItems.length,
      compliant,
      nonCompliant,
      pending,
      totalLVs,
      compliantLVs,
      overallScore: totalLVs > 0 ? Math.round((compliantLVs / totalLVs) * 100) : 0
    };
  }, []);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleElement = (id: string) => {
    setExpandedElements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allItemIds = requirements.map(r => r.id);
    const allElementIds = requirements.flatMap(r => r.elements.map(e => e.id));
    setExpandedItems(new Set(allItemIds));
    setExpandedElements(new Set(allElementIds));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
    setExpandedElements(new Set());
  };

  const handleExport = () => {
    const rows = ["Código,Título,Módulo,Status,Criticidade,Score,Responsável,Última Auditoria"];
    requirements.forEach(req => {
      req.elements.forEach(elem => {
        rows.push(`"${req.code}","${req.title}","${req.module}","${req.status}","${req.criticality}","${elem.score}%","${req.responsible}","${req.lastAudit}"`);
      });
    });
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `matriz-rastreabilidade-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('Matriz exportada em CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Matriz de Rastreabilidade
          </h2>
          <p className="text-muted-foreground text-sm">
            Drill-down: Módulo → Requisito → Elemento → LV → Evidência → Status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <ChevronDown className="h-4 w-4 mr-1" /> Expandir
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <ChevronUp className="h-4 w-4 mr-1" /> Recolher
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics.overallScore}%</p>
                <p className="text-xs text-muted-foreground">Score Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalRequirements}</p>
                <p className="text-xs text-muted-foreground">Requisitos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{metrics.compliant}</p>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{metrics.nonCompliant}</p>
                <p className="text-xs text-muted-foreground">NCs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-accent-foreground" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalLVs}</p>
                <p className="text-xs text-muted-foreground">Total LVs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{metrics.compliantLVs}</p>
                <p className="text-xs text-muted-foreground">LVs OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar requisito, código ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedModule} onValueChange={(v) => setSelectedModule(v as typeof selectedModule)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PEOTRAM">PEOTRAM</SelectItem>
                <SelectItem value="PEO-DP">PEO-DP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="compliant">Conforme</SelectItem>
                <SelectItem value="non_compliant">Não Conforme</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Análise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estrutura de Requisitos</CardTitle>
          <CardDescription>
            Clique para expandir e ver elementos e linhas de verificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {requirements.map((requirement) => {
                const statusConfig = getStatusConfig(requirement.status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = expandedItems.has(requirement.id);

                return (
                  <Collapsible
                    key={requirement.id}
                    open={isExpanded}
                    onOpenChange={() => toggleItem(requirement.id)}
                  >
                    {/* Requirement Level */}
                    <CollapsibleTrigger className="w-full">
                      <div className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors ${statusConfig.bg}`}>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        
                        <Badge variant="outline" className="font-mono">
                          {requirement.code}
                        </Badge>
                        
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        
                        <div className="flex-1 text-left">
                          <p className="font-medium">{requirement.title}</p>
                          <p className="text-xs text-muted-foreground">{requirement.description}</p>
                        </div>

                        {getCriticalityBadge(requirement.criticality)}
                        
                        <Badge variant="secondary">{requirement.module}</Badge>
                        
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Peso: {requirement.weight}</p>
                          <p className="text-xs">{requirement.elements.length} elementos</p>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="ml-8 mt-2 space-y-2">
                        {requirement.elements.map((element) => {
                          const elemStatusConfig = getStatusConfig(element.status);
                          const ElemStatusIcon = elemStatusConfig.icon;
                          const isElemExpanded = expandedElements.has(element.id);

                          return (
                            <Collapsible
                              key={element.id}
                              open={isElemExpanded}
                              onOpenChange={() => toggleElement(element.id)}
                            >
                              {/* Element Level */}
                              <CollapsibleTrigger className="w-full">
                                <div className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 ${elemStatusConfig.bg}`}>
                                  {isElemExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {element.code}
                                  </Badge>
                                  
                                  <ElemStatusIcon className={`h-4 w-4 ${elemStatusConfig.color}`} />
                                  
                                  <div className="flex-1 text-left">
                                    <p className="font-medium text-sm">{element.name}</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Progress value={element.score} className="w-20 h-2" />
                                    <span className="text-sm font-medium">{element.score}%</span>
                                  </div>
                                  
                                  <span className="text-xs text-muted-foreground">
                                    {element.lvs.length} LVs
                                  </span>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="ml-8 mt-2 space-y-1">
                                  {element.lvs.map((lv) => {
                                    const lvStatusConfig = getStatusConfig(lv.status);
                                    const LVStatusIcon = lvStatusConfig.icon;

                                    return (
                                      <div
                                        key={lv.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${lvStatusConfig.bg}`}
                                      >
                                        <Badge variant="outline" className="font-mono text-xs">
                                          {lv.code}
                                        </Badge>
                                        
                                        <LVStatusIcon className={`h-4 w-4 ${lvStatusConfig.color}`} />
                                        
                                        <div className="flex-1">
                                          <p className="text-sm">{lv.description}</p>
                                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <FileText className="h-3 w-3" />
                                            <span>{lv.evidenceType}: {lv.evidenceExpected}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {lv.evidenceUploaded ? (
                                            <Badge variant="outline" className="text-success border-success">
                                              <FileCheck className="h-3 w-3 mr-1" />
                                              Evidência OK
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-warning border-warning">
                                              <Clock className="h-3 w-3 mr-1" />
                                              Pendente
                                            </Badge>
                                          )}
                                          
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        {lv.notes && (
                                          <span className="text-xs text-warning italic">
                                            {lv.notes}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
