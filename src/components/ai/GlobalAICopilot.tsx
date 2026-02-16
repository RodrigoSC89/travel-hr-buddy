/**
 * Global AI Copilot - Floating Chat with Streaming SSE
 * World-class maritime AI assistant available on every page
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, X, Sparkles, Loader2, Brain, Minimize2, Maximize2, 
  Mic, Copy, ThumbsUp, Trash2, Anchor, MessageSquarePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/supabase/edge-function-helper";
import { logger } from '@/lib/logger';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: '📊 Status da Frota', prompt: 'Qual o status atual da frota? Embarcações ativas, em manutenção e alertas.' },
  { label: '⚠️ Alertas Críticos', prompt: 'Quais são os alertas críticos do momento? Certificados vencendo, NCs abertas, manutenções atrasadas.' },
  { label: '👥 Prontidão Tripulação', prompt: 'Analise a prontidão da tripulação: certificações, escalas e compliance MLC 2006.' },
  { label: '🔧 Manutenção Pendente', prompt: 'Liste as manutenções pendentes e atrasadas, priorizando por criticidade.' },
];

export function GlobalAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const allMessages = [...messages, userMessage]
        .filter(m => m.content)
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(
        getEdgeFunctionUrl('crew-ai-copilot'),
        {
          method: 'POST',
          headers: getEdgeFunctionHeaders(session?.access_token),
          body: JSON.stringify({ type: 'chat', messages: allMessages }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Limite de requisições excedido');
          throw new Error('Rate limited');
        }
        if (response.status === 402) {
          toast.error('Créditos de IA insuficientes');
          throw new Error('Payment required');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const json = line.slice(6).trim();
          if (json === '[DONE]') break;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
              );
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      if (!accumulated) {
        // Non-streaming fallback
        try {
          const jsonResponse = JSON.parse(buffer || '{}');
          if (jsonResponse.result) {
            accumulated = jsonResponse.result;
            setMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
            );
          }
        } catch { /* ignore */ }
      }

      if (!accumulated) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        toast.error('Sem resposta da IA');
      }
    } catch (error) {
      logger.error('GlobalAICopilot error:', error);
      setMessages(prev => prev.filter(m => m.id !== assistantId));
      if (!(error instanceof Error && (error.message.includes('Rate') || error.message.includes('Payment')))) {
        toast.error('Erro ao processar mensagem');
      }
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => { setMessages([]); toast.success('Conversa limpa'); };

  // Floating Button
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25 text-primary-foreground group"
        aria-label="Abrir Copilot IA"
      >
        <Brain className="h-6 w-6 group-hover:hidden" />
        <Sparkles className="h-6 w-6 hidden group-hover:block" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-success border-2 border-background" />
        </span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          "fixed z-50 shadow-2xl shadow-primary/10",
          isMinimized
            ? "bottom-6 right-6 w-80"
            : "bottom-6 right-6 w-[420px] h-[640px]"
        )}
      >
        <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-border/50 bg-background/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/5 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Anchor className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Nautilus Copilot</h3>
                <p className="text-[10px] text-muted-foreground">
                  {isStreaming ? '⚡ Respondendo...' : '🟢 Online • Gemini 3 Flash'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat} title="Limpar" aria-label="Limpar conversa">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Expandir" : "Minimizar"} aria-label={isMinimized ? "Expandir" : "Minimizar"}>
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)} title="Fechar" aria-label="Fechar">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                      >
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                          <Brain className="h-8 w-8 text-primary" />
                        </div>
                      </motion.div>
                      <h4 className="font-semibold text-foreground mb-1">Nautilus Copilot</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Seu assistente IA para operações marítimas
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_ACTIONS.map((action) => (
                          <motion.button
                            key={action.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => sendMessage(action.prompt)}
                            className="p-2.5 rounded-xl border border-border/50 bg-card hover:bg-accent/50 text-left transition-colors"
                          >
                            <span className="text-xs font-medium">{action.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn("flex gap-2.5", msg.role === 'user' ? "justify-end" : "justify-start")}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mt-0.5">
                            <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        )}
                        <div className={cn(
                          "max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted/70 rounded-bl-md"
                        )}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                                  ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
                                  ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
                                  li: ({ children }) => <li className="text-sm">{children}</li>,
                                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                  code: ({ children }) => (
                                    <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                  ),
                                }}
                              >
                                {msg.content || '⏳'}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          )}
                          <div className={cn(
                            "flex items-center gap-1 mt-1.5 text-[10px]",
                            msg.role === 'user' ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            <span>{msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.role === 'assistant' && msg.content && (
                              <Button
                                variant="ghost" size="icon" className="h-5 w-5 ml-auto opacity-50 hover:opacity-100"
                                onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copiado'); }}
                                aria-label="Copiar"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isStreaming && messages[messages.length - 1]?.content === '' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <div className="bg-muted/70 rounded-2xl rounded-bl-md px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(dotIdx => (
                              <motion.div
                                key={`typing-dot-${dotIdx}`}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: dotIdx * 0.15 }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">Pensando...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border/30 bg-card/50">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    placeholder="Pergunte sobre operações marítimas..."
                    className="resize-none min-h-[40px] max-h-[100px] text-sm rounded-xl border-border/50"
                    rows={1}
                    disabled={isStreaming}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isStreaming}
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    aria-label="Enviar"
                  >
                    {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                  Shift+Enter nova linha • Powered by Gemini 3 Flash
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GlobalAICopilot;
