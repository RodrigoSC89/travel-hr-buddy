import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Play, 
  Pause,
  MessageSquare,
  Navigation,
  Zap,
  Anchor,
  Compass
} from "lucide-react";

// Declarações de tipos para Web Speech API
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}


interface VoiceTestingProps {
  onNavigate?: (module: string) => void;
  isVisible?: boolean;
  onClose?: () => void;
}

const VoiceTestingPanel: React.FC<VoiceTestingProps> = ({ onNavigate, isVisible = false, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [recognition, setRecognition] = useState<unknown>(null);
  const [synthesis] = useState(window.speechSynthesis);
  const { toast } = useToast();

  // Comandos de teste disponíveis
  const testCommands = [
    { text: "dashboard", module: "dashboard", description: "Ir para dashboard" },
    { text: "recursos humanos", module: "hr", description: "Abrir RH" },
    { text: "viagens", module: "travel", description: "Sistema de viagens" },
    { text: "sistema marítimo", module: "maritime", description: "Gestão marítima" },
    { text: "alertas", module: "price-alerts", description: "Alertas de preço" },
    { text: "analytics", module: "analytics", description: "Análises" },
    { text: "relatórios", module: "reports", description: "Relatórios" },
    { text: "comunicação", module: "communication", description: "Chat e mensagens" },
    { text: "configurações", module: "settings", description: "Configurações" },
    { text: "estratégico", module: "strategic", description: "Central estratégica" }
  ];

  useEffect(() => {
    // Inicializar reconhecimento de voz
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "pt-BR";
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          setLastCommand(finalTranscript);
          processCommand(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        toast({
          title: "Erro no reconhecimento",
          description: `Erro: ${event.error}`,
          variant: "destructive",
        });
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      toast({
        title: "Reconhecimento de voz não suportado",
        description: "Seu navegador não suporta reconhecimento de voz",
        variant: "destructive",
      });
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Mapeamento de comandos
    const commandMap: Record<string, string> = {
      "dashboard": "dashboard",
      "painel": "dashboard",
      "início": "dashboard",
      "home": "dashboard",
      
      "recursos humanos": "hr",
      "rh": "hr",
      "funcionários": "hr",
      "tripulação": "hr",
      
      "viagens": "travel",
      "travel": "travel",
      "voos": "travel",
      "hotéis": "travel",
      "passagens": "travel",
      
      "sistema marítimo": "maritime",
      "marítimo": "maritime",
      "frota": "maritime",
      "navios": "maritime",
      
      "alertas": "price-alerts",
      "preços": "price-alerts",
      "monitoramento": "price-alerts",
      
      "analytics": "analytics",
      "análises": "analytics",
      "estatísticas": "analytics",
      "métricas": "analytics",
      
      "relatórios": "reports",
      "reports": "reports",
      
      "comunicação": "communication",
      "mensagens": "communication",
      "chat": "communication",
      
      "configurações": "settings",
      "settings": "settings",
      "preferências": "settings",
      
      "estratégico": "strategic",
      "strategic": "strategic",
      "estratégia": "strategic"
    };
    
    // Procurar correspondência
    for (const [cmd, module] of Object.entries(commandMap)) {
      if (lowerCommand.includes(cmd)) {
        
        if (onNavigate) {
          onNavigate(module);
        }
        
        speak(`Navegando para ${cmd}`);
        
        toast({
          title: "Comando executado",
          description: `Navegando para: ${cmd}`,
        });
        
        return;
      }
    }
    
    // Comando não reconhecido
    speak("Comando não reconhecido. Tente novamente.");
    toast({
      title: "Comando não reconhecido",
      description: "Não consegui identificar o comando",
      variant: "destructive",
    });
  };

  const speak = (text: string) => {
    if (!synthesis) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    synthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const testCommand = (command: string, module: string) => {
    setLastCommand(command);
    setTranscript(command);
    
    if (onNavigate) {
      onNavigate(module);
    }
    
    speak(`Testando comando: ${command}`);
    
    toast({
      title: "Comando de teste",
      description: `Executando: ${command}`,
    });
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-primary" />
            Teste de Comando de Voz
            <Badge variant="outline" className="ml-auto mr-2">
              {isListening ? "Ouvindo" : "Inativo"}
            </Badge>
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-destructive/10"
              >
                ×
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Controles principais */}
          <div className="flex gap-2">
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              className="flex-1"
              disabled={!recognition}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Parar
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Ouvir
                </>
              )}
            </Button>
            
            <Button
              onClick={stopSpeaking}
              variant="outline"
              disabled={!isSpeaking}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Status atual */}
          <div className="space-y-2">
            {isListening && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600">
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Ouvindo... Fale agora</span>
                </div>
              </div>
            )}
            
            {isSpeaking && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Falando...</span>
                </div>
              </div>
            )}
            
            {transcript && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Último comando:</div>
                <div className="text-sm text-muted-foreground">{transcript}</div>
              </div>
            )}
          </div>

          {/* Comandos de teste */}
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Comandos de Teste:
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
              {testCommands.map((cmd, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => testCommand(cmd.text, cmd.module)}
                  className="text-xs justify-start"
                  title={cmd.description}
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  {cmd.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Instruções */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Diga comandos como:
            </div>
            <div>• &quot;Dashboard&quot; ou &quot;Painel&quot;</div>
            <div>• &quot;Recursos Humanos&quot; ou &quot;RH&quot;</div>
            <div>• &quot;Viagens&quot; ou &quot;Travel&quot;</div>
            <div>• &quot;Sistema Marítimo&quot;</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceTestingPanel;