import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, Volume2, Brain, Camera, FileText,
  Phone, PhoneOff, Loader2, Wifi,
  MessageSquare, Wand2, AlertTriangle, Navigation,
  ChevronRight, ChevronLeft, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { PreOVIDRealtimeChat, RealtimeMessage } from '@/utils/PreOVIDRealtimeAudio';
import { AnimatedAudioWaveform, PulseIndicator } from '@/components/ui/audio-waveform';

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  command?: string;
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
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  
  const chatRef = useRef<PreOVIDRealtimeChat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript, assistantResponse]);

  // Voice commands mapping with patterns
  const voiceCommands = [
    { patterns: ['próximo item', 'próxima questão', 'próximo', 'avançar'], command: 'next', label: 'Próximo' },
    { patterns: ['item anterior', 'voltar', 'anterior', 'retornar'], command: 'previous', label: 'Anterior' },
    { patterns: ['marcar conforme', 'está conforme', 'ok', 'aprovado'], command: 'mark_compliant', label: 'Conforme' },
    { patterns: ['não conforme', 'reprovado', 'falhou'], command: 'mark_non_compliant', label: 'Não Conforme' },
    { patterns: ['gerar evidência', 'criar evidência', 'evidência'], command: 'generate_evidence', label: 'Evidência' },
    { patterns: ['tirar foto', 'capturar foto', 'fotografar', 'foto'], command: 'take_photo', label: 'Foto' },
    { patterns: ['adicionar observação', 'observação', 'nota', 'comentário'], command: 'add_observation', label: 'Observação' },
    { patterns: ['ir para capítulo', 'capítulo', 'abrir capítulo'], command: 'goto_chapter', label: 'Ir para Capítulo' },
    { patterns: ['não aplicável', 'n/a', 'não se aplica'], command: 'mark_na', label: 'N/A' },
    { patterns: ['salvar', 'gravar', 'guardar'], command: 'save', label: 'Salvar' },
    { patterns: ['ajuda', 'comandos', 'o que posso falar'], command: 'help', label: 'Ajuda' },
  ];

  const parseVoiceCommand = (transcript: string): { command: string; params?: Record<string, string> } | null => {
    const lower = transcript.toLowerCase().trim();
    
    for (const cmd of voiceCommands) {
      for (const pattern of cmd.patterns) {
        if (lower.includes(pattern)) {
          // Extract chapter number if going to chapter
          if (cmd.command === 'goto_chapter') {
            const match = lower.match(/cap[íi]tulo\s*(\d+)/i);
            if (match) {
              return { command: cmd.command, params: { chapter: match[1] } };
            }
          }
          return { command: cmd.command };
        }
      }
    }
    
    return null;
  };

  const handleMessage = useCallback((event: RealtimeMessage) => {
    console.log('Realtime message:', event.type);
    
    // Update listening state
    if (event.type === 'input_audio_buffer.speech_started') {
      setIsListening(true);
    }
    if (event.type === 'input_audio_buffer.speech_stopped') {
      setIsListening(false);
    }
    
    // Parse voice commands from transcript
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const transcript = event.transcript as string;
      const parsedCommand = parseVoiceCommand(transcript);
      
      setMessages(prev => [...prev, {
        role: 'user',
        content: transcript,
        timestamp: new Date(),
        command: parsedCommand?.command
      }]);
      setCurrentTranscript('');
      
      // Execute command if recognized
      if (parsedCommand) {
        setLastCommand(parsedCommand.command);
        onCommand?.(parsedCommand.command, parsedCommand.params);
        
        // Show feedback toast
        const cmdInfo = voiceCommands.find(c => c.command === parsedCommand.command);
        if (cmdInfo) {
          toast.success(`Comando: ${cmdInfo.label}`, { duration: 2000 });
        }
      }
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
      toast.success('ARIA conectada! Fale seus comandos.');
      
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
    setIsListening(false);
    setCurrentTranscript('');
    setAssistantResponse('');
    setLastCommand(null);
    toast.info('ARIA desconectada');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  const quickCommands = [
    { icon: ChevronRight, label: 'Próximo', command: 'Próximo item' },
    { icon: CheckCircle, label: 'Conforme', command: 'Marcar conforme' },
    { icon: XCircle, label: 'NC', command: 'Não conforme' },
    { icon: Camera, label: 'Foto', command: 'Tirar foto' },
    { icon: Wand2, label: 'Evidência', command: 'Gerar evidência' },
  ];

  const sendQuickCommand = async (text: string) => {
    if (!chatRef.current?.isConnected()) {
      toast.error('ARIA não conectada');
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

  const getCommandIcon = (command?: string) => {
    const icons: Record<string, React.ReactNode> = {
      next: <ChevronRight className="w-3 h-3" />,
      previous: <ChevronLeft className="w-3 h-3" />,
      mark_compliant: <CheckCircle className="w-3 h-3 text-green-500" />,
      mark_non_compliant: <XCircle className="w-3 h-3 text-red-500" />,
      take_photo: <Camera className="w-3 h-3" />,
      generate_evidence: <Wand2 className="w-3 h-3" />,
      add_observation: <FileText className="w-3 h-3" />,
      goto_chapter: <Navigation className="w-3 h-3" />,
    };
    return command ? icons[command] : null;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-base">ARIA Realtime</span>
            {isConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                WebRTC
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
        {/* Audio Visualization */}
        {isConnected && (
          <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2">
              <PulseIndicator isActive={isListening} type="input" size="sm" />
              <div className="w-24">
                <AnimatedAudioWaveform isActive={isListening} type="input" barCount={5} />
              </div>
              <span className="text-xs text-muted-foreground">Você</span>
            </div>
            
            <div className="w-px h-8 bg-border" />
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">ARIA</span>
              <div className="w-24">
                <AnimatedAudioWaveform isActive={isSpeaking} type="output" barCount={5} />
              </div>
              <PulseIndicator isActive={isSpeaking} type="output" size="sm" />
            </div>
          </div>
        )}

        {/* Quick Commands */}
        {isConnected && (
          <div className="flex gap-1.5 flex-wrap justify-center">
            {quickCommands.map((cmd, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
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
              <p className="text-sm font-medium">ARIA Voice - Inspeção OVID</p>
              <p className="text-xs mt-2">
                Clique em "Iniciar" para ativar comandos de voz
              </p>
              <div className="mt-4 text-left max-w-xs mx-auto">
                <p className="text-xs font-medium mb-2">Comandos disponíveis:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• "Próximo item" / "Voltar"</li>
                  <li>• "Marcar conforme" / "Não conforme"</li>
                  <li>• "Tirar foto" / "Adicionar observação"</li>
                  <li>• "Ir para capítulo 5"</li>
                  <li>• "Gerar evidência"</li>
                </ul>
              </div>
            </div>
          ) : messages.length === 0 && isConnected ? (
            <div className="text-center text-muted-foreground py-8">
              <Volume2 className="w-10 h-10 mx-auto mb-3 opacity-50 animate-pulse" />
              <p className="text-sm">Fale sua pergunta ou comando...</p>
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
                    <div className="flex items-center gap-1.5">
                      {msg.command && getCommandIcon(msg.command)}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.command && (
                      <Badge variant="secondary" className="text-[10px] mt-1 h-4">
                        {voiceCommands.find(c => c.command === msg.command)?.label}
                      </Badge>
                    )}
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
              className="w-44"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Iniciar ARIA
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={endConversation}
              variant="destructive"
              size="lg"
              className="w-44"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Encerrar
            </Button>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-center gap-3 text-xs">
          {isListening && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 animate-pulse">
              <Mic className="w-3 h-3 mr-1" />
              Ouvindo...
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 animate-pulse">
              <Volume2 className="w-3 h-3 mr-1" />
              ARIA falando...
            </Badge>
          )}
          {isConnected && !isListening && !isSpeaking && (
            <Badge variant="outline" className="text-muted-foreground">
              <Mic className="w-3 h-3 mr-1" />
              Aguardando comando...
            </Badge>
          )}
          {lastCommand && (
            <Badge variant="secondary" className="text-xs">
              Último: {voiceCommands.find(c => c.command === lastCommand)?.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
