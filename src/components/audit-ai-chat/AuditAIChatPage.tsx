/**
 * Audit AI Chat Page - Interactive Chat for PEOTRAM & PEO-DP
 * Features: Chat history, quick actions, evidence PDF generation with QR code
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Send,
  Brain,
  Sparkles,
  FileText,
  History,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Cloud,
  CloudOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { ChatHistory } from "./ChatHistory";
import { EvidencePDFGenerator } from "./EvidencePDFGenerator";
import { HistoryExporter } from "./HistoryExporter";
import { logger } from '@/lib/logger';
import {
  useAuditChatPersistence, 
  type ChatMessage as PersistentMessage, 
  type ChatSession 
} from "@/hooks/use-audit-chat-persistence";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  module?: string;
}

// Re-export ChatSession for other components
export type { ChatSession } from "@/hooks/use-audit-chat-persistence";

interface AuditAIChatPageProps {
  defaultModule?: 'peotram' | 'peodp';
}

const PEOTRAM_QUICK_ACTIONS = [
  { label: "Auditar Elemento 1 - Liderança", prompt: "Realize auditoria completa do Elemento 1 - Liderança e Responsabilidade com todas as LVs e evidências esperadas." },
  { label: "Auditar Elemento 4 - Operação", prompt: "Audite o Elemento 4 - OPERAÇÃO (15% peso crítico). Mapeie todos os requisitos, procedimentos e identifique possíveis não conformidades." },
  { label: "Auditar Elemento 6 - Manutenção", prompt: "Audite o Elemento 6 - MANUTENÇÃO (15% peso crítico). Verifique plano preventivo, calibração, registros e spare parts." },
  { label: "Gerar Checklist Completo", prompt: "Gere um checklist completo de auditoria PEOTRAM com todos os 13 elementos, requisitos críticos e evidências necessárias." },
  { label: "Identificar NCs Comuns", prompt: "Quais são as não conformidades mais comuns em auditorias PEOTRAM? Liste por classificação (A, B, C, D) com ações corretivas." },
  { label: "Preparar Auditoria Externa", prompt: "Como preparar a embarcação para uma auditoria PEOTRAM externa? Liste os documentos essenciais e pontos de atenção." },
];

const PEODP_QUICK_ACTIONS = [
  { label: "Verificar Status ASOG", prompt: "Analise o status ASOG atual para uma embarcação DP2. Explique cada nível (GREEN, BLUE, YELLOW, RED) e critérios de transição." },
  { label: "Auditar FMEA", prompt: "Audite a seção de FMEA (Seção 3). Verifique requisitos de WCF, cenários de falha e critérios de aceitação." },
  { label: "Auditar DP Trials", prompt: "Audite a seção de DP Trials (Seção 4). Verifique Annual Trials, FMEA proving e continuous trials." },
  { label: "Verificar DPOs", prompt: "Verifique os requisitos de qualificação de DPOs (Seção 6). Liste certificações NI/IMCA, experiência mínima e treinamentos." },
  { label: "Gerar Checklist DP", prompt: "Gere um checklist completo de auditoria PEO-DP com todas as 9 seções e 114 requisitos." },
  { label: "Analisar Incidente DP", prompt: "Como investigar e reportar um incidente DP conforme IMCA DPOIS? Liste os passos, classificação e documentação." },
];

const CHAT_URL = `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/module-ai-chat`;
const ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE`;

// Helper to convert between Message types
const toMessage = (pm: PersistentMessage): Message => ({
  ...pm,
  timestamp: new Date(pm.timestamp)
});

const toPersistentMessage = (m: Message): PersistentMessage => ({
  ...m,
  timestamp: m.timestamp.toISOString()
});

export function AuditAIChatPage({ defaultModule = 'peotram' }: AuditAIChatPageProps) {
  const [activeModule, setActiveModule] = useState<'peotram' | 'peodp'>(defaultModule);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [selectedMessageForPDF, setSelectedMessageForPDF] = useState<Message | null>(null);
  
  const { 
    sessions, 
    isLoading: sessionsLoading,
    createSession,
    saveSession,
    deleteSession 
  } = useAuditChatPersistence(activeModule);
  
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SpeechRecognition not in standard lib
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SpeechRecognition event not in standard lib
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Erro no reconhecimento de voz");
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Reconhecimento de voz não suportado");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info(`🎤 Fale sua pergunta sobre ${activeModule === 'peotram' ? 'PEOTRAM' : 'PEO-DP'}...`);
    }
  };

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      module: activeModule
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          module: activeModule,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (response.status === 429) {
        toast.error("Rate limit atingido. Tente novamente em alguns segundos.");
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast.error("Créditos insuficientes. Adicione créditos no Lovable.");
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error('Falha na requisição');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, content } : m
            );
          }
          return [...prev, {
            id: `assistant_${Date.now()}`,
            role: 'assistant' as const,
            content,
            timestamp: new Date(),
            module: activeModule
          }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              updateAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save session
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        module: activeModule
      };

      const allMessages = [...messages, userMessage, assistantMessage];
      const persistentMessages = allMessages.map(toPersistentMessage);

      if (activeSessionId) {
        const session = sessions.find(s => s.id === activeSessionId);
        if (session) {
          saveSession({ ...session, messages: persistentMessages });
        }
      } else {
        const title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
        const newSession = createSession(title, persistentMessages);
        setActiveSessionId(newSession.id);
      }

    } catch (error) {
      logger.error('Chat error:', error);
      toast.error('Erro ao comunicar com a IA. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, activeModule, activeSessionId, sessions, createSession, saveSession]);

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    setInput('');
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages.map(toMessage));
    setActiveSessionId(session.id);
    setActiveModule(session.module);
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    if (activeSessionId === sessionId) {
      startNewChat();
    }
  };

  const handleGeneratePDF = (message: Message) => {
    setSelectedMessageForPDF(message);
    setShowPDFGenerator(true);
  };

  const quickActions = activeModule === 'peotram' ? PEOTRAM_QUICK_ACTIONS : PEODP_QUICK_ACTIONS;
  const moduleColor = activeModule === 'peotram' ? 'orange' : 'blue';
  const moduleTitle = activeModule === 'peotram' ? 'PEOTRAM 2024' : 'PEO-DP 2026';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Assistente Agêntico</h1>
              <p className="text-muted-foreground">Chat interativo para auditorias {moduleTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
              {sessions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{sessions.length}</Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={startNewChat}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </div>
        </div>

        {/* Module Tabs */}
        <Tabs value={activeModule} onValueChange={(v) => {
          setActiveModule(v as 'peotram' | 'peodp');
          startNewChat();
        }}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="peotram" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              PEOTRAM
            </TabsTrigger>
            <TabsTrigger value="peodp" className="gap-2">
              <FileText className="h-4 w-4" />
              PEO-DP
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* History Panel */}
          {showHistory && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Conversas Anteriores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChatHistory
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onLoadSession={loadSession}
                  onDeleteSession={handleDeleteSession}
                />
              </CardContent>
            </Card>
          )}

          {/* Main Chat Area */}
          <Card className={showHistory ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Chat {moduleTitle}
                </CardTitle>
                <Badge variant="outline">
                  {messages.length} mensagens
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages Area */}
              <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Brain className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">Inicie uma conversa</p>
                    <p className="text-sm">Use as ações rápidas ou digite sua pergunta</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onGeneratePDF={() => handleGeneratePDF(message)}
                      />
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analisando...</span>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleListening}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Pergunte sobre ${moduleTitle}...`}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions
                actions={quickActions}
                onAction={handleQuickAction}
                disabled={isLoading}
                moduleColor={moduleColor}
              />
            </CardContent>
          </Card>
        </div>

        {/* PDF Generator Modal */}
        {showPDFGenerator && selectedMessageForPDF && (
          <EvidencePDFGenerator
            message={selectedMessageForPDF}
            module={activeModule}
            onClose={() => {
              setShowPDFGenerator(false);
              setSelectedMessageForPDF(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AuditAIChatPage;
