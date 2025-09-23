import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, MessageSquare, Settings, HelpCircle, BarChart3, History, Brain, Link } from 'lucide-react';
import VoiceCommands from './VoiceCommands';
import VoiceSettings from './VoiceSettings';
import VoiceAnalytics from './VoiceAnalytics';
import VoiceHistory from './VoiceHistory';
import VoicePersonality from './VoicePersonality';
import VoiceIntegrations from './VoiceIntegrations';

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
  const [showCommands, setShowCommands] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPersonality, setShowPersonality] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState(0);
  const [personalitySettings, setPersonalitySettings] = useState({
    tone: 'friendly' as 'formal' | 'casual' | 'friendly' | 'professional',
    responseLength: 'balanced' as 'concise' | 'balanced' | 'detailed',
    expertise: ['Recursos Humanos', 'Viagens Corporativas'],
    customInstructions: '',
    contextAwareness: true,
    proactiveHelp: true
  });
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
      setSessionStart(new Date());
      const startTime = Date.now();
      
      chatRef.current = new RealtimeChat(handleMessage, setIsSpeaking);
      await chatRef.current.init();
      setIsConnected(true);
      
      setResponseTime(Date.now() - startTime);
      
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
    setSessionStart(null);
    // Keep messages for history but mark session as ended
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

  const clearHistory = () => {
    setMessages([]);
  };

  const exportHistory = () => {
    const data = {
      timestamp: new Date().toISOString(),
      messages: messages.map(m => ({
        type: m.type,
        text: m.text,
        role: m.role,
        timestamp: m.timestamp.toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSessionDuration = () => {
    if (!sessionStart) return 0;
    return Math.floor((Date.now() - sessionStart.getTime()) / 1000);
  };

  const getConnectionQuality = (): 'excellent' | 'good' | 'poor' => {
    if (responseTime < 500) return 'excellent';
    if (responseTime < 1500) return 'good';
    return 'poor';
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  const toggleMicrophone = () => {
    if (isConnected) {
      endConversation();
    } else {
      startConversation();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Voice Button */}
      <div className="relative">
        <Button
          onClick={toggleMicrophone}
          disabled={isLoading}
          size="lg"
          className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 ${
            isConnected 
              ? 'bg-destructive hover:bg-destructive/90 text-white' 
              : 'bg-primary hover:bg-primary/90 text-white'
          } ${isSpeaking ? 'animate-pulse ring-4 ring-primary/30' : ''}`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          ) : isConnected ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        
        {/* Status indicator */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
          isConnected ? 'bg-emerald-500' : 'bg-muted'
        }`} />
      </div>

      {/* Expanded Interface */}
      {isConnected && (
        <Card className="absolute bottom-20 right-0 w-80 p-4 shadow-lg border-primary/20 bg-background/95 backdrop-blur">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">Assistente de Voz</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {isSpeaking ? 'Falando...' : 'Ouvindo...'}
              </div>
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {messages.slice(-3).map((message, index) => (
                  <div key={index} className={`text-sm p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-muted text-foreground mr-4'
                  }`}>
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <MessageSquare className="h-3 w-3 mt-0.5 opacity-60" />
                      )}
                      <span>{message.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-5 gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCommands(!showCommands)}
                className="text-xs p-1"
                title="Comandos"
              >
                <HelpCircle className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="text-xs p-1"
                title="Analytics"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs p-1"
                title="Histórico"
              >
                <History className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPersonality(true)}
                className="text-xs p-1"
                title="Personalidade"
              >
                <Brain className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowIntegrations(true)}
                className="text-xs p-1"
                title="Integrações"
              >
                <Link className="h-3 w-3" />
              </Button>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSettings(true)}
              className="w-full"
            >
              <Settings className="h-3 w-3 mr-2" />
              Configurações Avançadas
            </Button>

            {/* Quick text input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite ou fale sua pergunta..."
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendTextMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Commands Panel */}
      {showCommands && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCommands(false)}
              className="absolute -top-2 -right-2 z-10"
            >
              ✕
            </Button>
            <VoiceCommands 
              onCommand={(command) => {
                sendTextMessage(command);
                setShowCommands(false);
              }}
              isConnected={isConnected}
            />
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAnalytics(false)}
              className="absolute -top-2 -right-2 z-10"
            >
              ✕
            </Button>
            <VoiceAnalytics
              isConnected={isConnected}
              totalMessages={messages.length}
              sessionDuration={getSessionDuration()}
              responseTime={responseTime}
              connectionQuality={getConnectionQuality()}
            />
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHistory(false)}
              className="absolute -top-2 -right-2 z-10"
            >
              ✕
            </Button>
            <VoiceHistory
              messages={messages.map(m => ({
                id: `${m.timestamp.getTime()}`,
                type: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
                content: m.text || '',
                timestamp: m.timestamp,
                action: m.type === 'response.function_call_arguments.done' ? 'Navigation' : undefined
              }))}
              onClear={clearHistory}
              onExport={exportHistory}
            />
          </div>
        </div>
      )}

      {/* Personality Modal */}
      <VoicePersonality
        isOpen={showPersonality}
        onClose={() => setShowPersonality(false)}
        currentSettings={personalitySettings}
        onSave={setPersonalitySettings}
      />

      {/* Integrations Modal */}
      <VoiceIntegrations
        isOpen={showIntegrations}
        onClose={() => setShowIntegrations(false)}
        onNavigate={(module) => {
          if (onNavigate) {
            onNavigate(module);
          }
          setShowIntegrations(false);
        }}
      />

      {/* Settings Modal */}
      <VoiceSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default VoiceInterface;