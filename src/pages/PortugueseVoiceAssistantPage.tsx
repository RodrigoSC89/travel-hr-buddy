/**
 * Assistente de Voz em Português - Interface localizada
 * Portuguese Voice Assistant with native language interface
 */
import React from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Volume2, 
  MessageSquare, 
  History,
  Settings,
  Play,
  Pause,
  MicOff,
  AudioWaveform,
  Sparkles
} from "lucide-react";

export default function PortugueseVoiceAssistantPage() {
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const quickCommands = [
    "Qual é o status da frota?",
    "Mostrar certificados próximos ao vencimento",
    "Gerar relatório de manutenção",
    "Verificar compliance PEOTRAM",
    "Listar tarefas pendentes",
    "Abrir gestão de tripulação"
  ];

  const conversationHistory = [
    {
      type: "user",
      message: "Mostre o status da embarcação Atlântico Sul",
      time: "10:32"
    },
    {
      type: "assistant",
      message: "A embarcação Atlântico Sul está em operação normal. Posição atual: Porto de Santos. Próxima manutenção programada: 20/02/2026.",
      time: "10:32"
    },
    {
      type: "user",
      message: "Quantos certificados vencem este mês?",
      time: "10:30"
    },
    {
      type: "assistant",
      message: "Encontrei 12 certificados com vencimento em fevereiro. 3 são de alta prioridade e precisam de ação imediata.",
      time: "10:30"
    }
  ];

  return (
    <OrganizationLayout title="Assistente de Voz">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Volume2 className="h-8 w-8 text-primary" />
              Assistente de Voz
            </h1>
            <p className="text-muted-foreground mt-1">
              Interface de voz em português para comandos e consultas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurar Voz
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Interface de Voz</CardTitle>
              <CardDescription>Clique no microfone e fale seu comando</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6 py-8">
                {/* Voice Orb */}
                <button 
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening 
                      ? "bg-primary/30 shadow-lg shadow-primary/30" 
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? (
                    <>
                      <AudioWaveform className="h-12 w-12 text-primary animate-pulse" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" />
                    </>
                  ) : (
                    <Mic className="h-12 w-12 text-muted-foreground" />
                  )}
                </button>

                <div className="text-center">
                  <p className="font-medium">
                    {isListening ? "🎤 Ouvindo... Fale agora" : "Toque para começar"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reconhecimento de voz em português brasileiro
                  </p>
                </div>

                {/* Voice Controls */}
                <div className="flex gap-2">
                  <Button 
                    variant={isListening ? "destructive" : "default"} 
                    onClick={() => setIsListening(!isListening)}
                    className="gap-2"
                  >
                    {isListening ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Parar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Iniciar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Comandos Rápidos
              </CardTitle>
              <CardDescription>Sugestões de comandos frequentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickCommands.map((cmd, idx) => (
                  <Button 
                    key={idx} 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => {
                      // Simulate command
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                    <span className="text-sm">{cmd}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Conversa Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}
