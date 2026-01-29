/**
 * MLC Voice Chat Component
 * AI-powered voice assistant for MLC 2006 inspections
 * Integrates with ElevenLabs for HD voice and Lovable AI for conversation
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Brain,
  Sparkles,
  RefreshCw,
  Scale,
  HelpCircle,
  Loader2,
  Headphones
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MLCVoiceChatProps {
  onQuestionAsked?: (question: string, answer: string) => void;
}

const QUICK_QUESTIONS = [
  "Quais são os requisitos de horas de descanso?",
  "O que deve conter no SEA (contrato)?",
  "Como funciona a repatriação?",
  "Quais documentos são obrigatórios?",
  "Quando o navio pode ser detido?",
  "Requisitos de certificação médica?"
];

export function MLCVoiceChat({ onQuestionAsked }: MLCVoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-send after voice input
        if (transcript.trim()) {
          setTimeout(() => sendMessage(transcript), 300);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Erro no reconhecimento de voz");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Reconhecimento de voz não suportado");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("🎤 Fale sua pergunta sobre MLC...");
    }
  };

  // ElevenLabs HD TTS
  const speakWithElevenLabs = async (text: string) => {
    if (!voiceEnabled || !text) return;
    
    setIsPlayingAudio(true);
    
    try {
      // Limit text for voice (60 words for natural speech)
      const words = text.split(/\s+/);
      const limitedText = words.slice(0, 60).join(' ') + (words.length > 60 ? '...' : '');
      
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: response, error } = await supabase.functions.invoke("mlc-voice-tts", {
        body: { text: limitedText },
      });

      if (error) {
        throw error;
      }

      const ttsData = response;
      
      if (ttsData?.audioContent) {
        // Play audio using data URI
        const audioUrl = `data:audio/mpeg;base64,${ttsData.audioContent}`;
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsPlayingAudio(false);
          setIsSpeaking(false);
        };
        audioRef.current.onerror = () => {
          setIsPlayingAudio(false);
          setIsSpeaking(false);
          // Fallback to browser TTS
          speakWithBrowserTTS(text);
        };
        
        setIsSpeaking(true);
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsPlayingAudio(false);
      // Fallback to browser TTS
      speakWithBrowserTTS(text);
    }
  };

  // Browser TTS fallback
  const speakWithBrowserTTS = (text: string) => {
    if (!voiceEnabled) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text.substring(0, 500));
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPlayingAudio(false);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: responseData, error } = await supabase.functions.invoke("mlc-assistant", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        },
      });

      if (error) {
        throw error;
      }

      // Handle response from edge function (non-streaming)
      const assistantContent = responseData?.content || responseData?.message || 
        "Desculpe, não consegui processar sua pergunta. Por favor, tente novamente.";
      const assistantId = `assistant_${Date.now()}`;

      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      }]);

      // Speak response if voice enabled (use ElevenLabs or browser TTS)
      if (voiceEnabled && assistantContent) {
        if (useElevenLabs) {
          speakWithElevenLabs(assistantContent);
        } else {
          speakWithBrowserTTS(assistantContent);
        }
      }

      // Callback for parent component
      if (onQuestionAsked && assistantContent) {
        onQuestionAsked(text, assistantContent);
      }

    } catch (error) {
      console.error('Error:', error);
      
      // Fallback response
      const fallbackResponse = `Como especialista em MLC 2006, posso ajudar com sua pergunta sobre "${text}". 

A Maritime Labour Convention 2006 estabelece direitos e condições mínimas de trabalho para marítimos. Para uma resposta mais detalhada, por favor reformule sua pergunta ou consulte os documentos específicos da MLC.

Áreas principais cobertas:
• Título 1: Requisitos mínimos (idade, certificados, qualificação)
• Título 2: Condições de emprego (SEA, salários, horas, férias)
• Título 3: Acomodação e alimentação
• Título 4: Saúde e segurança
• Título 5: Conformidade e aplicação`;

      setMessages(prev => [...prev, {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
              <Brain className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <span className="text-lg">MLCGuard AI</span>
              <Badge variant="outline" className="ml-2 text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> MLC 2006
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* ElevenLabs HD Toggle */}
            {voiceEnabled && (
              <div className="flex items-center gap-1 mr-2">
                <Headphones className={`h-3 w-3 ${useElevenLabs ? 'text-blue-500' : 'text-muted-foreground'}`} />
                <Switch
                  checked={useElevenLabs}
                  onCheckedChange={setUseElevenLabs}
                  className="scale-75"
                />
                <span className="text-xs text-muted-foreground">HD</span>
              </div>
            )}
            
            <Button
              variant={voiceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isSpeaking) stopSpeaking();
                if (!voiceEnabled) {
                  toast.success("Voz ativada", { description: useElevenLabs ? "ElevenLabs HD" : "Browser TTS" });
                }
              }}
              className={isSpeaking ? "animate-pulse" : ""}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            {isSpeaking && (
              <Button variant="destructive" size="sm" onClick={stopSpeaking}>
                Parar
              </Button>
            )}
            
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Scale className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-lg mb-2">Assistente MLC 2006</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Tire dúvidas sobre a Convenção do Trabalho Marítimo, requisitos de inspeção,
                direitos dos marítimos e conformidade.
              </p>
              
              {/* Quick Questions */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 justify-start text-left"
                    onClick={() => sendMessage(q)}
                  >
                    <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">MLCGuard</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg mr-8">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-muted-foreground">Analisando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleListening}
            className="flex-shrink-0"
          >
            {isListening ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pergunte sobre MLC 2006, requisitos, direitos..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />

          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isListening && (
          <p className="text-xs text-center text-muted-foreground mt-2 animate-pulse">
            🎤 Ouvindo... Fale sua pergunta
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default MLCVoiceChat;
