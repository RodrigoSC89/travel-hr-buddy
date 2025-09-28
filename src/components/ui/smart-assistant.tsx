import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Minimize2, 
  Maximize2,
  RotateCcw,
  Sparkles,
  Zap,
  Brain,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  metadata?: {
    module?: string;
    actionTaken?: boolean;
    confidence?: number;
  };
}

interface SmartAssistantProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose?: () => void;
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ 
  isMinimized, 
  onToggleMinimize,
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou o Nautilus Assistant, seu assistente inteligente para operações marítimas. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
      suggestions: [
        'Criar nova auditoria PEOTRAM',
        'Consultar status da frota',
        'Verificar certificados vencendo',
        'Gerar relatório mensal'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Respostas inteligentes do assistente
  const smartResponses = {
    'peotram': {
      response: 'Entendi que você quer trabalhar com auditorias PEOTRAM. Posso te ajudar a criar uma nova auditoria, verificar auditorias pendentes ou analisar resultados anteriores.',
      suggestions: ['Criar nova auditoria', 'Ver auditorias pendentes', 'Analisar resultados'],
      actions: [
        { text: 'Ir para PEOTRAM', action: () => navigate('/peotram') }
      ]
    },
    'frota': {
      response: 'Vou te ajudar com a gestão da frota. Posso mostrar o status atual das embarcações, eficiência de combustível, rotas ativas ou programar manutenções.',
      suggestions: ['Status das embarcações', 'Eficiência de combustível', 'Rotas ativas'],
      actions: [
        { text: 'Abrir Dashboard da Frota', action: () => navigate('/fleet-dashboard') }
      ]
    },
    'certificados': {
      response: 'Sobre certificações da tripulação: posso verificar certificados vencendo, status de renovações ou gerar relatórios de compliance.',
      suggestions: ['Certificados vencendo', 'Status renovações', 'Relatório compliance'],
      actions: [
        { text: 'Ir para RH Marítimo', action: () => navigate('/hr') }
      ]
    },
    'relatório': {
      response: 'Para relatórios, posso gerar análises de performance, relatórios financeiros, auditorias de compliance ou métricas operacionais.',
      suggestions: ['Relatório de performance', 'Análise financeira', 'Métricas operacionais'],
      actions: [
        { text: 'Abrir Analytics', action: () => navigate('/advanced-analytics') }
      ]
    }
  };

  const quickActions = [
    {
      icon: Brain,
      label: 'Insights IA',
      description: 'Análises inteligentes dos dados',
      action: () => navigate('/ai-insights')
    },
    {
      icon: CheckCircle,
      label: 'Nova Auditoria',
      description: 'Criar auditoria PEOTRAM',
      action: () => navigate('/peotram')
    },
    {
      icon: AlertCircle,
      label: 'Alertas',
      description: 'Verificar pendências',
      action: () => toast({ title: 'Alertas', description: '3 certificados vencem em 15 dias' })
    }
  ];

  // Scroll automático para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Processamento inteligente de mensagens
  const processMessage = async (message: string) => {
    setIsLoading(true);
    
    // Simular processamento IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const messageLower = message.toLowerCase();
    let response = 'Entendi sua solicitação. Como posso ajudá-lo especificamente com isso?';
    let suggestions: string[] = [];
    
    // Detecção inteligente de intenção
    for (const [keyword, data] of Object.entries(smartResponses)) {
      if (messageLower.includes(keyword)) {
        response = data.response;
        suggestions = data.suggestions;
        break;
      }
    }
    
    // Adicionar resposta do assistente
    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      suggestions,
      metadata: {
        confidence: 0.95,
        actionTaken: false
      }
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // Text-to-speech se habilitado
    if (voiceEnabled && 'speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    
    // Processar mensagem
    await processMessage(messageToProcess);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await processMessage(suggestion);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: 'Erro',
        description: 'Reconhecimento de voz não suportado neste navegador',
        variant: 'destructive'
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      
      // Enviar automaticamente se confiança alta
      if (event.results[0][0].confidence > 0.8) {
        setTimeout(() => handleSendMessage(), 500);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: 'Erro',
        description: 'Erro no reconhecimento de voz',
        variant: 'destructive'
      });
    };

    recognition.start();
  };

  const clearConversation = () => {
    setMessages([messages[0]]); // Manter mensagem de boas-vindas
    toast({
      title: 'Conversa limpa',
      description: 'Histórico removido com sucesso'
    });
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-6 right-24 w-16 h-16 z-[10050] cursor-pointer shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-primary via-primary-light to-secondary hover:scale-110 transition-all duration-300"
            onClick={onToggleMinimize}>
        <CardContent className="p-0 flex items-center justify-center h-full">
          <div className="relative">
            <Bot className="w-8 h-8 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] z-[10050] shadow-2xl border-2 border-primary/20 bg-background flex flex-col">
      {/* Header */}
      <CardHeader className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-secondary">
                <AvatarFallback className="text-primary-foreground">
                  <Bot className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                Nautilus Assistant
                <Sparkles className="w-4 h-4 text-primary" />
              </CardTitle>
              <p className="text-xs text-muted-foreground">IA Marítima • Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearConversation}
              className="w-8 h-8 p-0 hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="w-8 h-8 p-0"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleMinimize}
              className="w-8 h-8 p-0"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-l-xl rounded-tr-xl' 
                    : 'bg-muted text-foreground rounded-r-xl rounded-tl-xl border border-border/50'
                } p-3`}>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs opacity-70">Sugestões rápidas:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-background/50 border-border/30 hover:bg-accent/50"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
                    <Clock className="w-3 h-3" />
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-r-xl rounded-tl-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Processando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-12 flex flex-col gap-1 text-xs bg-background/50 border-border/30 hover:bg-accent/50"
                onClick={action.action}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-xs truncate">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-background">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem ou comando..."
              className="flex-1 bg-background border-border/50 text-foreground placeholder:text-muted-foreground"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceInput}
              disabled={isLoading || isListening}
              className={`w-10 h-10 p-0 ${isListening ? 'bg-red-100 border-red-300' : ''}`}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="w-10 h-10 p-0 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartAssistant;