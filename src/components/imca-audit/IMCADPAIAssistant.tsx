import { useEffect, useRef, useState } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Loader2, FileCheck, AlertTriangle, Users, Wrench } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  selectedDPClass: "DP1" | "DP2" | "DP3";
}

export const IMCADPAIAssistant = memo(function({ selectedDPClass }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/imca-dp-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context: { dpClass: selectedDPClass }
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao processar. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "ASOG/CAMO", icon: FileCheck, prompt: "Explique os requisitos do IMCA M220 para ASOG e CAMO" },
    { label: "FMEA", icon: AlertTriangle, prompt: "Como verificar conformidade do FMEA com IMCA M166?" },
    { label: "Competências", icon: Users, prompt: "Requisitos de competência IMCA M117 para pessoal chave DP" },
    { label: "Manutenção", icon: Wrench, prompt: "Requisitos de manutenção e testes anuais IMCA M190" },
  ];

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Assistente IA - Auditoria DP
          <Badge variant="secondary">{selectedDPClass}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">Pergunte sobre normas IMCA, IMO, requisitos de auditoria DP...</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickActions.map(action => (
                    <Button key={action.label} variant="outline" size="sm" onClick={() => setInput(action.prompt)}>
                      <action.icon className="h-4 w-4 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre IMCA, IMO, FMEA, ASOG..."
              className="min-h-[60px]"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            />
            <Button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
