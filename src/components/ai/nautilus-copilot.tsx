import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, Send, Mic, MicOff, User, 
  Anchor, Clock, AlertTriangle, CheckCircle,
  Lightbulb, ArrowRight, Calendar, Users,
  FileText, BarChart3, Settings, Minimize2,
  Maximize2, Volume2, VolumeX
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DraggableFloating from '@/components/ui/draggable-floating';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: {
    label: string;
    action: () => void;
    icon?: React.ComponentType<any>;
  }[];
  suggestions?: string[];
  data?: any;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  query: string;
  category: string;
}

interface ContextMemory {
  currentModule: string;
  lastActions: string[];
  userPreferences: Record<string, any>;
  sessionContext: Record<string, any>;
}

export const NautilusCopilot: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextMemory, setContextMemory] = useState<ContextMemory>({
    currentModule: 'dashboard',
    lastActions: [],
    userPreferences: {},
    sessionContext: {}
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Criar nova escala',
      icon: Users,
      query: 'Como criar uma nova escala de tripulação?',
      category: 'maritime'
    },
    {
      id: '2',
      label: 'Ver alertas de preço',
      icon: AlertTriangle,
      query: 'Quais alertas de preço estão ativos?',
      category: 'price-alerts'
    },
    {
      id: '3',
      label: 'Reservas da semana',
      icon: Calendar,
      query: 'Quais reservas temos para esta semana?',
      category: 'reservations'
    },
    {
      id: '4',
      label: 'Status das viagens',
      icon: Anchor,
      query: 'Qual o status das viagens em andamento?',
      category: 'travel'
    },
    {
      id: '5',
      label: 'Relatório RH',
      icon: BarChart3,
      query: 'Gerar relatório de recursos humanos',
      category: 'hr'
    },
    {
      id: '6',
      label: 'Configurações',
      icon: Settings,
      query: 'Como configurar notificações do sistema?',
      category: 'settings'
    }
  ];

  useEffect(() => {
    // Inicializar com mensagem de boas-vindas
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '0',
        type: 'assistant',
        content: '👋 Olá! Sou o Copiloto do Nautilus One. Estou aqui para ajudar você a navegar pelo sistema, tirar dúvidas e otimizar seu trabalho. Como posso ajudar hoje?',
        timestamp: new Date(),
        suggestions: [
          'Como criar uma escala?',
          'Ver alertas pendentes',
          'Status das viagens',
          'Ajuda com reservas'
        ]
      };
      setMessages([welcomeMessage]);
    }

    // Configurar síntese de voz
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Configurar reconhecimento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateContextMemory = (action: string, data?: any) => {
    setContextMemory(prev => ({
      ...prev,
      lastActions: [action, ...prev.lastActions.slice(0, 4)],
      sessionContext: { ...prev.sessionContext, ...data }
    }));
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      updateContextMemory('sent_message', { message: text });

      // Enviar para IA com contexto
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: text,
          context: 'copilot',
          systemContext: {
            currentModule: contextMemory.currentModule,
            lastActions: contextMemory.lastActions,
            userRole: 'user', // Buscar do contexto de auth
            availableModules: ['maritime', 'hr', 'travel', 'reservations', 'price-alerts']
          }
        }
      });

      if (error) throw error;

      // Processar resposta da IA
      const aiResponse = processAIResponse(data.response, text);
      setMessages(prev => [...prev, aiResponse]);

      // Síntese de voz se habilitada
      if (isSpeaking && synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(aiResponse.content);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        synthRef.current.speak(utterance);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: '😔 Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente ou seja mais específico.',
        timestamp: new Date(),
        suggestions: ['Tentar novamente', 'Falar com suporte', 'Ver ajuda']
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro no Copiloto",
        description: "Não foi possível processar sua mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processAIResponse = (response: string, userQuery: string): Message => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      actions: [],
      suggestions: []
    };

    // Detectar intenções e adicionar ações contextuais
    const lowerQuery = userQuery.toLowerCase();
    
    if (lowerQuery.includes('escala') || lowerQuery.includes('tripulação')) {
      message.actions = [
        {
          label: 'Ir para Escalas',
          action: () => navigate('/maritime'),
          icon: Users
        },
        {
          label: 'Criar Nova Escala',
          action: () => {
            navigate('/maritime');
            toast({ title: "Navegando para criação de escala" });
          },
          icon: ArrowRight
        }
      ];
      message.suggestions = ['Como editar uma escala?', 'Ver histórico de escalas', 'Configurar notificações'];
    }
    
    else if (lowerQuery.includes('alerta') || lowerQuery.includes('preço')) {
      message.actions = [
        {
          label: 'Ver Alertas',
          action: () => navigate('/price-alerts'),
          icon: AlertTriangle
        },
        {
          label: 'Criar Alerta',
          action: () => {
            navigate('/price-alerts');
            // Trigger modal de criação
          },
          icon: ArrowRight
        }
      ];
      message.suggestions = ['Como configurar alertas?', 'Ver histórico de preços', 'Alertas mais eficazes'];
    }
    
    else if (lowerQuery.includes('reserva')) {
      message.actions = [
        {
          label: 'Ver Reservas',
          action: () => navigate('/reservations'),
          icon: Calendar
        },
        {
          label: 'Nova Reserva',
          action: () => navigate('/reservations'),
          icon: ArrowRight
        }
      ];
      message.suggestions = ['Como cancelar reserva?', 'Alterar data de reserva', 'Histórico de reservas'];
    }
    
    else if (lowerQuery.includes('viagem') || lowerQuery.includes('travel')) {
      message.actions = [
        {
          label: 'Ver Viagens',
          action: () => navigate('/travel'),
          icon: Anchor
        }
      ];
      message.suggestions = ['Status de viagens em andamento', 'Planejar nova viagem', 'Relatórios de viagem'];
    }

    // Sugestões gerais se não houver específicas
    if (!message.suggestions?.length) {
      message.suggestions = [
        'Como posso otimizar meu trabalho?',
        'Mostre funcionalidades avançadas',
        'Preciso de mais ajuda'
      ];
    }

    return message;
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Recurso não disponível",
        description: "Reconhecimento de voz não está disponível neste navegador",
        variant: "destructive",
      });
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

  const handleQuickAction = (action: QuickAction) => {
    setInputMessage(action.query);
    handleSendMessage(action.query);
    updateContextMemory('quick_action', { action: action.id, category: action.category });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <DraggableFloating
        storageKey="copilot_fab_pos"
        ariaLabel="Botão do Copiloto"
        defaultPosition={() => ({
          x: Math.max(12, window.innerWidth - 60 - 16),
          y: Math.max(12, window.innerHeight - 60 - 96), // acima da barra inferior
        })}
        zIndex={50}
      >
        <Button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir Copiloto"
          className="rounded-full w-12 h-12 shadow-md hover:shadow-lg transition-all duration-300 bg-primary text-primary-foreground"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </DraggableFloating>
    );
  }

  return (
    <DraggableFloating
      storageKey="copilot_panel_pos"
      ariaLabel="Janela do Copiloto"
      defaultPosition={() => ({
        x: Math.max(12, window.innerWidth - 360 - 16),
        y: Math.max(12, window.innerHeight - 520 - 96),
      })}
      zIndex={50}
    >
      <Card className={`bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl transition-all duration-300 ${
        isMinimized 
          ? 'w-72 md:w-80 h-14 md:h-16' 
          : 'w-[min(92vw,26rem)] md:w-96 h-[70vh] md:h-[600px]'
      }`}>
      <CardHeader className="flex-shrink-0 pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70">
                <AvatarFallback>
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-status-active rounded-full border-2 border-background"></div>
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🧭 Nautilus Copilot
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Pensando...' : 'Online e pronto para ajudar'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSpeaking(!isSpeaking)}
              className="w-8 h-8 p-0"
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-primary/10">
                        <AvatarFallback>
                          <Bot className="w-5 h-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] space-y-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.actions.map((action, index) => {
                            const Icon = action.icon || ArrowRight;
                            return (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={action.action}
                                className="text-xs"
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {action.label}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                            >
                              💡 {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {message.type === 'user' && (
                      <Avatar className="w-8 h-8 bg-primary">
                        <AvatarFallback>
                          <User className="w-5 h-5 text-primary-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-primary/10">
                      <AvatarFallback>
                        <Bot className="w-5 h-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          {/* Ações Rápidas */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.slice(0, 4).map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="text-xs justify-start"
                    >
                      <Icon className="w-3 h-3 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 border-t bg-background/50">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Digite sua pergunta ou comando..."
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 ${
                    isListening ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>💡 Use comandos em linguagem natural</span>
              <div className="flex items-center gap-2">
                {isListening && (
                  <Badge variant="destructive" className="animate-pulse">
                    🎤 Ouvindo...
                  </Badge>
                )}
                <Badge variant="outline">
                  Ctrl+K
                </Badge>
              </div>
            </div>
          </div>
        </>
      )}
      </Card>
    </DraggableFloating>
  );
};

export default NautilusCopilot;