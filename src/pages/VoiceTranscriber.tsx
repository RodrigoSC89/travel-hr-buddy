import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Copy, Trash2, Volume2, StopCircle, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

export default function VoiceTranscriber() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [language, setLanguage] = useState("pt-BR");
  
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      toast.success("Gravação iniciada");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      logger.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Permissão de microfone negada");
      } else {
        toast.error(`Erro: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.info("Gravação finalizada");
    }
  }, []);

  const copyToClipboard = async () => {
    if (transcript) {
      await navigator.clipboard.writeText(transcript);
      toast.success("Texto copiado para a área de transferência");
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    toast.info("Transcrição limpa");
  };

  const speakText = () => {
    if (transcript && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
      toast.success("Reproduzindo texto");
    }
  };

  const languages = [
    { code: "pt-BR", label: "Português (Brasil)" },
    { code: "en-US", label: "English (US)" },
    { code: "es-ES", label: "Español" },
    { code: "fr-FR", label: "Français" },
    { code: "de-DE", label: "Deutsch" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          🎙️ IA de Transcrição de Voz
        </h1>
        <p className="text-muted-foreground">
          Transcreva sua voz em texto em tempo real usando tecnologia de reconhecimento de fala
        </p>
      </div>

      {/* Browser Support Warning */}
      {!isSupported && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">
              ⚠️ Reconhecimento de voz não suportado neste navegador.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Por favor, use Google Chrome, Microsoft Edge ou Safari para acessar esta funcionalidade.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Controles de Gravação</CardTitle>
          <CardDescription>
            Clique no botão para iniciar ou parar a transcrição
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Badge
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  language === lang.code && "bg-primary"
                )}
                onClick={() => setLanguage(lang.code)}
              >
                {lang.label}
              </Badge>
            ))}
          </div>

          {/* Recording Button */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isSupported}
              className={cn(
                "gap-2 min-w-[180px]",
                isRecording && "animate-pulse"
              )}
            >
              {isRecording ? (
                <>
                  <StopCircle className="h-5 w-5" />
                  Parar Gravação
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Iniciar Gravação
                </>
              )}
            </Button>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"
                )}
              />
              <span className="text-sm text-muted-foreground">
                {isRecording ? "Gravando..." : "Aguardando"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Output */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📝 Transcrição
              </CardTitle>
              <CardDescription>
                Texto transcrito da sua fala
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={speakText}
                disabled={!transcript}
                className="gap-1"
              >
                <Volume2 className="h-4 w-4" />
                Ouvir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!transcript}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearTranscript}
                disabled={!transcript && !interimTranscript}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={transcript + (interimTranscript ? ` [${interimTranscript}]` : "")}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="O texto transcrito aparecerá aqui..."
            className="min-h-[200px] font-mono"
          />

          {/* Word Count */}
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              Palavras: {transcript.split(/\s+/).filter(Boolean).length}
            </span>
            <span>
              Caracteres: {transcript.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Fale claramente e em um ritmo normal para melhores resultados</li>
            <li>Certifique-se de que o microfone está funcionando corretamente</li>
            <li>Evite ambientes com muito ruído de fundo</li>
            <li>O texto entre colchetes [] indica transcrição em andamento</li>
            <li>Você pode editar o texto manualmente após a transcrição</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
