"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Send, Loader2, Bot, User, Sparkles, ListChecks, FileText, Activity, ClipboardList, FileSearch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Olá! Sou o assistente do sistema Nautilus One. Posso ajudá-lo com várias tarefas como criar checklists, resumir documentos, verificar status do sistema, buscar tarefas pendentes e muito mais. Como posso ajudar?",
      timestamp: new Date(),
    },
  ]);

  const quickCommands = [
    { icon: ListChecks, text: "Crie um checklist para inspeção técnica", color: "text-blue-600" },
    { icon: FileText, text: "Quantas tarefas pendentes tenho hoje?", color: "text-green-600" },
    { icon: FileSearch, text: "Resuma o último documento gerado", color: "text-purple-600" },
    { icon: Activity, text: "Qual o status do sistema?", color: "text-orange-600" },
    { icon: ClipboardList, text: "Liste os documentos recentes", color: "text-pink-600" },
  ];

  async function sendQuery() {
    if (!question.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setQuestion("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { 
          message: question,
          context: "Nautilus One - Sistema de Gestão Empresarial"
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data?.reply || "Desculpe, não consegui processar sua solicitação.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      toast({
        title: "Resposta recebida",
        description: "O assistente processou sua solicitação.",
      });
    } catch (err) {
      console.error("Error querying assistant:", err);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "❌ Erro ao processar sua pergunta. Por favor, tente novamente.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Erro ao consultar assistente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  function handleQuickCommand(command: string) {
    setQuestion(command);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Assistente IA
          </h1>
          <p className="text-muted-foreground">
            Assistente inteligente do Nautilus One
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Messages */}
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Conversa
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.type === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          message.type === "user"
                            ? "bg-blue-100"
                            : "bg-purple-100"
                        }`}
                      >
                        {message.type === "user" ? (
                          <User className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Bot className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div
                        className={`flex-1 p-4 rounded-lg ${
                          message.type === "user"
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-purple-50 border border-purple-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {message.timestamp.toLocaleTimeString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Processando...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Ex: 'Crie um checklist para inspeção técnica'"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="min-h-[100px] resize-none"
                />
                <Button
                  onClick={sendQuery}
                  disabled={!question.trim() || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comandos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickCommands.map((cmd, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => handleQuickCommand(cmd.text)}
                  disabled={loading}
                >
                  <cmd.icon className={`h-4 w-4 mr-2 flex-shrink-0 ${cmd.color}`} />
                  <span className="text-sm">{cmd.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Capacidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary" className="w-full justify-start">
                ✅ Criar checklists
              </Badge>
              <Badge variant="secondary" className="w-full justify-start">
                📄 Resumir documentos
              </Badge>
              <Badge variant="secondary" className="w-full justify-start">
                📊 Mostrar status
              </Badge>
              <Badge variant="secondary" className="w-full justify-start">
                📋 Listar tarefas
              </Badge>
              <Badge variant="secondary" className="w-full justify-start">
                📁 Listar documentos
              </Badge>
              <Badge variant="secondary" className="w-full justify-start">
                📑 Gerar PDF
              </Badge>
              <Badge variant="secondary" className="w-full justify-start">
                🔗 Navegação interna
              </Badge>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">GPT-4</span>
                </div>
                <p className="text-sm text-purple-700">
                  Powered by OpenAI GPT-4 através do Supabase Edge Functions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
