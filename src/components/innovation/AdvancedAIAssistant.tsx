import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  MessageSquare, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Mic,
  Image,
  FileText,
  BarChart3,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIContext {
  userId: string;
  currentModule: string;
  recentActions: string[];
  preferences: Record<string, string>;
  workPatterns: Record<string, string | string[]>;
}

interface AIResponse {
  text: string;
  suggestions: string[];
  actionItems: Array<{
    title: string;
    priority: "high" | "medium" | "low";
    estimatedTime: string;
  }>;
  insights: Array<{
    type: "warning" | "opportunity" | "info";
    message: string;
    confidence: number;
  }>;
}

interface ConversationMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: "image" | "document" | "chart";
    url: string;
    name: string;
  }>;
}

interface QuickAction {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

export const AdvancedAIAssistant = () => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "Olá! Sou sua IA executiva avançada. Posso analisar dados complexos, gerar relatórios inteligentes, otimizar processos e fornecer insights estratégicos personalizados. Como posso impulsionar seus resultados hoje?",
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiContext, setAiContext] = useState<AIContext>({
    userId: "current-user",
    currentModule: "dashboard",
    recentActions: ["Visualizou dashboard", "Analisou KPIs", "Criou workflow"],
    preferences: { language: "pt-BR", timezone: "America/Sao_Paulo" },
    workPatterns: { peakHours: "9-11", preferredTasks: ["analysis", "reports"] }
  });

  const [quickActions] = useState<QuickAction[]>([
    { id: 1, label: "Análise de Performance", icon: BarChart3, prompt: "Faça uma análise detalhada da performance da equipe nos últimos 30 dias" },
    { id: 2, label: "Otimizar Processos", icon: Zap, prompt: "Identifique oportunidades de otimização nos nossos processos atuais" },
    { id: 3, label: "Relatório Executivo", icon: FileText, prompt: "Gere um relatório executivo completo com insights estratégicos" },
    { id: 4, label: "Previsões IA", icon: TrendingUp, prompt: "Crie previsões para os próximos 3 meses baseadas nos dados atuais" },
    { id: 5, label: "Insights de Mercado", icon: Lightbulb, prompt: "Analise tendências do mercado e oportunidades de crescimento" },
    { id: 6, label: "Otimização de Equipe", icon: Users, prompt: "Sugira estratégias para melhorar a colaboração e produtividade da equipe" }
  ]);

  const { toast } = useToast();

  const generateAIResponse = async (userMessage: string): Promise<AIResponse> => {
    // Simulação de resposta avançada da IA baseada no contexto
    const responses = {
      "análise": {
        text: "Baseado nos dados coletados, identifiquei padrões significativos na performance da equipe. A produtividade aumentou 23% desde a implementação dos workflows inteligentes, com picos de eficiência entre 9h-11h. Recomendo expandir o uso de automação em 3 áreas específicas.",
        suggestions: ["Automatizar relatórios diários", "Implementar alertas preditivos", "Otimizar fluxo de aprovações"],
        actionItems: [
          { title: "Configurar dashboard personalizado", priority: "high" as const, estimatedTime: "2h" },
          { title: "Treinar equipe em novos recursos", priority: "medium" as const, estimatedTime: "4h" },
          { title: "Revisar métricas semanalmente", priority: "low" as const, estimatedTime: "1h" }
        ],
        insights: [
          { type: "opportunity" as const, message: "Oportunidade de reduzir tempo de processos em 40%", confidence: 87 },
          { type: "warning" as const, message: "Possível gargalo identificado no módulo de aprovações", confidence: 92 }
        ]
      },
      "processo": {
        text: "Analisando seus processos atuais, encontrei 5 oportunidades críticas de otimização. Implementando automação inteligente, podemos reduzir o tempo de execução em 45% e eliminar 80% das tarefas manuais repetitivas.",
        suggestions: ["Implementar RPA em tarefas repetitivas", "Criar workflows condicionais", "Integrar sistemas via API"],
        actionItems: [
          { title: "Mapear processos críticos", priority: "high" as const, estimatedTime: "3h" },
          { title: "Desenvolver automações prioritárias", priority: "high" as const, estimatedTime: "8h" },
          { title: "Testar e validar melhorias", priority: "medium" as const, estimatedTime: "2h" }
        ],
        insights: [
          { type: "opportunity" as const, message: "Economia estimada de R$ 25.000/mês com automações", confidence: 94 },
          { type: "info" as const, message: "ROI esperado de 340% nos primeiros 6 meses", confidence: 89 }
        ]
      },
      default: {
        text: "Compreendo sua solicitação. Com base no contexto atual e nos padrões de trabalho identificados, posso fornecer insights personalizados e ações específicas para otimizar seus resultados. Que aspecto gostaria de explorar mais profundamente?",
        suggestions: ["Explorar dados em tempo real", "Gerar relatório personalizado", "Criar plano de ação"],
        actionItems: [
          { title: "Definir objetivos específicos", priority: "medium" as const, estimatedTime: "1h" },
          { title: "Coletar dados relevantes", priority: "medium" as const, estimatedTime: "30min" }
        ],
        insights: [
          { type: "info" as const, message: "Sistema operando com 99.8% de eficiência", confidence: 100 }
        ]
      }
    };

    // Simular delay de processamento IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    const messageKey = userMessage.toLowerCase().includes("análise") ? "análise" :
      userMessage.toLowerCase().includes("processo") ? "processo" : "default";
    
    return responses[messageKey];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const aiMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse.text,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, aiMessage]);

      // Adicionar suggestions e insights como mensagens separadas se relevantes
      if (aiResponse.actionItems.length > 0) {
        setTimeout(() => {
          const actionMessage: ConversationMessage = {
            id: (Date.now() + 2).toString(),
            type: "ai",
            content: `📋 **Ações Recomendadas:**\n${aiResponse.actionItems.map(item => 
              `• ${item.title} (${item.priority} - ${item.estimatedTime})`
            ).join("\n")}`,
            timestamp: new Date()
          };
          setConversation(prev => [...prev, actionMessage]);
        }, 1000);
      }

    } catch (error) {
      toast({
        title: "Erro na IA",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputMessage(action.prompt);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
    case "warning": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case "opportunity": return <TrendingUp className="w-4 h-4 text-green-500" />;
    default: return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chat Interface */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              IA Executiva Avançada
            </CardTitle>
            <CardDescription>
              Assistente inteligente com análise contextual e insights estratégicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chat Messages */}
            <ScrollArea className="h-96 mb-4 p-4 border rounded-lg bg-background/50">
              <div className="space-y-4">
                {conversation.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card border shadow-sm"
                    }`}>
                      <div className="flex items-start gap-3">
                        {message.type === "ai" && (
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Brain className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card border p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">Analisando com IA...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Descreva o que precisa analisar ou otimizar..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!inputMessage.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mic className="w-4 h-4 mr-2" />
                  Voz
                </Button>
                <Button variant="outline" size="sm">
                  <Image className="w-4 h-4 mr-2" />
                  Imagem
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Documento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with Quick Actions and Context */}
      <div className="space-y-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="w-full justify-start h-auto p-3"
                  >
                    <IconComponent className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs text-left">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              Contexto IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Módulo Atual</p>
                <Badge variant="secondary">{aiContext.currentModule}</Badge>
              </div>
              
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Ações Recentes</p>
                <div className="space-y-1">
                  {aiContext.recentActions.slice(0, 3).map((action, index) => (
                    <p key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {action}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Status IA</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Online & Aprendendo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              Capacidades IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Análise Preditiva
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Otimização de Processos
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Insights Estratégicos
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Relatórios Inteligentes
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Automação Avançada
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};