/**
 * AIAssistantV2 - Assistente IA Padronizado V2
 * ETAPA 4: Integração de IA (Modo Aditivo) - NÃO SUBSTITUI assistentes existentes
 * 
 * Este componente é uma camada ADICIONAL que pode ser integrada a qualquer módulo
 * sem remover funcionalidades manuais existentes.
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AIAssistantV2Props {
  moduleName: string;
  moduleContext?: string;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionApply?: (suggestion: string) => void;
  position?: 'inline' | 'floating' | 'sidebar';
  className?: string;
  // Integration with module data
  onAnalyze?: (data: any) => Promise<string>;
  onGenerate?: (prompt: string) => Promise<string>;
}

export function AIAssistantV2({
  moduleName,
  moduleContext,
  placeholder = 'Pergunte algo ao assistente IA...',
  suggestions = [],
  onSuggestionApply,
  position = 'inline',
  className,
  onAnalyze,
  onGenerate,
}: AIAssistantV2Props) {
  const [isOpen, setIsOpen] = useState(position === 'inline');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: `Olá! Sou o assistente IA do módulo ${moduleName}. Como posso ajudar?`,
      timestamp: new Date(),
    },
  ]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: AIMessage = {
        role: 'assistant',
        content: `Analisando sua solicitação sobre "${input.slice(0, 50)}...":\n\n` +
          `Com base no contexto do módulo ${moduleName}, aqui estão minhas sugestões:\n\n` +
          `1. Verifique os dados de entrada\n` +
          `2. Revise os parâmetros de configuração\n` +
          `3. Consulte a documentação para mais detalhes\n\n` +
          `Posso ajudar com algo mais específico?`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast.error('Erro ao processar sua solicitação');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, moduleName]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setInput(suggestion);
    onSuggestionApply?.(suggestion);
    toast.info(`Sugestão aplicada: "${suggestion.slice(0, 30)}..."`);
  };

  // Floating button for non-inline positions
  if (position === 'floating' && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'h-14 w-14 rounded-full',
          'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
          'shadow-lg hover:shadow-xl transition-all duration-300',
          'flex items-center justify-center',
          'hover:scale-110',
          className
        )}
        aria-label="Abrir Assistente IA"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  const containerStyles = {
    inline: 'w-full',
    floating: cn(
      'fixed bottom-6 right-6 z-50',
      isExpanded ? 'w-[600px] h-[600px]' : 'w-[400px] h-[500px]'
    ),
    sidebar: 'h-full w-full max-w-md',
  };

  return (
    <Card className={cn(
      'flex flex-col overflow-hidden',
      'border-purple-500/30 bg-background/95 backdrop-blur-sm',
      containerStyles[position],
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Assistente IA</h3>
            <p className="text-xs text-muted-foreground">{moduleName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {position === 'floating' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          {position !== 'inline' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.role === 'assistant' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'bg-primary'
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
              <div className={cn(
                'flex-1 rounded-lg p-3 text-sm',
                message.role === 'assistant' 
                  ? 'bg-muted/50' 
                  : 'bg-primary text-primary-foreground'
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.timestamp && (
                  <p className={cn(
                    'text-xs mt-2',
                    message.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                  )}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="flex-1 rounded-lg p-3 bg-muted/50">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 text-xs"
                onClick={() => applySuggestion(suggestion)}
              >
                {suggestion.slice(0, 25)}...
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default AIAssistantV2;
