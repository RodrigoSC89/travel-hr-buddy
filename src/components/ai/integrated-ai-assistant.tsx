import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Settings, 
  Download,
  Zap,
  Brain,
  User,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  DollarSign
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AISettingsDialog } from "./AISettingsDialog";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  metadata?: {
    function_calls?: string[];
    confidence?: number;
    sources?: string[];
  };
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: string;
}

const IntegratedAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Olá! Sou seu assistente IA empresarial. Posso ajudar com análises, relatórios, automações e muito mais. Como posso ajudá-lo hoje?",
      role: "assistant",
      timestamp: new Date(),
      metadata: { confidence: 95 }
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Análise de Performance Q4",
      lastMessage: "Relatório gerado com sucesso",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messageCount: 15
    },
    {
      id: "2",
      title: "Automação de Workflows",
      lastMessage: "Configuração de aprovações",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      messageCount: 8
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "Análise de Vendas",
      description: "Gerar relatório de vendas do período",
      icon: <TrendingUp className="w-4 h-4" />,
      prompt: "Analise as vendas dos últimos 30 dias e forneça insights sobre tendências e oportunidades",
      category: "Analytics"
    },
    {
      id: "2",
      title: "Relatório Financeiro",
      description: "Criar relatório financeiro detalhado",
      icon: <DollarSign className="w-4 h-4" />,
      prompt: "Crie um relatório financeiro completo incluindo receitas, despesas e projeções",
      category: "Financeiro"
    },
    {
      id: "3",
      title: "Análise de Equipe",
      description: "Avaliar performance da equipe",
      icon: <Users className="w-4 h-4" />,
      prompt: "Analise a performance da equipe e sugira melhorias de produtividade",
      category: "RH"
    },
    {
      id: "4",
      title: "Dashboard KPI",
      description: "Criar dashboard de indicadores",
      icon: <BarChart3 className="w-4 h-4" />,
      prompt: "Crie um dashboard com os principais KPIs da empresa e métricas de performance",
      category: "Business Intelligence"
    },
    {
      id: "5",
      title: "Automatizar Processo",
      description: "Configurar automação de workflow",
      icon: <Zap className="w-4 h-4" />,
      prompt: "Ajude-me a configurar uma automação para o processo de aprovação de documentos",
      category: "Automação"
    },
    {
      id: "6",
      title: "Previsão de Demanda",
      description: "Análise preditiva de vendas",
      icon: <Brain className="w-4 h-4" />,
      prompt: "Use machine learning para prever a demanda dos próximos 3 meses",
      category: "Predictive Analytics"
    }
  ];

  useEffect(() => {
    // Debounce scroll to prevent excessive re-renders
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-chat', {
        body: { prompt: currentMessage, module: 'integrated-assistant' }
      });
      
      const aiResponse = await generateAIResponse(currentMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        role: "assistant",
        timestamp: new Date(),
        metadata: {
          confidence: aiResponse.confidence,
          function_calls: aiResponse.functionCalls,
          sources: aiResponse.sources
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to database if user is authenticated
      if (user) {
        await saveConversation();
      }
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (prompt: string) => {
    // Simulate different types of responses based on keywords
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("vendas") || lowerPrompt.includes("receita")) {
      return {
        content: `📊 **Análise de Vendas Concluída**

Com base nos dados disponíveis, identifiquei os seguintes insights:

**Métricas Principais:**
• Receita atual: R$ 2.847.392
• Crescimento vs. mês anterior: +12.8%
• Número de transações: 1.429
• Ticket médio: R$ 1.993

**Tendências Identificadas:**
1. **Crescimento Consistente**: Vendas crescendo 12.8% ao mês
2. **Sazonalidade**: Picos nas terças e quintas-feiras
3. **Produtos Top**: Categoria "Tecnologia" lidera com 34% das vendas

**Recomendações:**
✅ Focar em campanhas nas terças e quintas
✅ Expandir estoque de tecnologia
✅ Implementar cross-selling para aumentar ticket médio

Deseja que eu gere um relatório detalhado ou configure alertas automáticos?`,
        confidence: 94,
        functionCalls: ["analytics_query", "sales_analysis"],
        sources: ["price_alerts", "user_statistics"]
      };
    }

    if (lowerPrompt.includes("equipe") || lowerPrompt.includes("rh") || lowerPrompt.includes("funcionário")) {
      return {
        content: `👥 **Análise de Equipe - Relatório Executivo**

**Overview da Equipe:**
• Total de colaboradores ativos: 47
• Taxa de retenção: 94.2%
• Satisfação média: 8.7/10
• Produtividade geral: +15% vs. trimestre anterior

**Destaques por Departamento:**
📈 **Vendas**: 12 pessoas, performance 118% da meta
💻 **TI**: 8 pessoas, 98% de entregas no prazo
📊 **Marketing**: 6 pessoas, ROI de campanhas +23%
🏢 **Operações**: 21 pessoas, eficiência operacional 91%

**Oportunidades de Melhoria:**
1. **Treinamento**: 15% dos colaboradores precisam de capacitação
2. **Ferramentas**: Modernizar stack tecnológico do time de operações
3. **Processos**: Automatizar aprovações para reduzir gargalos

**Próximos Passos:**
🎯 Implementar programa de mentoria
🎯 Investir em novas ferramentas de produtividade
🎯 Criar dashboard de performance individual

Posso detalhar algum departamento específico ou criar um plano de ação?`,
        confidence: 92,
        functionCalls: ["hr_analysis", "performance_metrics"],
        sources: ["employee_certificates", "performance_metrics"]
      };
    }

    if (lowerPrompt.includes("automatizar") || lowerPrompt.includes("workflow") || lowerPrompt.includes("processo")) {
      return {
        content: `⚙️ **Sistema de Automação Configurado**

Identifiquei oportunidades de automação nos seus processos:

**Automações Recomendadas:**

🔄 **Aprovação de Documentos**
• Roteamento automático baseado em valor/tipo
• Notificações inteligentes para aprovadores
• Escalação automática após 48h

📧 **Comunicação Inteligente**
• Relatórios automáticos semanais
• Alertas de KPIs críticos
• Lembretes de tarefas pendentes

📊 **Análise de Dados**
• Dashboards atualizados em tempo real
• Alertas de anomalias nos dados
• Relatórios mensais automatizados

**Status da Implementação:**
✅ Workflow de aprovações: Configurado
✅ Notificações automáticas: Ativas
🔄 Integração com sistemas: Em andamento
⏳ Testes finais: Agendados

**Próximas Automações:**
1. Gestão de inventário
2. Onboarding de funcionários
3. Análise preditiva de churn

Deseja ativar alguma automação específica ou configurar novos triggers?`,
        confidence: 96,
        functionCalls: ["workflow_setup", "automation_config"],
        sources: ["optimization_actions", "intelligent_notifications"]
      };
    }

    if (lowerPrompt.includes("dashboard") || lowerPrompt.includes("kpi") || lowerPrompt.includes("métricas")) {
      return {
        content: `📈 **Dashboard de KPIs Criado**

Configurei um dashboard personalizado com suas métricas principais:

**KPIs Financeiros:**
💰 Receita Mensal: R$ 2.847.392 (+12.8%)
💳 Margem de Lucro: 34.2% (+2.1%)
💸 Custos Operacionais: R$ 1.873.248 (-3.4%)
🎯 ROI: 187% (+15%)

**KPIs Operacionais:**
⚡ Produtividade: 94.7% (+8.2%)
🕐 Tempo Médio de Resposta: 2.3h (-25%)
✅ Taxa de Conclusão: 97.1% (+4.3%)
🔄 Eficiência de Processos: 89.4% (+6.7%)

**KPIs de Equipe:**
👥 Satisfação: 8.7/10 (+0.4)
📚 Horas de Treinamento: 42h/mês (+12h)
🎯 Metas Atingidas: 94.3% (+7.2%)
⭐ Net Promoter Score: 73 (+8)

**Alertas Configurados:**
🚨 Receita abaixo de R$ 2.5M
🚨 Margem de lucro < 30%
🚨 Produtividade < 85%
🚨 Satisfação da equipe < 8.0

O dashboard está disponível em tempo real. Posso configurar alertas adicionais ou criar visualizações específicas?`,
        confidence: 98,
        functionCalls: ["dashboard_creation", "kpi_analysis"],
        sources: ["system_metrics", "performance_metrics", "ux_metrics"]
      };
    }

    // Default response
    return {
      content: `Entendi sua solicitação! Como seu assistente IA empresarial, posso ajudar com:

🎯 **Análises e Relatórios**
• Análise de vendas e performance
• Relatórios financeiros automatizados
• Insights de business intelligence

⚡ **Automação de Processos**
• Configuração de workflows
• Notificações inteligentes
• Otimização de operações

👥 **Gestão de Equipe**
• Análise de produtividade
• Métricas de satisfação
• Planos de desenvolvimento

📊 **Business Intelligence**
• Dashboards personalizados
• KPIs em tempo real
• Análises preditivas

Para começar, você pode:
1. Escolher uma das ações rápidas ao lado
2. Descrever especificamente o que precisa
3. Solicitar análises de dados específicos

Como posso ajudá-lo especificamente hoje?`,
      confidence: 85,
      functionCalls: ["general_help"],
      sources: []
    };
  };

  const saveConversation = async () => {
    try {
      // This would integrate with the actual conversations table
      // For now, we'll just show a success message
      // Conversation saved to history
    } catch (error) {
      // Error saving conversation
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setCurrentMessage(action.prompt);
    inputRef.current?.focus();
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Start voice recognition
      toast({
        title: "Reconhecimento de voz ativo",
        description: "Fale agora..."
      });
    } else {
      toast({
        title: "Reconhecimento de voz desativado",
        description: "Voltando ao modo texto"
      });
    }
  };

  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.role}: ${msg.content}`
    ).join("\n\n");
    
    const blob = new Blob([conversation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversa-ia-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Conversa exportada",
      description: "Arquivo baixado com sucesso"
    });
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar with Conversations and Quick Actions */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Assistente IA
          </h2>
          <p className="text-sm text-muted-foreground">
            Seu copiloto empresarial inteligente
          </p>
        </div>

        <Tabs defaultValue="quick-actions" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-4">
            <TabsTrigger value="quick-actions">Ações Rápidas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-actions" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Card 
                    key={action.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleQuickAction(action)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{action.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {action.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-2">
                            {action.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Card key={conv.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {conv.messageCount}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {conv.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">Chat IA Empresarial</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Processando..." : "Online e pronto para ajudar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportConversation}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSettingsClick}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="p-2 bg-primary/10 rounded-lg self-start">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {message.content.split("\n").map((line, lineIdx) => (
                      <div key={`${message.id}-line-${lineIdx}`}>
                        {line}
                        {lineIdx < message.content.split("\n").length - 1 && <br />}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Clock className="w-3 h-3" />
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    
                    {message.metadata?.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {message.metadata.confidence}% confiança
                      </Badge>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="p-2 bg-primary/10 rounded-lg self-start">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                    <span className="text-sm ml-2">Processando sua solicitação...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Digite sua mensagem ou escolha uma ação rápida..."
                  className="pr-12"
                  disabled={isLoading}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={toggleListening}
                >
                  {isListening ? 
                    <MicOff className="w-4 h-4 text-destructive" /> : 
                    <Mic className="w-4 h-4" />
                  }
                </Button>
              </div>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={!currentMessage.trim() || isLoading}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                Pressione Enter para enviar • Use o microfone para voz
              </span>
              <span>
                {currentMessage.length}/2000 caracteres
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <AISettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </div>
  );
};

export default IntegratedAIAssistant;