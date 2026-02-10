import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, Download, FileText, Calendar, Filter, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Clock, Brain, RefreshCw, Share2, Printer, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  type: 'audit' | 'compliance' | 'incident' | 'training' | 'certification';
  status: 'ready' | 'generating' | 'scheduled' | 'failed';
  generatedAt: string;
  period: string;
  format: 'PDF' | 'Excel' | 'Word';
  size: string;
  score?: number;
  findings?: number;
}

const reports: Report[] = [
  {
    id: '1',
    name: 'Relatório de Conformidade ISM Q4 2024',
    type: 'compliance',
    status: 'ready',
    generatedAt: '2024-12-28T14:30:00',
    period: 'Q4 2024',
    format: 'PDF',
    size: '2.4 MB',
    score: 94,
    findings: 3
  },
  {
    id: '2',
    name: 'Auditoria ISPS Code - Dezembro 2024',
    type: 'audit',
    status: 'ready',
    generatedAt: '2024-12-25T09:00:00',
    period: 'Dezembro 2024',
    format: 'PDF',
    size: '1.8 MB',
    score: 97,
    findings: 1
  },
  {
    id: '3',
    name: 'Relatório de Incidentes Marítimos 2024',
    type: 'incident',
    status: 'generating',
    generatedAt: '',
    period: '2024',
    format: 'Excel',
    size: '-',
    findings: 12
  },
  {
    id: '4',
    name: 'Conformidade MLC 2006 - Anual',
    type: 'certification',
    status: 'ready',
    generatedAt: '2024-12-20T16:45:00',
    period: '2024',
    format: 'PDF',
    size: '3.1 MB',
    score: 91,
    findings: 5
  },
  {
    id: '5',
    name: 'Treinamentos STCW - Resumo Semestral',
    type: 'training',
    status: 'scheduled',
    generatedAt: '',
    period: 'S2 2024',
    format: 'Word',
    size: '-',
    score: 88
  }
];

const complianceMetrics = [
  { label: 'ISM Code', score: 94, trend: 'up', change: '+2%' },
  { label: 'ISPS Code', score: 97, trend: 'up', change: '+1%' },
  { label: 'MLC 2006', score: 91, trend: 'down', change: '-1%' },
  { label: 'STCW', score: 88, trend: 'up', change: '+3%' },
  { label: 'MARPOL', score: 95, trend: 'stable', change: '0%' },
  { label: 'SOLAS', score: 93, trend: 'up', change: '+2%' }
];

const typeConfig = {
  audit: { label: 'Auditoria', color: 'bg-blue-500/20 text-blue-400' },
  compliance: { label: 'Conformidade', color: 'bg-emerald-500/20 text-emerald-400' },
  incident: { label: 'Incidente', color: 'bg-orange-500/20 text-orange-400' },
  training: { label: 'Treinamento', color: 'bg-purple-500/20 text-purple-400' },
  certification: { label: 'Certificação', color: 'bg-amber-500/20 text-amber-400' }
};

const statusConfig = {
  ready: { label: 'Pronto', color: 'bg-emerald-500/20 text-emerald-400' },
  generating: { label: 'Gerando...', color: 'bg-blue-500/20 text-blue-400' },
  scheduled: { label: 'Agendado', color: 'bg-amber-500/20 text-amber-400' },
  failed: { label: 'Falhou', color: 'bg-destructive/20 text-destructive' }
};

export default function ComplianceRelatorios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('reports');

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const overallScore = Math.round(complianceMetrics.reduce((a, m) => a + m.score, 0) / complianceMetrics.length);

  const handleDownload = (report: Report) => {
    toast.success(`Baixando ${report.name}`, {
      description: `Formato: ${report.format} | Tamanho: ${report.size}`
    });
  };

  const handleGenerateAI = () => {
    toast.success('IA gerando relatório personalizado...', {
      description: 'Análise completa será gerada em alguns minutos'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Relatórios de Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Análises, auditorias e métricas de conformidade marítima
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleGenerateAI}>
            <Brain className="h-4 w-4" />
            Gerar com IA
          </Button>
          <Button className="gap-2" onClick={() => toast.info("Novo Relatório", { description: "Selecione um template abaixo na aba 'Templates' para gerar um relatório personalizado." })}>
            <FileText className="h-4 w-4" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6 text-center">
            <h3 className="text-sm text-muted-foreground mb-2">Score Geral de Compliance</h3>
            <div className="text-6xl font-bold text-primary mb-2">{overallScore}%</div>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1.5% vs mês anterior
            </Badge>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Auditorias</p>
                <p className="font-bold text-foreground">12 realizadas</p>
              </div>
              <div>
                <p className="text-muted-foreground">Findings</p>
                <p className="font-bold text-foreground">21 total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Métricas por Regulamentação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {complianceMetrics.map((metric) => (
                <div key={metric.label} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className={cn(
                      "text-xs flex items-center gap-0.5",
                      metric.trend === 'up' ? 'text-emerald-400' : 
                      metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                      {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                      {metric.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{metric.score}%</div>
                  <Progress value={metric.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar relatórios..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="audit">Auditoria</SelectItem>
                <SelectItem value="compliance">Conformidade</SelectItem>
                <SelectItem value="incident">Incidente</SelectItem>
                <SelectItem value="training">Treinamento</SelectItem>
                <SelectItem value="certification">Certificação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{report.name}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge className={typeConfig[report.type].color}>
                          {typeConfig[report.type].label}
                        </Badge>
                        <Badge className={statusConfig[report.status].color}>
                          {report.status === 'generating' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                          {statusConfig[report.status].label}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {report.period}
                        </span>
                        {report.generatedAt && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    {report.score !== undefined && (
                      <div className="text-center px-4">
                        <div className={cn(
                          "text-2xl font-bold",
                          report.score >= 90 ? 'text-emerald-400' :
                          report.score >= 80 ? 'text-amber-400' : 'text-destructive'
                        )}>
                          {report.score}%
                        </div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}

                    {report.findings !== undefined && (
                      <div className="text-center px-4">
                        <div className="text-2xl font-bold text-foreground">
                          {report.findings}
                        </div>
                        <p className="text-xs text-muted-foreground">Findings</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {report.status === 'ready' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                            <Download className="h-4 w-4 mr-1" />
                            {report.format}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toast.info(`Visualizando: ${report.name}`, { description: `Score: ${report.score}% | Findings: ${report.findings} | Período: ${report.period}` })}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/compliance/reports/${report.id}`); toast.success("Link copiado para compartilhamento"); }}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { window.print(); }}>
                            <Printer className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>Relatórios com geração automática programada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatório Semanal de Compliance</h4>
                    <p className="text-sm text-muted-foreground">Toda segunda-feira às 08:00</p>
                  </div>
                  <Badge>Ativo</Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Resumo Mensal de Auditorias</h4>
                    <p className="text-sm text-muted-foreground">Primeiro dia útil do mês</p>
                  </div>
                  <Badge>Ativo</Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dashboard Executivo Trimestral</h4>
                    <p className="text-sm text-muted-foreground">Início de cada trimestre</p>
                  </div>
                  <Badge variant="outline">Pausado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Templates de Relatório</CardTitle>
              <CardDescription>Modelos prontos para geração rápida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Auditoria ISM', 'Conformidade ISPS', 'Relatório MLC', 'Treinamentos STCW', 'Incidentes MARPOL', 'Dashboard Executivo'].map((template) => (
                  <Card key={template} className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-medium">{template}</h4>
                        <p className="text-xs text-muted-foreground">Clique para gerar</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
