/**
 * ICP Dashboard - Intelligent Compliance Predictor
 * ML-based compliance risk prediction visualization
 * NAUTILUS ONE v4.0
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, TrendingUp, Calendar,
  Search, RefreshCw, CheckCircle, Clock, FileWarning
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useICP } from '@/hooks/useICP';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts';
import { cn } from '@/lib/utils';

export function ICPDashboard() {
  const { prediction, trends, deadlines, predictRisk, loadTrends, loadDeadlines, reset } = useICP();
  
  const [vesselId, setVesselId] = useState('vessel-001');

  const handlePredict = () => {
    predictRisk(vesselId);
    loadTrends(vesselId);
  };

  const categoryRiskData = prediction?.categoryRisks 
    ? Array.from(prediction.categoryRisks.entries()).map(([cat, risk]) => ({
        category: cat,
        risk: Math.round(risk * 100),
        color: risk > 0.7 ? '#ef4444' : risk > 0.4 ? '#f59e0b' : '#22c55e'
      }))
    : [];

  const trendData = trends.map(t => ({
    period: t.period.slice(5),
    score: t.avgScore,
    issues: t.issueCount
  }));

  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return 'text-red-500';
    if (risk > 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBadge = (risk: number) => {
    if (risk > 0.7) return 'destructive';
    if (risk > 0.4) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            ICP - Predição Inteligente de Compliance
          </h2>
          <p className="text-muted-foreground">Machine Learning para análise de risco regulatório</p>
        </div>
        <Button variant="destructive" size="sm" onClick={reset}>Reset</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input value={vesselId} onChange={(e) => setVesselId(e.target.value)} placeholder="ID do Navio (ex: vessel-001)" />
            </div>
            <Button onClick={handlePredict}>
              <Search className="h-4 w-4 mr-2" />Analisar Risco
            </Button>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <>
          {/* Risk Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="md:col-span-1">
              <CardContent className="p-6 text-center">
                <div className={cn("text-5xl font-bold mb-2", getRiskColor(prediction.overallRisk))}>
                  {Math.round(prediction.overallRisk * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Risco Geral</p>
                <Badge variant={getRiskBadge(prediction.overallRisk)} className="mt-2">
                  {prediction.overallRisk > 0.7 ? 'ALTO' : prediction.overallRisk > 0.4 ? 'MÉDIO' : 'BAIXO'}
                </Badge>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Confiança: {(prediction.confidence * 100).toFixed(0)}%</p>
                  <Progress value={prediction.confidence * 100} className="h-1 mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Risco por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryRiskData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip formatter={(v: number) => [`${v}%`, 'Risco']} />
                      <Bar dataKey="risk" radius={4}>
                        {categoryRiskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predicted Issues */}
          {prediction.predictedIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5" />
                  Problemas Previstos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prediction.predictedIssues.map((issue, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "p-4 rounded-lg border",
                        issue.estimatedImpact === 'high' && "border-red-500/50 bg-red-500/5",
                        issue.estimatedImpact === 'medium' && "border-yellow-500/50 bg-yellow-500/5",
                        issue.estimatedImpact === 'low' && "border-green-500/50 bg-green-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={issue.estimatedImpact === 'high' ? 'destructive' : issue.estimatedImpact === 'medium' ? 'secondary' : 'default'}>
                          {issue.estimatedImpact.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{(issue.probability * 100).toFixed(0)}%</span>
                      </div>
                      <p className="font-medium text-sm">{issue.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Prazo: {issue.timeframe}
                      </p>
                      <p className="text-xs mt-2 p-2 bg-muted/50 rounded">{issue.suggestedAction}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Trends & Deadlines */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências de Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="issues" name="Issues" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>Execute uma análise para ver tendências</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prazos Próximos (90 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              {deadlines.length > 0 ? (
                <div className="space-y-2">
                  {deadlines.map((d, i) => {
                    const daysLeft = Math.ceil((new Date(d.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={i} className={cn(
                        "p-3 rounded-lg border flex items-center justify-between",
                        daysLeft <= 7 && "border-red-500/50 bg-red-500/5",
                        daysLeft > 7 && daysLeft <= 30 && "border-yellow-500/50"
                      )}>
                        <div>
                          <p className="font-medium text-sm">{d.checkType}</p>
                          <p className="text-xs text-muted-foreground">{d.vesselId}</p>
                        </div>
                        <Badge variant={daysLeft <= 7 ? 'destructive' : daysLeft <= 30 ? 'secondary' : 'outline'}>
                          {daysLeft} dias
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum prazo próximo</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
