/**
 * M010 - Voice-to-Agent Interface
 * Voice command processing with Web Speech API + Agent routing
 */
import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX, Bot, Brain, Loader2, Send, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentId?: string;
  timestamp: Date;
  isVoice: boolean;
}

const AGENT_LABELS: Record<string, { name: string; color: string }> = {
  "nauti-brain": { name: "Nauti Brain", color: "bg-primary/20 text-primary" },
  "captain-ai": { name: "Captain AI", color: "bg-info/20 text-info" },
  "maintenance-ai": { name: "Engineer AI", color: "bg-warning/20 text-warning" },
  "compliance-chief": { name: "Compliance", color: "bg-success/20 text-success" },
  "crew-ai": { name: "People AI", color: "bg-secondary/20 text-secondary-foreground" },
  "finance-ai": { name: "Finance AI", color: "bg-warning/20 text-warning" },
  "esg-ai": { name: "ESG AI", color: "bg-success/20 text-success" },
};

function classifyIntent(text: string): string {
  const lower = text.toLowerCase();
  if (/frota|fleet|navio|vessel|status geral/i.test(lower)) return "captain-ai";
  if (/manutenção|maintenance|equipamento|equipment|falha|failure/i.test(lower)) return "maintenance-ai";
  if (/compliance|auditoria|audit|certificado|certificate|ism|isps|solas|marpol|mlc|stcw/i.test(lower)) return "compliance-chief";
  if (/tripulação|crew|escala|schedule|fadiga|fatigue|treinamento|training/i.test(lower)) return "crew-ai";
  if (/financeiro|financial|budget|custo|cost|invoice|fatura/i.test(lower)) return "finance-ai";
  if (/emissão|emission|cii|carbono|carbon|esg|sustentabilidade/i.test(lower)) return "esg-ai";
  return "nauti-brain";
}

export const VoiceAgentInterface: React.FC = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SpeechRecognition is non-standard browser API
  const recognitionRef = useRef<ReturnType<typeof Object> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const processMessage = useCallback(async (content: string, isVoice: boolean) => {
    const agentId = classifyIntent(content);
    const userMsg: VoiceMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      isVoice,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            ...messages.filter(m => m.role !== "user" || messages.indexOf(m) > messages.length - 6).map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content },
          ],
          agentId,
        },
      });

      if (error) throw error;

      const responseText = typeof data === "string"
        ? data
        : data?.choices?.[0]?.message?.content || data?.result || "Desculpe, não consegui processar sua solicitação.";

      const assistantMsg: VoiceMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseText,
        agentId,
        timestamp: new Date(),
        isVoice: false,
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (isVoice) {
        speak(responseText.substring(0, 500));
      }
    } catch (err) {
      logger.error("Voice agent error", err as Error);
      toast.error("Erro ao processar comando de voz");
      const errorMsg: VoiceMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Tente novamente.",
        agentId: "nauti-brain",
        timestamp: new Date(),
        isVoice: false,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, speak]);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Web Speech API not in standard TS types
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Reconhecimento de voz não suportado");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      processMessage(transcript, true);
    };

    recognition.onerror = (event: { error: string }) => {
      logger.error("Speech recognition error: " + event.error);
      setIsListening(false);
      if (event.error !== "aborted") {
        toast.error("Erro no reconhecimento de voz");
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [processMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    processMessage(textInput.trim(), false);
    setTextInput("");
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            Voice Agent Interface
            <Badge variant="outline" className="text-xs">M010</Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? "Desativar TTS" : "Ativar TTS"}
            >
              {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Messages */}
        <ScrollArea className="h-[260px] rounded-lg border bg-muted/30 p-3">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm text-center gap-2">
                <Waves className="h-8 w-8 opacity-50" />
                <p>Fale ou digite um comando para os agentes de IA</p>
                <p className="text-xs opacity-70">
                  Exemplo: "Qual o status de compliance da frota?"
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1 max-w-[85%]",
                  msg.role === "user" ? "ml-auto items-end" : "items-start"
                )}
              >
                {msg.role === "assistant" && msg.agentId && (
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", AGENT_LABELS[msg.agentId]?.color)}
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    {AGENT_LABELS[msg.agentId]?.name || msg.agentId}
                  </Badge>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.isVoice && msg.role === "user" && (
                    <Mic className="h-3 w-3 inline mr-1 opacity-70" />
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={isListening ? "destructive" : "default"}
            className={cn("shrink-0 h-10 w-10 rounded-full", isListening && "animate-pulse")}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            placeholder={isListening ? "Ouvindo..." : "Digite um comando..."}
            className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
            disabled={isListening || isProcessing}
          />
          <Button
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isListening ? "🔴 Microfone ativo" : isSpeaking ? "🔊 Respondendo..." : "⏸ Aguardando"}
          </span>
          <span>{messages.length} mensagens</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAgentInterface;
