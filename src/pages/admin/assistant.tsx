"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickCommands = [
    { label: "Criar checklist", command: "criar checklist para inspeção técnica" },
    { label: "Tarefas pendentes", command: "quantas tarefas pendentes tenho hoje?" },
    { label: "Resumir documento", command: "resumir o último documento gerado" },
    { label: "Status do sistema", command: "qual o status do sistema?" },
    { label: "Documentos recentes", command: "listar os documentos recentes" },
  ];

  async function sendMessage(customMessage?: string) {
    const question = customMessage || input;
    if (!question.trim()) return;
    
    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    if (!customMessage) {
      setInput("");
    }

    try {
      // Try Supabase function first
      const { data, error } = await supabase.functions.invoke("assistant-query", {
        body: { question },
      });

      if (error) {
        console.warn("Supabase function error, falling back to API route:", error);
        // Fall back to Next.js API route
        const res = await fetch("/api/assistant-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
        const apiData = await res.json();
        if (!res.ok) throw new Error(apiData.error);
        setMessages((prev) => [...prev, { role: "assistant", content: apiData.answer || "" }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data?.answer || "" }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
    <div className="h-[calc(100vh-4rem)] p-6 flex flex-col lg:flex-row gap-4">
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            🤖 Assistente IA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seu copiloto inteligente para navegação e tarefas do sistema
          </p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Olá! Como posso ajudar você hoje?</p>
                    <p className="text-xs mt-2">
                      Experimente: "Criar checklist", "Resumir documento", "Mostrar alertas"
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
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
      </div>

      {/* Quick Commands Sidebar */}
      <div className="lg:w-80 w-full">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Comandos Rápidos
            </h3>
            <div className="space-y-2">
              {quickCommands.map((cmd, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => sendMessage(cmd.command)}
                  disabled={loading}
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                Capacidades
              </h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>✅ Criar checklists</li>
                <li>✅ Resumir documentos</li>
                <li>✅ Status do sistema</li>
                <li>✅ Buscar tarefas</li>
                <li>✅ Listar documentos</li>
                <li>✅ Gerar relatórios</li>
                <li>✅ Navegação inteligente</li>
              </ul>
              <div className="mt-4 text-xs text-center text-muted-foreground">
                <p className="flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Powered by GPT-4o-mini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
