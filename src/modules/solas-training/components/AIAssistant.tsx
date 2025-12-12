import { useEffect, useRef, useState, useCallback, useMemo } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSOLASAI } from "../hooks/useSolasAI";
import { Brain, Sparkles, Send, Loader2, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o assistente de treinamentos SOLAS/ISM com IA. Posso ajudar com procedimentos de drills, requisitos STCW, planejamento de treinamentos e análise de conformidade. Como posso ajudar?" }
  ]);
  const [input, setInput] = useState("");
  const { isLoading, sendMessage } = useSOLASAI();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    const response = await sendMessage(userMessage);
    if (response) {
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }
  };

  const quickActions = [
    "Procedimento de incêndio",
    "Como fazer abandono?",
    "Verificar certificados expirando",
    "Requisitos SOLAS drill mensal",
  ];

  return (
    <Card className="h-full bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-orange-500" />
          Assistente SOLAS/ISM
          <Badge variant="secondary" className="ml-auto"><Sparkles className="h-3 w-3 mr-1" />LLM</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-80px)]">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-orange-500" />
                  </div>
                )}
                <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Processando...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <Button key={i} variant="outline" size="sm" onClick={handleSetInput} disabled={isLoading}>
                {action}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte sobre drills, SOLAS, STCW..."
              value={input}
              onChange={handleChange}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
