import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { useVoiceSynthesis } from "./hooks/useVoiceSynthesis";
import { useVoiceLogging } from "./hooks/useVoiceLogging";
import { ConversationHistory } from "./components/ConversationHistory";

type Language = "pt-BR" | "en-US";

const LANGUAGES: Record<Language, { name: string; code: string }> = {
  "pt-BR": { name: "Português (BR)", code: "pt-BR" },
  "en-US": { name: "English (US)", code: "en-US" }
};

export default function VoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [language, setLanguage] = useState<Language>("pt-BR");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>>([]);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: speechSupported,
    currentLanguage,
    changeLanguage
  } = useVoiceRecognition(language);

  const {
    speak,
    isSpeaking,
    cancel: cancelSpeech,
    isSupported: ttsSupported
  } = useVoiceSynthesis();

  const {
    currentConversationId,
    startConversation,
    endConversation,
    logMessage
  } = useVoiceLogging();

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

  // Estimated milliseconds per character for TTS duration calculation
  const CHARS_TO_MS_ESTIMATE = 50;

  const handleUserMessage = async (text: string) => {
    const userMessage = { role: "user" as const, content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    // Log user message to database
    await logMessage("user", text, {
      transcript: text,
      duration: 0
    });

    // Simular resposta do assistente (integrar com OpenAI depois)
    const response = generateResponse(text, language);
    const assistantMessage = { role: "assistant" as const, content: response, timestamp: new Date() };
    
    setMessages(prev => [...prev, assistantMessage]);

    // Log assistant message to database with estimated duration
    await logMessage("assistant", response, {
      duration: response.length * CHARS_TO_MS_ESTIMATE
    });
    
    if (ttsSupported) {
      speak(response, language);
    }
  };

  const generateResponse = (input: string, lang: Language): string => {
    const lower = input.toLowerCase();
    
    if (lang === "pt-BR") {
      if (lower.includes("olá") || lower.includes("oi")) {
        return "Olá! Como posso ajudá-lo hoje no Nautilus One?";
      }
      if (lower.includes("status") || lower.includes("embarcações")) {
        return "Todas as embarcações estão operacionais. A frota está 100% ativa no momento.";
      }
      if (lower.includes("manutenção")) {
        return "Há 3 manutenções programadas para esta semana. Deseja ver os detalhes?";
      }
      if (lower.includes("relatório") || lower.includes("report")) {
        return "Posso gerar relatórios de operações, manutenção, compliance e performance. Qual relatório você precisa?";
      }
      
      return "Entendi. Posso ajudá-lo com informações sobre frotas, manutenções, relatórios e operações do Nautilus One.";
    } else {
      // English responses
      if (lower.includes("hello") || lower.includes("hi")) {
        return "Hello! How can I help you today with Nautilus One?";
      }
      if (lower.includes("status") || lower.includes("vessels")) {
        return "All vessels are operational. The fleet is 100% active at the moment.";
      }
      if (lower.includes("maintenance")) {
        return "There are 3 scheduled maintenances this week. Would you like to see the details?";
      }
      if (lower.includes("report")) {
        return "I can generate reports on operations, maintenance, compliance and performance. Which report do you need?";
      }
      
      return "Understood. I can help you with information about fleets, maintenance, reports and Nautilus One operations.";
    }
  };

  const toggleAssistant = async () => {
    if (isActive) {
      stopListening();
      cancelSpeech();
      setIsActive(false);
      
      // End conversation in database
      await endConversation();
      
      toast.info(language === "pt-BR" ? "Assistente desativado" : "Assistant deactivated", {
        description: language === "pt-BR" ? "Conversa encerrada e salva" : "Conversation ended and saved"
      });
    } else {
      if (speechSupported) {
        // Start new conversation in database
        await startConversation(language === "pt-BR" ? "Conversa de Voz" : "Voice Conversation");
        
        startListening();
        setIsActive(true);
        toast.success(language === "pt-BR" ? "Assistente ativado" : "Assistant activated", {
          description: language === "pt-BR" ? "Pode começar a falar" : "You can start speaking"
        });
      }
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    changeLanguage(newLang);
    toast.info(
      language === "pt-BR" ? "Idioma alterado" : "Language changed",
      { description: LANGUAGES[newLang].name }
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "pt-BR" ? "Assistente de Voz" : "Voice Assistant"}
          </h1>
          <p className="text-muted-foreground">
            {language === "pt-BR" 
              ? "Controle o Nautilus One por comandos de voz"
              : "Control Nautilus One with voice commands"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([code, { name }]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {!speechSupported && (
            <span className="text-sm text-destructive">
              {language === "pt-BR" ? "Navegador não suportado" : "Browser not supported"}
            </span>
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
                {language === "pt-BR" ? "Desativar" : "Deactivate"}
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                {language === "pt-BR" ? "Ativar Assistente" : "Activate Assistant"}
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
            {language === "pt-BR" ? "Status do Assistente" : "Assistant Status"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {language === "pt-BR" ? "Estado" : "State"}
              </span>
              <span className={`text-sm font-medium ${isActive ? "text-success" : "text-muted-foreground"}`}>
                {isActive 
                  ? (language === "pt-BR" ? "Ativo" : "Active")
                  : (language === "pt-BR" ? "Inativo" : "Inactive")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {language === "pt-BR" ? "Escutando" : "Listening"}
              </span>
              <span className={`text-sm font-medium ${isListening ? "text-primary" : "text-muted-foreground"}`}>
                {isListening 
                  ? (language === "pt-BR" ? "Sim" : "Yes")
                  : (language === "pt-BR" ? "Não" : "No")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {language === "pt-BR" ? "Falando" : "Speaking"}
              </span>
              <span className={`text-sm font-medium ${isSpeaking ? "text-primary" : "text-muted-foreground"}`}>
                {isSpeaking 
                  ? (language === "pt-BR" ? "Sim" : "Yes")
                  : (language === "pt-BR" ? "Não" : "No")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {language === "pt-BR" ? "Idioma" : "Language"}
              </span>
              <span className="text-sm font-medium">
                {LANGUAGES[language].name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <ConversationHistory messages={messages} />

      {/* Voice Controls Help */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "pt-BR" ? "Comandos Disponíveis" : "Available Commands"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {language === "pt-BR" ? (
              <>
                <li>• "Olá" ou "Oi" - Cumprimentar o assistente</li>
                <li>• "Status das embarcações" - Ver status da frota</li>
                <li>• "Programar manutenção" - Agendar manutenções</li>
                <li>• "Gerar relatório" - Criar relatórios</li>
                <li>• "Ajuda" - Ver mais comandos</li>
              </>
            ) : (
              <>
                <li>• "Hello" or "Hi" - Greet the assistant</li>
                <li>• "Vessel status" - View fleet status</li>
                <li>• "Schedule maintenance" - Schedule maintenance</li>
                <li>• "Generate report" - Create reports</li>
                <li>• "Help" - See more commands</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
