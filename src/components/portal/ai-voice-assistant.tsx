import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceAssistantProps {
  crewMemberId?: string;
  onResponse?: (response: string) => void;
}

export const AIVoiceAssistant: React.FC<VoiceAssistantProps> = ({ crewMemberId, onResponse }) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Solicitar permissão de microfone
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioPermission(true);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      setAudioPermission(false);
      toast({
        title: "Permissão negada",
        description: "Precisamos da permissão do microfone para o assistente por voz",
        variant: "destructive",
      });
      return false;
    }
  };

  // Iniciar gravação
  const startRecording = async () => {
    if (audioPermission === null) {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      setTranscript("Ouvindo...");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a gravação",
        variant: "destructive",
      });
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsProcessing(true);
      setTranscript("Processando...");
    }
  };

  // Processar áudio com ElevenLabs e AI
  const processAudio = async (audioBlob: Blob) => {
    try {
      // Converter blob para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];

        if (!base64Audio) {
          throw new Error("Erro ao converter áudio");
        }

        // Enviar para edge function
        const { data, error } = await supabase.functions.invoke("eleven-labs-voice", {
          body: {
            type: "speech_to_text",
            audio: base64Audio,
            crewMemberId,
          },
        });

        if (error) throw error;

        const transcription = data.transcription;
        setTranscript(transcription);

        // Processar resposta com IA
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
          "crew-ai-insights",
          {
            body: {
              type: "voice_chat",
              message: transcription,
              crewMemberId,
              responseFormat: "voice",
            },
          }
        );

        if (aiError) throw aiError;

        const response = aiResponse.response;
        onResponse?.(response);

        // Converter resposta para fala
        await textToSpeech(response);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      setTranscript("Erro no processamento");
      toast({
        title: "Erro",
        description: "Não foi possível processar o áudio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Converter texto para fala usando ElevenLabs
  const textToSpeech = async (text: string) => {
    try {
      setIsSpeaking(true);

      const { data, error } = await supabase.functions.invoke("eleven-labs-voice", {
        body: {
          type: "text_to_speech",
          text,
          voiceId: "Sarah", // Voz padrão
          crewMemberId,
        },
      });

      if (error) throw error;

      // Reproduzir áudio
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audio.onended = () => setIsSpeaking(false);
      await audio.play();
    } catch (error) {
      setIsSpeaking(false);

      // Fallback para síntese nativa do navegador
      fallbackTextToSpeech(text);
    }
  };

  // Fallback para síntese de fala nativa
  const fallbackTextToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      speechSynthRef.current = new SpeechSynthesisUtterance(text);
      speechSynthRef.current.lang = "pt-BR";
      speechSynthRef.current.rate = 0.9;
      speechSynthRef.current.pitch = 1;

      speechSynthRef.current.onend = () => setIsSpeaking(false);
      speechSynthRef.current.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(speechSynthRef.current);
      setIsSpeaking(true);
    } else {
      setIsSpeaking(false);
      toast({
        title: "Síntese de fala não disponível",
        description: "Seu navegador não suporta síntese de fala",
        variant: "destructive",
      });
    }
  };

  // Parar fala
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Assistente por Voz</h3>
          <p className="text-sm text-muted-foreground">
            Fale com a IA sobre documentos, regras e carreira
          </p>
        </div>

        {/* Status */}
        <div className="flex justify-center">
          {isListening && (
            <Badge variant="default" className="animate-pulse">
              <Mic className="h-3 w-3 mr-1" />
              Ouvindo...
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processando...
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="outline">
              <Volume2 className="h-3 w-3 mr-1" />
              Falando...
            </Badge>
          )}
        </div>

        {/* Transcrição */}
        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            onClick={isListening ? stopRecording : startRecording}
            disabled={isProcessing || audioPermission === false}
            className="flex-1"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Parar
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Falar
              </>
            )}
          </Button>

          {isSpeaking && (
            <Button variant="outline" size="lg" onClick={stopSpeaking}>
              <VolumeX className="h-4 w-4" />
            </Button>
          )}
        </div>

        {audioPermission === false && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Permissão de microfone negada</p>
            <Button variant="outline" size="sm" onClick={requestMicrophonePermission}>
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
