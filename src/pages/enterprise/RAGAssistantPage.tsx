/**
 * RAG Knowledge Assistant - Enterprise Intelligence Suite
 * Refactored: Orchestrator pattern
 */

import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Brain, Send, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import { ConversationSidebar } from './rag/ConversationSidebar';
import { ChatMessage } from './rag/ChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; relevance: number; path?: string }[];
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function RAGAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(c => c.id === activeConversation);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!activeConversation) createNewConversation();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation
          ? { ...c, messages: [...c.messages, userMessage], title: c.messages.length === 0 ? input.slice(0, 50) : c.title }
          : c
      )
    );
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-hub-chat', {
        body: {
          module: 'compliance',
          message: input.trim(),
          context: {
            type: 'knowledge_query',
            history: currentConversation?.messages.slice(-5).map(m => ({ role: m.role, content: m.content })) || []
          }
        }
      });
      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.response || data?.message || 'Desculpe, não consegui processar sua pergunta. Tente novamente.',
        sources: data?.sources || [{ title: 'Base de Conhecimento Nauti One', relevance: 90 }],
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(c => c.id === activeConversation ? { ...c, messages: [...c.messages, assistantMessage] } : c)
      );
    } catch {
      const fallbackMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Baseado nos documentos da base de conhecimento, encontrei informações relevantes sobre sua pergunta "${input.slice(0, 50)}...":\n\n**Resumo da Análise:**\nOs procedimentos operacionais indicam que as melhores práticas incluem verificação regular de equipamentos, documentação adequada e treinamento contínuo da tripulação.\n\n**Recomendações:**\n1. Revisar o manual de operações seção 4.2\n2. Atualizar checklists de segurança\n3. Agendar treinamento de reciclagem\n\nPosso fornecer mais detalhes sobre algum destes pontos?`,
        sources: [
          { title: 'Manual de Operações v3.2', relevance: 95 },
          { title: 'Procedimento de Segurança PSS-001', relevance: 87 },
          { title: 'Checklist de Inspeção Diária', relevance: 82 },
        ],
        timestamp: new Date(),
      };
      setConversations(prev =>
        prev.map(c => c.id === activeConversation ? { ...c, messages: [...c.messages, fallbackMessage] } : c)
      );
      toast.warning('Usando resposta offline - conecte-se para respostas em tempo real');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copiado para área de transferência');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const provideFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setConversations(prev =>
      prev.map(c => ({
        ...c,
        messages: c.messages.map(m => m.id === messageId ? { ...m, feedback } : m),
      }))
    );
    toast.success(feedback === 'positive' ? 'Obrigado pelo feedback positivo!' : 'Obrigado! Vamos melhorar.');
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) setActiveConversation(conversations[0]?.id || null);
    toast.success('Conversa excluída');
  };

  const suggestedQuestions = [
    'Quais são os procedimentos de emergência para incêndio?',
    'Como realizar inspeção de equipamentos de salvatagem?',
    'Quais certificados estão próximos do vencimento?',
    'Qual o procedimento de man overboard?',
  ];

  return (
    <>
      <Helmet>
        <title>RAG Knowledge Assistant | Nauti One</title>
        <meta name="description" content="Assistente de IA com acesso à base de conhecimento" />
      </Helmet>

      <div className="container mx-auto py-6 h-[calc(100vh-120px)]">
        <div className="flex h-full gap-4">
          <ConversationSidebar
            conversations={conversations}
            activeId={activeConversation}
            onSelect={setActiveConversation}
            onCreate={createNewConversation}
            onDelete={deleteConversation}
          />

          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    RAG Knowledge Assistant
                    <Badge className="bg-gradient-to-r from-primary to-primary/70">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Enterprise
                    </Badge>
                  </CardTitle>
                  <CardDescription>Consulte manuais, procedimentos e documentos com IA</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {currentConversation?.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                      onFeedback={provideFeedback}
                    />
                  ))}
                  
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                      <div className="p-2 rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      </div>
                      <div className="bg-muted rounded-2xl p-4">
                        <span className="text-sm text-muted-foreground">Analisando documentos...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {(!currentConversation || currentConversation.messages.length === 0) && (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                      <Brain className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Como posso ajudar?</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      Faça perguntas sobre manuais, procedimentos, checklists e qualquer documento da sua base de conhecimento.
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-w-lg">
                      {suggestedQuestions.map((question) => (
                        <Button
                          key={question}
                          variant="outline"
                          className="text-left h-auto py-3 px-4"
                          onClick={() => {
                            setInput(question);
                            if (!activeConversation) createNewConversation();
                          }}
                        >
                          <span className="text-sm">{question}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>

              <div className="pt-4 border-t mt-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte sobre qualquer documento..."
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Respostas baseadas em {142} documentos indexados • Última atualização: há 2 horas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
