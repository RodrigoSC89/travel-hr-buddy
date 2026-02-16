/**
 * Voice Copilot - Maritime Voice AI Assistant
 * Real-time voice commands for operational procedures
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX, Brain, Ship, Shield, Anchor, Activity, Send, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  module?: string;
  confidence?: number;
}

const QUICK_COMMANDS = [
  { label: "Status da frota", icon: Ship, command: "Qual o status atual de toda a frota?" },
  { label: "Certificados vencendo", icon: Shield, command: "Quais certificados vencem nos próximos 30 dias?" },
  { label: "Manutenções pendentes", icon: Anchor, command: "Liste todas as manutenções pendentes com prioridade alta" },
  { label: "KPIs operacionais", icon: Activity, command: "Apresente os KPIs operacionais do mês atual" },
  { label: "Compliance score", icon: Shield, command: "Qual o score de compliance geral da empresa?" },
  { label: "Tripulação a bordo", icon: Activity, command: "Quantos tripulantes estão a bordo em cada embarcação?" },
];

const VOICE_CAPABILITIES = [
  { area: "Operações", examples: ["Status da frota", "Posição dos navios", "ETA próximos portos"], color: "bg-blue-500/10 text-blue-400" },
  { area: "Compliance", examples: ["Score de auditoria", "NCs abertas", "Certificados críticos"], color: "bg-amber-500/10 text-amber-400" },
  { area: "Manutenção", examples: ["Ordens de serviço", "Predições de falha", "Estoque de peças"], color: "bg-emerald-500/10 text-emerald-400" },
  { area: "Tripulação", examples: ["Escala de embarque", "Fadiga da tripulação", "Treinamentos vencidos"], color: "bg-purple-500/10 text-purple-400" },
];

export default function VoiceCopilotPage() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const processCommand = useCallback(async (command: string) => {
    const userMsg: VoiceMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: command,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: command,
          context: "voice_copilot_maritime",
          language: "pt",
        },
      });

      if (error) throw error;

      const reply = data?.reply || data?.response || "Não foi possível processar o comando.";
      const assistantMsg: VoiceMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
        module: detectModule(command),
        confidence: data?.confidence || 0.92,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // TTS
      speakText(reply);
    } catch (err) {
      toast.error("Erro ao processar comando");
      const errMsg: VoiceMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Desculpe, houve um erro ao processar seu comando. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const detectModule = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("frota") || lower.includes("navio")) return "Operações";
    if (lower.includes("compliance") || lower.includes("auditoria") || lower.includes("certificado")) return "Compliance";
    if (lower.includes("manutenção") || lower.includes("falha") || lower.includes("peça")) return "Manutenção";
    if (lower.includes("tripulação") || lower.includes("escala") || lower.includes("embarque")) return "Tripulação";
    return "Geral";
  };

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Web Speech API not in standard TypeScript types
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setLiveTranscript(transcript);

      if (event.results[0].isFinal) {
        setLiveTranscript("");
        processCommand(transcript);
      }
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") toast.error("Permissão de microfone negada");
      else if (event.error !== "no-speech") toast.error("Erro no reconhecimento de voz");
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [processCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setLiveTranscript("");
  }, []);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    processCommand(textInput.trim());
    setTextInput("");
  };

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            Voice Copilot
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assistente de voz inteligente para operações marítimas
          </p>
        </div>
        <div className="flex gap-2">
          {isSpeaking && (
            <Button variant="outline" size="sm" onClick={stopSpeaking}>
              <VolumeX className="h-4 w-4 mr-1" /> Parar áudio
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chat */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Nauti Voice Copilot</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Pressione o botão de microfone ou use os comandos rápidos para interagir com o assistente
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3 max-w-[85%]",
                          msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            msg.role === "user" ? "bg-primary/20" : "bg-emerald-500/20"
                          )}
                        >
                          {msg.role === "user" ? (
                            <Mic className="h-4 w-4 text-primary" />
                          ) : (
                            <Brain className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "rounded-xl px-4 py-3 text-sm",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                            <span>{msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            {msg.module && <Badge variant="outline" className="text-[10px] px-1 py-0">{msg.module}</Badge>}
                            {msg.confidence && <span>{Math.round(msg.confidence * 100)}% conf.</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                        </div>
                        <div className="bg-muted rounded-xl px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Live transcript */}
              {liveTranscript && (
                <div className="px-4 py-2 border-t border-border bg-primary/5">
                  <p className="text-sm text-primary italic flex items-center gap-2">
                    <Activity className="h-3 w-3 animate-pulse" />
                    {liveTranscript}
                  </p>
                </div>
              )}

              {/* Input area */}
              <div className="p-4 border-t border-border flex gap-2">
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  className={cn("rounded-full w-12 h-12 p-0 flex-shrink-0", isListening && "animate-pulse")}
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Digite um comando ou pergunta..."
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!textInput.trim() || isProcessing} aria-label="Enviar comando" title="Enviar">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Quick Commands */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_COMMANDS.map((cmd) => (
              <Button
                key={cmd.label}
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-auto py-2 text-left"
                onClick={() => processCommand(cmd.command)}
                disabled={isProcessing}
              >
                <cmd.icon className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-xs truncate">{cmd.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Voice Status */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Status do Copilot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Microfone</span>
                <Badge variant={isListening ? "default" : "secondary"}>
                  {isListening ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">IA</span>
                <Badge variant={isProcessing ? "default" : "secondary"}>
                  {isProcessing ? "Processando" : "Pronta"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">TTS</span>
                <Badge variant={isSpeaking ? "default" : "secondary"}>
                  {isSpeaking ? "Falando" : "Silencioso"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mensagens</span>
                <span className="font-mono text-xs">{messages.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Capacidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {VOICE_CAPABILITIES.map((cap) => (
                <div key={cap.area} className="space-y-1">
                  <Badge className={cn("text-xs", cap.color)}>{cap.area}</Badge>
                  <div className="flex flex-wrap gap-1">
                    {cap.examples.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => processCommand(ex)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-accent transition-colors cursor-pointer"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
