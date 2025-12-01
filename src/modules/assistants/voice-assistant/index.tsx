import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Radio,
  MessageSquare,
  Activity,
  Loader2,
  Command
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { logger } from "@/lib/logger";
import { useNavigate } from "react-router-dom";

interface VoiceCommand {
  timestamp: string;
  transcript: string;
  response: string;
  action?: string;
}

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [volume, setVolume] = useState(1);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Verificar suporte do navegador
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      toast({
        title: "Navegador não suportado",
        description: "Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.",
        variant: "destructive",
      });
      return;
    }

    // Inicializar Speech Recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "pt-BR";

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      
      setTranscript(transcriptText);

      // Se for resultado final, processar comando
      if (event.results[current].isFinal) {
        processCommand(transcriptText);
        setTranscript("");
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      logger.error("Speech recognition error", { error: event.error });
      
      if (event.error === "no-speech") {
        toast({
          title: "Nenhuma fala detectada",
          description: "Tente falar mais alto ou verificar seu microfone.",
          variant: "destructive",
        });
      }
      
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // Reiniciar se ainda estiver no modo de escuta
        try {
          recognitionRef.current?.start();
        } catch (error) {
          logger.error("Error restarting recognition", { error });
        }
      }
    };

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast({
        title: "Assistente pausado",
        description: "O assistente de voz foi pausado.",
      });
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: "Assistente ativo",
          description: "Estou ouvindo. Fale seu comando.",
        });
      } catch (error) {
        logger.error("Error starting recognition", { error });
        toast({
          title: "Erro ao iniciar",
          description: "Não foi possível iniciar o reconhecimento de voz.",
          variant: "destructive",
        });
      }
    }
  };

  const processCommand = async (command: string) => {
    logger.info("Processing voice command", { command });

    const lowerCommand = command.toLowerCase();
    let response = "";
    let action = "";

    // Processar comandos comuns
    if (lowerCommand.includes("dashboard") || lowerCommand.includes("painel")) {
      action = "navigate_dashboard";
      response = "Abrindo dashboard principal...";
      setTimeout(() => navigate("/dashboard"), 500);
    } 
    else if (lowerCommand.includes("relatório") || lowerCommand.includes("relatorio")) {
      action = "navigate_reports";
      response = "Abrindo central de relatórios...";
      setTimeout(() => navigate("/reports"), 500);
    }
    else if (lowerCommand.includes("frota") || lowerCommand.includes("embarcações")) {
      action = "navigate_fleet";
      response = "Abrindo gestão de frota...";
      setTimeout(() => navigate("/fleet"), 500);
    }
    else if (lowerCommand.includes("status") || lowerCommand.includes("situação")) {
      action = "query_status";
      response = "Sistema operando normalmente. Todos os módulos estão ativos.";
    }
    else if (lowerCommand.includes("ajuda") || lowerCommand.includes("help")) {
      action = "show_help";
      response = "Posso ajudá-lo a navegar pelo sistema, abrir módulos, verificar status e muito mais. Experimente dizer: ir para dashboard, abrir relatórios, ou mostrar frota.";
    }
    else if (lowerCommand.includes("tripulação") || lowerCommand.includes("crew")) {
      action = "navigate_crew";
      response = "Abrindo gestão de tripulação...";
      setTimeout(() => navigate("/crew"), 500);
    }
    else {
      response = `Recebi o comando: ${command}. Ainda estou aprendendo a executar essa ação.`;
    }

    // Adicionar ao histórico
    const newCommand: VoiceCommand = {
      timestamp: new Date().toISOString(),
      transcript: command,
      response,
      action
    };

    setCommands(prev => [newCommand, ...prev]);

    // Falar resposta
    speak(response);

    logger.info("Command processed", { command: newCommand });
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Cancelar falas anteriores

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.volume = volume;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleMute = () => {
    const newVolume = volume > 0 ? 0 : 1;
    setVolume(newVolume);
    toast({
      title: newVolume > 0 ? "Som ativado" : "Som desativado",
      description: newVolume > 0 ? "O assistente voltará a falar." : "O assistente está mudo.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Assistente de Voz</h1>
        <p className="text-muted-foreground">
          Controle o Nautilus One usando comandos de voz
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Controles Principais */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Voz</CardTitle>
            <CardDescription>
              Ative o assistente e fale seus comandos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSupported ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>Seu navegador não suporta reconhecimento de voz.</p>
                <p className="text-sm mt-2">Use Chrome, Edge ou Safari para melhor experiência.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "default"}
                    className="h-32 w-32 rounded-full"
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <div className="flex flex-col items-center">
                        <Radio className="h-12 w-12 mb-2 animate-pulse" />
                        <span className="text-xs">Ouvindo...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Mic className="h-12 w-12 mb-2" />
                        <span className="text-xs">Ativar</span>
                      </div>
                    )}
                  </Button>
                </div>

                <div className="flex justify-center gap-4">
                  <Badge variant={isListening ? "default" : "secondary"}>
                    {isListening ? <Mic className="mr-1 h-3 w-3" /> : <MicOff className="mr-1 h-3 w-3" />}
                    {isListening ? "Escutando" : "Pausado"}
                  </Badge>
                  
                  <Badge variant={isSpeaking ? "default" : "secondary"}>
                    {isSpeaking ? <Volume2 className="mr-1 h-3 w-3" /> : <VolumeX className="mr-1 h-3 w-3" />}
                    {isSpeaking ? "Falando" : "Silencioso"}
                  </Badge>
                </div>

                {transcript && (
                  <Card className="bg-muted">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-1">Ouvindo:</p>
                      <p className="font-medium">{transcript}</p>
                    </CardContent>
                  </Card>
                )}

                <Button variant="outline" className="w-full" onClick={toggleMute}>
                  {volume > 0 ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                  {volume > 0 ? "Desativar Som" : "Ativar Som"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Comandos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Comandos Disponíveis
            </CardTitle>
            <CardDescription>
              Experimente estes comandos de voz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <p className="font-semibold text-sm mb-1">Navegação</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "Ir para dashboard"</li>
                    <li>• "Abrir relatórios"</li>
                    <li>• "Mostrar frota"</li>
                    <li>• "Ver tripulação"</li>
                  </ul>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-semibold text-sm mb-1">Consultas</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "Qual o status do sistema"</li>
                    <li>• "Mostrar ajuda"</li>
                  </ul>
                </div>

                <div className="p-3 border rounded-lg bg-muted">
                  <p className="font-semibold text-sm mb-1">Em Breve</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "Gerar relatório"</li>
                    <li>• "Enviar email"</li>
                    <li>• "Criar checklist"</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Comandos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Comandos
          </CardTitle>
          <CardDescription>
            Últimos comandos processados pelo assistente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commands.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum comando executado ainda. Ative o assistente e comece a falar!
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {commands.map((cmd, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(cmd.timestamp).toLocaleTimeString()}
                      </span>
                      {cmd.action && (
                        <Badge variant="outline" className="text-xs">
                          {cmd.action}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">Você: {cmd.transcript}</p>
                    <p className="text-sm text-muted-foreground">Assistente: {cmd.response}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
