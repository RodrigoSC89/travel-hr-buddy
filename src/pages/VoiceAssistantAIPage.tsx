/**
 * Voice Assistant AI Page - Conversational AI Module
 * Advanced multilingual voice assistant with maritime context
 */
import React from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  Volume2, 
  MessageSquare, 
  Languages, 
  AudioWaveform,
  Settings,
  History,
  Globe,
  Sparkles,
  MicOff
} from "lucide-react";

export default function VoiceAssistantAIPage() {
  const [isListening, setIsListening] = React.useState(false);
  const [lastTranscription, setLastTranscription] = React.useState("");

  const voiceFeatures = [
    { name: "Reconhecimento Natural", accuracy: 98, icon: Mic },
    { name: "Multi-idiomas", languages: 12, icon: Languages },
    { name: "Contexto Marítimo", terms: 5000, icon: Globe },
    { name: "Resposta em Tempo Real", latency: "< 500ms", icon: AudioWaveform }
  ];

  const recentCommands = [
    { command: "Qual é o status da embarcação Atlântico Sul?", response: "Atlântico Sul está em operação normal...", time: "2min atrás" },
    { command: "Agendar manutenção do motor principal", response: "Manutenção agendada para 15/02...", time: "15min atrás" },
    { command: "Gerar relatório de compliance PEOTRAM", response: "Relatório sendo gerado...", time: "1h atrás" }
  ];

  return (
    <OrganizationLayout title="Voice Assistant AI">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Mic className="h-8 w-8 text-primary" />
              Voice Assistant AI
            </h1>
            <p className="text-muted-foreground mt-1">
              Assistente de voz inteligente com contexto marítimo avançado
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>

        {/* Main Voice Interface */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Voice Orb */}
              <div 
                className={`relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  isListening 
                    ? "bg-primary/30 animate-pulse shadow-lg shadow-primary/50" 
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? (
                  <Mic className="h-16 w-16 text-primary animate-bounce" />
                ) : (
                  <MicOff className="h-16 w-16 text-muted-foreground" />
                )}
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30" />
                )}
              </div>

              <div className="text-center">
                <p className="text-lg font-medium">
                  {isListening ? "Ouvindo..." : "Clique para iniciar"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isListening ? "Fale seu comando" : "Toque no microfone para ativar"}
                </p>
              </div>

              {lastTranscription && (
                <Card className="w-full max-w-md">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Última transcrição:</p>
                    <p className="font-medium">{lastTranscription}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {voiceFeatures.map((feature) => (
            <Card key={feature.name}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {'accuracy' in feature && `${feature.accuracy}% precisão`}
                      {'languages' in feature && `${feature.languages} idiomas`}
                      {'terms' in feature && `${feature.terms}+ termos`}
                      {'latency' in feature && feature.latency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Commands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Comandos Recentes
            </CardTitle>
            <CardDescription>Histórico de interações por voz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCommands.map((item) => (
                <div key={item.command} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{item.command}</p>
                    <p className="text-sm text-muted-foreground">{item.response}</p>
                  </div>
                  <Badge variant="outline">{item.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}
