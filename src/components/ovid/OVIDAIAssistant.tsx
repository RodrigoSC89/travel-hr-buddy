import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Loader2, FileCheck, AlertTriangle, ClipboardList, Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OVIDAIAssistantProps {
  vesselType: string;
}

export const OVIDAIAssistant: React.FC<OVIDAIAssistantProps> = ({ vesselType }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ovid-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          vesselType,
        }),
      });

      if (!response.ok) throw new Error("Falha na comunicação com IA");

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
      toast.error("Erro ao comunicar com assistente IA");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: FileCheck, label: "Gerar Evidências 2.1.1", prompt: "Quais evidências são necessárias para a questão OVIQ4 2.1.1 sobre certificados?" },
    { icon: AlertTriangle, label: "Redigir Observação", prompt: "Me ajude a redigir uma observação factual para uma não conformidade relacionada a SMS." },
    { icon: ClipboardList, label: "Checklist Pré-Inspeção", prompt: "Gere um checklist de preparação pré-inspeção OVID para " + vesselType },
    { icon: Book, label: "Explicar ISM Code", prompt: "Explique os requisitos do ISM Code relevantes para a inspeção OVID." },
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Assistente IA OVID
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickActions.map((action, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => sendMessage(action.prompt)} disabled={isLoading}>
              <action.icon className="w-4 h-4 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Pergunte sobre OVIQ4, evidências ou procedimentos de inspeção</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            placeholder="Pergunte sobre OVIQ4, evidências, observações..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            className="resize-none"
            rows={2}
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
