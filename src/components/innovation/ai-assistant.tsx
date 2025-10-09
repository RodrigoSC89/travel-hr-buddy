import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Brain,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: {
    label: string;
    action: string;
  }[];
}

interface Insight {
  id: string;
  type: "prediction" | "recommendation" | "alert" | "optimization";
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high";
  module: string;
  createdAt: Date;
}

const AIAssistant: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Olá! Sou seu assistente de IA para o sistema Nautilus One. Como posso ajudá-lo hoje?",
      timestamp: new Date(),
      suggestions: [
        "Analisar compliance das embarcações",
        "Gerar relatório de manutenção",
        "Verificar alertas críticos",
        "Otimizar rotas de navegação",
      ],
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: "1",
      type: "prediction",
      title: "Manutenção Preventiva Necessária",
      description: "Motor principal da embarcação A-001 necessitará manutenção em 7 dias",
      confidence: 92,
      priority: "high",
      module: "Frota",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "optimization",
      title: "Otimização de Rota Identificada",
      description: "Rota Santos-Rio pode ser otimizada economizando 12% de combustível",
      confidence: 87,
      priority: "medium",
      module: "Navegação",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "alert",
      title: "Certificação Próxima ao Vencimento",
      description: "3 certificados STCW vencem nos próximos 30 dias",
      confidence: 100,
      priority: "high",
      module: "Certificações",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsProcessing(true);

    // Simular processamento de IA
    setTimeout(() => {
      const responses = [
        {
          content:
            "Analisando seus dados... Encontrei algumas recomendações importantes para otimização da frota.",
          suggestions: ["Ver detalhes da análise", "Aplicar otimizações", "Agendar manutenções"],
        },
        {
          content:
            "Com base no histórico de navegação, posso sugerir rotas mais eficientes que reduzirão o consumo de combustível em até 15%.",
          suggestions: ["Calcular economia", "Aplicar nova rota", "Comparar alternativas"],
        },
        {
          content:
            "Identifiquei padrões nos dados de manutenção que indicam possíveis falhas futuras. Recomendo ação preventiva.",
          suggestions: ["Ver predições", "Agendar manutenção", "Configurar alertas"],
        },
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: randomResponse.content,
        timestamp: new Date(),
        suggestions: randomResponse.suggestions,
        actions: [
          { label: "Implementar", action: "implement" },
          { label: "Mais detalhes", action: "details" },
        ],
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Reconhecimento de Voz",
        description: "Fale agora... (recurso em desenvolvimento)",
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
    case "prediction":
      return <TrendingUp className="h-4 w-4" />;
    case "recommendation":
      return <Lightbulb className="h-4 w-4" />;
    case "alert":
      return <AlertCircle className="h-4 w-4" />;
    case "optimization":
      return <Zap className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high":
      return "text-red-600 bg-red-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
      return "text-green-600 bg-green-100";
    default:
      return "text-muted-foreground bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/20">
            <Bot className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Assistente IA Nautilus
            </h1>
            <p className="text-muted-foreground">
              Assistente inteligente para análise e otimização marítima
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Online
          </Badge>
          <Badge variant="outline">GPT-4 Turbo</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversa com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className="flex-shrink-0">
                          {message.type === "user" ? (
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div
                          className={`space-y-2 ${message.type === "user" ? "text-right" : "text-left"}`}
                        >
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === "user" ? "bg-blue-500 text-white" : "bg-muted"
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.suggestions && (
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">Processando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="mt-4 flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={e => setCurrentMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={e => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceToggle}
                  className={isListening ? "bg-red-100 text-red-600" : ""}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isProcessing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Insights Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map(insight => (
                  <div key={insight.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority === "high"
                          ? "Alta"
                          : insight.priority === "medium"
                            ? "Média"
                            : "Baixa"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{insight.module}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Confiança:</span>
                        <span className="font-medium">{insight.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {insight.createdAt.toLocaleDateString()} às{" "}
                      {insight.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Análise Preditiva
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Verificar Alertas
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Sugestões de Otimização
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Automações Disponíveis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
