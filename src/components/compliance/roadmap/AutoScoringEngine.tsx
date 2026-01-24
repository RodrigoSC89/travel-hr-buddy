import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Calculator, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Scale, Award, BarChart3, Settings, Download, RefreshCw,
  Gauge, Zap, FileText, ChevronRight, Info
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';

// Types
interface AuditItem {
  id: string;
  itemId: string;
  nome: string;
  elemento: string;
  lvId: string;
  criticidade: 'critico' | 'alto' | 'medio' | 'baixo';
  peso: number;
  conforme: boolean | null;
  observacao?: string;
}

interface ScoringConfig {
  pesos: {
    critico: number;
    alto: number;
    medio: number;
    baixo: number;
  };
  penalizacoes: {
    porCriticoNC: number;
    limiteCriticosReprovacao: number;
  };
  faixas: {
    excelente: { min: number; max: number };
    bom: { min: number; max: number };
    aceitavel: { min: number; max: number };
    inadequado: { min: number; max: number };
    critico: { min: number; max: number };
  };
}

interface ScoringResult {
  scoreSimples: number;
  scorePonderado: number;
  scoreFinal: number;
  penalizacaoTotal: number;
  nivel: 'excelente' | 'bom' | 'aceitavel' | 'inadequado' | 'critico';
  aprovado: boolean;
  totalItens: number;
  conformes: number;
  naoConformes: number;
  naoAvaliados: number;
  criticosNC: number;
  detalhes: {
    criticidade: string;
    total: number;
    conformes: number;
    naoConformes: number;
    peso: number;
    contribuicao: number;
  }[];
}

// Default config
const defaultConfig: ScoringConfig = {
  pesos: {
    critico: 10,
    alto: 5,
    medio: 3,
    baixo: 1
  },
  penalizacoes: {
    porCriticoNC: 5,
    limiteCriticosReprovacao: 2
  },
  faixas: {
    excelente: { min: 90, max: 100 },
    bom: { min: 80, max: 89 },
    aceitavel: { min: 70, max: 79 },
    inadequado: { min: 50, max: 69 },
    critico: { min: 0, max: 49 }
  }
};

// Generate mock audit items
const generateAuditItems = (): AuditItem[] => {
  const criticidades = ['critico', 'alto', 'medio', 'baixo'] as const;
  const elementos = [
    'Liderança e Gerenciamento',
    'Conformidade Legal',
    'Gestão de Mudanças',
    'Operações e Procedimentos',
    'Treinamento e Competência',
    'Comunicação e Consulta',
    'Documentação e Registros',
    'Medição e Análise',
    'Auditorias Internas',
    'Melhoria Contínua'
  ];

  return Array.from({ length: 40 }, (_, i) => {
    const criticidade = criticidades[Math.floor(Math.random() * criticidades.length)];
    const conforme = Math.random() > 0.2 ? true : (Math.random() > 0.3 ? false : null);
    
    return {
      id: `item-${i + 1}`,
      itemId: `LV-${String(i + 1).padStart(3, '0')}`,
      nome: `Requisito de verificação ${i + 1}`,
      elemento: elementos[i % elementos.length],
      lvId: `LV-${String(i + 1).padStart(3, '0')}`,
      criticidade,
      peso: defaultConfig.pesos[criticidade],
      conforme,
      observacao: conforme === false ? `Observação sobre não conformidade ${i + 1}` : undefined
    };
  });
};

// Helper functions
const getNivelColor = (nivel: string) => {
  switch (nivel) {
    case 'excelente': return { bg: 'bg-success', text: 'text-success', border: 'border-success' };
    case 'bom': return { bg: 'bg-success/80', text: 'text-success', border: 'border-success/80' };
    case 'aceitavel': return { bg: 'bg-warning', text: 'text-warning', border: 'border-warning' };
    case 'inadequado': return { bg: 'bg-warning/80', text: 'text-warning', border: 'border-warning/80' };
    case 'critico': return { bg: 'bg-destructive', text: 'text-destructive', border: 'border-destructive' };
    default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' };
  }
};

const getCriticidadeColor = (criticidade: string) => {
  switch (criticidade) {
    case 'critico': return 'bg-destructive text-destructive-foreground';
    case 'alto': return 'bg-warning text-warning-foreground';
    case 'medio': return 'bg-warning/80 text-foreground';
    case 'baixo': return 'bg-success text-success-foreground';
    default: return 'bg-muted';
  }
};

