/**
 * FASE 3 - AI Control Tower
 * Voice Assistant com NLU marítimo (benchmark: ARIA Voice)
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Volume2, VolumeX, Brain, 
  Activity, Settings, History, Sparkles, 
  MessageSquare, Waves, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface VoiceCommand {
  id: string;
  timestamp: Date;
  transcript: string;
  intent: string;
  confidence: number;
  response: string;
  status: "success" | "processing" | "failed";
}

const recentCommands: VoiceCommand[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 60000),
    transcript: "Qual é a posição atual do Atlântico Sul?",
    intent: "vessel.position",
    confidence: 0.95,
    response: "O MV Atlântico Sul está atualmente em 23°50'S 46°30'W, a 15 milhas náuticas do Porto de Santos.",
    status: "success"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 300000),
    transcript: "Mostrar certificados vencendo este mês",
    intent: "compliance.certificates.expiring",
    confidence: 0.92,
    response: "Encontrei 3 certificados vencendo: SMC do Oceano Azul (dia 15), DOC do Maré Alta (dia 22), e IOPP do Atlântico Sul (dia 28).",
    status: "success"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 600000),
    transcript: "Criar ordem de serviço para motor principal",
    intent: "maintenance.create_work_order",
    confidence: 0.88,
    response: "Ordem de serviço #OS-2024-0234 criada para inspeção do motor principal. Prioridade: Alta.",
    status: "success"
  },
];

const supportedIntents = [
  { intent: "vessel.position", description: "Consultar posição de embarcações", examples: ["Onde está o...", "Posição do..."] },
  { intent: "vessel.status", description: "Status operacional", examples: ["Status do...", "Como está o..."] },
  { intent: "compliance.certificates", description: "Verificar certificados", examples: ["Certificados de...", "Vencimentos..."] },
  { intent: "maintenance.status", description: "Status de manutenção", examples: ["Manutenções pendentes", "Próximas inspeções"] },
  { intent: "crew.info", description: "Informações da tripulação", examples: ["Quantos tripulantes...", "Quem é o capitão..."] },
  { intent: "weather.forecast", description: "Previsão meteorológica", examples: ["Tempo em...", "Previsão para..."] },
  { intent: "navigation.eta", description: "Tempo estimado de chegada", examples: ["Quando chega...", "ETA do..."] },
  { intent: "reports.generate", description: "Gerar relatórios", examples: ["Gerar relatório de...", "Exportar..."] },
];

export default function VoiceAssistantNLU() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [commands, setCommands] = useState<VoiceCommand[]>(recentCommands);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate audio level when listening
  useEffect(() => {
    if (isListening) {
      let phase = 0;
      audioIntervalRef.current = setInterval(() => {
        phase += 0.3;
        setAudioLevel(50 + Math.sin(phase) * 40);
      }, 100);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      setAudioLevel(0);
    }
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [isListening]);

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript("");
    toast.info("Ouvindo... Fale seu comando");
    
    // Simulate voice recognition after 3 seconds
    setTimeout(() => {
      setTranscript("Qual o status de manutenção da frota?");
      setTimeout(() => {
        handleProcessCommand("Qual o status de manutenção da frota?");
        setIsListening(false);
      }, 1000);
    }, 3000);
  };

  const handleStopListening = () => {
    setIsListening(false);
    setTranscript("");
  };

  const handleProcessCommand = (text: string) => {
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      timestamp: new Date(),
      transcript: text,
      intent: "maintenance.status",
      confidence: 0.94,
      response: "A frota está com 94% de disponibilidade. 3 ordens de serviço pendentes, sendo 1 crítica no Gerador #2 do PSV Oceano Azul.",
      status: "success"
    };
    
    setCommands(prev => [newCommand, ...prev]);
    setIsSpeaking(true);
    toast.success("Comando processado com sucesso");
    
    // Simulate TTS
    setTimeout(() => setIsSpeaking(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Voice Control Panel */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Microphone Button */}
            <div className="relative">
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className={`h-24 w-24 rounded-full ${isListening ? "animate-pulse" : ""}`}
                onClick={isListening ? handleStopListening : handleStartListening}
              >
                {isListening ? (
                  <MicOff className="h-10 w-10" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </Button>
              
              {/* Audio Level Indicator */}
              {isListening && (
                <div className="absolute -inset-4 rounded-full border-4 border-primary/30 animate-ping" />
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              <p className="text-lg font-medium">
                {isListening ? "Ouvindo..." : isSpeaking ? "Respondendo..." : "Clique para falar"}
              </p>
              {transcript && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{transcript}"
                </p>
              )}
            </div>

            {/* Audio Level Bar */}
            {isListening && (
              <div className="w-full max-w-md">
                <Progress value={audioLevel} className="h-2" />
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span>NLU Marítimo</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span>GPT-5 Powered</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-success" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Commands */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Comandos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {commands.map((cmd) => (
                    <div key={cmd.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <p className="font-medium">"{cmd.transcript}"</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {(cmd.confidence * 100).toFixed(0)}% conf
                          </Badge>
                          {cmd.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      <div className="pl-6">
                        <Badge variant="secondary" className="mb-2">
                          {cmd.intent}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{cmd.response}</p>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        {cmd.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Supported Intents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Comandos Suportados
            </CardTitle>
            <CardDescription>
              Intents do NLU marítimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {supportedIntents.map((intent) => (
                  <div key={intent.intent} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Waves className="h-4 w-4 text-primary" />
                      <span className="font-mono text-xs">{intent.intent}</span>
                    </div>
                    <p className="text-sm">{intent.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {intent.examples.map((ex, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {ex}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
