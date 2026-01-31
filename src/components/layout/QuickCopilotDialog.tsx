/**
 * Quick Copilot Dialog Component
 * PATCH VOICE-1.0: Assistente IA rápido no header com suporte a voz e TTS
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Loader2,
  Sparkles,
  Ship,
  Wrench,
  BarChart3,
  Shield,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceCommands } from "@/modules/nauti-command-center/hooks/useVoiceCommands";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuickCopilotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickActions = [
  { label: "Status da Frota", icon: Ship, prompt: "Qual o status atual da frota?" },
  { label: "Manutenções Pendentes", icon: Wrench, prompt: "Quais manutenções estão pendentes?" },
  { label: "KPIs do Dia", icon: BarChart3, prompt: "Mostre os principais KPIs de hoje" },
  { label: "Alertas de Segurança", icon: Shield, prompt: "Há algum alerta de segurança ativo?" },
  { label: "Ajuda Geral", icon: HelpCircle, prompt: "O que você pode fazer por mim?" },
];

export function QuickCopilotDialog({ open, onOpenChange }: QuickCopilotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Copiloto Nautilus, seu assistente de IA para operações marítimas. Como posso ajudar você hoje?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice commands integration
  const { isListening, isSupported, transcript, toggleVoice, stopListening } = useVoiceCommands({
    onCommand: (command) => {
      if (command.trim()) {
        sendMessage(command);
        stopListening();
      }
    }
  });

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Text-to-Speech using ElevenLabs
  const speakText = useCallback(async (text: string) => {
    if (!isTTSEnabled || isSpeaking) return;

    try {
      setIsSpeaking(true);
      
      // Try ElevenLabs first
      const { data, error } = await supabase.functions.invoke("eleven-labs-voice", {
        body: {
          text: text.replace(/\*\*/g, "").replace(/[📊🔧📈🛡️🤖⚠️✅🎯]/g, ""), // Clean markdown and emojis
          voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah voice
          model_id: "eleven_multilingual_v2",
        },
      });

      if (!error && data?.audioContent) {
        const audioSrc = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          fallbackSpeak(text);
        };
        await audio.play();
        return;
      }

      // Fallback to browser TTS
      fallbackSpeak(text);
    } catch (err) {
      logger.error("TTS error:", err);
      fallbackSpeak(text);
    }
  }, [isTTSEnabled, isSpeaking]);

  // Browser native TTS fallback
  const fallbackSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        text.replace(/\*\*/g, "").replace(/[📊🔧📈🛡️🤖⚠️✅🎯]/g, "")
      );
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const generateLocalResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("frota") || msg.includes("embarcações") || msg.includes("navios")) {
      return `📊 **Status da Frota Atual:**\n\n- **20 embarcações** operacionais\n- **3 embarcações** em manutenção programada\n- **1 embarcação** em standby\n\n✅ Taxa de disponibilidade: **83%**\n\nDeseja ver detalhes de alguma embarcação específica?`;
    }
    
    if (msg.includes("manutenção") || msg.includes("manutenções")) {
      return `🔧 **Manutenções Pendentes:**\n\n1. **Ocean Pioneer** - Manutenção preventiva (amanhã)\n2. **Sea Guardian** - Troca de filtros (próxima semana)\n3. **Atlantic Star** - Inspeção de casco (em 15 dias)\n\n⚠️ Total: **3 manutenções** nos próximos 30 dias\n\nPosso agendar ou reprogramar alguma?`;
    }
    
    if (msg.includes("kpi") || msg.includes("indicador") || msg.includes("métricas")) {
      return `📈 **KPIs do Dia:**\n\n- **Uptime da Frota:** 94.5%\n- **Índice de Segurança (TRIR):** 0.42\n- **Emissões CO2:** -12% vs meta\n- **Eficiência Operacional:** 87%\n- **Custos:** Dentro do orçamento\n\n🎯 Todos os indicadores dentro das metas!`;
    }
    
    if (msg.includes("segurança") || msg.includes("alerta") || msg.includes("incidente")) {
      return `🛡️ **Status de Segurança:**\n\n- **0 incidentes** nas últimas 24h\n- **156 dias** sem LTI (Lost Time Injury)\n- **2 alertas** de verificação pendente\n\n⚠️ Alertas ativos:\n1. Verificação de equipamento de segurança - Deck 3\n2. Atualização de treinamento - 5 tripulantes\n\nDeseja mais detalhes?`;
    }
    
    if (msg.includes("ajuda") || msg.includes("o que você pode")) {
      return `🤖 **Como posso ajudar:**\n\n- 📊 Consultar status da frota\n- 🔧 Ver manutenções pendentes\n- 📈 Analisar KPIs e métricas\n- 🛡️ Verificar alertas de segurança\n- 📋 Gerar relatórios rápidos\n- 🌱 Consultar dados ESG\n- 👥 Status da tripulação\n- 📦 Verificar suprimentos\n\nBasta me perguntar!`;
    }
    
    return `Entendi sua pergunta sobre "${userMessage}". \n\nPosso ajudar com:\n- Status da frota e embarcações\n- Manutenções programadas\n- KPIs e métricas operacionais\n- Alertas de segurança\n- Relatórios e análises\n\nPode reformular ou escolher uma das opções acima?`;
  };

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Try to call the edge function
      const { data, error } = await supabase.functions.invoke("nauti-copilot", {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: "quick_assistant"
        }
      });

      let responseText: string;
      if (error || !data?.response) {
        // Fallback to local response
        responseText = generateLocalResponse(text);
      } else {
        responseText = data.response;
      }

      setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
      
      // Speak the response if TTS is enabled
      if (isTTSEnabled) {
        // Extract first sentence for TTS to keep it concise
        const firstSentence = responseText.split(/[.!?]/)[0] + ".";
        speakText(firstSentence);
      }
    } catch (err) {
      // Fallback to local response on any error
      const localResponse = generateLocalResponse(text);
      setMessages(prev => [...prev, { role: "assistant", content: localResponse }]);
      
      if (isTTSEnabled) {
        speakText(localResponse.split(/[.!?]/)[0] + ".");
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isTTSEnabled, speakText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Copiloto Nautilus</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              IA + Voz
            </Badge>
            
            {/* Voice Controls */}
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setIsTTSEnabled(!isTTSEnabled);
                  if (isSpeaking) stopSpeaking();
                }}
                title={isTTSEnabled ? "Desativar voz" : "Ativar voz"}
              >
                {isTTSEnabled ? (
                  <Volume2 className={cn("h-4 w-4", isSpeaking && "text-primary animate-pulse")} />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap pb-2 border-b">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input with Voice */}
        <div className="flex gap-2 pt-2 border-t">
          {isSupported && (
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleVoice}
              className={cn(isListening && "animate-pulse")}
              title={isListening ? "Parar" : "Falar"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Escutando..." : "Digite ou fale sua pergunta..."}
            disabled={isLoading}
            className={cn("flex-1", isListening && "border-red-500")}
          />
          <Button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
