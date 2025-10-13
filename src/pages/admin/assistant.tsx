"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Bot, User, CheckCircle2, Zap, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Quick command buttons
const quickCommands = [
  { label: "Criar checklist", command: "criar checklist", icon: "✅" },
  { label: "Tarefas pendentes", command: "tarefas pendentes", icon: "📋" },
  { label: "Resumir documento", command: "resumir documento", icon: "📄" },
  { label: "Status do sistema", command: "status do sistema", icon: "📊" },
  { label: "Documentos recentes", command: "documentos recentes", icon: "📚" },
];

// Assistant capabilities
const capabilities = [
  "Criar novo checklist",
  "Resumir documentos",
  "Mostrar status do sistema",
  "Buscar tarefas pendentes",
  "Listar documentos recentes",
  "Gerar PDF com resumo",
  "Redirecionar para rotas internas",
  "Navegação inteligente",
  "Responder perguntas gerais",
];

export default function AssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(commandText?: string) {
    const question = commandText || input.trim();
    if (!question) return;
    
    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    if (!commandText) setInput("");

    try {
      const { data, error } = await supabase.functions.invoke("assistant-query", {
        body: { question },
      });

      if (error) {
        throw error;
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: data?.answer || "" }]);
    } catch (error) {
      logger.error("Error sending message to assistant", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-6 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            🤖 Assistente IA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seu copiloto inteligente para navegação e tarefas do sistema
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/assistant/logs")}
        >
          <History className="w-4 h-4 mr-2" />
          Ver Histórico
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col min-w-0">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Olá! Como posso ajudar você hoje?</p>
                    <p className="text-xs mt-2">
                      Experimente os comandos rápidos ao lado ou digite sua pergunta
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[80%] ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div 
                            className="text-sm whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: msg.content }}
                          />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Gerando resposta...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Pergunte algo... (ex: 'criar checklist', 'resumir documento')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Commands Sidebar */}
        <div className="lg:w-80 w-full space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Comandos Rápidos
              </h3>
              <div className="space-y-2">
                {quickCommands.map((cmd, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => sendMessage(cmd.command)}
                    disabled={loading}
                  >
                    <span className="mr-2">{cmd.icon}</span>
                    {cmd.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Capacidades
              </h3>
              <div className="space-y-1.5">
                {capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-xs font-medium text-purple-700">
              <Sparkles className="w-3 h-3" />
              Powered by GPT-4o-mini
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
