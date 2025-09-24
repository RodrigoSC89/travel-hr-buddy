import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Lightbulb,
  MessageSquare,
  Send,
  Brain,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIInsight {
  id: number;
  type: 'suggestion' | 'alert' | 'opportunity' | 'trend';
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const AIAssistantPanel = () => {
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: 1,
      type: 'opportunity',
      title: 'Oportunidade de Vendas',
      description: 'Cliente Premium Corp. tem 85% de chance de renovar contrato se abordado esta semana.',
      confidence: 85,
      action: 'Agendar reunião'
    },
    {
      id: 2,
      type: 'trend',
      title: 'Tendência de Mercado',
      description: 'Setor de tecnologia crescendo 23% este trimestre. Considere expandir portfólio.',
      confidence: 92,
      action: 'Ver análise'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Alerta de Performance',
      description: 'Equipe de vendas 15% abaixo da meta. Sugestão: workshop de capacitação.',
      confidence: 78,
      action: 'Criar plano'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      content: 'Olá! Sou seu assistente de IA corporativo. Como posso ajudar a otimizar seus processos hoje?',
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'alert': return <Target className="w-5 h-5 text-red-500" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'trend': return <Sparkles className="w-5 h-5 text-blue-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      'Baseado nos dados atuais, recomendo focar em clientes com ticket médio acima de R$ 10k para maximizar ROI.',
      'Identifiquei uma oportunidade de cross-sell com 3 clientes ativos. Posso gerar uma proposta personalizada?',
      'Análise dos KPIs mostra tendência positiva. Sugiro aumentar investimento em marketing digital em 15%.',
      'Detectei padrão nos dados: clientes que recebem follow-up em 24h têm 40% mais chance de conversão.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const executeAction = (insight: AIInsight) => {
    toast({
      title: "Ação executada",
      description: `${insight.action} para: ${insight.title}`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Insights de IA */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Insights Inteligentes
          </CardTitle>
          <CardDescription>
            Recomendações em tempo real baseadas em IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(insight.confidence)}`} />
                        <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    {insight.action && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => executeAction(insight)}
                        className="h-8"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {insight.action}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat com IA */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Assistente IA Corporativo
          </CardTitle>
          <CardDescription>
            Converse com a IA para insights e análises personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chat Messages */}
            <ScrollArea className="h-64 p-3 border rounded-lg bg-muted/20">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card border p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">IA digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Faça uma pergunta ou solicite uma análise..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setNewMessage('Qual é a previsão de vendas para este mês?')}>
                📊 Previsão de vendas
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setNewMessage('Analise o desempenho da equipe')}>
                👥 Performance da equipe
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setNewMessage('Identifique oportunidades de crescimento')}>
                🚀 Oportunidades
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};