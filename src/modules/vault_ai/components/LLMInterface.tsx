/**
 * LLMInterface Component
 * AI-powered document interpretation interface for Vault AI
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Send, User, Bot } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: string;
}

const TECHNICAL_CONTEXTS = {
  asog: {
    descricao: "Os documentos ASOG (Aircraft Servicing and Operating Guidelines) descrevem as diretrizes específicas de operação e serviço de aeronaves.",
    keywords: ["asog", "operação", "servicing", "guidelines", "aeronave"]
  },
  fmea: {
    descricao: "Os relatórios FMEA (Failure Mode and Effects Analysis) identificam falhas potenciais, seus modos e estratégias de mitigação.",
    keywords: ["fmea", "falha", "failure", "análise", "mitigação", "risco"]
  },
  imca: {
    descricao: "Documentos IMCA (International Marine Contractors Association) estabelecem padrões e boas práticas para operações marítimas.",
    keywords: ["imca", "marítimo", "marine", "padrões", "contractors", "offshore"]
  },
  sgso: {
    descricao: "SGSO (Sistema de Gestão de Segurança Operacional) define políticas e procedimentos para gestão de segurança operacional.",
    keywords: ["sgso", "segurança", "safety", "gestão", "operacional", "sms"]
  },
  mts: {
    descricao: "Manuais Técnicos de Sistema (MTS) descrevem componentes, manutenção preventiva e limites operacionais de sistemas técnicos.",
    keywords: ["mts", "manual", "técnico", "manutenção", "sistema", "componente"]
  },
  manual: {
    descricao: "Manuais técnicos gerais descrevem componentes, procedimentos de manutenção e limites operacionais.",
    keywords: ["manual", "técnico", "procedimento", "manutenção", "operação"]
  }
};

export function LLMInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente inteligente do Vault Técnico. Posso ajudá-lo a entender e interpretar documentos técnicos. Pergunte sobre ASOG, FMEA, IMCA, SGSO, MTS ou manuais técnicos.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");

  const detectContext = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    for (const [key, context] of Object.entries(TECHNICAL_CONTEXTS)) {
      if (context.keywords.some(keyword => lowerText.includes(keyword))) {
        return key;
      }
    }
    
    return null;
  };

  const generateResponse = (question: string): string => {
    const contextKey = detectContext(question);
    
    if (contextKey && TECHNICAL_CONTEXTS[contextKey]) {
      const context = TECHNICAL_CONTEXTS[contextKey];
      const itemNumber = Math.floor(Math.random() * 50) + 1;
      
      return `${context.descricao}\n\n📋 Análise IA: Para mais informações específicas sobre sua consulta, recomendo consultar o item ${itemNumber} da documentação ${contextKey.toUpperCase()}. Os documentos relacionados podem conter detalhes técnicos adicionais sobre procedimentos, requisitos e especificações operacionais.`;
    }
    
    return "Não encontrei correspondência direta com os contextos técnicos conhecidos (ASOG, FMEA, IMCA, SGSO, MTS). Poderia reformular sua pergunta incluindo um destes termos técnicos? Também posso ajudar com consultas sobre manuais técnicos gerais.";
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    const contextKey = detectContext(input);
    const response = generateResponse(input);

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: response,
      timestamp: new Date(),
      context: contextKey || undefined
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Consulta IA sobre Documentos
          </CardTitle>
          <CardDescription>
            Assistente inteligente para interpretação de documentos técnicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">ASOG</Badge>
              <Badge variant="outline" className="text-xs">FMEA</Badge>
              <Badge variant="outline" className="text-xs">IMCA</Badge>
              <Badge variant="outline" className="text-xs">SGSO</Badge>
              <Badge variant="outline" className="text-xs">MTS</Badge>
              <Badge variant="outline" className="text-xs">Manuais Técnicos</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chat com IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === "user" ? "bg-primary" : "bg-secondary"
                    }`}>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-secondary-foreground" />
                      )}
                    </div>
                    <div className={`space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <Card className={msg.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                        <CardContent className="p-3">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </CardContent>
                      </Card>
                      <div className="flex items-center gap-2 px-1">
                        <p className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {msg.context && (
                          <Badge variant="outline" className="text-xs">
                            {msg.context.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Faça uma pergunta sobre documentos técnicos..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
