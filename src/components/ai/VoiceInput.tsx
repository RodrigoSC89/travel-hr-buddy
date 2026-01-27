/**
 * PATCH 854 - Voice Input Component for AI
 * Speech recognition input for hands-free AI interaction
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  language?: string;
  className?: string;
}

export function VoiceInput({
  onTranscription,
  disabled = false,
  language = "pt-BR",
  className = "",
}: VoiceInputProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        onTranscription(finalTranscript);
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        toast.error("Permissão de microfone negada");
      } else if (event.error === "no-speech") {
        toast.info("Nenhuma fala detectada");
      } else {
        toast.error(`Erro no reconhecimento: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscription]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        toast.info("Escutando... Fale sua pergunta");
      } catch {
        toast.error("Erro ao iniciar reconhecimento de voz");
      }
    }
  }, [isListening]);

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Reconhecimento de voz não suportado neste navegador"
        className={className}
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={toggleListening}
        disabled={disabled}
        className="relative"
        title={isListening ? "Parar gravação" : "Iniciar gravação por voz"}
      >
        {isListening ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
            <span className="animate-pulse">Escutando...</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-1" />
            <span>Voz</span>
          </>
        )}
        {isListening && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-ping" />
        )}
      </Button>
      {transcript && isListening && (
        <span className="text-sm text-muted-foreground italic max-w-[200px] truncate">
          "{transcript}"
        </span>
      )}
    </div>
  );
}

export default VoiceInput;
