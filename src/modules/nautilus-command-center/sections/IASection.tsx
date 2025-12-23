/**
 * Seção: Inteligência Artificial
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, Loader2, Sparkles, Copy, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { useUnifiedCommandAI } from "../hooks/useUnifiedCommandAI";
import { toast } from "sonner";

const quickPrompts = [
  "📊 Análise de performance da frota",
  "🎯 Sugestões de otimização",
  "⚠️ Identificar riscos operacionais",
  "📈 Prever tendências de receita"
];

export function IASection() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearMessages } = useUnifiedCommandAI();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chat Principal */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Nautilus AI Assistant</CardTitle>
                <CardDescription>Powered by Gemini 2.5 Flash</CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Online</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Olá! Sou o assistente IA do Command Center.</p>
                  <p className="text-sm">Como posso ajudar hoje?</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content || (msg.status === "streaming" ? "..." : "")}</p>
                    {msg.role === "assistant" && msg.status === "complete" && (
                      <div className="flex gap-1 mt-2 pt-2 border-t border-border/50">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copiado!"); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><ThumbsUp className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><ThumbsDown className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 mt-4 mb-3">
            {quickPrompts.map((prompt) => (
              <Button key={prompt} variant="outline" size="sm" className="text-xs" onClick={() => handleQuickPrompt(prompt)}>
                <Lightbulb className="h-3 w-3 mr-1" />{prompt}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte qualquer coisa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Painel Lateral */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Modelos IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Previsão de Demanda", accuracy: 96.5, status: "active" },
            { name: "Detecção de Anomalias", accuracy: 98.2, status: "active" },
            { name: "Otimização de Recursos", accuracy: 94.7, status: "active" }
          ].map((model) => (
            <div key={model.name} className="p-3 rounded-lg border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{model.name}</span>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">Ativo</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Precisão: {model.accuracy}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
