/**
 * ModuleAIChat - Chat IA Contextual V2
 * Componente de chat IA reutilizável para todos os módulos
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
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

interface ModuleAIChatProps {
  moduleName: string;
  moduleContext: string;
  systemPrompt: string;
  quickQuestions?: string[];
  onQuestionAsked?: (question: string, answer: string) => void;
  edgeFunctionName?: string;
  accentColor?: string;
}

export function ModuleAIChat({
  moduleName,
  moduleContext,
  systemPrompt,
  quickQuestions = [],
  onQuestionAsked,
  edgeFunctionName = "module-ai-chat",
  accentColor = "blue"
}: ModuleAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        if (transcript.trim()) {
          setTimeout(() => sendMessage(transcript), 300);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Erro no reconhecimento de voz");
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

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
      toast.info(`🎤 Fale sua pergunta sobre ${moduleName}...`);
    }
  };

  const speakText = (text: string) => {
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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${edgeFunctionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          module: moduleName,
          context: moduleContext,
          system_prompt: systemPrompt,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantId = `assistant_${Date.now()}`;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant' && last.id === assistantId) {
                      return prev.map((m, i) => 
                        i === prev.length - 1 
                          ? { ...m, content: assistantContent } 
                          : m
                      );
                    }
                    return [...prev, {
                      id: assistantId,
                      role: 'assistant',
                      content: assistantContent,
                      timestamp: new Date()
                    }];
                  });
                }
              } catch {}
            }
          }
        }
      }

      if (voiceEnabled && assistantContent) {
        speakText(assistantContent);
      }

      if (onQuestionAsked && assistantContent) {
        onQuestionAsked(text, assistantContent);
      }

    } catch (error) {
      console.error('Error:', error);
      
      const fallbackResponse = `Como assistente de ${moduleName}, posso ajudar com sua pergunta. Por favor, reformule ou consulte a documentação do módulo para mais detalhes.`;

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
            <div className={`p-2 bg-gradient-to-br from-${accentColor}-500/20 to-${accentColor}-500/10 rounded-lg`}>
              <Brain className={`h-5 w-5 text-${accentColor}-500`} />
            </div>
            <div>
              <span className="text-lg">{moduleName} AI</span>
              <Badge variant="outline" className="ml-2 text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Lovable AI
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={voiceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isSpeaking) stopSpeaking();
                if (!voiceEnabled) {
                  toast.success("Voz ativada");
                }
              }}
              className={isSpeaking ? "animate-pulse" : ""}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            {isSpeaking && (
              <Button variant="destructive" size="sm" onClick={stopSpeaking}>
                Parar
              </Button>
            )}
            
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Brain className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-lg mb-2">Assistente {moduleName}</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Tire dúvidas sobre {moduleContext}
              </p>
              
              {quickQuestions.length > 0 && (
                <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                  {quickQuestions.slice(0, 6).map((q, i) => (
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
              )}
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
                        <Brain className={`h-4 w-4 text-${accentColor}-500`} />
                        <span className="text-xs font-medium">{moduleName} AI</span>
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
                      <Loader2 className={`h-4 w-4 animate-spin text-${accentColor}-500`} />
                      <span className="text-sm text-muted-foreground">Analisando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

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
            placeholder={`Pergunte sobre ${moduleName}...`}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />

          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ModuleAIChat;
