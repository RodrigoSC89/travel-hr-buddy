import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  Brain, 
  Sparkles, 
  Star, 
  Zap, 
  MessageCircle,
  Search,
  FileText,
  BarChart3,
  Settings,
  Crown,
  Globe,
  Shield,
  Target,
  Activity,
  CheckCircle,
  TrendingUp,
  Camera,
  Upload,
  Download,
  Clock,
  AlertCircle,
  Info,
  HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  category?: "general" | "analysis" | "prediction" | "recommendation" | "voice" | "image";
  confidence?: number;
  sources?: string[];
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  active: boolean;
  shortcut: string;
  tooltip: string;
}

const EnhancedAIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<string>("general");
  const [isLoaded, setIsLoaded] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    setVoiceSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
    
    // Mensagem de boas-vindas com delay para efeito visual
    setTimeout(() => {
      setMessages([
        {
          id: "welcome",
          type: "ai",
          content: "🌊 Olá! Sou o Assistente IA do Nautilus One, seu companheiro inteligente para operações marítimas. Como posso ajudá-lo hoje? \n\n💡 **Dicas rápidas:**\n• Use comandos de voz clicando no 🎙️\n• Envie imagens para análise\n• Digite \"/\" para ver comandos especiais\n• Pressione Tab para navegar rapidamente",
          timestamp: new Date(),
          category: "general",
          confidence: 100
        }
      ]);
    }, 500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Suporte a teclas de atalho
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
        case "k":
          e.preventDefault();
          inputRef.current?.focus();
          break;
        case "Enter":
          e.preventDefault();
          handleSendMessage();
          break;
        }
      }
      if (e.key === "Escape") {
        setIsVoiceActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputMessage]);

  const aiCapabilities: AICapability[] = [
    {
      id: "general",
      name: "Assistente Geral",
      description: "Perguntas gerais e navegação do sistema",
      icon: MessageCircle,
      color: "primary",
      active: true,
      shortcut: "Ctrl+1",
      tooltip: "Assistência geral com navegação e funcionalidades do sistema"
    },
    {
      id: "analysis",
      name: "Análise de Dados",
      description: "Análise profunda de métricas e KPIs",
      icon: BarChart3,
      color: "info",
      active: true,
      shortcut: "Ctrl+2",
      tooltip: "Análise avançada de dados operacionais e relatórios inteligentes"
    },
    {
      id: "prediction",
      name: "IA Preditiva",
      description: "Previsões baseadas em machine learning",
      icon: Brain,
      color: "success",
      active: true,
      shortcut: "Ctrl+3",
      tooltip: "Previsões e tendências baseadas em algoritmos avançados"
    },
    {
      id: "recommendation",
      name: "Recomendações",
      description: "Sugestões inteligentes e otimizações",
      icon: Target,
      color: "warning",
      active: true,
      shortcut: "Ctrl+4",
      tooltip: "Recomendações personalizadas para otimização operacional"
    },
    {
      id: "voice",
      name: "Comando de Voz",
      description: "Interação por voz em tempo real",
      icon: Mic,
      color: "secondary",
      active: voiceSupported,
      shortcut: "Espaço",
      tooltip: "Controle por comandos de voz para operação hands-free"
    },
    {
      id: "image",
      name: "Análise Visual",
      description: "Processamento de imagens e documentos",
      icon: Camera,
      color: "accent",
      active: true,
      shortcut: "Ctrl+U",
      tooltip: "Análise inteligente de imagens, documentos e capturas de tela"
    }
  ];

  const quickCommands = [
    { text: "📊 Mostrar dashboard de performance", category: "analysis", icon: BarChart3 },
    { text: "🔮 Previsão de demanda para próximo mês", category: "prediction", icon: TrendingUp },
    { text: "⚡ Como otimizar workflow de checklists?", category: "recommendation", icon: Zap },
    { text: "📋 Relatório de conformidade PEOTRAM", category: "analysis", icon: FileText },
    { text: "🌊 Tendências de operações marítimas", category: "prediction", icon: Activity },
    { text: "💡 Sugestões para reduzir custos operacionais", category: "recommendation", icon: Target },
    { text: "🚢 Status atual da frota", category: "general", icon: Info },
    { text: "📈 Análise de KPIs em tempo real", category: "analysis", icon: TrendingUp }
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

    // Simular processamento da IA com feedback visual
    setTimeout(() => {
      const aiResponse = generateEnhancedAIResponse(inputMessage, selectedCapability);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
        category: selectedCapability as unknown,
        confidence: aiResponse.confidence,
        sources: aiResponse.sources
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, Math.random() * 1000 + 1500); // Variação realística no tempo de resposta
  };

  const generateEnhancedAIResponse = (input: string, capability: string) => {
    const responses = {
      general: {
        content: `🌊 **Nautilus One Analysis**\n\nBaseado na sua consulta "${input}", identifiquei informações relevantes no sistema:\n\n✅ **Status Operacional**: Todos os módulos funcionando normalmente\n📊 **Métricas Atuais**: Performance acima da média (94.2%)\n🔄 **Última Sincronização**: Dados atualizados há 2 minutos\n\n💡 **Sugestão**: Quer que eu detalhe algum aspecto específico?`,
        confidence: 92,
        sources: ["Sistema Nautilus One", "Base de Conhecimento", "Logs Operacionais"]
      },
      analysis: {
        content: `📊 **Análise Detalhada Concluída**\n\nProcessei ${Math.floor(Math.random() * 5000 + 1000)} pontos de dados relacionados à sua consulta:\n\n📈 **Tendências Identificadas**:\n• Crescimento de 18% nas métricas principais\n• Eficiência operacional em 94.7%\n• 3 oportunidades de otimização detectadas\n\n🎯 **Insights Principais**:\n• Performance superior à média do setor\n• Padrão sazonal identificado nos dados\n• Recomendo revisão dos processos do Módulo B\n\n🔍 **Próximos Passos**: Implementar as otimizações sugeridas pode resultar em 12% de melhoria adicional.`,
        confidence: 96,
        sources: ["Analytics Engine", "Historical Data", "Benchmarking DB"]
      },
      prediction: {
        content: `🔮 **Previsão Avançada - Modelo ML v3.2**\n\nAnálise preditiva baseada em ${Math.floor(Math.random() * 50 + 20)} variáveis:\n\n📊 **Previsões para próximos 30 dias**:\n• Probabilidade de 87% de atingir metas estabelecidas\n• Aumento previsto de 23% na demanda\n• Otimização de recursos pode economizar R$ 45.000\n\n⚠️ **Alertas Preditivos**:\n• Possível pico de demanda na semana 3\n• Manutenção preventiva recomendada para 2 equipamentos\n• Ajuste de equipe sugerido para período de alta\n\n🎯 **Confiança do Modelo**: ${90 + Math.floor(Math.random() * 8)}% (baseado em histórico de 24 meses)`,
        confidence: 94,
        sources: ["ML Model v3.2", "Predictive Analytics", "Historical Patterns"]
      },
      recommendation: {
        content: `💡 **Recomendações Inteligentes**\n\nCom base na análise da sua solicitação, identifiquei ${Math.floor(Math.random() * 8 + 3)} oportunidades:\n\n🚀 **Implementação Imediata** (ROI: 2-4 semanas):\n• Automatizar aprovações no módulo de checklists\n• Otimizar roteamento de notificações\n• Implementar cache inteligente de dados\n\n⭐ **Melhorias Estratégicas** (ROI: 2-3 meses):\n• Integração com APIs externas para dados meteorológicos\n• Dashboard preditivo personalizado\n• Sistema de alertas proativos\n\n🎯 **Impacto Estimado**:\n• ⬆️ 28% de eficiência operacional\n• ⬇️ 15% de redução de custos\n• ⬆️ 35% de satisfação da equipe\n\n📋 **Plano de Ação**: Quer que eu detalhe a implementação de alguma recomendação específica?`,
        confidence: 91,
        sources: ["Best Practices DB", "Industry Benchmarks", "Optimization Engine"]
      },
      voice: {
        content: `🎙️ **Comando de Voz Processado**\n\nReconheci sua solicitação por voz com precisão de ${95 + Math.floor(Math.random() * 5)}%:\n\n✅ **Comando Interpretado**: "${input}"\n🔄 **Ação Executada**: Processamento em andamento\n📊 **Contexto Detectado**: ${selectedCapability}\n\n🗣️ **Dica**: Para melhor reconhecimento, fale claramente e evite ruídos de fundo.\n\n💬 **Resposta**: Processando sua solicitação via comando de voz...`,
        confidence: 88,
        sources: ["Speech Recognition API", "Voice Processing Engine", "Context Analyzer"]
      },
      image: {
        content: `📸 **Análise Visual Completa**\n\nProcessei a imagem/documento enviado:\n\n🔍 **Elementos Detectados**:\n• Formato: ${["PDF", "JPG", "PNG", "DOC"][Math.floor(Math.random() * 4)]}\n• Qualidade: ${85 + Math.floor(Math.random() * 15)}%\n• Texto extraído: ${Math.floor(Math.random() * 500 + 100)} caracteres\n• Objetos identificados: ${Math.floor(Math.random() * 10 + 3)}\n\n📋 **Informações Extraídas**:\n• Tipo de documento: Operacional\n• Data identificada: ${new Date().toLocaleDateString("pt-BR")}\n• Status de conformidade: ✅ Aprovado\n\n🔄 **Processamento OCR**: Texto convertido e indexado para busca.\n\n💡 **Sugestão**: Documento processado com sucesso. Posso ajudar com análise específica do conteúdo?`,
        confidence: 89,
        sources: ["OCR Engine", "Image Recognition API", "Document Parser"]
      }
    };

    return responses[capability as keyof typeof responses] || responses.general;
  };

  const handleVoiceToggle = () => {
    if (!voiceSupported) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: "ai",
        content: "❌ **Comando de Voz Não Suportado**\n\nSeu navegador não suporta reconhecimento de voz. Recomendo usar Chrome, Edge ou Firefox atualizado.",
        timestamp: new Date(),
        category: "general"
      }]);
      return;
    }

    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Simular reconhecimento de voz
      setTimeout(() => {
        const voiceCommands = [
          "Mostrar status da frota",
          "Gerar relatório de performance",
          "Como está o clima para navegação?",
          "Verificar conformidade PEOTRAM",
          "Mostrar alertas pendentes"
        ];
        const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
        setInputMessage(randomCommand);
        setSelectedCapability("voice");
        setIsVoiceActive(false);
      }, 3000);
    }
  };

  const handleQuickCommand = (command: string, category: string) => {
    setInputMessage(command);
    setSelectedCapability(category);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedCapability("image");
      setInputMessage(`📎 Arquivo enviado: ${file.name}`);
      setTimeout(() => {
        handleSendMessage();
      }, 500);
    }
  };

  const getCapabilityColor = (capability: AICapability) => {
    return selectedCapability === capability.id ? capability.color : "muted";
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto p-6 space-y-8">
          {/* Enhanced Hero Section */}
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-glow p-8 text-primary-foreground 
            transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}>
            
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-mesh opacity-20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-success/15 to-transparent rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm animate-pulse-glow">
                  <Bot className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                    IA Assistant Nautilus One
                  </h1>
                  <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                    Assistente inteligente revolucionário
                    <Crown className="inline-block w-6 h-6 ml-2 text-warning animate-bounce" />
                  </p>
                </div>
              </div>
              
              <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
                Sistema de IA mais avançado para operações marítimas com processamento de linguagem natural, 
                análise preditiva e automação completa.
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
                  <Shield className="h-5 w-5 animate-pulse" />
                  <span className="font-semibold">Segurança Máxima</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Capabilities Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {aiCapabilities.map((capability, index) => (
              <Tooltip key={capability.id}>
                <TooltipTrigger asChild>
                  <Card 
                    className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl
                      ${selectedCapability === capability.id ? "ring-2 ring-primary shadow-primary/25 bg-primary/5" : ""}
                      ${capability.active ? "opacity-100" : "opacity-50 cursor-not-allowed"}
                      bg-gradient-to-br from-card via-card/95 to-${capability.color}/5 border-${capability.color}/20 hover:border-${capability.color}/40`}
                    onClick={() => capability.active && setSelectedCapability(capability.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                      <div className={`p-3 rounded-xl bg-${capability.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                        <capability.icon className={`w-5 h-5 text-${capability.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{capability.name}</p>
                        <p className="text-xs text-muted-foreground hidden lg:block">{capability.shortcut}</p>
                      </div>
                      {!capability.active && (
                        <Badge variant="secondary" className="text-xs">Em breve</Badge>
                      )}
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{capability.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Enhanced Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50 h-[700px] flex flex-col">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-gradient">Chat Inteligente</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <Star className="w-6 h-6 text-warning animate-pulse" />
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Converse com a IA mais avançada do mundo marítimo
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Online
                    </Badge>
                    <Badge variant="outline" className={`bg-${getCapabilityColor(aiCapabilities.find(c => c.id === selectedCapability)!)}/10 text-${getCapabilityColor(aiCapabilities.find(c => c.id === selectedCapability)!)} border-${getCapabilityColor(aiCapabilities.find(c => c.id === selectedCapability)!)}/30`}>
                      {aiCapabilities.find(c => c.id === selectedCapability)?.name}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6" role="log" aria-live="polite" aria-label="Conversa com assistente IA">
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-4 animate-fade-in ${
                            message.type === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
                            message.type === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-gradient-to-br from-success/20 to-success/10 border border-success/30"
                          }`}>
                            {message.type === "user" ? (
                              <User className="w-5 h-5" />
                            ) : (
                              <Bot className="w-5 h-5 text-success" />
                            )}
                          </div>
                          <div className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-card border border-border/50"
                          }`}>
                            <div className="space-y-2">
                              <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {message.content}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs opacity-70">
                                <span>{message.timestamp.toLocaleTimeString("pt-BR")}</span>
                                {message.confidence && (
                                  <div className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>{message.confidence}% confiança</span>
                                  </div>
                                )}
                              </div>
                              
                              {message.sources && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {message.sources.map((source, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isProcessing && (
                        <div className="flex items-start gap-4 animate-fade-in">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/10 border border-success/30">
                            <Bot className="w-5 h-5 text-success animate-pulse" />
                          </div>
                          <div className="bg-card border border-border/50 shadow-lg px-6 py-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                              </div>
                              <span className="text-sm text-muted-foreground">IA processando sua solicitação...</span>
                              <Sparkles className="w-4 h-4 text-primary animate-spin" />
                            </div>
                            <Progress value={(Date.now() % 100)} className="mt-2 h-1" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Enhanced Input Area */}
                  <div className="border-t border-border/50 p-6 space-y-4 bg-background/50 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Digite sua pergunta... (Ctrl+K para focar, Ctrl+Enter para enviar)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="bg-background/80 backdrop-blur-sm border-2 focus:ring-2 transition-all duration-300 pr-20"
                          aria-label="Digite sua mensagem para o assistente IA"
                          disabled={isProcessing}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 w-8 p-0"
                                aria-label="Enviar arquivo"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enviar arquivo (Ctrl+U)</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleVoiceToggle}
                                variant={isVoiceActive ? "destructive" : "outline"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={!voiceSupported}
                                aria-label={isVoiceActive ? "Parar gravação de voz" : "Iniciar comando de voz"}
                              >
                                {isVoiceActive ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{voiceSupported ? (isVoiceActive ? "Parar gravação (Esc)" : "Comando de voz (Espaço)") : "Navegador não suporta voz"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isProcessing}
                            className="shrink-0 transition-all duration-300 hover:scale-105"
                            aria-label="Enviar mensagem"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enviar mensagem (Ctrl+Enter)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      aria-hidden="true"
                    />
                    
                    {isVoiceActive && (
                      <div className="text-center py-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                          🎙️ Ouvindo... Fale agora!
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Pressione Esc para cancelar</p>
                      </div>
                    )}

                    {/* Voice feedback */}
                    {!voiceSupported && (
                      <div className="text-center py-2 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="flex items-center justify-center gap-2 text-warning text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Comando de voz não suportado neste navegador
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Quick Commands */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-warning" />
                    Comandos Rápidos
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Clique para executar ações comuns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ScrollArea className="h-64">
                    {quickCommands.map((command, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-left justify-start h-auto py-3 px-3 hover:bg-primary/5 group transition-all duration-300"
                            onClick={() => handleQuickCommand(command.text, command.category)}
                          >
                            <command.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs leading-relaxed">{command.text}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Executar comando: {command.category}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* AI Status */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-info/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-info" />
                    Status da IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processamento</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Otimizado
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Modelo</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        GPT-4 Turbo
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Latência</span>
                      <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                        <Clock className="w-3 h-3 mr-1" />
                        ~150ms
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confiabilidade</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        99.9%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Performance</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Help & Tips */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-secondary/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="w-5 h-5 text-secondary" />
                    Dicas & Atalhos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Ctrl+K</Badge>
                      <span>Focar na caixa de texto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Ctrl+Enter</Badge>
                      <span>Enviar mensagem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Ctrl+U</Badge>
                      <span>Enviar arquivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Tab</Badge>
                      <span>Navegar elementos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Esc</Badge>
                      <span>Parar comando de voz</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      💡 Use "/" no início da mensagem para comandos especiais
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedAIChatbot;