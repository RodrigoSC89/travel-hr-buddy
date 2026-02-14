/**
 * HR Chatbot Component
 * Assistente virtual de RH 24/7 com IA (usando nova edge function hr-chat)
 */
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, X, Send, Bot, User, 
  Calendar, FileText, DollarSign, HelpCircle,
  Loader2, Minimize2, Maximize2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEmployeeProfile, useEmployeePayslips } from '@/hooks/useEmployeePortal';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: Calendar, label: 'Minhas férias', query: 'Quantos dias de férias eu tenho disponíveis?' },
  { icon: FileText, label: 'Último holerite', query: 'Quero ver meu último holerite' },
  { icon: DollarSign, label: '13º salário', query: 'Quando vou receber o 13º salário?' },
  { icon: HelpCircle, label: 'Políticas', query: 'Quais são as políticas de home office?' },
];

export function HRChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou o assistente virtual de RH. Como posso ajudar você hoje?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get employee context for personalized responses
  const { data: profile } = useEmployeeProfile();
  const { data: payslips } = useEmployeePayslips();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context for AI
      const latestPayslip = payslips?.[0];
      const employeeContext = profile ? {
        name: profile.full_name,
        position: profile.position,
        department: profile.department,
        hireDate: profile.hire_date,
        vacationDays: profile.vacation_balance,
        lastPayslip: latestPayslip ? {
          month: `${latestPayslip.reference_month}/${latestPayslip.reference_year}`,
          grossSalary: latestPayslip.gross_salary,
          netSalary: latestPayslip.net_salary,
        } : null,
      } : null;

      // Call edge function
      const { data, error } = await supabase.functions.invoke('hr-chat', {
        body: {
          messages: messages
            .filter(m => m.id !== '1') // Exclude initial greeting
            .map(m => ({ role: m.role, content: m.content }))
            .concat([{ role: 'user', content: messageText }]),
          employeeContext,
        },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      logger.error('Chatbot error:', error);
      
      // Check for rate limit or payment errors
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('429')) {
        toast.error('Muitas requisições. Aguarde um momento.');
      } else if (errorMessage.includes('402')) {
        toast.error('Créditos de IA esgotados.');
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente ou entre em contato com o RH diretamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        aria-label="Abrir assistente de RH"
        title="Assistente de RH"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed z-50 shadow-xl transition-all duration-200 ${
      isMinimized 
        ? 'bottom-24 right-4 md:bottom-6 w-72 h-14' 
        : 'bottom-24 right-4 md:bottom-6 w-[95vw] md:w-96 h-[70vh] md:h-[500px]'
    }`}>
      {/* Header */}
      <CardHeader className="p-3 border-b flex flex-row items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-sm">Assistente de RH</CardTitle>
          <Badge variant="secondary" className="text-xs">Online 24/7</Badge>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)} aria-label={isMinimized ? "Expandir chat" : "Minimizar chat"} title={isMinimized ? "Expandir" : "Minimizar"}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)} aria-label="Fechar chat" title="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 h-[calc(100%-120px)]" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Perguntas frequentes:</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-auto py-2"
                      onClick={() => handleSend(action.query)}
                    >
                      <action.icon className="h-3 w-3 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} aria-label="Enviar mensagem" title="Enviar">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
}
