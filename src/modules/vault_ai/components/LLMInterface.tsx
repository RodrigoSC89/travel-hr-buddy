/**
 * LLMInterface Component
 * AI chat interface with technical context support
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Brain } from "lucide-react";
import { TechnicalContext, type ChatMessage } from "../types";

interface LLMInterfaceProps {
  onBack: () => void;
}

export default function LLMInterface({ onBack }: LLMInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectContext = (query: string): TechnicalContext => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("asog") || lowerQuery.includes("servicing")) {
      return TechnicalContext.ASOG;
    }
    if (lowerQuery.includes("fmea") || lowerQuery.includes("failure mode")) {
      return TechnicalContext.FMEA;
    }
    if (lowerQuery.includes("imca") || lowerQuery.includes("marine contractor")) {
      return TechnicalContext.IMCA;
    }
    if (lowerQuery.includes("sgso") || lowerQuery.includes("segurança operacional")) {
      return TechnicalContext.SGSO;
    }
    if (lowerQuery.includes("mts") || lowerQuery.includes("manual técnico")) {
      return TechnicalContext.MTS;
    }

    return TechnicalContext.GENERAL;
  };

  const getContextResponse = (context: TechnicalContext, userMessage: string): string => {
    const responses: Record<TechnicalContext, string> = {
      [TechnicalContext.ASOG]: `Com base no contexto ASOG (Aircraft Servicing and Operating Guidelines), vou ajudá-lo com sua pergunta: "${userMessage}"\n\nOs documentos ASOG são essenciais para operações seguras de servicing de aeronaves. Aqui estão algumas orientações:\n\n• Sempre consulte o manual ASOG específico para sua aeronave\n• Verifique os procedimentos de segurança antes de iniciar\n• Mantenha todas as ferramentas e equipamentos calibrados\n• Documente todas as atividades de manutenção\n\nPara informações mais específicas, consulte os documentos ASOG indexados no vault.`,

      [TechnicalContext.FMEA]: `No contexto de FMEA (Failure Mode and Effects Analysis), vou abordar sua questão: "${userMessage}"\n\nA análise FMEA é crucial para:\n\n• Identificar modos de falha potenciais\n• Avaliar efeitos e severidade\n• Determinar causas raízes\n• Estabelecer controles e ações preventivas\n\nRecomendo consultar os documentos FMEA específicos no vault para análises detalhadas.`,

      [TechnicalContext.IMCA]: `Referente aos padrões IMCA (International Marine Contractors Association): "${userMessage}"\n\nAs diretrizes IMCA cobrem:\n\n• Operações de mergulho e ROV\n• Sistemas de posicionamento dinâmico\n• Segurança operacional marítima\n• Boas práticas da indústria\n\nConsulte os documentos IMCA no vault para padrões específicos.`,

      [TechnicalContext.SGSO]: `Sobre SGSO (Sistema de Gestão de Segurança Operacional): "${userMessage}"\n\nO SGSO abrange:\n\n• Políticas de segurança\n• Gestão de riscos\n• Treinamento e competências\n• Investigação de incidentes\n• Auditorias e melhorias contínuas\n\nRecomendo revisar os manuais SGSO indexados para procedimentos detalhados.`,

      [TechnicalContext.MTS]: `Referente aos Manuais Técnicos de Sistema (MTS): "${userMessage}"\n\nOs MTS fornecem:\n\n• Especificações técnicas detalhadas\n• Procedimentos de operação\n• Instruções de manutenção\n• Troubleshooting e diagnósticos\n\nConsulte os documentos MTS específicos no vault.`,

      [TechnicalContext.GENERAL]: `Olá! Vou ajudá-lo com sua pergunta: "${userMessage}"\n\nEste é o assistente técnico do Nautilus Vault. Posso ajudá-lo com:\n\n• Interpretação de documentos técnicos\n• Orientações sobre ASOG, FMEA, IMCA, SGSO e MTS\n• Busca contextual em manuais e relatórios\n• Análise de pareceres técnicos\n\nPara melhor assistência, por favor especifique o contexto técnico da sua dúvida (ASOG, FMEA, IMCA, SGSO, ou MTS).`,
    };

    return responses[context];
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    const context = detectContext(input);
    const assistantResponse = getContextResponse(context, input);

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: assistantResponse,
      timestamp: new Date().toISOString(),
      context,
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  const getContextBadgeVariant = (context?: TechnicalContext) => {
    switch (context) {
      case TechnicalContext.ASOG:
        return "default";
      case TechnicalContext.FMEA:
        return "destructive";
      case TechnicalContext.IMCA:
        return "secondary";
      case TechnicalContext.SGSO:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            🧠 Assistente Técnico IA
          </CardTitle>
          <CardDescription>
            Interpretação contextual de documentos técnicos com suporte a ASOG, FMEA, IMCA, SGSO e MTS
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Faça uma pergunta sobre documentos técnicos</p>
                  <p className="text-sm mt-2">
                    Contextos suportados: ASOG, FMEA, IMCA, SGSO, MTS
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold">
                        {message.role === "user" ? "Você" : "Assistente IA"}
                      </span>
                      {message.context && (
                        <Badge variant={getContextBadgeVariant(message.context)} className="text-xs">
                          {message.context}
                        </Badge>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta sobre documentos técnicos..."
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
