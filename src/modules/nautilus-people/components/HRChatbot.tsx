/**
import { useEffect, useRef, useState } from "react";;
 * HR Chatbot - Assistente Virtual de RH com LLM
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Calendar,
  FileText,
  HelpCircle,
  Clock,
  Loader2,
  X,
  Maximize2,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const HRChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o assistente virtual de RH do Nautilus. Como posso ajudá-lo hoje? Posso responder dúvidas sobre férias, benefícios, políticas internas e muito mais.",
      timestamp: new Date(),
      suggestions: [
        "Quantos dias de férias tenho?",
        "Qual a política de home office?",
        "Como solicitar licença?",
        "Ver meus benefícios"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickActions = [
    { icon: Calendar, label: "Férias", query: "Quantos dias de férias eu tenho disponível?" },
    { icon: FileText, label: "Holerite", query: "Como acessar meu holerite?" },
    { icon: HelpCircle, label: "Benefícios", query: "Quais são meus benefícios?" },
    { icon: Clock, label: "Banco de Horas", query: "Qual é meu saldo de banco de horas?" }
  ];

  const simulateResponse = async (userMessage: string): Promise<string> => {
    // Simulated AI responses based on common HR queries
    const responses: Record<string, string> = {
      "férias": "📅 **Informações de Férias**\n\nVocê possui **12 dias** de férias acumulados.\n\n**Próximo período aquisitivo:** 15/03/2026\n\nPara solicitar férias:\n1. Acesse o Portal do Colaborador\n2. Vá em \"Solicitações > Férias\"\n3. Selecione o período desejado\n4. Aguarde aprovação do gestor\n\nDeseja que eu abra a solicitação de férias para você?",
      "holerite": "💰 **Acesso ao Holerite**\n\nSeu holerite está disponível no Portal do Colaborador.\n\n**Último holerite:** Novembro/2025\n- Salário Bruto: R$ 12.500,00\n- Descontos: R$ 2.875,00\n- Líquido: R$ 9.625,00\n\nDeseja ver o detalhamento ou acessar holerites anteriores?",
      "benefícios": "🎁 **Seus Benefícios**\n\n✅ **Plano de Saúde** - Bradesco Saúde (cobertura familiar)\n✅ **Plano Odontológico** - Odontoprev\n✅ **Vale Refeição** - R$ 45,00/dia\n✅ **Vale Alimentação** - R$ 600,00/mês\n✅ **Gympass** - Plano Gold\n✅ **Seguro de Vida** - 24x salário\n✅ **PLR** - Até 2 salários\n\nTem alguma dúvida sobre algum benefício específico?",
      "banco de horas": "⏰ **Banco de Horas**\n\n**Saldo Atual:** +16h 30min\n\n**Últimos registros:**\n- 05/12: +2h 15min\n- 04/12: +1h 45min\n- 03/12: -0h 30min\n\n**Política:** O banco de horas deve ser compensado em até 6 meses.\n\nDeseja solicitar uma folga?",
      "home office": "🏠 **Política de Home Office**\n\nSua posição permite **regime híbrido**:\n- 3 dias presenciais (Seg, Qua, Sex)\n- 2 dias remotos (Ter, Qui)\n\n**Para solicitar alteração temporária:**\n1. Comunique seu gestor com 48h de antecedência\n2. Registre no sistema de ponto\n\n**Equipamentos fornecidos:**\n- Notebook corporativo\n- Auxílio home office: R$ 150/mês",
      "licença": "📋 **Tipos de Licença**\n\n🤰 **Maternidade:** 180 dias\n👶 **Paternidade:** 20 dias\n💍 **Casamento:** 3 dias\n😢 **Luto:** 3-7 dias (conforme grau)\n📚 **Estudos:** Conforme aprovação\n\nPara solicitar, acesse o Portal > Solicitações > Licenças e anexe a documentação necessária.\n\nQual tipo de licença você precisa?"
    };

    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return `Entendi sua pergunta sobre "${userMessage}". \n\nPara informações mais detalhadas, recomendo:\n1. Consultar o Portal do Colaborador\n2. Falar com o RH pelo e-mail rh@nautilus.com\n3. Agendar uma reunião com seu gestor\n\nPosso ajudar com algo mais específico?`;
  };

  const handleSend = async (message?: string) => {
    const msgToSend = message || input;
    if (!msgToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msgToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = await simulateResponse(msgToSend);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      <div className="p-3 border-b flex gap-2 overflow-x-auto">
        {quickActions.map((action, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => handleSend(action.query)}
          >
            <action.icon className="w-3 h-3 mr-1" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => handleSend(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {message.role === "user" && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-secondary">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by Nautilus AI • Suas conversas são confidenciais
        </p>
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
          <Sparkles className="w-4 h-4" />
          Assistente RH
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className={`p-0 ${isExpanded ? "w-full sm:max-w-full" : "sm:max-w-md"}`}
      >
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle>Assistente de RH</SheetTitle>
              <p className="text-xs text-muted-foreground">Nautilus AI • Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </SheetHeader>
        <div className="h-[calc(100vh-80px)]">
          <ChatContent />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HRChatbot;
