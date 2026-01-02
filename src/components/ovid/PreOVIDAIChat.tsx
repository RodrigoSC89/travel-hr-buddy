import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Send, Loader2, FileCheck, AlertTriangle, ClipboardList, 
  Book, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PreOVIDAIChatProps {
  vesselType: string;
  chapterId?: string;
  questionId?: string;
  mode?: 'chat' | 'evidence' | 'voice';
}

export const PreOVIDAIChat: React.FC<PreOVIDAIChatProps> = ({ 
  vesselType, 
  chapterId, 
  questionId,
  mode = 'chat'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current!.continuous = false;
      recognitionRef.current!.interimResults = false;
      recognitionRef.current!.lang = 'pt-BR';

      recognitionRef.current!.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current!.onerror = () => {
        setIsListening(false);
        toast.error('Erro no reconhecimento de voz');
      };

      recognitionRef.current!.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Reconhecimento de voz não suportado neste navegador');
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

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/preovid-ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          vesselType,
          chapterId,
          questionId,
          mode,
          language: 'pt',
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Limite de requisições excedido. Tente novamente em breve.');
          return;
        }
        if (response.status === 402) {
          toast.error('Créditos insuficientes. Adicione créditos ao workspace.');
          return;
        }
        throw new Error('Falha na comunicação com IA');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      // Auto-speak in voice mode
      if (mode === 'voice' && assistantContent) {
        speakText(assistantContent);
      }
    } catch (error) {
      toast.error('Erro ao comunicar com assistente IA');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      icon: FileCheck, 
      label: 'Gerar Evidência', 
      prompt: questionId 
        ? `Gere uma evidência detalhada para a não conformidade no item ${questionId}` 
        : 'Como gerar evidências para uma não conformidade no OVIQ4?' 
    },
    { 
      icon: AlertTriangle, 
      label: 'Analisar Risco', 
      prompt: `Analise os riscos do capítulo ${chapterId || 'atual'} e priorize os itens críticos.` 
    },
    { 
      icon: ClipboardList, 
      label: 'Checklist Pré-Inspeção', 
      prompt: `Gere um checklist de preparação pré-inspeção OVID para ${vesselType}` 
    },
    { 
      icon: Book, 
      label: 'Referências', 
      prompt: 'Quais são as principais referências normativas para este capítulo? (SOLAS, MARPOL, ISM, STCW, MLC, GOMO)' 
    },
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Assistente IA Pre-OVID</span>
          </div>
          <div className="flex items-center gap-2">
            {chapterId && (
              <Badge variant="outline">Cap. {chapterId}</Badge>
            )}
            {questionId && (
              <Badge variant="secondary">{questionId}</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map((action, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm" 
              onClick={() => sendMessage(action.prompt)} 
              disabled={isLoading}
              className="text-xs"
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1 border rounded-lg p-4 mb-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Pergunte sobre OVIQ4, evidências, normas ou procedimentos de inspeção</p>
              <p className="text-xs mt-2">Contexto: {vesselType}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && msg.content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-6 px-2"
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content)}
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Button
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            onClick={toggleListening}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Textarea
            placeholder="Pergunte sobre OVIQ4, evidências, observações..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            className="resize-none flex-1"
            rows={2}
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
