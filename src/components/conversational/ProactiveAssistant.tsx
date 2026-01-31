/**
 * ProactiveAssistant Component
 * Sidebar AI assistant that proactively suggests actions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, X, ChevronRight, Lightbulb, AlertTriangle, 
  TrendingUp, Clock, MessageSquare, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { streamCommandChat, type Message } from '@/lib/ai/nautilus-command';
import { logger } from '@/lib/logger';

interface Suggestion {
  id: string;
  type: 'insight' | 'action' | 'warning' | 'trend';
  title: string;
  description: string;
  action?: { label: string; route: string };
  timestamp: Date;
}

interface ProactiveAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
  currentModule?: string;
}

const typeIcons = {
  insight: Lightbulb,
  action: Sparkles,
  warning: AlertTriangle,
  trend: TrendingUp,
};

const typeColors = {
  insight: 'text-blue-400 bg-blue-500/10',
  action: 'text-primary bg-primary/10',
  warning: 'text-orange-400 bg-orange-500/10',
  trend: 'text-green-400 bg-green-500/10',
};

export function ProactiveAssistant({ 
  isOpen, 
  onClose, 
  onNavigate,
  currentModule 
}: ProactiveAssistantProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [streamingResponse, setStreamingResponse] = useState('');

  useEffect(() => {
    if (isOpen) {
      generateProactiveSuggestions();
    }
  }, [isOpen, currentModule]);

  function generateProactiveSuggestions() {
    // Generate context-aware suggestions
    const baseSuggestions: Suggestion[] = [
      {
        id: '1',
        type: 'warning',
        title: '3 certificados expirando',
        description: 'Certificados STCW de tripulantes expiram em 15 dias',
        action: { label: 'Ver Documentos', route: '/documents' },
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'insight',
        title: 'Padrão de manutenção detectado',
        description: 'Motor auxiliar apresenta falhas recorrentes. Considere inspeção preventiva.',
        action: { label: 'Abrir Manutenção', route: '/maintenance' },
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '3',
        type: 'trend',
        title: 'Eficiência operacional +12%',
        description: 'Indicadores de performance melhoraram no último mês.',
        action: { label: 'Ver Relatório', route: '/reports' },
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: '4',
        type: 'action',
        title: 'Ação sugerida',
        description: 'Baseado no histórico, recomendo atualizar plano de contingência.',
        action: { label: 'Abrir Compliance', route: '/compliance' },
        timestamp: new Date(Date.now() - 10800000),
      },
    ];

    setSuggestions(baseSuggestions);
  }

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);
    setStreamingResponse('');

    try {
      await streamCommandChat({
        messages: [...chatMessages, userMessage],
        context: { activeModules: [currentModule || 'command-center'] },
        onDelta: (delta) => {
          setStreamingResponse(prev => prev + delta);
        },
        onDone: () => {
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: streamingResponse,
            timestamp: new Date().toISOString(),
          }]);
          setStreamingResponse('');
          setIsLoading(false);
        },
        onError: (error) => {
          logger.error('Chat error:', error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-80 bg-background/95 backdrop-blur-md border-l border-border/50 shadow-2xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-semibold">Assistente IA</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mode toggle */}
          <div className="flex p-2 gap-2 border-b border-border/50">
            <Button
              variant={!showChat ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setShowChat(false)}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Insights
            </Button>
            <Button
              variant={showChat ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setShowChat(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="h-[calc(100%-140px)]">
            {!showChat ? (
              /* Suggestions list */
              <div className="p-4 space-y-3">
                {suggestions.map((suggestion, index) => {
                  const Icon = typeIcons[suggestion.type];
                  const colorClass = typeColors[suggestion.type];

                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-muted/30 border border-border/50 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium mb-1">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {suggestion.description}
                          </p>
                          {suggestion.action && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 text-xs"
                              onClick={() => onNavigate?.(suggestion.action!.route)}
                            >
                              {suggestion.action.label}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(suggestion.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Chat interface */
              <div className="p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {streamingResponse && (
                  <div className="bg-muted p-3 rounded-lg text-sm mr-8">
                    {streamingResponse}
                    <span className="animate-pulse">▊</span>
                  </div>
                )}
                {chatMessages.length === 0 && !streamingResponse && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Pergunte qualquer coisa sobre o sistema</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Chat input */}
          {showChat && (
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 bg-muted/50 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !chatInput.trim()}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