export function AutoScoringEngine() {
  const [items, setItems] = useState<AuditItem[]>(() => generateAuditItems());
  const [config, setConfig] = useState<ScoringConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState('resultado');
  const [selectedElemento, setSelectedElemento] = useState<string>('all');
  const [showConfig, setShowConfig] = useState(false);

  // Calculate scoring
  const result = useMemo<ScoringResult>(() => {
    const conformes = items.filter(i => i.conforme === true);
    const naoConformes = items.filter(i => i.conforme === false);
    const naoAvaliados = items.filter(i => i.conforme === null);
    const criticosNC = naoConformes.filter(i => i.criticidade === 'critico').length;

    // Score simples (percentual)
    const avaliados = conformes.length + naoConformes.length;
    const scoreSimples = avaliados > 0 ? Math.round((conformes.length / avaliados) * 100) : 0;

    // Score ponderado
    const totalPeso = items.filter(i => i.conforme !== null).reduce((sum, i) => sum + i.peso, 0);
    const pesoConformes = conformes.reduce((sum, i) => sum + i.peso, 0);
    const scorePonderado = totalPeso > 0 ? Math.round((pesoConformes / totalPeso) * 100) : 0;

    // Penalização por itens críticos não conformes
    const penalizacaoTotal = criticosNC * config.penalizacoes.porCriticoNC;
    const scoreFinal = Math.max(0, scorePonderado - penalizacaoTotal);

    // Determinar nível
    let nivel: ScoringResult['nivel'];
    if (scoreFinal >= config.faixas.excelente.min) nivel = 'excelente';
    else if (scoreFinal >= config.faixas.bom.min) nivel = 'bom';
    else if (scoreFinal >= config.faixas.aceitavel.min) nivel = 'aceitavel';
    else if (scoreFinal >= config.faixas.inadequado.min) nivel = 'inadequado';
    else nivel = 'critico';

    // Aprovação
    const aprovado = scoreFinal >= config.faixas.aceitavel.min && criticosNC < config.penalizacoes.limiteCriticosReprovacao;

    // Detalhes por criticidade
    const detalhes = (['critico', 'alto', 'medio', 'baixo'] as const).map(crit => {
      const itensCategoria = items.filter(i => i.criticidade === crit && i.conforme !== null);
      const conformesCategoria = itensCategoria.filter(i => i.conforme === true);
      const ncCategoria = itensCategoria.filter(i => i.conforme === false);
      const pesoCategoria = itensCategoria.reduce((sum, i) => sum + i.peso, 0);
      const pesoConformesCategoria = conformesCategoria.reduce((sum, i) => sum + i.peso, 0);

      return {
        criticidade: crit,
        total: itensCategoria.length,
        conformes: conformesCategoria.length,
        naoConformes: ncCategoria.length,
        peso: config.pesos[crit],
        contribuicao: totalPeso > 0 ? Math.round((pesoConformesCategoria / totalPeso) * 100) : 0
      };
    });

    return {
      scoreSimples,
      scorePonderado,
      scoreFinal,
      penalizacaoTotal,
      nivel,
      aprovado,
      totalItens: items.length,
      conformes: conformes.length,
      naoConformes: naoConformes.length,
      naoAvaliados: naoAvaliados.length,
      criticosNC,
      detalhes
    };
  }, [items, config]);

  // Chart data
  const pieData = [
    { name: 'Conformes', value: result.conformes, color: '#22c55e' },
    { name: 'Não Conformes', value: result.naoConformes, color: '#ef4444' },
    { name: 'Não Avaliados', value: result.naoAvaliados, color: '#6b7280' }
  ].filter(d => d.value > 0);

  const barData = result.detalhes.map(d => ({
    criticidade: d.criticidade.charAt(0).toUpperCase() + d.criticidade.slice(1),
    conformes: d.conformes,
    naoConformes: d.naoConformes,
    peso: d.peso
  }));

  const radialData = [
    { name: 'Score Final', value: result.scoreFinal, fill: getNivelColor(result.nivel).bg.replace('bg-', '#').replace('-500', '') || '#22c55e' }
  ];

  // Handlers
  const handleToggleItem = (itemId: string, value: boolean | null) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, conforme: value } : i));
  };

  const handleResetAudit = () => {
    setItems(prev => prev.map(i => ({ ...i, conforme: null })));
    toast.success('Auditoria reiniciada');
  };

  const handleExportReport = () => {
    toast.success('Relatório exportado com sucesso');
  };

  const nivelColors = getNivelColor(result.nivel);

  const elementos = [...new Set(items.map(i => i.elemento))];

  const filteredItems = useMemo(() => {
    if (selectedElemento === 'all') return items;
    return items.filter(i => i.elemento === selectedElemento);
  }, [items, selectedElemento]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Motor de Scoring Automático
          </h2>
          <p className="text-muted-foreground text-sm">
            Fase 2.2 do Roadmap • Cálculo ponderado por criticidade
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetAudit}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração do Scoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Peso CRÍTICO</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-red-500">{config.pesos.critico}</Badge>
                  <span className="text-xs text-muted-foreground">pontos</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Peso ALTO</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-orange-500">{config.pesos.alto}</Badge>
                  <span className="text-xs text-muted-foreground">pontos</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Peso MÉDIO</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-yellow-500 text-black">{config.pesos.medio}</Badge>
                  <span className="text-xs text-muted-foreground">pontos</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Peso BAIXO</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-500">{config.pesos.baixo}</Badge>
                  <span className="text-xs text-muted-foreground">pontos</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Regras de Penalização:</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• -{config.penalizacoes.porCriticoNC}% por cada item CRÍTICO não conforme</li>
                <li>• Reprovação automática se {config.penalizacoes.limiteCriticosReprovacao}+ itens CRÍTICOS falharem</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Resultado Principal */}
        <Card className={`col-span-1 lg:col-span-1 border-2 ${nivelColors.border}`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className={`text-6xl font-bold ${nivelColors.text}`}>
                  {result.scoreFinal}%
                </div>
                {result.penalizacaoTotal > 0 && (
                  <div className="absolute -top-2 -right-8 text-xs text-red-500">
                    -{result.penalizacaoTotal}%
                  </div>
                )}
              </div>
              
              <Badge className={`${nivelColors.bg} text-white mt-3`}>
                {result.nivel.toUpperCase()}
              </Badge>
              
              <div className="mt-4">
                {result.aprovado ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">APROVADO</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">REPROVADO</span>
                  </div>
                )}
              </div>
              
              {result.criticosNC > 0 && (
                <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-600">
                  ⚠️ {result.criticosNC} item(s) CRÍTICO(s) não conforme(s)
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Métricas Secundárias */}
        <Card className="col-span-1">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score Simples</span>
              <span className="font-bold">{result.scoreSimples}%</span>
            </div>
            <Progress value={result.scoreSimples} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score Ponderado</span>
              <span className="font-bold">{result.scorePonderado}%</span>
            </div>
            <Progress value={result.scorePonderado} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center p-2 bg-green-500/10 rounded">
                <div className="text-lg font-bold text-green-600">{result.conformes}</div>
                <div className="text-xs text-muted-foreground">Conformes</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded">
                <div className="text-lg font-bold text-red-600">{result.naoConformes}</div>
                <div className="text-xs text-muted-foreground">NC</div>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="text-lg font-bold">{result.naoAvaliados}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Pizza */}
        <Card className="col-span-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Distribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por Criticidade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Análise por Criticidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="criticidade" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Legend />
                <Bar dataKey="conformes" name="Conformes" fill="#22c55e" />
                <Bar dataKey="naoConformes" name="Não Conformes" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {result.detalhes.map(d => (
                <div key={d.criticidade} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Badge className={getCriticidadeColor(d.criticidade)}>
                      {d.criticidade.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">
                        {d.conformes}/{d.total} conformes
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Peso: {d.peso} | Contribuição: {d.contribuicao}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {d.naoConformes > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {d.naoConformes} NC
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Itens */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resultado" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Resultado
          </TabsTrigger>
          <TabsTrigger value="itens" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Itens ({items.length})
          </TabsTrigger>
          <TabsTrigger value="ncs" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Conformes ({result.naoConformes})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resultado" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Faixas de Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { nivel: 'EXCELENTE', min: 90, max: 100, color: 'bg-green-600' },
                  { nivel: 'BOM', min: 80, max: 89, color: 'bg-lime-500' },
                  { nivel: 'ACEITÁVEL', min: 70, max: 79, color: 'bg-yellow-500' },
                  { nivel: 'INADEQUADO', min: 50, max: 69, color: 'bg-orange-500' },
                  { nivel: 'CRÍTICO', min: 0, max: 49, color: 'bg-red-500' }
                ].map(faixa => (
                  <div 
                    key={faixa.nivel}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.nivel.toUpperCase() === faixa.nivel ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${faixa.color}`} />
                      <span className="font-medium">{faixa.nivel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {faixa.min}% - {faixa.max}%
                      </span>
                      {result.nivel.toUpperCase() === faixa.nivel && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itens" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Lista de Verificação</CardTitle>
                <Select value={selectedElemento} onValueChange={setSelectedElemento}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por elemento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os elementos</SelectItem>
                    {elementos.map(el => (
                      <SelectItem key={el} value={el}>{el}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.conforme === true ? 'bg-green-500/5 border-green-500/30' :
                      item.conforme === false ? 'bg-red-500/5 border-red-500/30' :
                      'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={getCriticidadeColor(item.criticidade)}>
                        {item.peso}
                      </Badge>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{item.itemId}</span>
                          <span className="text-sm font-medium">{item.nome}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.elemento}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={item.conforme === true ? 'default' : 'outline'}
                        className={item.conforme === true ? 'bg-green-600' : ''}
                        onClick={() => handleToggleItem(item.id, true)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={item.conforme === false ? 'destructive' : 'outline'}
                        onClick={() => handleToggleItem(item.id, false)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleItem(item.id, null)}
                      >
                        N/A
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ncs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Itens Não Conformes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.filter(i => i.conforme === false).map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-red-500/30 bg-red-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getCriticidadeColor(item.criticidade)}>
                          {item.criticidade.toUpperCase()}
                        </Badge>
                        <div>
                          <span className="font-mono text-sm">{item.itemId}</span>
                          <span className="mx-2">-</span>
                          <span className="font-medium">{item.nome}</span>
                        </div>
                      </div>
                      <Badge variant="destructive">NC</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{item.elemento}</p>
                    {item.observacao && (
                      <p className="text-sm text-red-600 mt-2">{item.observacao}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Abrir NC
                      </Button>
                      <Button size="sm" variant="outline">
                        Ver Procedimento
                      </Button>
                    </div>
                  </div>
                ))}
                
                {items.filter(i => i.conforme === false).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p>Nenhum item não conforme!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AutoScoringEngine;
