/**
 * SEVI Dashboard - Intelligent Vector Evolution System
 * Self-learning visualization and feedback management
 * NAUTILUS ONE v4.0
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Target, RefreshCw, Lightbulb,
  AlertTriangle, CheckCircle, Activity, Zap, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSEVI } from '@/hooks/useSEVI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export function SEVIDashboard() {
  const { metrics, patterns, recommendations, submitFeedback, predict, refresh, reset } = useSEVI();
  
  const [feedbackModule, setFeedbackModule] = useState('crew-management');
  const [feedbackPrediction, setFeedbackPrediction] = useState(0.8);
  const [feedbackActual, setFeedbackActual] = useState(0.75);

  const handleSubmitFeedback = () => {
    submitFeedback(
      feedbackModule,
      'prediction',
      feedbackPrediction,
      feedbackActual,
      { timestamp: Date.now(), source: 'manual' }
    );
  };

  const moduleMetricsData = metrics?.moduleMetrics 
    ? Array.from(metrics.moduleMetrics.entries()).map(([name, data]) => ({
        module: name.length > 12 ? name.slice(0, 12) + '...' : name,
        accuracy: Math.round(data.accuracy * 100),
        trend: data.trend
      }))
    : [];

  const radarData = metrics?.moduleMetrics
    ? Array.from(metrics.moduleMetrics.entries()).slice(0, 6).map(([name, data]) => ({
        subject: name.split('-')[0],
        A: Math.round(data.accuracy * 100),
        fullMark: 100
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            SEVI - Evolução Vetorial Inteligente
          </h2>
          <p className="text-muted-foreground">Auto-aprendizado baseado em feedback operacional</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />Atualizar
          </Button>
          <Button variant="destructive" size="sm" onClick={reset}>Reset</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {metrics ? (metrics.globalAccuracy * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Precisão Global</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.totalFeedback || 0}</p>
                <p className="text-xs text-muted-foreground">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {metrics ? (metrics.learningRate * 100).toFixed(2) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Taxa Aprendizado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metrics?.improvementTrend && metrics.improvementTrend > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <TrendingUp className={`h-5 w-5 ${metrics?.improvementTrend && metrics.improvementTrend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {metrics?.improvementTrend ? (metrics.improvementTrend > 0 ? '+' : '') + (metrics.improvementTrend * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Tendência</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feedback Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Submeter Feedback
            </CardTitle>
            <CardDescription>Ensine o sistema com resultados reais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Módulo</Label>
              <Input value={feedbackModule} onChange={(e) => setFeedbackModule(e.target.value)} placeholder="crew-management" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Predição (0-1)</Label>
                <Input type="number" min="0" max="1" step="0.05" value={feedbackPrediction} onChange={(e) => setFeedbackPrediction(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Resultado Real</Label>
                <Input type="number" min="0" max="1" step="0.05" value={feedbackActual} onChange={(e) => setFeedbackActual(Number(e.target.value))} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmitFeedback}>
              <CheckCircle className="h-4 w-4 mr-2" />Enviar Feedback
            </Button>
          </CardContent>
        </Card>

        {/* Module Accuracy Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Precisão por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Precisão" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>Sem dados de módulos ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              {recommendations.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                      <p className="text-sm">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma recomendação pendente</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Patterns Detected */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Padrões Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {patterns.map((p, i) => (
                <div key={i} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={p.confidence > 0.7 ? 'destructive' : 'secondary'}>
                      {(p.confidence * 100).toFixed(0)}% confiança
                    </Badge>
                    <span className="text-xs text-muted-foreground">{p.occurrences}x</span>
                  </div>
                  <p className="font-medium text-sm">{p.pattern.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.suggestedAction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
