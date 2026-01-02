import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, MicOff, Volume2, VolumeX, Brain, 
  Phone, PhoneOff, Loader2, Wifi, WifiOff,
  MessageSquare, Wand2, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { PreOVIDRealtimeChat, RealtimeMessage } from '@/utils/PreOVIDRealtimeAudio';

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PreOVIDRealtimeVoiceProps {
  vesselType: string;
  chapterId?: string;
  chapterName?: string;
  onCommand?: (command: string, params?: Record<string, string>) => void;
}

export const PreOVIDRealtimeVoice: React.FC<PreOVIDRealtimeVoiceProps> = ({
  vesselType,
  chapterId,
  chapterName,
  onCommand,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  
  const chatRef = useRef<PreOVIDRealtimeChat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript, assistantResponse]);

  const handleMessage = useCallback((event: RealtimeMessage) => {
    console.log('Realtime message:', event.type);
    
    // Parse voice commands from transcript
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const transcript = event.transcript as string;
      setMessages(prev => [...prev, {
        role: 'user',
        content: transcript,
        timestamp: new Date()
      }]);
      setCurrentTranscript('');
      
      // Check for navigation commands
      parseVoiceCommand(transcript);
    }
    
    // Collect assistant response
    if (event.type === 'response.audio_transcript.delta') {
      setAssistantResponse(prev => prev + (event.delta as string));
    }
    
    // Finalize assistant response
    if (event.type === 'response.audio_transcript.done') {
      const finalResponse = assistantResponse + (event.transcript as string || '');
      if (finalResponse) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: finalResponse,
          timestamp: new Date()
        }]);
      }
      setAssistantResponse('');
    }
  }, [assistantResponse, onCommand]);

  const parseVoiceCommand = (transcript: string) => {
    const lower = transcript.toLowerCase();
    
    if (lower.includes('próximo item') || lower.includes('próxima questão')) {
      onCommand?.('next');
    } else if (lower.includes('item anterior') || lower.includes('voltar')) {
      onCommand?.('previous');
    } else if (lower.includes('marcar conforme') || lower.includes('está conforme')) {
      onCommand?.('mark_compliant');
    } else if (lower.includes('não conforme') || lower.includes('não está conforme')) {
      onCommand?.('mark_non_compliant');
    } else if (lower.includes('gerar evidência') || lower.includes('criar evidência')) {
      onCommand?.('generate_evidence');
    } else if (lower.includes('salvar') || lower.includes('gravar')) {
      onCommand?.('save');
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    
    try {
      chatRef.current = new PreOVIDRealtimeChat({
        vesselType,
        chapterId,
        onMessage: handleMessage,
        onSpeakingChange: setIsSpeaking,
        onTranscript: (text, isFinal) => {
          if (!isFinal) {
            setCurrentTranscript(prev => prev + text);
          }
        },
        onError: (error) => {
          console.error('Realtime error:', error);
          toast.error('Erro na conexão de voz');
          setIsConnected(false);
        }
      });
      
      await chatRef.current.init();
      setIsConnected(true);
      toast.success('Assistente de voz conectado!');
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Falha ao conectar assistente de voz');
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
    setAssistantResponse('');
    toast.info('Assistente de voz desconectado');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  const quickCommands = [
    { icon: Wand2, label: 'Gerar Evidência', command: 'Gere uma evidência objetiva para este item' },
    { icon: AlertTriangle, label: 'Riscos', command: 'Quais são os principais riscos deste capítulo?' },
    { icon: MessageSquare, label: 'Referência', command: 'Qual a referência normativa deste item?' },
  ];

  const sendQuickCommand = async (text: string) => {
    if (!chatRef.current?.isConnected()) {
      toast.error('Assistente não conectado');
      return;
    }
    
    try {
      await chatRef.current.sendTextMessage(text);
      setMessages(prev => [...prev, {
        role: 'user',
        content: text,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-base">ARIA Voice</span>
            {isConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                <Wifi className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            )}
          </div>
          {chapterName && (
            <Badge variant="secondary" className="text-xs">
              {chapterName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Quick Commands */}
        {isConnected && (
          <div className="flex gap-2 flex-wrap">
            {quickCommands.map((cmd, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => sendQuickCommand(cmd.command)}
              >
                <cmd.icon className="w-3 h-3 mr-1" />
                {cmd.label}
              </Button>
            ))}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-3" ref={scrollRef}>
          {messages.length === 0 && !isConnected ? (
            <div className="text-center text-muted-foreground py-8">
              <Mic className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Assistente de Voz OVID</p>
              <p className="text-xs mt-2">
                Clique em "Iniciar" para conversar com a ARIA
              </p>
              <p className="text-xs mt-1 text-primary">
                Suporte: {vesselType}
              </p>
            </div>
          ) : messages.length === 0 && isConnected ? (
            <div className="text-center text-muted-foreground py-8">
              <Volume2 className="w-10 h-10 mx-auto mb-3 opacity-50 animate-pulse" />
              <p className="text-sm">Fale sua pergunta...</p>
              <p className="text-xs mt-2">
                ARIA está ouvindo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
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
              
              {/* Live transcripts */}
              {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-2 rounded-lg bg-primary/50 text-primary-foreground">
                    <p className="text-sm italic">{currentTranscript}...</p>
                  </div>
                </div>
              )}
              
              {assistantResponse && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-2 rounded-lg bg-muted animate-pulse">
                    <p className="text-sm">{assistantResponse}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              size="lg"
              className="w-40"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={endConversation}
              variant="destructive"
              size="lg"
              className="w-40"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Encerrar
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="text-center">
          {isSpeaking && (
            <Badge variant="default" className="animate-pulse">
              <Volume2 className="w-3 h-3 mr-1" />
              ARIA está falando...
            </Badge>
          )}
          {isConnected && !isSpeaking && (
            <Badge variant="outline" className="text-muted-foreground">
              <Mic className="w-3 h-3 mr-1" />
              Aguardando sua voz...
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
