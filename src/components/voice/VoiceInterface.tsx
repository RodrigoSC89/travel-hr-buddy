import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Loader2, MessageSquare, ChevronDown, Minimize2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceRecording, useTextToSpeech, useAIChat } from '@/hooks/use-voice-conversation';
import { useVoiceNavigation } from '@/hooks/use-voice-navigation';
import DraggableFloating from '@/components/ui/draggable-floating';
import { FloatingShortcutButton } from '@/components/ui/floating-shortcut-button';
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
  const [userTranscript, setUserTranscript] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);
  const chatRef = useRef<RealtimeChat | null>(null);
  
  // Mock data for conversation
  const conversationId = 'mock-conversation-id';
  const startDbConversation = () => console.log('Starting conversation');
  const endDbConversation = () => console.log('Ending conversation');
  const saveMessage = (message: any) => console.log('Saving message:', message);
  const logVoiceCommand = (command: any) => console.log('Logging command:', command);
  
  const { processVoiceCommand } = useVoiceNavigation();

  const handleMessage = async (event: any) => {
    console.log('Received message:', event.type, event);
    
    try {
      // Handle different event types
      if (event.type === 'response.audio.delta') {
        setIsSpeaking(true);
        onSpeakingChange?.(true);
      } 
      else if (event.type === 'response.audio.done') {
        setIsSpeaking(false);
        onSpeakingChange?.(false);
        
        // Salvar resposta do assistente se houver transcript
        if (transcript.trim()) {
          await saveMessage({
            type: 'assistant',
            content: transcript.trim(),
            timestamp: new Date(),
            actionData: { duration: event.duration || 0 }
          });
          setTranscript(''); // Limpar após salvar
        }
      } 
      else if (event.type === 'response.audio_transcript.delta') {
        setTranscript(prev => prev + (event.delta || ''));
      } 
      else if (event.type === 'response.audio_transcript.done') {
        // Transcript completo da resposta do assistente
        console.log('Assistant transcript complete:', transcript);
      } 
      else if (event.type === 'input_audio_buffer.speech_started') {
        console.log('User started speaking');
        setUserTranscript('');
      } 
      else if (event.type === 'input_audio_buffer.speech_stopped') {
        console.log('User stopped speaking');
      }
      else if (event.type === 'conversation.item.input_audio_transcription.completed') {
        // Transcrição da fala do usuário
        const userText = event.transcript || '';
        console.log('User transcript:', userText);
        setUserTranscript(userText);
        
        if (userText.trim()) {
          // Salvar mensagem do usuário
          await saveMessage({
            type: 'user',
            content: userText.trim(),
            timestamp: new Date()
          });
          
          // Processar comando de navegação
          const commandResult = processVoiceCommand(userText.trim());
          
          if (commandResult.success && commandResult.intent) {
            // Log do comando executado
            await logVoiceCommand({
              command: userText.trim(),
              action: commandResult.action || 'navigation',
              module: commandResult.intent.module,
              result: `Navigated to ${commandResult.intent.module}`,
              success: true
            });
            
            // Executar navegação se callback fornecido
            if (onNavigate) {
              onNavigate(commandResult.intent.module);
            }
          } else {
            // Log do comando falhado
            await logVoiceCommand({
              command: userText.trim(),
              action: 'unknown',
              module: undefined,
              result: 'Command not recognized',
              success: false
            });
          }
        }
      }
      else if (event.type === 'response.function_call_arguments.done') {
        // Handle function calls for navigation
        if (event.name === 'navigate_system') {
          try {
            const args = JSON.parse(event.arguments);
            const module = args.module || args.destination;
            
            if (module && onNavigate) {
              onNavigate(module);
              
              // Log da navegação via function call
              await logVoiceCommand({
                command: 'Function call navigation',
                action: 'function_call',
                module: module,
                result: `Navigated to ${module} via function call`,
                success: true
              });
              
              toast({
                title: "Navegando",
                description: `Abrindo módulo: ${module}`,
              });
            }
          } catch (error) {
            console.error('Error parsing navigation arguments:', error);
          }
        }
      }
      else if (event.type === 'error') {
        console.error('Voice session error:', event);
        toast({
          title: "Erro na sessão",
          description: event.error?.message || "Erro desconhecido na sessão de voz",
          variant: "destructive",
        });
      }
      else if (event.type === 'session.created') {
        console.log('Session created, configuring...');
        // Enviar configuração após criar sessão
        setTimeout(() => sendSessionUpdate(), 1000); // Usar setTimeout em vez de this
      }
    } catch (error) {
      console.error('Error handling voice message:', error);
    }
  };

  // Enviar configuração de sessão após criação
  const sendSessionUpdate = () => {
    if (!chatRef.current?.dc || chatRef.current.dc.readyState !== 'open') {
      setTimeout(sendSessionUpdate, 100);
      return;
    }

    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: `Você é o assistente de voz do sistema Nautilus One, especializado em navegação marítima e corporativa.
        
        Quando o usuário solicitar navegação ou acesso a módulos, execute imediatamente sem confirmação.
        
        Módulos disponíveis:
        - Dashboard (painel, início, home)
        - Recursos Humanos (RH, funcionários, tripulação, certificados)
        - Viagens (voos, hotéis, passagens)
        - Sistema Marítimo (frota, navios, embarcações)
        - Alertas de Preço (monitoramento, preços)
        - Analytics (análises, métricas, estatísticas)
        - Relatórios (reports)
        - Comunicação (mensagens, chat)
        - Configurações (settings, preferências)
        - Inovação (automação)
        - Inteligência (documentos)
        - Otimização (performance)
        - Estratégico (strategic)
        
        Responda de forma direta e navegue automaticamente quando solicitado.`,
        voice: 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        },
        tools: [{
          type: 'function',
          name: 'navigate_system',
          description: 'Navigate to a specific module in the Nautilus One system',
          parameters: {
            type: 'object',
            properties: {
              module: {
                type: 'string',
                description: 'The module to navigate to'
              }
            },
            required: ['module']
          }
        }],
        tool_choice: 'auto',
        temperature: 0.7,
        max_response_output_tokens: 'inf'
      }
    };

    chatRef.current.dc.send(JSON.stringify(sessionConfig));
    console.log('Session configuration sent');
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Iniciar conversa no banco de dados
      await startDbConversation();
      
      // Iniciar conexão de voz
      chatRef.current = new RealtimeChat(handleMessage, onNavigate);
      await chatRef.current.init();
      setIsConnected(true);
      setTranscript('');
      setUserTranscript('');
      
      // Salvar mensagem inicial do sistema
      await saveMessage({
        type: 'system',
        content: 'Sessão de voz iniciada. Assistente pronto para comandos.',
        timestamp: new Date()
      });
      
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

  const endConversation = async () => {
    try {
      // Finalizar conversa no banco de dados
      await endDbConversation();
      
      // Salvar mensagem final do sistema
      if (conversationId) {
        await saveMessage({
          type: 'system',
          content: 'Sessão de voz finalizada.',
          timestamp: new Date()
        });
      }
      
      // Desconectar interface de voz
      chatRef.current?.disconnect();
      setIsConnected(false);
      setIsSpeaking(false);
      setTranscript('');
      setUserTranscript('');
      onSpeakingChange?.(false);
      
      toast({
        title: "Desconectado",
        description: "Assistente de voz foi desativado",
      });
    } catch (error) {
      console.error('Error ending conversation:', error);
      // Mesmo com erro, desconectar a interface
      chatRef.current?.disconnect();
      setIsConnected(false);
      setIsSpeaking(false);
      setTranscript('');
      setUserTranscript('');
      onSpeakingChange?.(false);
    }
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  if (isMinimized) {
    return (
      <DraggableFloating
        storageKey="voice_interface_toggle_pos"
        defaultPosition={() => ({ x: 16, y: Math.max(12, window.innerHeight - 48 - 96) })}
        zIndex={10040}
        ariaLabel="Botão Assistente de Voz"
      >
        <FloatingShortcutButton
          icon={Mic}
          onClick={() => setIsMinimized(false)}
          label="Assistente de Voz"
          bgColor="#003366"
          iconColor="#FFFFFF"
          size="md"
          ariaLabel="Abrir assistente de voz"
          tabIndex={0}
        />
      </DraggableFloating>
    );
  }

  return (
    <DraggableFloating
      storageKey="voice_interface_panel_pos"
      defaultPosition={() => ({ x: 16, y: Math.max(12, window.innerHeight - 280 - 120) })}
      zIndex={10040}
      ariaLabel="Painel Assistente de Voz"
    >
      <Card className="w-80 bg-card/95 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Header with minimize button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-status-active' : 'bg-status-inactive'
                }`} />
                <span className="text-sm font-medium text-card-foreground">
                  {isConnecting ? 'Conectando...' : isConnected ? 'Assistente Ativo' : 'Assistente Inativo'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
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
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Assistente falando...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-primary" />
                      Pode falar
                    </>
                  )}
                </div>
                
                {(transcript || userTranscript) && (
                  <div className="space-y-2">
                    {userTranscript && (
                      <div className="p-2 bg-info/10 border border-info/30 rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3 h-3 text-info" />
                          <span className="text-info font-medium">Você disse:</span>
                        </div>
                        <div className="text-card-foreground">{userTranscript}</div>
                      </div>
                    )}
                    {transcript && (
                      <div className="p-2 bg-success/10 border border-success/30 rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Mic className="w-3 h-3 text-success" />
                          <span className="text-success font-medium">Assistente:</span>
                        </div>
                        <div className="text-card-foreground max-h-20 overflow-y-auto">{transcript}</div>
                      </div>
                    )}
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
    </DraggableFloating>
  );
};

export default VoiceInterface;