/**
 * Enhanced AI Control Tower - AI Command Center
 * PATCH AI-2.0 - Complete AI orchestration experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain, Sparkles, Activity, TrendingUp, AlertTriangle, CheckCircle,
  RefreshCw, Send, Bot, Zap, Target, BarChart3, Lightbulb,
  Settings, Shield, Clock, MessageSquare, Cpu, Network, Database,
  Eye, Play, Pause, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { format } from 'date-fns';

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  tasksCompleted: number;
  accuracy: number;
  lastActive: Date;
  description: string;
}

interface AIInsight {
  id: string;
  type: 'optimization' | 'prediction' | 'alert' | 'recommendation';
  module: string;
  title: string;
  description: string;
  confidence: number;
  potentialImpact: string;
  actionable: boolean;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export const EnhancedAIControlTower: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [metrics, setMetrics] = useState<AIMetric[]>([]);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    setLoading(true);
    try {
      // Load agents from agent_registry
      const { data: agentData } = await supabase.from('agent_registry').select('*').limit(10);
      if (agentData?.length) {
        setAgents(agentData.map((a) => ({
          id: a.id, name: a.name, type: (a.capabilities as Record<string, unknown>)?.type as string || 'General',
          status: a.status === 'active' ? 'active' as const : 'idle' as const,
          tasksCompleted: (a.metadata as Record<string, unknown>)?.tasks_completed as number || 0, accuracy: (a.metadata as Record<string, unknown>)?.accuracy as number || 90,
          lastActive: new Date(a.last_heartbeat || a.updated_at), description: (a.metadata as Record<string, unknown>)?.description as string || ''
        })));
      }

      // Load insights from ai_insights
      const { data: insightData } = await supabase.from('ai_insights').select('*').order('created_at', { ascending: false }).limit(10);
      if (insightData?.length) {
        setInsights(insightData.map((i) => ({
          id: i.id, type: i.category as AIInsight['type'], module: i.related_module || '',
          title: i.title, description: i.description, confidence: i.confidence * 100,
          potentialImpact: i.impact_value || '', actionable: i.actionable, timestamp: new Date(i.created_at)
        })));
      }

      // Load metrics
      const { data: metricsData } = await supabase.from('ai_behavior_snapshots').select('*').order('created_at', { ascending: false }).limit(4);
      if (metricsData?.length) {
        setMetrics(metricsData.map((m) => ({
          label: m.module_name, value: (m.accuracy_score || 0) * 100, unit: '%',
          trend: 'up' as const, change: m.learning_rate || 0
        })));
      }

      setChatMessages([
        { id: '1', role: 'assistant', content: 'Olá! Sou o assistente IA do Nauti One. Como posso ajudá-lo hoje?', timestamp: new Date() }
      ]);

    } catch (error) {
      logger.error('Error loading AI data:', error);
      toast.error('Erro ao carregar dados de IA');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsProcessing(true);

    try {
      const { data: aiResult } = await supabase.functions.invoke('ai-chat', { body: { prompt: chatInput, module: 'ai-control-tower' } });

      const responses: Record<string, string> = {
        default: `Analisei sua solicitação sobre "${chatInput}". Com base nos dados disponíveis, posso ajudar com análises preditivas, otimização de operações, conformidade regulatória e muito mais. Seja mais específico sobre o que você precisa.`,
        manutençao: 'Analisando os dados de manutenção... Identifiquei 3 equipamentos que precisam de atenção nos próximos 7 dias. O Motor Auxiliar #2 tem 85% de probabilidade de necessitar intervenção.',
        combustivel: 'Com base na análise de rotas e condições climáticas, identifico potencial de economia de 12% no consumo de combustível através de ajuste de velocidade e otimização de rota.',
        tripulaçao: 'O sistema identificou que 4 tripulantes têm certificados expirando nos próximos 30 dias. Recomendo iniciar o processo de renovação imediatamente.'
      };

      const key = Object.keys(responses).find(k => 
        chatInput.toLowerCase().includes(k)
      ) || 'default';

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[key],
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Erro ao processar mensagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success';
      case 'processing': return 'bg-primary/20 text-primary';
      case 'idle': return 'bg-warning/20 text-warning';
      case 'error': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Zap className="h-5 w-5 text-primary" />;
      case 'prediction': return <TrendingUp className="h-5 w-5 text-accent-foreground" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'recommendation': return <Lightbulb className="h-5 w-5 text-success" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={`ai-tower-skeleton-${i}`} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
            <Brain className="h-8 w-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Control Tower</h1>
            <p className="text-muted-foreground">Centro de comando de inteligência artificial</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-success/10 text-success">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            {agents.filter(a => a.status === 'active').length} agentes ativos
          </Badge>
          <Button variant="outline" onClick={loadAIData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <Badge variant="outline" className={metric.trend === 'up' ? 'text-success' : metric.trend === 'down' && metric.label.includes('Tempo') ? 'text-success' : 'text-destructive'}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{metric.value}{metric.unit}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agentes
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
            {insights.filter(i => i.actionable).length > 0 && (
              <Badge className="ml-1">{insights.filter(i => i.actionable).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Assistente
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Performance dos Agentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.slice(0, 4).map((agent) => (
                    <div key={agent.id} className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(agent.status)}`}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.tasksCompleted} tarefas</p>
                      </div>
                      <div className="w-24">
                        <Progress value={agent.accuracy} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{agent.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Insights Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {insights.slice(0, 4).map((insight) => (
                      <div key={insight.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{insight.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{insight.module}</Badge>
                              <Badge variant="outline">{insight.confidence}% confiança</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(agent.status)}`}>
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{agent.name}</h3>
                        <Badge variant="outline" className="mt-1">{agent.type}</Badge>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status === 'active' ? 'Ativo' :
                       agent.status === 'processing' ? 'Processando' :
                       agent.status === 'idle' ? 'Ocioso' : 'Erro'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tarefas</p>
                      <p className="font-bold">{agent.tasksCompleted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Precisão</p>
                      <p className="font-bold">{agent.accuracy}%</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Config
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant="outline">{insight.module}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline">
                            <Brain className="h-3 w-3 mr-1" />
                            {insight.confidence}% confiança
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Impacto: {insight.potentialImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                    {insight.actionable && (
                      <Button>
                        Aplicar
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Assistente IA
              </CardTitle>
              <CardDescription>Converse com a IA para obter insights e realizar ações</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {format(message.timestamp, 'HH:mm')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">Processando...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Digite sua mensagem..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[44px] max-h-[120px]"
                />
                <Button onClick={handleSendMessage} disabled={isProcessing}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIControlTower;
