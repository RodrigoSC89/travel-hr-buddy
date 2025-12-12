import { useEffect, useRef, useState, useCallback, useMemo } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Clock,
  Image,
  Volume2,
  VolumeX,
  History,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    type?: "action" | "suggestion" | "alert" | "diagnostic";
    actions?: Array<{ label: string; action: string }>;
    confidence?: number;
  };
}

interface ProactiveSuggestion {
  id: string;
  type: "maintenance" | "certification" | "risk" | "efficiency";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  action?: string;
}

export default function AdvancedCopilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize proactive suggestions
  useEffect(() => {
    loadProactiveSuggestions();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadProactiveSuggestions = async () => {
    // Simulated proactive suggestions - in production, these come from AI analysis
    setSuggestions([
      {
        id: "1",
        type: "maintenance",
        title: "Tendência de falha detectada",
        description: "Thruster 2 apresenta padrão de vibração similar a falhas anteriores. Recomendo inspeção em 48h.",
        priority: "high",
        action: "create_inspection_job",
      },
      {
        id: "2",
        type: "certification",
        title: "Certificação próxima ao vencimento",
        description: "Certificado STCW do 2º Engenheiro vence em 5 dias.",
        priority: "medium",
        action: "alert_hr",
      },
      {
        id: "3",
        type: "efficiency",
        title: "Oportunidade de economia",
        description: "Reduzir RPM em 2% durante standby pode economizar 15L/h de combustível.",
        priority: "low",
        action: "view_details",
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("mmi-advanced-copilot", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          prompt: input,
          context: {
            vessel: "DP2 Marítimo",
            systems: ["Propulsão", "DP", "Geração"],
          },
        },
      });

      if (error) {
        
        // Fallback: generate local response when edge function fails
        const fallbackResponse = generateLocalResponse(input);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fallbackResponse,
          timestamp: new Date(),
          metadata: { type: "suggestion" },
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        if (voiceEnabled) {
          speakResponse(fallbackResponse);
        }
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.response || data?.message || "Processando sua solicitação...",
        timestamp: new Date(),
        metadata: data?.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Text-to-speech for response
      if (voiceEnabled && data?.response) {
        speakResponse(data.response);
      }
    } catch (error) {
      console.error("Copilot error:", error);
      console.error("Copilot error:", error);
      
      // Fallback response when request fails completely
      const fallbackResponse = generateLocalResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
        metadata: { type: "suggestion" },
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (voiceEnabled) {
        speakResponse(fallbackResponse);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Local fallback response generator when AI is unavailable
  const generateLocalResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("job") || input.includes("criar") || input.includes("manutenção")) {
      return "Entendi que você precisa de suporte com manutenção. Para criar um novo job:\n\n1. Clique em \"Novo Plano\" no topo da página\n2. Preencha os dados do equipamento e tipo de manutenção\n3. Defina a prioridade e data programada\n\nPosso ajudar com mais alguma coisa?";
    }
    
    if (input.includes("vazamento") || input.includes("falha") || input.includes("problema")) {
      return "Para problemas técnicos como vazamentos ou falhas:\n\n**Ações Recomendadas:**\n1. Isole o sistema afetado se possível\n2. Documente com fotos e descrição detalhada\n3. Verifique o histórico de manutenções do equipamento\n4. Crie um job corretivo com prioridade alta\n\n**Próximos passos:** Acesse a aba \"Jobs\" para registrar o problema.";
    }
    
    if (input.includes("thruster") || input.includes("dp") || input.includes("posicionamento")) {
      return "Para questões de Posicionamento Dinâmico (DP):\n\n**Verificações importantes:**\n- Status dos thrusters\n- Sistemas de referência (DGNSS, HPR)\n- Power Management System\n- Redundância operacional\n\nConsulte o manual ISM ou entre em contato com o comandante para procedimentos específicos.";
    }
    
    if (input.includes("relatório") || input.includes("conformidade") || input.includes("auditoria")) {
      return "Para relatórios de conformidade:\n\n1. Acesse a aba \"Jobs\" para ver histórico de manutenções\n2. Use a aba \"Timeline\" para visão cronológica\n3. Exporte os dados pelo botão \"Exportar\"\n\nRelatórios detalhados incluem: taxa de conclusão, MTBF, MTTR e compliance com normas ISM/IMCA.";
    }
    
    if (input.includes("oi") || input.includes("olá") || input.includes("bom dia") || input.includes("boa tarde")) {
      return "Olá! Sou o Copilot de Manutenção Inteligente. Posso ajudar com:\n\n🔧 **Criar jobs** de manutenção\n🔍 **Diagnosticar** problemas técnicos\n📋 **Consultar procedimentos** ISM/IMCA\n📊 **Gerar relatórios** de conformidade\n\nComo posso ajudá-lo hoje?";
    }
    
    return `Entendi sua solicitação: "${userInput}"\n\nPosso ajudar com:\n- Criar jobs de manutenção preventiva/corretiva\n- Diagnosticar problemas em equipamentos\n- Consultar procedimentos técnicos\n- Verificar status de manutenções\n\nPor favor, descreva com mais detalhes o que você precisa.`;
  };

  const speakResponse = async (text: string) => {
    setIsSpeaking(true);
    try {
      // Use browser's speech synthesis as fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS error:", error);
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Não suportado",
        description: "Reconhecimento de voz não disponível neste navegador",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "pt-BR";

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onresult = (event: Event) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: unknown) => result[0].transcript)
        .join("");
      setInput(transcript);

      if (event.results[0].isFinal) {
        setInput(transcript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onerror = (event: unknown: unknown: unknown) => {
      setIsListening(false);
    });

    recognitionRef.current.start();
  });

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSuggestionAction = async (suggestion: ProactiveSuggestion) => {
    const actionMessages: Record<string, string> = {
      create_inspection_job: `Criar job de inspeção para: ${suggestion.title}`,
      alert_hr: `Enviar alerta ao RH sobre: ${suggestion.title}`,
      view_details: `Mostrar detalhes de: ${suggestion.title}`,
    };

    setInput(actionMessages[suggestion.action || "view_details"] || suggestion.description);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-destructive text-destructive-foreground";
    case "high":
      return "bg-orange-500 text-white";
    case "medium":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "maintenance":
      return <Wrench className="h-4 w-4" />;
    case "certification":
      return <Clock className="h-4 w-4" />;
    case "risk":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Main Chat */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Copilot Avançado MMI
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Multimodal
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSetVoiceEnabled}
                title={voiceEnabled ? "Desativar voz" : "Ativar voz"}
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" title="Histórico">
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Copilot de Manutenção Inteligente</p>
                  <p className="text-sm mt-2">
                    Descreva problemas, crie jobs por voz ou texto, e receba diagnósticos baseados em IA.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={handleSetInput}>
                      "Criar job urgente..."
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={handleSetInput}>
                      "Procedimento blackout..."
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={handleSetInput}>
                      "Relatório conformidade..."
                    </Badge>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.metadata?.actions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.metadata.actions.map((action, i) => (
                          <Button key={i} size="sm" variant="secondary">
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Textarea
              placeholder="Descreva o problema ou comando... (voz ou texto)"
              value={input}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              className="resize-none"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" title="Enviar imagem">
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isListening && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-pulse">●</span>
              Ouvindo... Fale agora
            </div>
          )}

          {isSpeaking && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Volume2 className="h-4 w-4 animate-pulse" />
              Falando...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proactive Suggestions Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-warning" />
            Sugestões Proativas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma sugestão no momento
            </p>
          ) : (
            suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handlehandleSuggestionAction}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded ${getPriorityColor(suggestion.priority)}`}>
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 A IA analisa continuamente dados de sensores, certificações e histórico para antecipar problemas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
