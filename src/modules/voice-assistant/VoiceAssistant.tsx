import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { useVoiceSynthesis } from "./hooks/useVoiceSynthesis";
import { useVoiceConversation } from "./hooks/useVoiceConversation";
import { ConversationHistory } from "./components/ConversationHistory";

export default function VoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [localMessages, setLocalMessages] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>>([]);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: speechSupported 
  } = useVoiceRecognition();

  const {
    speak,
    isSpeaking,
    cancel: cancelSpeech,
    isSupported: ttsSupported
  } = useVoiceSynthesis();

  const {
    currentConversation,
    messages: dbMessages,
    startConversation,
    endConversation,
    logMessage
  } = useVoiceConversation();

  useEffect(() => {
    if (!speechSupported) {
      toast.error("Seu navegador não suporta reconhecimento de voz", {
        description: "Use Chrome, Edge ou Safari para melhor experiência"
      });
    }
  }, [speechSupported]);

  useEffect(() => {
    if (transcript) {
      handleUserMessage(transcript);
    }
  }, [transcript]);

  const handleUserMessage = async (text: string) => {
    const userMessage = { role: "user" as const, content: text, timestamp: new Date() };
    setLocalMessages(prev => [...prev, userMessage]);

    // Log to database
    await logMessage("user", text, {
      transcript: text,
      command_detected: detectCommand(text)
    });

    // Simular resposta do assistente (integrar com OpenAI depois)
    const response = generateResponse(text);
    const assistantMessage = { role: "assistant" as const, content: response, timestamp: new Date() };
    
    setLocalMessages(prev => [...prev, assistantMessage]);
    
    // Log assistant response to database
    await logMessage("assistant", response, {
      action_taken: detectCommand(text)
    });
    
    if (ttsSupported) {
      speak(response);
    }
  };

  const detectCommand = (input: string): string | undefined => {
    const lower = input.toLowerCase();
    if (lower.includes("status") || lower.includes("embarcações")) return "fleet_status_query";
    if (lower.includes("manutenção")) return "maintenance_query";
    if (lower.includes("relatório") || lower.includes("report")) return "report_request";
    if (lower.includes("dashboard")) return "dashboard_navigation";
    if (lower.includes("missão") || lower.includes("mission")) return "mission_query";
    return undefined;
  };

  const generateResponse = (input: string): string => {
    const lower = input.toLowerCase();
    
    if (lower.includes("olá") || lower.includes("oi")) {
      return "Olá! Como posso ajudá-lo hoje no Nautilus One?";
    }
    if (lower.includes("status") || lower.includes("embarcações")) {
      return "Todas as embarcações estão operacionais. A frota está 100% ativa no momento.";
    }
    if (lower.includes("dashboard") || lower.includes("painel")) {
      return "Abrindo o painel de controle principal. Um momento, por favor.";
    }
    if (lower.includes("missão") || lower.includes("mission")) {
      return "O centro de controle de missões está disponível. Há 2 missões ativas no momento.";
    }
    if (lower.includes("manutenção")) {
      return "Há 3 manutenções programadas para esta semana. Deseja ver os detalhes?";
    }
    if (lower.includes("relatório") || lower.includes("report")) {
      return "Posso gerar relatórios de operações, manutenção, compliance e performance. Qual relatório você precisa?";
    }
    
    return "Entendi. Posso ajudá-lo com informações sobre frotas, manutenções, relatórios e operações do Nautilus One.";
  };

  const toggleAssistant = async () => {
    if (isActive) {
      stopListening();
      cancelSpeech();
      await endConversation();
      setIsActive(false);
    } else {
      if (speechSupported) {
        const conversation = await startConversation();
        if (conversation) {
          startListening();
          setIsActive(true);
          toast.success("Assistente ativado", {
            description: "Pode começar a falar"
          });
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assistente de Voz</h1>
          <p className="text-muted-foreground">
            Controle o Nautilus One por comandos de voz
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!speechSupported && (
            <span className="text-sm text-destructive">Navegador não suportado</span>
          )}
          <Button
            size="lg"
            variant={isActive ? "destructive" : "default"}
            onClick={toggleAssistant}
            disabled={!speechSupported}
            className="gap-2"
          >
            {isActive ? (
              <>
                <MicOff className="h-5 w-5" />
                Desativar
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Ativar Assistente
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isListening && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {isSpeaking && <Volume2 className="h-5 w-5 text-primary animate-pulse" />}
            {!isListening && !isSpeaking && <Mic className="h-5 w-5 text-muted-foreground" />}
            Status do Assistente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estado</span>
              <span className={`text-sm font-medium ${isActive ? "text-success" : "text-muted-foreground"}`}>
                {isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Escutando</span>
              <span className={`text-sm font-medium ${isListening ? "text-primary" : "text-muted-foreground"}`}>
                {isListening ? "Sim" : "Não"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Falando</span>
              <span className={`text-sm font-medium ${isSpeaking ? "text-primary" : "text-muted-foreground"}`}>
                {isSpeaking ? "Sim" : "Não"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <ConversationHistory messages={localMessages} />

      {/* Conversation Info */}
      {currentConversation && (
        <Card>
          <CardHeader>
            <CardTitle>Sessão Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID da Sessão:</span>
                <span className="font-mono">{currentConversation.session_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mensagens:</span>
                <span>{currentConversation.message_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Iniciada:</span>
                <span>{new Date(currentConversation.start_time).toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Controls Help */}
      <Card>
        <CardHeader>
          <CardTitle>Comandos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• "Olá" ou "Oi" - Cumprimentar o assistente</li>
            <li>• "Status das embarcações" - Ver status da frota</li>
            <li>• "Abrir dashboard" - Navegar para painel principal</li>
            <li>• "Status da missão" - Consultar missões ativas</li>
            <li>• "Programar manutenção" - Agendar manutenções</li>
            <li>• "Gerar relatório" - Criar relatórios</li>
            <li>• "Ajuda" - Ver mais comandos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
