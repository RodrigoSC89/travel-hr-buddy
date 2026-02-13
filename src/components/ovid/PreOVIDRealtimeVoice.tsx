/**
 * PreOVID Realtime Voice Component
 * PATCH 864 - Removed @ts-nocheck, added proper TypeScript types
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mic, Brain, Camera, FileText,
  Phone, PhoneOff, Loader2, Wifi, Volume2,
  Wand2, Navigation,
  ChevronRight, ChevronLeft, CheckCircle, XCircle, Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { PreOVIDRealtimeChat, type RealtimeMessage } from '@/utils/PreOVIDRealtimeAudio';
import { AnimatedAudioWaveform, PulseIndicator } from '@/components/ui/audio-waveform';
import { PhotoCaptureModal, ObservationModal, ChapterNavigationModal } from './VoiceCommandModals';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from '@/lib/supabase/edge-function-helper';

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
  questionId?: string;
  inspectionId?: string;
  onCommand?: (command: string, params?: Record<string, string>) => void;
}

export const PreOVIDRealtimeVoice: React.FC<PreOVIDRealtimeVoiceProps> = ({
  vesselType,
  chapterId,
  chapterName,
  questionId,
  inspectionId,
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
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Modals state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [currentObservation, setCurrentObservation] = useState('');
  
  const chatRef = useRef<PreOVIDRealtimeChat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Play audio using ElevenLabs
  const playElevenLabsAudio = async (text: string) => {
    if (!useElevenLabs || !text.trim()) return;

    try {
      setIsPlayingAudio(true);
      
      const response = await fetch(
        getEdgeFunctionUrl('eleven-labs-voice'),
        {
          method: 'POST',
          headers: getEdgeFunctionHeaders(),
          body: JSON.stringify({
            text: text.substring(0, 500), // Limit to 500 chars for voice
            voice_name: 'sarah', // Clear female voice for ARIA
            speed: 1.05
          })
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        
        await audio.play();
      }
    } catch (error) {
      logger.error('ElevenLabs TTS error:', error);
      // Fallback to browser TTS if ElevenLabs fails
      speakWithBrowserTTS(text);
    } finally {
      // Will be set to false when audio ends
    }
  };

  // Browser TTS fallback
  const speakWithBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Execute command action
  const executeCommand = (command: string, params?: Record<string, string>) => {
    switch (command) {
      case 'take_photo':
        setShowPhotoModal(true);
        break;
      case 'add_observation':
        setShowObservationModal(true);
        break;
      case 'goto_chapter':
        if (params?.chapter) {
          onCommand?.(command, params);
        } else {
          setShowChapterModal(true);
        }
        break;
      default:
        onCommand?.(command, params);
    }
  };

  const handleMessage = useCallback((event: RealtimeMessage) => {
    logger.debug('Realtime message:', event.type);
    
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
        executeCommand(parsedCommand.command, parsedCommand.params);
        
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
        
        // Play with ElevenLabs HD voice
        if (useElevenLabs) {
          playElevenLabsAudio(finalResponse);
        }
      }
      setAssistantResponse('');
    }
  }, [assistantResponse, onCommand, useElevenLabs]);

  const startConversation = async () => {
    setIsConnecting(true);
    
    try {
      chatRef.current = new PreOVIDRealtimeChat({
        vesselType,
        chapterId,
        onMessage: handleMessage,
        onSpeakingChange: (speaking) => {
          // Only set speaking if not using ElevenLabs (WebRTC audio)
          if (!useElevenLabs) {
            setIsSpeaking(speaking);
          }
        },
        onTranscript: (text, isFinal) => {
          if (!isFinal) {
            setCurrentTranscript(prev => prev + text);
          }
        },
        onError: (error) => {
          logger.error('Realtime error:', error);
          toast.error('Erro na conexão de voz');
          setIsConnected(false);
        }
      });
      
      await chatRef.current.init();
      setIsConnected(true);
      toast.success('ARIA conectada! Fale seus comandos.');
      
    } catch (error) {
      logger.error('Failed to start conversation:', error);
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
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    
    toast.info('ARIA desconectada');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const quickCommands = [
    { icon: ChevronRight, label: 'Próximo', command: 'Próximo item' },
    { icon: CheckCircle, label: 'Conforme', command: 'Marcar conforme' },
    { icon: XCircle, label: 'NC', command: 'Não conforme' },
    { icon: Camera, label: 'Foto', action: () => setShowPhotoModal(true) },
    { icon: FileText, label: 'Nota', action: () => setShowObservationModal(true) },
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
      logger.error('Failed to send message:', error);
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

  const handlePhotoCaptured = (data: { url: string; caption?: string }) => {
    toast.success('Foto adicionada como evidência');
    onCommand?.('photo_captured', { url: data.url, caption: data.caption || '' });
  };

  const handleObservationSaved = (text: string) => {
    setCurrentObservation(text);
    onCommand?.('observation_saved', { text });
  };

  const handleChapterNavigate = (chapter: string) => {
    onCommand?.('goto_chapter', { chapter });
  };

  return (
    <>
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
            <div className="flex items-center gap-2">
              {chapterName && (
                <Badge variant="secondary" className="text-xs">
                  {chapterName}
                </Badge>
              )}
            </div>
          </CardTitle>
          
          {/* ElevenLabs Toggle */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Label htmlFor="elevenlabs" className="text-xs text-muted-foreground flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              Voz HD
            </Label>
            <Switch
              id="elevenlabs"
              checked={useElevenLabs}
              onCheckedChange={setUseElevenLabs}
              className="scale-75"
            />
          </div>
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
                  <AnimatedAudioWaveform isActive={isSpeaking || isPlayingAudio} type="output" barCount={5} />
                </div>
                <PulseIndicator isActive={isSpeaking || isPlayingAudio} type="output" size="sm" />
              </div>
            </div>
          )}

          {/* Quick Commands */}
          {isConnected && (
            <div className="flex gap-1.5 flex-wrap justify-center">
              {quickCommands.map((cmd, i) => (
                <Button
                  key={`cmd-${cmd.label}`}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => cmd.action ? cmd.action() : sendQuickCommand(cmd.command!)}
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
              <div className="text-center text-muted-foreground py-6">
                <Mic className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">ARIA Voice - Inspeção OVID</p>
                <p className="text-xs mt-2">
                  Clique em "Iniciar" para ativar comandos de voz
                </p>
                <div className="mt-4 text-left max-w-xs mx-auto">
                  <p className="text-xs font-medium mb-2">Comandos disponíveis:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• "Próximo" / "Voltar"</li>
                    <li>• "Marcar conforme" / "Não conforme"</li>
                    <li>• "Tirar foto" / "Observação"</li>
                    <li>• "Ir para capítulo X"</li>
                    <li>• "Gerar evidência"</li>
                  </ul>
                </div>
              </div>
            ) : messages.length === 0 && isConnected ? (
              <div className="text-center text-muted-foreground py-6">
                <Volume2 className="w-10 h-10 mx-auto mb-3 opacity-50 animate-pulse" />
                <p className="text-sm">Fale sua pergunta ou comando...</p>
                <p className="text-xs mt-2">ARIA está ouvindo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div 
                    key={`msg-${i}-${msg.role}`} 
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
            {(isSpeaking || isPlayingAudio) && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 animate-pulse">
                <Volume2 className="w-3 h-3 mr-1" />
                {useElevenLabs ? 'HD Voice' : 'Falando'}...
              </Badge>
            )}
            {isConnected && !isListening && !isSpeaking && !isPlayingAudio && (
              <Badge variant="outline" className="text-muted-foreground">
                <Mic className="w-3 h-3 mr-1" />
                Aguardando...
              </Badge>
            )}
            {lastCommand && (
              <Badge variant="secondary" className="text-xs">
                {voiceCommands.find(c => c.command === lastCommand)?.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <PhotoCaptureModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        questionId={questionId}
        inspectionId={inspectionId}
        onPhotoCaptured={handlePhotoCaptured}
      />

      <ObservationModal
        isOpen={showObservationModal}
        onClose={() => setShowObservationModal(false)}
        questionId={questionId}
        initialText={currentObservation}
        onSave={handleObservationSaved}
      />

      <ChapterNavigationModal
        isOpen={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        currentChapter={chapterId}
        onNavigate={handleChapterNavigate}
      />
    </>
  );
};
