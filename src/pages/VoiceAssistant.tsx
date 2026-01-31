/**
 * Voice Assistant - ElevenLabs Powered Voice AI
 * Complete voice interface with STT, TTS, and AI command processing
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  AudioWaveform,
  Loader2,
  Play,
  Pause,
  Settings,
  Sparkles,
  Send,
  User,
  Bot,
  Headphones,
  Radio
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

const VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "British male" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "American female" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "American male" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "American female" },
];

export default function VoiceAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        await processVoiceCommand(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Gravando...",
        description: "Fale seu comando",
      });
    } catch (error) {
      logger.error("Recording error:", error);
      toast({
        title: "Erro no microfone",
        description: "Não foi possível acessar o microfone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceCommand = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const { data, error } = await supabase.functions.invoke("elevenlabs-voice", {
        body: {
          operation: "command",
          audio: audioBase64,
          voiceId: selectedVoice,
          language: "pt"
        }
      });

      if (error) throw error;

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: data.userText || "...",
        timestamp: new Date(),
      };

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.aiResponse || "Não entendi.",
        audioUrl: data.audioContent ? `data:audio/mpeg;base64,${data.audioContent}` : undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);

      // Auto-play response
      if (autoSpeak && !isMuted && data.audioContent) {
        playAudio(`data:audio/mpeg;base64,${data.audioContent}`);
      }

      toast({
        title: "Comando processado",
        description: data.userText?.substring(0, 50) + "...",
      });
    } catch (error) {
      logger.error("Voice command error:", error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Falha ao processar comando",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const text = inputText;
    setInputText("");

    try {
      // Add user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      const { data, error } = await supabase.functions.invoke("elevenlabs-voice", {
        body: {
          operation: "command",
          text,
          voiceId: selectedVoice,
          language: "pt"
        }
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.aiResponse || "Não entendi.",
        audioUrl: data.audioContent ? `data:audio/mpeg;base64,${data.audioContent}` : undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-play response
      if (autoSpeak && !isMuted && data.audioContent) {
        playAudio(`data:audio/mpeg;base64,${data.audioContent}`);
      }
    } catch (error) {
      logger.error("Text message error:", error);
      toast({
        title: "Erro",
        description: "Falha ao processar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audio.volume = volume[0] / 100;
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      toast({
        title: "Erro de áudio",
        description: "Não foi possível reproduzir o áudio",
        variant: "destructive"
      });
    };

    audio.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const speakText = async (text: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-voice", {
        body: {
          operation: "tts",
          text,
          voiceId: selectedVoice,
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        playAudio(`data:audio/mpeg;base64,${data.audioContent}`);
      }
    } catch (error) {
      logger.error("TTS error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Headphones className="h-8 w-8 text-primary" />
            Voice Assistant
          </h1>
          <p className="text-muted-foreground">
            Assistente de voz com ElevenLabs AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isRecording ? "destructive" : "secondary"} className="animate-pulse">
            {isRecording ? (
              <>
                <Radio className="h-3 w-3 mr-1" />
                Gravando
              </>
            ) : (
              <>
                <AudioWaveform className="h-3 w-3 mr-1" />
                Pronto
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversa
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[500px]">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                    <p>Inicie uma conversa</p>
                    <p className="text-sm">Clique no microfone ou digite uma mensagem</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{message.content}</p>
                        {message.audioUrl && message.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => playAudio(message.audioUrl!)}
                          >
                            <Volume2 className="h-4 w-4 mr-1" />
                            Ouvir
                          </Button>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="mt-4 flex gap-2">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="shrink-0"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <Input
                placeholder="Digite uma mensagem..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendTextMessage()}
                disabled={isProcessing || isRecording}
              />

              <Button
                onClick={sendTextMessage}
                disabled={!inputText.trim() || isProcessing}
                className="shrink-0"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label>Voz do Assistente</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col">
                        <span>{voice.name}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Volume</Label>
                <span className="text-sm text-muted-foreground">{volume[0]}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Auto Speak Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resposta Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Reproduzir áudio automaticamente
                </p>
              </div>
              <Switch checked={autoSpeak} onCheckedChange={setAutoSpeak} />
            </div>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mudo</Label>
                <p className="text-xs text-muted-foreground">
                  Desativar reprodução de áudio
                </p>
              </div>
              <Switch checked={isMuted} onCheckedChange={setIsMuted} />
            </div>

            {/* Audio Controls */}
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Controles de Áudio</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={stopAudio}
                  disabled={!isPlaying}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Parar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => speakText("Olá! Sou o assistente de voz do Nautilus One.")}
                  disabled={isProcessing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Testar
                </Button>
              </div>
            </div>

            {/* Quick Commands */}
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Comandos Rápidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Status do sistema",
                  "Alertas ativos",
                  "Próxima manutenção",
                  "Clima marítimo"
                ].map((cmd) => (
                  <Button
                    key={cmd}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInputText(cmd);
                      sendTextMessage();
                    }}
                    disabled={isProcessing}
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
