import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, MessageSquare } from 'lucide-react';

interface Message {
  type: string;
  text?: string;
  role?: 'user' | 'assistant';
  timestamp: Date;
}

interface VoiceInterfaceProps {
  onNavigate?: (module: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onNavigate }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Voice interface received:', event.type);
    
    if (event.type === 'connected') {
      toast({
        title: "Assistente Conectado",
        description: "Pode falar ou digitar sua pergunta",
      });
    } else if (event.type === 'transcript' && event.text) {
      setMessages(prev => [...prev, {
        type: 'transcript',
        text: event.text,
        role: event.role,
        timestamp: new Date()
      }]);
    } else if (event.type === 'response.function_call_arguments.done') {
      // Handle function calls for navigation
      if (event.name === 'navigate_system' && onNavigate) {
        const args = JSON.parse(event.arguments);
        onNavigate(args.module);
        toast({
          title: "Navegando",
          description: `Abrindo módulo: ${args.module}`,
        });
      }
    }
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      chatRef.current = new RealtimeChat(handleMessage, setIsSpeaking);
      await chatRef.current.init();
      setIsConnected(true);
      
      // Add welcome message
      setMessages([{
        type: 'system',
        text: 'Olá! Sou seu assistente de voz. Como posso ajudar?',
        role: 'assistant',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Falha ao conectar',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setMessages([]);
  };

  const sendTextMessage = async (text: string) => {
    if (!chatRef.current || !text.trim()) return;
    
    try {
      await chatRef.current.sendMessage(text);
      setMessages(prev => [...prev, {
        type: 'user_input',
        text,
        role: 'user',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="fixed bottom-6 right-6 w-80 p-4 shadow-lg border-primary/20 bg-background/95 backdrop-blur">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">Assistente de Voz</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-muted'}`} />
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-2">
            {messages.slice(-3).map((message, index) => (
              <div key={index} className={`text-sm p-2 rounded ${
                message.role === 'user' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {message.text}
              </div>
            ))}
          </div>
        )}

        {/* Status */}
        {isConnected && (
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isSpeaking 
                ? 'bg-primary/20 text-primary animate-pulse' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <Mic className="h-3 w-3" />
              {isSpeaking ? 'Falando...' : 'Aguardando...'}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Conectando...' : 'Iniciar Conversa'}
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              variant="outline"
              className="flex-1"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Encerrar
            </Button>
          )}
        </div>

        {/* Quick text input */}
        {isConnected && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendTextMessage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceInterface;