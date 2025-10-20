/**
 * LLMInterface Component
 * Interface de IA embarcada – interpreta e responde sobre conteúdo técnico
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Send, Bot, User, Trash2 } from "lucide-react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

interface LLMInterfaceProps {
  onVoltar?: () => void;
}

interface Message {
  id: string;
  tipo: "usuario" | "ia";
  conteudo: string;
  timestamp: string;
}

const CONTEXTOS_TECNICOS = {
  asog: {
    chave: "asog",
    descricao: "ASOG - Aviation Safety Operations Guide",
    conteudo:
      "Os documentos ASOG descrevem as diretrizes específicas de operação e procedimentos de segurança operacional. Incluem protocolos de resposta a emergências, procedimentos de voo, e padrões de manutenção.",
  },
  fmea: {
    chave: "fmea",
    descricao: "FMEA - Failure Mode and Effects Analysis",
    conteudo:
      "Os relatórios FMEA identificam falhas potenciais, suas causas, efeitos e modos de mitigação. A análise quantifica riscos através de RPN (Risk Priority Number) e prioriza ações corretivas.",
  },
  manual: {
    chave: "manual",
    descricao: "Manuais Técnicos",
    conteudo:
      "Manuais técnicos descrevem componentes, procedimentos de manutenção e limites operacionais. Incluem especificações técnicas, diagramas, e instruções de troubleshooting.",
  },
  imca: {
    chave: "imca",
    descricao: "IMCA - International Marine Contractors Association",
    conteudo:
      "Documentos IMCA estabelecem padrões internacionais para operações marítimas e offshore. Cobrem DP (Dynamic Positioning), ROV operations, e procedimentos de segurança submarina.",
  },
  sgso: {
    chave: "sgso",
    descricao: "SGSO - Sistema de Gestão de Segurança Operacional",
    conteudo:
      "SGSO define políticas, processos e procedimentos para garantir segurança operacional. Inclui gestão de riscos, auditorias, treinamentos e melhoria contínua.",
  },
  mts: {
    chave: "mts",
    descricao: "MTS - Marine Technology Society",
    conteudo:
      "Padrões MTS cobrem tecnologias marítimas, sistemas de posicionamento dinâmico, e equipamentos submarinos. Estabelecem requisitos técnicos e de certificação.",
  },
};

export default function LLMInterface({ onVoltar }: LLMInterfaceProps) {
  const [mensagens, setMensagens] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      tipo: "ia",
      conteudo:
        "🧠 Olá! Sou o assistente técnico do Vault. Faça perguntas sobre documentos técnicos, procedimentos, normas ou padrões operacionais. Estou aqui para ajudar!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [pergunta, setPergunta] = useState("");
  const [processando, setProcessando] = useState(false);

  const gerarResposta = (pergunta: string): string => {
    const perguntaLower = pergunta.toLowerCase();

    // Check for technical contexts
    for (const contexto of Object.values(CONTEXTOS_TECNICOS)) {
      if (perguntaLower.includes(contexto.chave)) {
        const itemAleatorio = Math.floor(Math.random() * 50) + 1;
        return `📋 **${contexto.descricao}**\n\n${contexto.conteudo}\n\n🔍 **Análise IA:** Recomendo consultar o item ${itemAleatorio} para mais detalhes técnicos e procedimentos específicos.`;
      }
    }

    // Check for general safety terms
    if (
      perguntaLower.includes("segurança") ||
      perguntaLower.includes("safety")
    ) {
      return "🛡️ **Segurança Operacional**\n\nRecomendo revisar os documentos SGSO e ASOG indexados. Eles contêm diretrizes completas sobre procedimentos de segurança, análise de riscos e protocolos de emergência.\n\n💡 Para análise específica de falhas, consulte os relatórios FMEA disponíveis no Vault.";
    }

    // Check for maintenance terms
    if (
      perguntaLower.includes("manutenção") ||
      perguntaLower.includes("maintenance")
    ) {
      return "🔧 **Procedimentos de Manutenção**\n\nOs manuais técnicos indexados contêm procedimentos detalhados de manutenção preventiva e corretiva. Inclui especificações técnicas, intervalos de manutenção e troubleshooting.\n\n📊 Consulte também os relatórios FMEA para identificar pontos críticos de manutenção.";
    }

    // Check for operational terms
    if (
      perguntaLower.includes("operação") ||
      perguntaLower.includes("operation")
    ) {
      return "⚙️ **Procedimentos Operacionais**\n\nDocumentos ASOG fornecem diretrizes operacionais completas. Para operações marítimas específicas, consulte os padrões IMCA e MTS.\n\n🌊 Se for sobre Dynamic Positioning (DP), revise os guidelines IMCA para procedimentos de DP operations.";
    }

    // Default response
    return `🤖 **Análise da Consulta**\n\nNão encontrei correspondência direta para "${pergunta}".\n\n📚 **Recomendações:**\n- Revise documentos ASOG para procedimentos operacionais\n- Consulte FMEA para análise de falhas\n- Verifique manuais técnicos para especificações\n\n💡 Tente reformular sua pergunta incluindo termos como: ASOG, FMEA, Manual, IMCA, SGSO, MTS, segurança, manutenção, ou operação.`;
  };

  const enviarPergunta = async () => {
    if (!pergunta.trim()) {
      toast.error("❌ Digite uma pergunta");
      return;
    }

    const novaMensagemUsuario: Message = {
      id: crypto.randomUUID(),
      tipo: "usuario",
      conteudo: pergunta,
      timestamp: new Date().toISOString(),
    };

    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    logger.info(`Consulta Vault LLM: ${pergunta}`);
    setPergunta("");
    setProcessando(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const resposta = gerarResposta(novaMensagemUsuario.conteudo);

      const novaMensagemIA: Message = {
        id: crypto.randomUUID(),
        tipo: "ia",
        conteudo: resposta,
        timestamp: new Date().toISOString(),
      };

      setMensagens((prev) => [...prev, novaMensagemIA]);
      setProcessando(false);
    }, 1000);
  };

  const limparConversa = () => {
    setMensagens([
      {
        id: crypto.randomUUID(),
        tipo: "ia",
        conteudo:
          "🧠 Conversa reiniciada. Como posso ajudar com documentos técnicos?",
        timestamp: new Date().toISOString(),
      },
    ]);
    toast.success("🗑️ Conversa limpa");
  };

  const formatarHora = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🧠 Consulta Técnica IA – Vault
          </h2>
          <p className="text-muted-foreground mt-1">
            Pergunte sobre qualquer documento técnico indexado
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={limparConversa}
            disabled={processando}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          {onVoltar && (
            <Button variant="outline" onClick={onVoltar}>
              ⏹ Voltar
            </Button>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Chat com Assistente IA
            <Badge variant="secondary" className="ml-auto">
              {mensagens.length} mensagens
            </Badge>
          </CardTitle>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.tipo === "usuario" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.tipo === "ia" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.tipo === "usuario"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {msg.conteudo}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        msg.tipo === "usuario"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatarHora(msg.timestamp)}
                    </div>
                  </div>

                  {msg.tipo === "usuario" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {processando && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta sobre documentos técnicos..."
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !processando && enviarPergunta()}
              disabled={processando}
              className="flex-1"
            />
            <Button onClick={enviarPergunta} disabled={processando}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Pergunte sobre: ASOG, FMEA, IMCA, SGSO, MTS, manuais técnicos, procedimentos...
          </p>
        </div>
      </Card>
    </div>
  );
}
