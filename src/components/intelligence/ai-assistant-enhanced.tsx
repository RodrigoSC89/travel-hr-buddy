import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Star, 
  TrendingUp, 
  Shield, 
  Zap, 
  Clock,
  BarChart3,
  FileText,
  Search,
  Settings,
  Globe,
  Heart,
  Crown,
  Diamond
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  category?: "general" | "analysis" | "prediction" | "recommendation";
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  active: boolean;
}

const AIAssistantEnhanced: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<string>("general");
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    // Mensagem de boas-vindas
    setMessages([
      {
        id: "welcome",
        type: "ai",
        content: "Olá! Sou seu assistente de IA avançado do Nautilus One. Como posso ajudá-lo hoje? Posso analisar dados, fazer previsões, dar recomendações e muito mais!",
        timestamp: new Date(),
        category: "general"
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const aiCapabilities: AICapability[] = [
    {
      id: "general",
      name: "Assistente Geral",
      description: "Perguntas gerais e navegação do sistema",
      icon: MessageCircle,
      color: "primary",
      active: true
    },
    {
      id: "analysis",
      name: "Análise de Dados",
      description: "Análise profunda de métricas e KPIs",
      icon: BarChart3,
      color: "info",
      active: true
    },
    {
      id: "prediction",
      name: "IA Preditiva",
      description: "Previsões baseadas em machine learning",
      icon: Brain,
      color: "success",
      active: true
    },
    {
      id: "recommendation",
      name: "Recomendações",
      description: "Sugestões inteligentes e otimizações",
      icon: Star,
      color: "warning",
      active: true
    }
  ];

  const quickActions = [
    { text: "Analise o desempenho da equipe", category: "analysis" },
    { text: "Previsão de demanda para próximo mês", category: "prediction" },
    { text: "Como otimizar o workflow de checklists?", category: "recommendation" },
    { text: "Relatório de conformidade PEOTRAM", category: "analysis" },
    { text: "Tendências de viagens corporativas", category: "prediction" },
    { text: "Sugestões para reduzir custos", category: "recommendation" }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      category: selectedCapability as any
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    // Simular processamento da IA
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, selectedCapability);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
        category: selectedCapability as any
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateAIResponse = (input: string, capability: string): string => {
    const responses = {
      general: [
        "Entendi sua pergunta. Com base nos dados do sistema Nautilus One, posso fornecer informações detalhadas sobre esse tópico.",
        "Excelente pergunta! O sistema possui recursos avançados para isso. Vou analisar as informações disponíveis.",
        "Baseado na sua consulta, posso ajudar com análises específicas e recomendações personalizadas."
      ],
      analysis: [
        "Analisando os dados... Identifiquei padrões interessantes nos últimos 30 dias. A performance geral está 12% acima da média.",
        "Com base na análise de dados históricos, observo uma tendência de crescimento sustentável em 85% dos indicadores.",
        "Os dados mostram eficiência operacional de 94%, com oportunidades de melhoria em processos de aprovação."
      ],
      prediction: [
        "Usando algoritmos de machine learning, prevejo um aumento de 18% na demanda para o próximo trimestre.",
        "As previsões indicam uma probabilidade de 87% de atingimento das metas estabelecidas, com base em tendências atuais.",
        "Modelo preditivo sugere otimização de recursos em 23% se implementadas as recomendações propostas."
      ],
      recommendation: [
        "Recomendo implementar automação em 3 processos chave que resultará em economia de 35% do tempo.",
        "Sugiro ajustes na estratégia atual que podem aumentar a eficiência em 28% e reduzir custos em 15%.",
        "Baseado na análise, recomendo priorizar a otimização do workflow de aprovações para melhor performance."
      ]
    };

    const categoryResponses = responses[capability as keyof typeof responses] || responses.general;
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Simular reconhecimento de voz
      setTimeout(() => {
        setInputMessage("Como está o desempenho das operações hoje?");
        setIsVoiceActive(false);
      }, 3000);
    }
  };

  const handleQuickAction = (action: string, category: string) => {
    setInputMessage(action);
    setSelectedCapability(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-8">
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-glow p-8 text-primary-foreground 
          transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-success/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm animate-pulse-glow">
                <Brain className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  Assistente IA Avançado
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Inteligência artificial revolucionária
                  <Crown className="inline-block w-6 h-6 ml-2 text-warning animate-bounce" />
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Assistente de IA mais avançado do mercado com análise preditiva, processamento de linguagem natural 
              e capacidades de automação extraordinárias.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-success shadow-lg border border-success/30">
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Machine Learning</span>
              </div>
              <div className="flex items-center gap-2 bg-info/90 text-info-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-info shadow-lg border border-info/30">
                <Globe className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Processamento Natural</span>
              </div>
              <div className="flex items-center gap-2 bg-warning/90 text-warning-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-warning shadow-lg border border-warning/30">
                <Diamond className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Análise Preditiva</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {aiCapabilities.map((capability, index) => (
            <Card 
              key={capability.id} 
              className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl
                ${selectedCapability === capability.id ? "ring-2 ring-primary shadow-primary/25" : ""}
                bg-gradient-to-br from-card via-card/95 to-${capability.color}/5 border-${capability.color}/20 hover:border-${capability.color}/40`}
              onClick={() => setSelectedCapability(capability.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-${capability.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                  <capability.icon className={`w-6 h-6 text-${capability.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{capability.name}</p>
                  <p className="text-xs text-muted-foreground">{capability.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-gradient">Chat Inteligente</span>
                  <Star className="w-6 h-6 text-warning animate-pulse" />
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Converse com a IA mais avançada
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Online
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Modo {aiCapabilities.find(c => c.id === selectedCapability)?.name}
                  </Badge>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.type === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${
                          message.type === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-gradient-to-br from-success/20 to-success/10 border border-success/30"
                        }`}>
                          {message.type === "user" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4 text-success" />
                          )}
                        </div>
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-card border border-border shadow-sm"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {isProcessing && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-success/20 to-success/10 border border-success/30">
                          <Bot className="w-4 h-4 text-success animate-pulse" />
                        </div>
                        <div className="bg-card border border-border shadow-sm px-4 py-3 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                            <span className="text-sm text-muted-foreground ml-2">IA processando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input Area */}
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Digite sua pergunta para a IA..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="bg-background/50 backdrop-blur-sm"
                      />
                    </div>
                    <Button
                      onClick={handleVoiceToggle}
                      variant={isVoiceActive ? "destructive" : "outline"}
                      size="icon"
                      className="shrink-0"
                    >
                      {isVoiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isProcessing}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isVoiceActive && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        Ouvindo...
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-warning" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-3 px-3 hover:bg-primary/5"
                    onClick={() => handleQuickAction(action.text, action.category)}
                  >
                    <span className="text-xs leading-relaxed">{action.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card via-card/95 to-info/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-info" />
                  Status da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processamento</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Otimizado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Modelo</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    GPT-4 Turbo
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Latência</span>
                  <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                    <Clock className="w-3 h-3 mr-1" />
                    150ms
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantEnhanced;