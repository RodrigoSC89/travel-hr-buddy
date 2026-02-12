/**
 * Universal AI Chat Component
 * Componente de chat reutilizável para qualquer módulo de IA
 * PATCH AI-TRAINING v2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { unifiedAI } from '@/lib/ai/unified-ai-service';
import { AI_MODULES, type AIModuleKey } from '@/lib/ai-prompts';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { logger } from '@/lib/logger';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from '@/lib/supabase/edge-function-helper';

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UniversalAIChatProps {
  module: AIModuleKey;
  context?: Record<string, unknown>;
  placeholder?: string;
  welcomeMessage?: string;
  showVoice?: boolean;
  showExpand?: boolean;
  className?: string;
  onAction?: (action: { type: string; payload: unknown }) => void;
}

interface ChatMessage extends AIMessage {
  id: string;
  timestamp: Date;
  isLoading?: boolean;
  actions?: Array<{ type: string; label: string; payload: unknown }>;
}

export function UniversalAIChat({
  module,
  context,
  placeholder,
  welcomeMessage,
  showVoice = true,
  showExpand = true,
  className,
  onAction
}: UniversalAIChatProps) {
  const moduleConfig = AI_MODULES[module];
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [welcomeMessage, messages.length]);

  const speak = useCallback(async (text: string) => {
    // Try ElevenLabs HD first, fallback to browser TTS
    try {
      setIsSpeaking(true);
      
      const response = await fetch(
        getEdgeFunctionUrl('ai-hub-voice'),
        {
          method: 'POST',
          headers: getEdgeFunctionHeaders(),
          body: JSON.stringify({ text: text.slice(0, 500), module }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
          const audio = new Audio(audioUrl);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      }
    } catch (error) {
      logger.error('ElevenLabs HD failed, falling back to browser TTS:', error);
    }

    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  }, [module]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const copyMessage = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      let fullResponse = '';
      
      for await (const chunk of unifiedAI.streamChat({
        module,
        message: userMessage.content,
        context,
        conversationHistory: messages.filter(m => !m.isLoading).map(m => ({
          role: m.role,
          content: m.content
        }))
      })) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(m => 
            m.id === assistantMessage.id 
              ? { ...m, content: fullResponse, isLoading: false }
              : m
          )
        );
      }
    } catch (error) {
      logger.error('Chat error:', error);
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantMessage.id 
            ? { ...m, content: 'Desculpe, ocorreu um erro ao processar sua mensagem.', isLoading: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [input, isLoading, module, context, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleActionClick = useCallback((action: { type: string; label: string; payload: unknown }) => {
    onAction?.(action);
    toast({ title: `Ação: ${action.label}`, description: 'Executando...' });
  }, [onAction, toast]);

  const clearChat = useCallback(() => {
    setMessages(welcomeMessage ? [{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }] : []);
  }, [welcomeMessage]);

  if (!moduleConfig) return null;

  return (
    <Card className={cn(
      'flex flex-col bg-background/95 backdrop-blur-sm border shadow-lg',
      isExpanded ? 'fixed inset-4 z-50' : 'h-[500px]',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            {moduleConfig.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{moduleConfig.name}</h3>
            <p className="text-xs text-muted-foreground">{moduleConfig.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={clearChat} title="Limpar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {showExpand && (
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {message.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  </div>
                )}
                
                <div className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Pensando...</span>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyMessage(message.id, message.content)}>
                            {copiedId === message.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                          </Button>
                          {showVoice && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}>
                              {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary-foreground font-medium">Eu</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {moduleConfig.capabilities.slice(0, 4).map((cap: string) => (
              <Badge
                key={cap}
                variant="outline"
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setInput(`Executar: ${cap.replace(/_/g, ' ')}`)}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {cap.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Pergunte ao ${moduleConfig.name}...`}
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} className="flex-shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        
        {isStreaming && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Gerando resposta...</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default UniversalAIChat;
