import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Send, Mic, MicOff, Settings, Download, Zap, Brain, User, Clock, TrendingUp, BarChart3, Users, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AISettingsDialog } from "./AISettingsDialog";
import { generateAIResponse } from "./integrated-ai/response-generator";
import type { Message, Conversation, QuickAction } from "./integrated-ai/types";

const IntegratedAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Olá! Sou seu assistente IA empresarial. Posso ajudar com análises, relatórios, automações e muito mais. Como posso ajudá-lo hoje?", role: "assistant", timestamp: new Date(), metadata: { confidence: 95 } }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversations] = useState<Conversation[]>([
    { id: "1", title: "Análise de Performance Q4", lastMessage: "Relatório gerado com sucesso", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), messageCount: 15 },
    { id: "2", title: "Automação de Workflows", lastMessage: "Configuração de aprovações", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), messageCount: 8 }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    { id: "1", title: "Análise de Vendas", description: "Gerar relatório de vendas do período", icon: <TrendingUp className="w-4 h-4" />, prompt: "Analise as vendas dos últimos 30 dias e forneça insights sobre tendências e oportunidades", category: "Analytics" },
    { id: "2", title: "Relatório Financeiro", description: "Criar relatório financeiro detalhado", icon: <DollarSign className="w-4 h-4" />, prompt: "Crie um relatório financeiro completo incluindo receitas, despesas e projeções", category: "Financeiro" },
    { id: "3", title: "Análise de Equipe", description: "Avaliar performance da equipe", icon: <Users className="w-4 h-4" />, prompt: "Analise a performance da equipe e sugira melhorias de produtividade", category: "RH" },
    { id: "4", title: "Dashboard KPI", description: "Criar dashboard de indicadores", icon: <BarChart3 className="w-4 h-4" />, prompt: "Crie um dashboard com os principais KPIs da empresa e métricas de performance", category: "Business Intelligence" },
    { id: "5", title: "Automatizar Processo", description: "Configurar automação de workflow", icon: <Zap className="w-4 h-4" />, prompt: "Ajude-me a configurar uma automação para o processo de aprovação de documentos", category: "Automação" },
    { id: "6", title: "Previsão de Demanda", description: "Análise preditiva de vendas", icon: <Brain className="w-4 h-4" />, prompt: "Use machine learning para prever a demanda dos próximos 3 meses", category: "Predictive Analytics" }
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), content: currentMessage, role: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    try {
      await supabase.functions.invoke('ai-chat', { body: { prompt: currentMessage, module: 'integrated-assistant' } });
      const aiResponse = await generateAIResponse(currentMessage);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: aiResponse.content, role: "assistant", timestamp: new Date(), metadata: { confidence: aiResponse.confidence, function_calls: aiResponse.functionCalls, sources: aiResponse.sources } }]);
    } catch { toast({ title: "Erro", description: "Falha ao processar mensagem. Tente novamente.", variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleQuickAction = (action: QuickAction) => { setCurrentMessage(action.prompt); inputRef.current?.focus(); };
  const toggleListening = () => { setIsListening(!isListening); toast({ title: isListening ? "Reconhecimento de voz desativado" : "Reconhecimento de voz ativo", description: isListening ? "Voltando ao modo texto" : "Fale agora..." }); };

  const exportConversation = () => {
    const conversation = messages.map(msg => `[${msg.timestamp.toLocaleTimeString()}] ${msg.role}: ${msg.content}`).join("\n\n");
    const blob = new Blob([conversation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `conversa-ia-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast({ title: "Conversa exportada", description: "Arquivo baixado com sucesso" });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold flex items-center gap-2"><Bot className="w-5 h-5 text-primary" />Assistente IA</h2><p className="text-sm text-muted-foreground">Seu copiloto empresarial inteligente</p></div>
        <Tabs defaultValue="quick-actions" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-4"><TabsTrigger value="quick-actions">Ações Rápidas</TabsTrigger><TabsTrigger value="history">Histórico</TabsTrigger></TabsList>
          <TabsContent value="quick-actions" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full p-4"><div className="space-y-3">{quickActions.map((action) => (
              <Card key={action.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleQuickAction(action)}>
                <CardContent className="p-3"><div className="flex items-start gap-3"><div className="p-2 bg-primary/10 rounded-lg text-primary">{action.icon}</div><div className="flex-1 min-w-0"><h4 className="font-medium text-sm">{action.title}</h4><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p><Badge variant="outline" className="text-xs mt-2">{action.category}</Badge></div></div></CardContent>
              </Card>))}</div></ScrollArea>
          </TabsContent>
          <TabsContent value="history" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full p-4"><div className="space-y-2">{conversations.map((conv) => (
              <Card key={conv.id} className="cursor-pointer hover:bg-accent/50 transition-colors"><CardContent className="p-3"><div className="space-y-2"><div className="flex items-center justify-between"><h4 className="font-medium text-sm truncate">{conv.title}</h4><Badge variant="outline" className="text-xs">{conv.messageCount}</Badge></div><p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{conv.timestamp.toLocaleDateString()}</div></div></CardContent></Card>
            ))}</div></ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Brain className="w-5 h-5 text-primary" /></div><div><h1 className="font-semibold">Chat IA Empresarial</h1><p className="text-sm text-muted-foreground">{isLoading ? "Processando..." : "Online e pronto para ajudar"}</p></div></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={exportConversation}><Download className="w-4 h-4" /></Button><Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}><Settings className="w-4 h-4" /></Button></div></div></div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && <div className="p-2 bg-primary/10 rounded-lg self-start"><Bot className="w-4 h-4 text-primary" /></div>}
                <div className={`max-w-[80%] rounded-lg p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">{message.content.split("\n").map((line, lineIdx) => (<div key={`${message.id}-line-${lineIdx}`}>{line}{lineIdx < message.content.split("\n").length - 1 && <br />}</div>))}</div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50"><div className="flex items-center gap-2 text-xs opacity-70"><Clock className="w-3 h-3" />{message.timestamp.toLocaleTimeString()}</div>{message.metadata?.confidence && (<Badge variant="outline" className="text-xs">{message.metadata.confidence}% confiança</Badge>)}</div>
                </div>
                {message.role === "user" && <div className="p-2 bg-primary/10 rounded-lg self-start"><User className="w-4 h-4 text-primary" /></div>}
              </div>
            ))}
            {isLoading && (<div className="flex gap-3 justify-start"><div className="p-2 bg-primary/10 rounded-lg"><Bot className="w-4 h-4 text-primary" /></div><div className="bg-muted rounded-lg p-4"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div><div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div><div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div><span className="text-sm ml-2">Processando sua solicitação...</span></div></div></div>)}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border"><div className="max-w-4xl mx-auto"><div className="flex items-center gap-2"><div className="flex-1 relative"><Input ref={inputRef} value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Digite sua mensagem ou escolha uma ação rápida..." className="pr-12" disabled={isLoading} /><Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2" onClick={toggleListening}>{isListening ? <MicOff className="w-4 h-4 text-destructive" /> : <Mic className="w-4 h-4" />}</Button></div><Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isLoading} className="gap-2"><Send className="w-4 h-4" />Enviar</Button></div><div className="flex items-center justify-between mt-2 text-xs text-muted-foreground"><span>Pressione Enter para enviar • Use o microfone para voz</span><span>{currentMessage.length}/2000 caracteres</span></div></div></div>
      </div>
      <AISettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default IntegratedAIAssistant;
