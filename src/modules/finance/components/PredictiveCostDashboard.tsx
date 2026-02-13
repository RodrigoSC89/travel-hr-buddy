/**
 * Predictive Cost Dashboard Component
 * AI-powered cost predictions and savings opportunities
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, DollarSign, Fuel, Wrench, Users,
  Anchor, Shield, MoreHorizontal, Brain, Loader2, Lightbulb,
  ArrowRight, Sparkles, Target, BarChart3
} from 'lucide-react';
import { useFinanceProcurementAI, CostPrediction, SavingsOpportunity } from '@/hooks/useFinanceProcurementAI';
import { motion } from 'framer-motion';

const categoryIcons: Record<string, React.ElementType> = {
  fuel: Fuel,
  maintenance: Wrench,
  crew: Users,
  port: Anchor,
  insurance: Shield,
  other: MoreHorizontal
};

const categoryColors: Record<string, string> = {
  fuel: 'bg-warning',
  maintenance: 'bg-accent',
  crew: 'bg-info',
  port: 'bg-success',
  insurance: 'bg-destructive',
  other: 'bg-muted'
};

export function PredictiveCostDashboard() {
  const { 
    isLoading, 
    predictCosts, 
    identifySavings 
  } = useFinanceProcurementAI();

  const [predictions, setPredictions] = useState<CostPrediction[]>([]);
  const [savings, setSavings] = useState<SavingsOpportunity[]>([]);
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    // Load predictions
    const predData = await predictCosts(timeframe);
    if (predData) {
      setPredictions(predData);
    } else {
      // Demo data
      setPredictions([
        { month: '2024-02', fuel: 125000, maintenance: 45000, crew: 85000, port: 32000, insurance: 18000, other: 12000, total: 317000, confidence: 0.88 },
        { month: '2024-03', fuel: 132000, maintenance: 52000, crew: 85000, port: 28000, insurance: 18000, other: 15000, total: 330000, confidence: 0.85 },
        { month: '2024-04', fuel: 118000, maintenance: 38000, crew: 87000, port: 35000, insurance: 18000, other: 11000, total: 307000, confidence: 0.82 }
      ]);
    }

    // Load savings
    const savingsData = await identifySavings();
    if (savingsData) {
      setSavings(savingsData);
    } else {
      // Demo data
      setSavings([
        { id: '1', category: 'fuel', currentCost: 1500000, potentialSavings: 120000, savingsPercentage: 8, actions: ['Otimizar rotas', 'Slow steaming'], effort: 'low', timeline: '1-2 meses', roi: 450 },
        { id: '2', category: 'maintenance', currentCost: 540000, potentialSavings: 65000, savingsPercentage: 12, actions: ['Manutenção preditiva', 'Bulk purchasing'], effort: 'medium', timeline: '3-4 meses', roi: 280 },
        { id: '3', category: 'port', currentCost: 380000, potentialSavings: 28000, savingsPercentage: 7, actions: ['Negociação de tarifas', 'Port optimization'], effort: 'low', timeline: '1 mês', roi: 520 }
      ]);
    }
  };

  const totalPredicted = predictions.reduce((acc, p) => acc + p.total, 0);
  const totalSavings = savings.reduce((acc, s) => acc + s.potentialSavings, 0);
  const avgConfidence = predictions.length > 0 
    ? (predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Predição de Custos AI
          </h2>
          <p className="text-muted-foreground">
            Machine Learning + IA para previsão precisa de custos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeframe === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('monthly')}
          >
            Mensal
          </Button>
          <Button
            variant={timeframe === 'quarterly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('quarterly')}
          >
            Trimestral
          </Button>
          <Button
            variant={timeframe === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('yearly')}
          >
            Anual
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Previsto</p>
                  <p className="text-2xl font-bold">${(totalPredicted / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeframe === 'monthly' ? 'Este mês' : timeframe === 'quarterly' ? 'Trimestre' : 'Este ano'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Economia Potencial</p>
                  <p className="text-2xl font-bold text-success">${(totalSavings / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-success mt-1">
                    {savings.length} oportunidades
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-success opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confiança ML</p>
                  <p className="text-2xl font-bold text-info">{avgConfidence.toFixed(0)}%</p>
                  <Progress value={avgConfidence} className="h-1 mt-2 w-24" />
                </div>
                <Sparkles className="h-8 w-8 text-info opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROI Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {savings.length > 0 
                      ? (savings.reduce((a, s) => a + s.roi, 0) / savings.length).toFixed(0) 
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Das economias</p>
                </div>
                <Target className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">
            <BarChart3 className="h-4 w-4 mr-2" />
            Predições
          </TabsTrigger>
          <TabsTrigger value="savings">
            <Lightbulb className="h-4 w-4 mr-2" />
            Oportunidades de Economia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Gerando predições com ML...</span>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cost Breakdown by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Breakdown por Categoria</CardTitle>
                  <CardDescription>Custos previstos por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions[0] && Object.entries(predictions[0])
                      .filter(([key]) => !['month', 'total', 'confidence'].includes(key))
                      .map(([category, value]) => {
                        const Icon = categoryIcons[category] || MoreHorizontal;
                        const color = categoryColors[category] || 'bg-muted-foreground';
                        const percentage = ((value as number) / predictions[0].total) * 100;
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded ${color}/10`}>
                                  <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
                                </div>
                                <span className="font-medium capitalize">{category}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">${((value as number) / 1000).toFixed(0)}k</span>
                                <span className="text-muted-foreground ml-2">({percentage.toFixed(0)}%)</span>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Custos</CardTitle>
                  <CardDescription>Previsão por período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.map((pred, predIdx) => (
                      <div key={pred.month} className="flex items-center justify-between p-4 border rounded-lg">
...
                        <div className="text-right">
                          <p className="text-xl font-bold">${(pred.total / 1000).toFixed(0)}k</p>
                          {predIdx > 0 && (
                            <div className={`flex items-center text-xs ${
                              pred.total > predictions[predIdx - 1].total ? 'text-destructive' : 'text-success'
                            }`}>
                              {pred.total > predictions[predIdx - 1].total ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(((pred.total - predictions[predIdx - 1].total) / predictions[predIdx - 1].total) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                Oportunidades Identificadas por IA
              </CardTitle>
              <CardDescription>
                Rankeado por ROI (economia vs esforço de implementação)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savings.map((opportunity, idx) => {
                  const Icon = categoryIcons[opportunity.category] || MoreHorizontal;
                  const color = categoryColors[opportunity.category] || 'bg-muted-foreground';
                  
                  return (
                    <motion.div 
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{opportunity.category}</p>
                            <p className="text-sm text-muted-foreground">
                              Custo atual: ${(opportunity.currentCost / 1000).toFixed(0)}k
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {opportunity.actions.map((action) => (
                                <Badge key={action} variant="secondary" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-success">
                            -${(opportunity.potentialSavings / 1000).toFixed(0)}k
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {opportunity.savingsPercentage}% economia
                          </p>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <Badge variant={
                              opportunity.effort === 'low' ? 'default' :
                              opportunity.effort === 'medium' ? 'secondary' : 'destructive'
                            }>
                              {opportunity.effort === 'low' ? 'Fácil' :
                               opportunity.effort === 'medium' ? 'Médio' : 'Difícil'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{opportunity.timeline}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">ROI: {opportunity.roi}%</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Implementar
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
