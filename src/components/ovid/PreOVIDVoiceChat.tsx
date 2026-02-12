/**
 * PreOVID Voice Chat - PATCH 865
 * Removed @ts-nocheck, migrated to edge-function-helper
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, MicOff, Volume2, Brain, 
  Loader2, Square
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from '@/lib/supabase/edge-function-helper';

// SpeechRecognition types for Web Speech API
interface WebSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface WebSpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => WebSpeechRecognition;

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PreOVIDVoiceChatProps {
  vesselType: string;
  chapterId?: string;
  chapterName?: string;
}

export const PreOVIDVoiceChat: React.FC<PreOVIDVoiceChatProps> = ({
  vesselType,
  chapterId,
  chapterName,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    const windowWithSpeech = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: WebSpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            setTranscript(result[0].transcript);
          }
        }
        if (finalTranscript) {
          handleUserMessage(finalTranscript);
          setTranscript('');
        }
      };

      recognition.onerror = (event: WebSpeechRecognitionErrorEvent) => {
        logger.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleUserMessage = async (text: string) => {
    const userMessage: VoiceMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await fetch(getEdgeFunctionUrl('preovid-ai-chat'), {
        method: 'POST',
        headers: getEdgeFunctionHeaders(),
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          vesselType,
          chapterId,
          mode: 'voice',
          language: 'pt',
        }),
      });

      if (!response.ok) throw new Error('Falha na comunicação');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) assistantContent += content;
            } catch { /* expected: partial SSE JSON chunk */ }
          }
        }
      }

      const assistantMessage: VoiceMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response
      speakText(assistantContent);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      toast.error('Erro ao processar mensagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Reconhecimento de voz não suportado');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Voice Assistant OVID</span>
          </div>
          {chapterName && (
            <Badge variant="outline" className="text-xs">
              {chapterName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-3 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Mic className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Pressione o botão e fale sua pergunta</p>
              <p className="text-xs mt-2">Sobre OVIQ4, evidências ou procedimentos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={`voice-msg-${i}-${msg.role}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-2 rounded-lg bg-primary/50 text-primary-foreground">
                    <p className="text-sm italic">{transcript}...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isListening ? 'destructive' : 'default'}
            size="lg"
            className="w-16 h-16 rounded-full"
            onClick={toggleListening}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {isSpeaking && (
            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full"
              onClick={stopSpeaking}
            >
              <Square className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="text-center mt-3">
          {isListening && (
            <Badge variant="destructive" className="animate-pulse">
              <Mic className="w-3 h-3 mr-1" />
              Ouvindo...
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Processando...
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="default">
              <Volume2 className="w-3 h-3 mr-1" />
              Falando...
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
