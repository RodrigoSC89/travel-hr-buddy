import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
  onNavigate?: (module: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange, onNavigate }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event.type);
    
    // Handle different event types
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    } else if (event.type === 'response.audio_transcript.delta') {
      setTranscript(prev => prev + (event.delta || ''));
    } else if (event.type === 'response.audio_transcript.done') {
      // Transcript is complete for this response
    } else if (event.type === 'input_audio_buffer.speech_started') {
      console.log('User started speaking');
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      console.log('User stopped speaking');
    } else if (event.type === 'response.function_call_arguments.done') {
      // Handle function calls for navigation
      if (event.name === 'navigate_system' && onNavigate) {
        try {
          const args = JSON.parse(event.arguments);
          onNavigate(args.module);
          toast({
            title: "Navegando",
            description: `Abrindo módulo: ${args.module}`,
          });
        } catch (error) {
          console.error('Error parsing navigation arguments:', error);
        }
      }
    }
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      setTranscript('');
      
      toast({
        title: "Conectado",
        description: "Assistente de voz está pronto. Pode falar!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Falha ao iniciar conversa',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setTranscript('');
    onSpeakingChange?.(false);
    
    toast({
      title: "Desconectado",
      description: "Assistente de voz foi desativado",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Card className="w-80 bg-card/95 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted'}`} />
              <span className="text-sm font-medium">
                {isConnecting ? 'Conectando...' : isConnected ? 'Assistente Ativo' : 'Assistente Inativo'}
              </span>
            </div>
            
            {!isConnected ? (
              <Button 
                onClick={startConversation}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Ativar Assistente
                  </>
                )}
              </Button>
            ) : (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {isSpeaking ? (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Assistente falando...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Pode falar
                    </>
                  )}
                </div>
                
                {transcript && (
                  <div className="p-2 bg-muted/50 rounded text-xs max-h-20 overflow-y-auto">
                    {transcript}
                  </div>
                )}
                
                <Button 
                  onClick={endConversation}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Desativar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInterface;