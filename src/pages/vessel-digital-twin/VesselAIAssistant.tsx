/**
 * Vessel AI Assistant Component
 * Specialized AI with access to all vessel data, manuals, and diagnostics
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  BookOpen,
  Wrench,
  AlertTriangle,
  FileSearch,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  History,
  Settings,
  Lightbulb,
  Ship,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVesselDigitalTwin } from "@/hooks/use-vessel-digital-twin";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  sources?: {
    type: "manual" | "history" | "sensor" | "part";
    title: string;
    reference?: string;
  }[];
  confidence?: number;
}

interface VesselAIAssistantProps {
  vesselId: string;
}

const quickActions = [
  {
    id: "diagnostics",
    label: "Diagnóstico",
    icon: Wrench,
    prompt: "Faça um diagnóstico completo do estado atual da embarcação"
  },
  {
    id: "maintenance",
    label: "Manutenção",
    icon: Settings,
    prompt: "Quais são as próximas manutenções programadas e recomendações?"
  },
  {
    id: "manuals",
    label: "Manuais",
    icon: BookOpen,
    prompt: "Quais manuais técnicos estão disponíveis para consulta?"
  },
  {
    id: "alerts",
    label: "Alertas",
    icon: AlertTriangle,
    prompt: "Existem alertas ou avisos importantes que preciso saber?"
  }
];

const suggestedQuestions = [
  "Como faço a manutenção preventiva do motor principal?",
  "Qual o procedimento de emergência para fogo na praça de máquinas?",
  "Quando foi a última inspeção do sistema de salvatagem?",
  "Quais certificados vencem nos próximos 30 dias?",
  "Como interpretar os dados dos sensores de vibração?"
];

export default function VesselAIAssistant({ vesselId }: VesselAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá! Sou o assistente IA especializado nesta embarcação. Tenho acesso a:

• **Especificações técnicas** completas
• **Manuais** com busca inteligente (OCR)
• **Histórico** de manutenções e eventos
• **Dados de sensores** em tempo real
• **Catálogo de partes** e sobressalentes
• **Regulamentações** marítimas (IMO, SOLAS, MLC)

Como posso ajudar você hoje?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const vesselDigitalTwin = useVesselDigitalTwin(vesselId);
  const vesselData = vesselDigitalTwin.vessel;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build context from vessel data
      const context = {
        vesselId,
        vesselName: vesselData?.name || "Embarcação",
        specifications: vesselDigitalTwin.specifications || {},
        recentHistory: [],
        activeSensors: []
      };

      // Call vessel AI edge function
      const { data, error } = await supabase.functions.invoke("vessel-ai-assistant", {
        body: {
          question: messageText,
          context,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || data.answer || "Desculpe, não consegui processar sua pergunta.",
        timestamp: new Date(),
        sources: data.sources,
        confidence: data.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Store conversation - using correct column names from database
      await (supabase as any).from("vessel_ai_conversations").insert({
        vessel_id: vesselId,
        title: messageText.substring(0, 100),
        context: {
          user_message: messageText,
          ai_response: assistantMessage.content,
          sources_used: data.sources,
          confidence_score: data.confidence
        }
      });

    } catch (error) {
      console.error("AI error:", error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Desculpe, estou com dificuldades para processar sua pergunta no momento. 

Aqui estão algumas sugestões:
- Tente reformular a pergunta
- Verifique sua conexão
- Consulte os manuais diretamente na aba "Manuais"

Se o problema persistir, entre em contato com o suporte técnico.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [vesselId, vesselData, vesselDigitalTwin.specifications, messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      toast.info("Reconhecimento de voz desativado");
    } else {
      setIsListening(true);
      toast.info("Fale sua pergunta...");
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência");
  };

  const clearChat = () => {
    setMessages([messages[0]]);
    toast.info("Conversa limpa");
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Assistente IA da Embarcação
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              GPT-4o
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
          {/* Quick Actions */}
          <div className="px-6 py-3 border-b">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isLoading}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 px-6">
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">
                          {line.startsWith('•') ? (
                            <span dangerouslySetInnerHTML={{ 
                              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                            }} />
                          ) : (
                            line
                          )}
                        </p>
                      ))}
                    </div>
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">
                          Fontes consultadas:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {source.type === "manual" && <BookOpen className="h-3 w-3 mr-1" />}
                              {source.type === "history" && <History className="h-3 w-3 mr-1" />}
                              {source.type === "sensor" && <Settings className="h-3 w-3 mr-1" />}
                              {source.type === "part" && <Wrench className="h-3 w-3 mr-1" />}
                              {source.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Confidence */}
                    {message.confidence && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3" />
                        Confiança: {Math.round(message.confidence * 100)}%
                      </div>
                    )}
                    
                    {/* Actions for assistant messages */}
                    {message.role === "assistant" && message.id !== "welcome" && (
                      <div className="mt-2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Ship className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Analisando...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Suggested Questions */}
          {messages.length <= 2 && (
            <div className="px-6 py-3 border-t">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Perguntas sugeridas
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 3).map((question, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs justify-start"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Button
                type="button"
                variant={isListening ? "default" : "outline"}
                size="icon"
                onClick={toggleVoice}
                className={isListening ? "animate-pulse" : ""}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre a embarcação..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="flex-1 m-0 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Busca Inteligente em Manuais</h3>
              <p className="text-sm text-muted-foreground">
                Pesquise em todos os manuais técnicos da embarcação com IA.
              </p>
            </div>
            <Input placeholder="Buscar nos manuais..." />
            <div className="text-center py-8 text-muted-foreground">
              <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Digite sua busca para encontrar procedimentos, especificações e informações técnicas.</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 m-0 p-6">
          <div className="space-y-4">
            <h3 className="font-medium">Conversas Anteriores</h3>
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Suas conversas anteriores aparecerão aqui.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
