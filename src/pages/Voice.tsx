import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VoiceHistory from "@/components/voice/VoiceHistory";
import VoiceAnalytics from "@/components/voice/VoiceAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Mic,
  Settings,
  History,
  BarChart3,
  Bot,
  Volume2,
  MicOff,
  Play,
  Pause,
  Square,
  Headphones,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Voice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [messages, setMessages] = useState([]);
  const [audioPermission, setAudioPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [voiceSettings, setVoiceSettings] = useState({
    autoListen: true,
    volume: 0.8,
    sensitivity: 0.5,
    voice: "alloy",
    language: "pt-BR",
    wakeWord: true,
    noiseReduction: true,
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioPermission("granted");
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());

      toast({
        title: "Permissão Concedida",
        description: "Microfone configurado com sucesso!",
        duration: 3000,
      });
    } catch (error) {
      setAudioPermission("denied");
      toast({
        title: "Permissão Negada",
        description: "Microfone é necessário para usar comandos de voz",
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [toast]);

  // Request microphone permission on component mount
  useEffect(() => {
    requestMicrophonePermission();
  }, [requestMicrophonePermission]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAdvancedSettings(false);
        setIsListening(false);
        setIsSpeaking(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleVoiceToggle = () => {
    if (audioPermission !== "granted") {
      requestMicrophonePermission();
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    toast({
      title: "Assistente Ativo",
      description: "Ouvindo seus comandos...",
      duration: 2000,
    });

    // Simulate voice recognition timeout
    setTimeout(() => {
      if (isListening) {
        stopListening();
      }
    }, 30000); // 30 seconds timeout
  };

  const stopListening = () => {
    setIsListening(false);
    toast({
      title: "Assistente Pausado",
      description: "Clique no microfone para ativar novamente",
      duration: 2000,
    });
  };

  const handleNavigation = (module: string) => {
    const routes: { [key: string]: string } = {
      dashboard: "/",
      analytics: "/analytics",
      reports: "/reports",
      settings: "/settings",
      travel: "/travel",
      maritime: "/maritime",
      communication: "/communication",
      admin: "/admin",
    };

    const route = routes[module.toLowerCase()];
    if (route) {
      navigate(route);
      toast({
        title: "Navegando",
        description: `Redirecionando para ${module}`,
        duration: 2000,
      });
    }
  };

  const saveSettings = () => {
    toast({
      title: "Configurações Salvas",
      description: "Suas preferências de voz foram atualizadas",
      duration: 3000,
    });
    setShowAdvancedSettings(false);
  };

  const testVoice = () => {
    setIsSpeaking(true);
    toast({
      title: "Testando Voz",
      description: "Reproduzindo amostra de voz...",
      duration: 2000,
    });

    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Bot}
        title="Assistente de Voz"
        description="Controle o sistema usando comandos de voz inteligentes com IA avançada"
        gradient="purple"
        badges={[
          { icon: Mic, label: "Comandos de Voz" },
          { icon: Sparkles, label: "IA Conversacional" },
          { icon: Zap, label: "Tempo Real" },
        ]}
      />

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          onClick={() => setShowAdvancedSettings(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Configurações Avançadas
        </Button>

        <Button
          onClick={handleVoiceToggle}
          disabled={audioPermission === "denied"}
          className={`flex items-center gap-2 ${
            isListening
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              Parar
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Ativar Voz
            </>
          )}
        </Button>
      </div>

      {/* Permission Alert */}
      {audioPermission === "denied" && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MicOff className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Permissão de Microfone Necessária</p>
                <p className="text-sm text-muted-foreground">
                  Para usar comandos de voz, você precisa permitir acesso ao microfone.
                </p>
              </div>
              <Button onClick={requestMicrophonePermission} variant="outline" size="sm">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Status Card */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Status do Assistente
            {isListening && (
              <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                OUVINDO
              </Badge>
            )}
            {isSpeaking && <Badge className="bg-success text-success-foreground">FALANDO</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  isListening
                    ? "text-destructive"
                    : isSpeaking
                      ? "text-success"
                      : "text-muted-foreground"
                }`}
              >
                {isListening ? "ATIVO" : isSpeaking ? "FALANDO" : "STANDBY"}
              </div>
              <div className="text-sm text-muted-foreground">Status Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">97.3%</div>
              <div className="text-sm text-muted-foreground">Precisão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">1.2s</div>
              <div className="text-sm text-muted-foreground">Tempo Resposta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">247</div>
              <div className="text-sm text-muted-foreground">Comandos Hoje</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Configurações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Listen */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Escuta Automática</label>
                    <div className="text-sm text-muted-foreground">
                      Detectar automaticamente quando você fala
                    </div>
                  </div>
                  <Switch
                    checked={voiceSettings.autoListen}
                    onCheckedChange={checked =>
                      setVoiceSettings(prev => ({ ...prev, autoListen: checked }))
                    }
                  />
                </div>

                {/* Volume */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Volume da Resposta</label>
                  </div>
                  <Slider
                    value={[voiceSettings.volume]}
                    onValueChange={value =>
                      setVoiceSettings(prev => ({ ...prev, volume: value[0] }))
                    }
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {Math.round(voiceSettings.volume * 100)}%
                  </div>
                </div>

                {/* Sensitivity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Sensibilidade do Microfone</label>
                  </div>
                  <Slider
                    value={[voiceSettings.sensitivity]}
                    onValueChange={value =>
                      setVoiceSettings(prev => ({ ...prev, sensitivity: value[0] }))
                    }
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {Math.round(voiceSettings.sensitivity * 100)}%
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={testVoice} variant="outline" className="flex-1">
                    <Headphones className="h-4 w-4 mr-2" />
                    Testar Voz
                  </Button>
                  <Button onClick={saveSettings} className="flex-1">
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <VoiceHistory />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <VoiceAnalytics
              isConnected={!isSpeaking}
              totalMessages={messages.length}
              sessionDuration={247}
              responseTime={1200}
              connectionQuality="excellent"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Advanced Settings Modal */}
      <Dialog open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Avançadas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voz do Assistente</label>
              <Select
                value={voiceSettings.voice}
                onValueChange={value => setVoiceSettings(prev => ({ ...prev, voice: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy (Neutro)</SelectItem>
                  <SelectItem value="echo">Echo (Masculino)</SelectItem>
                  <SelectItem value="fable">Fable (Feminino)</SelectItem>
                  <SelectItem value="onyx">Onyx (Profundo)</SelectItem>
                  <SelectItem value="nova">Nova (Jovem)</SelectItem>
                  <SelectItem value="shimmer">Shimmer (Suave)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Idioma</label>
              <Select
                value={voiceSettings.language}
                onValueChange={value => setVoiceSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Wake Word */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Palavra de Ativação</label>
                <div className="text-sm text-muted-foreground">Ativar com "Olá Nautilus"</div>
              </div>
              <Switch
                checked={voiceSettings.wakeWord}
                onCheckedChange={checked =>
                  setVoiceSettings(prev => ({ ...prev, wakeWord: checked }))
                }
              />
            </div>

            {/* Noise Reduction */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Redução de Ruído</label>
                <div className="text-sm text-muted-foreground">Filtrar ruídos de fundo</div>
              </div>
              <Switch
                checked={voiceSettings.noiseReduction}
                onCheckedChange={checked =>
                  setVoiceSettings(prev => ({ ...prev, noiseReduction: checked }))
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSettings(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={saveSettings} className="flex-1">
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageWrapper>
  );
}
