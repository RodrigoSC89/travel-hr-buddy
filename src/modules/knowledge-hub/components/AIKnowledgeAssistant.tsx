/**
 * AI Knowledge Assistant - Componente de Chat IA Extraordinário
 * Interface conversacional para perguntas sobre documentos
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Send,
  Sparkles,
  FileText,
  Lightbulb,
  MessageSquare,
  Loader2,
  BookOpen,
  CheckSquare,
  ClipboardList,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { KnowledgeAnswer, KnowledgeSource } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: KnowledgeSource[];
  actions?: KnowledgeAnswer['actions'];
  timestamp: Date;
  isLoading?: boolean;
}

interface AIKnowledgeAssistantProps {
  onAsk: (question: string) => Promise<KnowledgeAnswer>;
  isLoading?: boolean;
  suggestedQuestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Qual é o procedimento para abandono de navio?",
  "Como fazer a inspeção de equipamentos de salvatagem?",
  "Quais são os requisitos do SOLAS para extintores?",
  "Mostre o checklist de segurança pré-partida",
  "Explique os procedimentos de homem ao mar",
];

export function AIKnowledgeAssistant({ 
  onAsk, 
  isLoading = false,
  suggestedQuestions = DEFAULT_SUGGESTIONS 
}: AIKnowledgeAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');

    try {
      const answer = await onAsk(input.trim());
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: answer.answer,
                sources: answer.sources,
                actions: answer.actions,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
                isLoading: false,
              }
            : msg
        )
      );
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span>Assistente de Conhecimento IA</span>
            <p className="text-xs font-normal text-muted-foreground">
              Pergunte sobre manuais, procedimentos e regulamentos
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            RAG + GPT-4
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Olá! Sou seu assistente de conhecimento
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Posso responder perguntas sobre manuais, procedimentos, 
                checklists e regulamentos da sua empresa. Experimente perguntar:
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.slice(0, 4).map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestionClick(q)}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {q.length > 40 ? q.substring(0, 40) + '...' : q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="p-2 rounded-full bg-primary/10 h-fit">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.role === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Analisando documentos...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Sources */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                Fontes ({message.sources.length})
                              </p>
                              <div className="space-y-1">
                                {message.sources.map((source, i) => (
                                  <div 
                                    key={i}
                                    className="text-xs p-2 rounded bg-background/50 flex items-center gap-2"
                                  >
                                    <FileText className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{source.documentTitle}</span>
                                    {source.pageNumber && (
                                      <Badge variant="outline" className="text-[10px] shrink-0">
                                        p.{source.pageNumber}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs font-medium mb-2">Ações sugeridas:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.actions.map((action, i) => (
                                  <Button
                                    key={i}
                                    size="sm"
                                    variant="secondary"
                                    className="text-xs h-7"
                                  >
                                    {action.type === 'create_task' && <CheckSquare className="h-3 w-3 mr-1" />}
                                    {action.type === 'generate_checklist' && <ClipboardList className="h-3 w-3 mr-1" />}
                                    {action.type === 'open_document' && <ExternalLink className="h-3 w-3 mr-1" />}
                                    {action.title}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Message actions */}
                          {message.role === 'assistant' && !message.isLoading && (
                            <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="p-2 rounded-full bg-primary h-fit">
                        <MessageSquare className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Pergunte sobre qualquer documento..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => setMessages([])}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Nova conversa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
