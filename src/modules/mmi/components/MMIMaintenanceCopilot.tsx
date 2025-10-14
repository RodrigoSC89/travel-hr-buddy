/**
 * MMI Maintenance Copilot
 * AI-powered conversational assistant for maintenance technicians and engineers
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Mic,
  Wrench,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
  Settings,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionable?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
}

export const MMIMaintenanceCopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Olá! Sou o Copilot de Manutenção Inteligente. Posso ajudá-lo com análise de falhas, sugestões de manutenção preventiva, consultas técnicas e abertura de ordens de serviço. Como posso ajudar?',
        timestamp: new Date(),
        suggestions: [
          'Quais são os jobs pendentes críticos?',
          'Analisar histórico de falhas do motor principal',
          'Sugerir manutenção preventiva para bomba de óleo',
          'Abrir ordem de serviço para troca de filtro',
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Ver Jobs Críticos',
      icon: <AlertTriangle className="h-4 w-4" />,
      action: 'Mostrar todos os jobs de manutenção com prioridade crítica',
    },
    {
      id: '2',
      label: 'Previsão de Falhas',
      icon: <TrendingUp className="h-4 w-4" />,
      action: 'Analisar padrões e prever possíveis falhas nos próximos 30 dias',
    },
    {
      id: '3',
      label: 'Abrir OS',
      icon: <FileText className="h-4 w-4" />,
      action: 'Ajudar a criar uma nova ordem de serviço',
    },
    {
      id: '4',
      label: 'Histórico Técnico',
      icon: <Settings className="h-4 w-4" />,
      action: 'Consultar histórico técnico de componentes',
    },
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call an API)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(input),
        timestamp: new Date(),
        actionable: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('crítico') || lowerQuery.includes('pendente')) {
      return '🔴 Encontrei 3 jobs críticos pendentes:\n\n1. **Motor Principal - Troca de Óleo** (Vencimento: amanhã)\n   - Componente: Motor Diesel 603.0004.02\n   - Embarcação: MV Atlantic Explorer\n   - Recomendação: Executar imediatamente\n\n2. **Sistema DP - Calibração de Sensores** (Vencimento: em 2 dias)\n   - Componente: Sensores de Posicionamento\n   - Embarcação: MV Atlantic Explorer\n   - Recomendação: Não atrasar\n\n3. **Bomba Hidráulica - Inspeção** (Vencimento: em 3 dias)\n   - Componente: Bomba HP-001\n   - Embarcação: MV Pacific Star\n\nDeseja criar uma ordem de serviço para algum desses jobs?';
    }

    if (lowerQuery.includes('falha') || lowerQuery.includes('previsão')) {
      return '📊 **Análise Preditiva de Falhas**\n\nCom base no histórico de manutenção e dados dos sensores IoT, identifiquei os seguintes componentes com alta probabilidade de falha:\n\n1. **Motor Auxiliar A2** - 78% de probabilidade nos próximos 15 dias\n   - Motivo: Vibração acima do normal detectada\n   - Ação recomendada: Inspeção de rolamentos\n\n2. **Bomba de Água Doce** - 65% de probabilidade nos próximos 30 dias\n   - Motivo: Aumento gradual de temperatura\n   - Ação recomendada: Verificar sistema de resfriamento\n\n3. **Gerador Principal G1** - 45% de probabilidade nos próximos 45 dias\n   - Motivo: Horímetro próximo do limite de manutenção\n   - Ação recomendada: Agendar manutenção preventiva\n\nDeseja que eu crie jobs de manutenção preventiva para esses componentes?';
    }

    if (lowerQuery.includes('ordem de serviço') || lowerQuery.includes('os')) {
      return '📝 **Abertura de Ordem de Serviço**\n\nVou ajudá-lo a criar uma OS. Por favor, me informe:\n\n1. Qual componente ou equipamento?\n2. Tipo de manutenção (preventiva/corretiva)?\n3. Descrição do problema ou ação necessária?\n4. Prioridade (baixa/normal/alta/crítica)?\n\nOu posso sugerir uma OS baseada nos jobs pendentes. O que prefere?';
    }

    if (lowerQuery.includes('histórico')) {
      return '📋 **Consulta de Histórico Técnico**\n\nPara qual componente você deseja consultar o histórico?\n\nExemplos:\n- Motor Principal\n- Bomba de Óleo\n- Sistema DP\n- Gerador\n\nOu posso mostrar um resumo geral das últimas manutenções realizadas.';
    }

    // Default response
    return 'Entendi sua solicitação. Posso ajudá-lo com:\n\n• 📊 Análise de dados de manutenção\n• 🔍 Diagnóstico de problemas técnicos\n• 📝 Criação de ordens de serviço\n• 📈 Previsão de falhas\n• 📋 Consulta de histórico\n• 💡 Sugestões de manutenção preventiva\n\nPode me dar mais detalhes sobre o que você precisa?';
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    toast.info(isListening ? 'Gravação pausada' : 'Gravação iniciada');
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Copilot de Manutenção
            <Badge variant="outline" className="ml-auto">
              🧠 IA Ativa
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions */}
          <div className="border-b p-4">
            <p className="text-sm text-muted-foreground mb-3">Ações Rápidas:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((qa) => (
                <Button
                  key={qa.id}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => handleQuickAction(qa.action)}
                >
                  {qa.icon}
                  <span className="text-xs">{qa.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'assistant'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">EU</span>
                  )}
                </div>

                <div
                  className={`flex-1 space-y-2 ${
                    message.role === 'user' ? 'flex flex-col items-end' : ''
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg whitespace-pre-wrap ${
                      message.role === 'assistant'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Sugestões:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pergunte sobre manutenção, falhas, histórico..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                variant={isListening ? 'default' : 'outline'}
                size="icon"
                onClick={handleVoiceToggle}
                className={isListening ? 'animate-pulse' : ''}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
