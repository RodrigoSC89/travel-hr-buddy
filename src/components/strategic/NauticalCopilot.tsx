import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Anchor, 
  Compass, 
  Ship, 
  Waves, 
  Navigation,
  MessageSquare,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Settings,
  Lightbulb,
  Target,
  Activity,
  Send,
  Mic,
  MicOff,
  Brain,
  Sparkles,
  Globe,
  BarChart3
} from "lucide-react";

interface CopilotMessage {
  id: string;
  content: string;
  type: "user" | "assistant" | "suggestion";
  timestamp: Date;
  category?: "navigation" | "operations" | "hr" | "analytics" | "logistics";
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  category: "optimization" | "alert" | "insight" | "task";
  priority: "high" | "medium" | "low";
  icon: React.ElementType;
}

const NauticalCopilot: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<"chat" | "suggestions" | "insights">("chat");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const smartSuggestions: SmartSuggestion[] = [
    {
      id: "1",
      title: "Otimização de Rota Marítima",
      description: "Identifiquei uma rota 15% mais eficiente para o próximo embarque",
      action: "Ver Rota Sugerida",
      category: "optimization",
      priority: "high",
      icon: Navigation
    },
    {
      id: "2", 
      title: "Certificados Expirando",
      description: "3 tripulantes com certificações vencendo em 30 dias",
      action: "Gerenciar Certificados",
      category: "alert",
      priority: "high",
      icon: FileText
    },
    {
      id: "3",
      title: "Performance da Frota",
      description: "Eficiência aumentou 8% no último mês com IA preditiva",
      action: "Ver Relatório",
      category: "insight",
      priority: "medium",
      icon: TrendingUp
    },
    {
      id: "4",
      title: "Planejamento de Tripulação",
      description: "Sugestão automática de escala para próxima viagem",
      action: "Revisar Escala",
      category: "task",
      priority: "medium",
      icon: Users
    }
  ];

  const quickActions = [
    { icon: Ship, label: "Status da Frota", action: "fleet_status" },
    { icon: Users, label: "Tripulação", action: "crew_management" },
    { icon: BarChart3, label: "Relatórios", action: "reports" },
    { icon: Calendar, label: "Cronograma", action: "schedule" },
    { icon: Waves, label: "Condições Marítimas", action: "maritime_conditions" },
    { icon: Target, label: "Metas", action: "goals" }
  ];

  useEffect(() => {
    // Mensagem de boas-vindas
    setMessages([{
      id: "1",
      content: "Olá! Sou o Nautilus Copilot, seu assistente marítimo inteligente. Como posso ajudá-lo hoje? 🚢",
      type: "assistant",
      timestamp: new Date(),
      category: "navigation"
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: CopilotMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      type: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simular resposta inteligente
    setTimeout(() => {
      const response = generateIntelligentResponse(inputMessage);
      const assistantMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: "assistant",
        timestamp: new Date(),
        category: response.category
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateIntelligentResponse = (message: string): { content: string; category: CopilotMessage["category"] } => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("frota") || lowerMessage.includes("navio")) {
      return {
        content: "Analisando sua frota... Temos 8 embarcações ativas. A eficiência média está em 94%. Posso gerar um relatório detalhado ou sugerir otimizações específicas?",
        category: "operations"
      };
    } else if (lowerMessage.includes("tripula") || lowerMessage.includes("crew")) {
      return {
        content: "Verificando dados da tripulação... 47 tripulantes ativos, 3 certificações expirando em breve. Deseja que eu prepare automaticamente os renewals ou ajude com o planejamento de escalas?",
        category: "hr"
      };
    } else if (lowerMessage.includes("rota") || lowerMessage.includes("viagem")) {
      return {
        content: "Processando dados de rota... Com base nas condições atuais e histórico, identifiquei uma rota 12% mais eficiente. Também posso considerar fatores climáticos em tempo real.",
        category: "navigation"
      };
    } else if (lowerMessage.includes("relatório") || lowerMessage.includes("análise")) {
      return {
        content: "Gerando insights analíticos... Performance geral subiu 15% este mês. Os principais KPIs mostram tendência positiva. Posso criar relatórios personalizados por categoria.",
        category: "analytics"
      };
    } else {
      return {
        content: "Entendi sua solicitação. Como especialista marítimo, posso ajudar com gestão de frota, planejamento de tripulação, otimização de rotas e análise de performance. Em que área posso ser mais útil?",
        category: "navigation"
      };
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      fleet_status: "Mostrando status da frota: 8 embarcações ativas, 2 em manutenção, eficiência média 94%",
      crew_management: "Acessando gestão de tripulação: 47 tripulantes ativos, próxima rotação em 5 dias",
      reports: "Gerando relatórios inteligentes com IA: Performance mensal, otimizações sugeridas",
      schedule: "Verificando cronograma: 3 viagens agendadas, 1 em preparação",
      maritime_conditions: "Condições marítimas atuais: Mar calmo, visibilidade boa, ventos favoráveis",
      goals: "Status das metas: 87% das metas mensais atingidas, tendência positiva"
    };

    const message: CopilotMessage = {
      id: Date.now().toString(),
      content: actionMessages[action as keyof typeof actionMessages] || "Ação executada com sucesso!",
      type: "assistant",
      timestamp: new Date(),
      category: "operations"
    };

    setMessages(prev => [...prev, message]);
    toast({
      title: "Ação Executada",
      description: "Informações atualizadas pelo Copilot",
    });
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "Microfone Desligado" : "Microfone Ligado",
      description: isListening ? "Comando de voz desativado" : "Fale agora para enviar comando",
    });
  };

  const getCategoryIcon = (category?: CopilotMessage["category"]) => {
    switch (category) {
    case "navigation": return <Compass className="w-4 h-4 text-primary" />;
    case "operations": return <Ship className="w-4 h-4 text-success" />;
    case "hr": return <Users className="w-4 h-4 text-secondary" />;
    case "analytics": return <BarChart3 className="w-4 h-4 text-warning" />;
    case "logistics": return <Navigation className="w-4 h-4 text-info" />;
    default: return <Brain className="w-4 h-4 text-primary" />;
    }
  };

  const getSuggestionColor = (category: SmartSuggestion["category"]) => {
    switch (category) {
    case "optimization": return "border-l-primary bg-primary/5 dark:bg-primary/10";
    case "alert": return "border-l-destructive bg-destructive/5 dark:bg-destructive/10";
    case "insight": return "border-l-success bg-success/5 dark:bg-success/10";
    case "task": return "border-l-secondary bg-secondary/5 dark:bg-secondary/10";
    default: return "border-l-muted-foreground bg-muted/50";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Principal */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col bg-gradient-to-br from-card via-primary/5 to-nautical/5 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-nautical/20 animate-pulse">
                  <Anchor className="w-6 h-6 text-primary" />
                </div>
                <span className="font-display">Nautilus Copilot</span>
                <Badge variant="secondary" className="font-mono">
                  <Brain className="w-3 h-3 mr-1" />
                  IA Maritime
                </Badge>
              </CardTitle>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVoiceInput}
                  className={`${isListening ? "bg-red-500 text-azure-50" : ""}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              {["chat", "suggestions", "insights"].map((mode) => (
                <Button
                  key={mode}
                  variant={activeMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveMode(mode as any)}
                  className="capitalize"
                >
                  {mode === "chat" && <MessageSquare className="w-4 h-4 mr-1" />}
                  {mode === "suggestions" && <Lightbulb className="w-4 h-4 mr-1" />}
                  {mode === "insights" && <Activity className="w-4 h-4 mr-1" />}
                  {mode}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {activeMode === "chat" && (
              <>
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-gradient-to-br from-nautical/20 to-primary/20"
                          }`}>
                            {message.type === "user" ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              getCategoryIcon(message.category)
                            )}
                          </div>
                          
                          <div className={`rounded-2xl p-4 ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 backdrop-blur-sm"
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <span className="text-xs opacity-70 mt-2 block">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nautical/20 to-primary/20 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                        <div className="bg-muted/50 rounded-2xl p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            </div>
                            <span className="text-sm text-muted-foreground">Analisando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-6 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Digite sua pergunta sobre operações marítimas..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeMode === "suggestions" && (
              <div className="flex-1 p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Sugestões Inteligentes
                  </h3>
                  
                  {smartSuggestions.map((suggestion) => {
                    const Icon = suggestion.icon;
                    return (
                      <div
                        key={suggestion.id}
                        className={`p-4 border-l-4 rounded-xl ${getSuggestionColor(suggestion.category)} 
                          hover:scale-[1.02] transition-all duration-300 cursor-pointer backdrop-blur-sm`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-azure-100/50 dark:bg-azure-800/50">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{suggestion.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                              <Button size="sm" variant="outline">
                                {suggestion.action}
                              </Button>
                            </div>
                          </div>
                          <Badge variant={suggestion.priority === "high" ? "destructive" : "secondary"}>
                            {suggestion.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar de Ações Rápidas */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleQuickAction(action.action)}
                    className="h-auto flex-col gap-2 p-4 hover:scale-105 transition-transform"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs text-center">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-nautical/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-nautical" />
              Status Marítimo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Condições do Mar</span>
                <Badge variant="secondary" className="text-success">Favorável</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Frota Ativa</span>
                <Badge variant="outline">8/10 Navios</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Eficiência Geral</span>
                <Badge className="bg-success">94%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Próxima Manutenção</span>
                <Badge variant="outline">3 dias</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NauticalCopilot;