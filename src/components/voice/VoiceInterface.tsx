import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceConversation } from '@/hooks/use-voice-conversation';
import { useVoiceNavigation } from '@/hooks/use-voice-navigation';

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
  const chatRef = useRef<RealtimeChat | null>(null);
  
  // Hooks para persistência e navegação
  const {
    conversationId,
    startConversation: startDbConversation,
    endConversation: endDbConversation,
    saveMessage,
    logVoiceCommand
  } = useVoiceConversation();
  
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
            await logVoiceCommand(
              userText.trim(),
              commandResult.action || 'navigation',
              commandResult.intent.module,
              `Navigated to ${commandResult.intent.module}`,
              true
            );
            
            // Executar navegação se callback fornecido
            if (onNavigate) {
              onNavigate(commandResult.intent.module);
            }
          } else {
            // Log do comando falhado
            await logVoiceCommand(
              userText.trim(),
              'unknown',
              undefined,
              'Command not recognized',
              false
            );
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
              await logVoiceCommand(
                'Function call navigation',
                'function_call',
                module,
                `Navigated to ${module} via function call`,
                true
              );
              
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
      const dbConversationId = await startDbConversation();
      if (!dbConversationId) {
        throw new Error('Falha ao iniciar conversa no banco de dados');
      }
      
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

  return (
    <div className="fixed bottom-8 left-6 md:left-72 z-30">
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
                
                {(transcript || userTranscript) && (
                  <div className="space-y-2">
                    {userTranscript && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-600 font-medium">Você disse:</span>
                        </div>
                        <div className="text-foreground">{userTranscript}</div>
                      </div>
                    )}
                    {transcript && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Mic className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-medium">Assistente:</span>
                        </div>
                        <div className="text-foreground max-h-20 overflow-y-auto">{transcript}</div>
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
    </div>
  );
};

export default VoiceInterface;