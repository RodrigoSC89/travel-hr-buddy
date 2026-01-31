/**
 * Budget Forecasting AI Component
 * Previsão inteligente de orçamento com machine learning
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar,
  Brain, Sparkles, AlertTriangle, CheckCircle, Download,
  RefreshCw, Loader2, PieChart, Target, Wallet
} from 'lucide-react';
import { toast } from 'sonner';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  forecast: number;
  trend: 'up' | 'down' | 'stable';
  variance: number;
  aiConfidence: number;
}

interface ForecastScenario {
  id: string;
  name: string;
  probability: number;
  totalBudget: number;
  savings: number;
  risks: string[];
}

const mockCategories: BudgetCategory[] = [
  { id: '1', name: 'Combustível', allocated: 500000, spent: 380000, forecast: 520000, trend: 'up', variance: 4, aiConfidence: 92 },
  { id: '2', name: 'Manutenção', allocated: 300000, spent: 210000, forecast: 285000, trend: 'down', variance: -5, aiConfidence: 88 },
  { id: '3', name: 'Tripulação', allocated: 450000, spent: 340000, forecast: 445000, trend: 'stable', variance: -1, aiConfidence: 95 },
  { id: '4', name: 'Porto & Taxas', allocated: 200000, spent: 150000, forecast: 210000, trend: 'up', variance: 5, aiConfidence: 85 },
  { id: '5', name: 'Seguros', allocated: 180000, spent: 180000, forecast: 180000, trend: 'stable', variance: 0, aiConfidence: 99 },
  { id: '6', name: 'Suprimentos', allocated: 120000, spent: 85000, forecast: 115000, trend: 'down', variance: -4, aiConfidence: 87 },
];

const mockScenarios: ForecastScenario[] = [
  { id: '1', name: 'Otimista', probability: 25, totalBudget: 1650000, savings: 100000, risks: ['Depende de preços favoráveis de combustível'] },
  { id: '2', name: 'Base', probability: 50, totalBudget: 1755000, savings: 0, risks: ['Cenário mais provável'] },
  { id: '3', name: 'Conservador', probability: 25, totalBudget: 1850000, savings: -95000, risks: ['Alta do dólar', 'Aumento de taxas portuárias'] },
];

export function BudgetForecastingAI() {
  const [categories, setCategories] = useState<BudgetCategory[]>(mockCategories);
  const [scenarios, setScenarios] = useState<ForecastScenario[]>(mockScenarios);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('q1-2025');
  const [newBudgetInput, setNewBudgetInput] = useState<{ category: string; amount: string }>({ category: '', amount: '' });

  const totalAllocated = categories.reduce((acc, cat) => acc + cat.allocated, 0);
  const totalSpent = categories.reduce((acc, cat) => acc + cat.spent, 0);
  const totalForecast = categories.reduce((acc, cat) => acc + cat.forecast, 0);
  const budgetHealth = totalForecast <= totalAllocated ? 'healthy' : totalForecast <= totalAllocated * 1.1 ? 'warning' : 'critical';

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info('Executando análise preditiva com IA...');
    
    await new Promise(r => setTimeout(r, 2500));
    
    // Simulate AI adjustments
    setCategories(prev => prev.map(cat => ({
      ...cat,
      forecast: cat.forecast + (Math.random() - 0.5) * 20000,
      aiConfidence: Math.min(99, cat.aiConfidence + Math.floor(Math.random() * 5))
    })));
    
    setIsAnalyzing(false);
    toast.success('Análise concluída!', {
      description: 'Previsões atualizadas com dados mais recentes'
    });
  };

  const handleUpdateBudget = (categoryId: string, newAllocated: number) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, allocated: newAllocated } : cat
    ));
    toast.success('Orçamento atualizado');
  };

  const handleAddBudgetAdjustment = () => {
    if (!newBudgetInput.category || !newBudgetInput.amount) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    const amount = parseFloat(newBudgetInput.amount);
    const category = categories.find(c => c.id === newBudgetInput.category);
    
    if (category) {
      handleUpdateBudget(category.id, category.allocated + amount);
      setNewBudgetInput({ category: '', amount: '' });
    }
  };

  const exportReport = () => {
    const report = `
RELATÓRIO DE PREVISÃO ORÇAMENTÁRIA
==================================
Período: ${selectedPeriod}
Gerado em: ${new Date().toLocaleString('pt-BR')}

RESUMO EXECUTIVO
----------------
Orçamento Total Alocado: R$ ${totalAllocated.toLocaleString('pt-BR')}
Total Gasto até a data: R$ ${totalSpent.toLocaleString('pt-BR')}
Previsão Total: R$ ${totalForecast.toLocaleString('pt-BR')}
Variação Prevista: ${((totalForecast - totalAllocated) / totalAllocated * 100).toFixed(1)}%

CATEGORIAS DETALHADAS
---------------------
${categories.map(cat => `
${cat.name}:
  Alocado: R$ ${cat.allocated.toLocaleString('pt-BR')}
  Gasto: R$ ${cat.spent.toLocaleString('pt-BR')}
  Previsão: R$ ${cat.forecast.toLocaleString('pt-BR')}
  Tendência: ${cat.trend === 'up' ? '↑ Alta' : cat.trend === 'down' ? '↓ Baixa' : '→ Estável'}
  Confiança IA: ${cat.aiConfidence}%
`).join('')}

CENÁRIOS
--------
${scenarios.map(s => `
${s.name} (${s.probability}% probabilidade):
  Total: R$ ${s.totalBudget.toLocaleString('pt-BR')}
  ${s.savings >= 0 ? 'Economia' : 'Excesso'}: R$ ${Math.abs(s.savings).toLocaleString('pt-BR')}
  Riscos: ${s.risks.join(', ')}
`).join('')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `previsao-orcamento-${selectedPeriod}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <span className="text-muted-foreground">→</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Budget Forecasting AI
          </h2>
          <p className="text-muted-foreground">Previsão inteligente de orçamento com machine learning</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q1-2025">Q1 2025</SelectItem>
              <SelectItem value="q2-2025">Q2 2025</SelectItem>
              <SelectItem value="h1-2025">H1 2025</SelectItem>
              <SelectItem value="2025">Ano 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Atualizar Previsão
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamento Total</p>
                <p className="text-2xl font-bold">R$ {(totalAllocated / 1000000).toFixed(2)}M</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Atual</p>
                <p className="text-2xl font-bold">R$ {(totalSpent / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">{((totalSpent / totalAllocated) * 100).toFixed(0)}% do orçamento</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Previsão Final</p>
                <p className="text-2xl font-bold">R$ {(totalForecast / 1000000).toFixed(2)}M</p>
                <Badge variant={budgetHealth === 'healthy' ? 'default' : budgetHealth === 'warning' ? 'secondary' : 'destructive'}>
                  {budgetHealth === 'healthy' ? 'Dentro do Orçamento' : budgetHealth === 'warning' ? 'Atenção' : 'Acima do Orçamento'}
                </Badge>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={budgetHealth === 'healthy' ? 'bg-green-500/10 border-green-500/30' : budgetHealth === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Variação Prevista</p>
                <p className={`text-2xl font-bold ${totalForecast <= totalAllocated ? 'text-green-600' : 'text-red-600'}`}>
                  {totalForecast <= totalAllocated ? '-' : '+'}R$ {Math.abs(totalForecast - totalAllocated).toLocaleString('pt-BR')}
                </p>
              </div>
              {budgetHealth === 'healthy' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Previsão por Categoria</CardTitle>
              <CardDescription>Análise detalhada com confiança da IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{category.name}</h4>
                        {getTrendIcon(category.trend)}
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          {category.aiConfidence}% confiança
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {category.forecast.toLocaleString('pt-BR')}</p>
                        <p className={`text-xs ${category.variance >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {category.variance >= 0 ? '+' : ''}{category.variance}% vs orçado
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Gasto: R$ {category.spent.toLocaleString('pt-BR')}</span>
                        <span>Orçado: R$ {category.allocated.toLocaleString('pt-BR')}</span>
                      </div>
                      <Progress value={(category.spent / category.allocated) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map(scenario => (
              <Card key={scenario.id} className={scenario.name === 'Base' ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <Badge variant={scenario.name === 'Otimista' ? 'default' : scenario.name === 'Base' ? 'secondary' : 'outline'}>
                      {scenario.probability}%
                    </Badge>
                  </div>
                  <CardDescription>Probabilidade de ocorrência</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Orçamento Total</p>
                    <p className="text-2xl font-bold">R$ {scenario.totalBudget.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {scenario.savings >= 0 ? 'Economia Prevista' : 'Excesso Previsto'}
                    </p>
                    <p className={`font-bold ${scenario.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {Math.abs(scenario.savings).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Fatores de Risco</p>
                    <ul className="text-xs space-y-1">
                      {scenario.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle>Ajustar Orçamento</CardTitle>
              <CardDescription>Faça ajustes manuais nas alocações de orçamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newBudgetInput.category} 
                    onValueChange={(v) => setNewBudgetInput(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor do Ajuste (R$)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 50000 ou -20000"
                    value={newBudgetInput.amount}
                    onChange={(e) => setNewBudgetInput(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddBudgetAdjustment} className="w-full">
                    Aplicar Ajuste
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Orçamentos Atuais</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-sm">R$ {cat.allocated.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BudgetForecastingAI;
