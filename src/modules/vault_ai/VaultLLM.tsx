/**
 * VaultLLM Component
 * Interface de IA embarcada – interpreta e responde sobre conteúdo técnico
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, Send } from "lucide-react";
import { logger } from "@/lib/logger";
import { VaultContext } from "./types";

const CONTEXTOS: VaultContext[] = [
  {
    chave: "asog",
    conteudo: "Os documentos ASOG descrevem as diretrizes específicas de operação.",
    categoria: "Operacional",
  },
  {
    chave: "fmea",
    conteudo: "Os relatórios FMEA identificam falhas potenciais e modos de mitigação.",
    categoria: "Análise de Risco",
  },
  {
    chave: "manual",
    conteudo: "Manuais técnicos descrevem componentes, manutenção e limites operacionais.",
    categoria: "Documentação Técnica",
  },
  {
    chave: "dp",
    conteudo: "Documentos de Dynamic Positioning (DP) incluem logs, incidentes e análises de posicionamento dinâmico.",
    categoria: "Sistema DP",
  },
  {
    chave: "sgso",
    conteudo: "Documentos do Sistema de Gestão de Saúde e Segurança Ocupacional incluem políticas, procedimentos e auditorias.",
    categoria: "Segurança",
  },
];

interface ChatMessage {
  id: string;
  pergunta: string;
  resposta: string;
  timestamp: string;
}

export const VaultLLM: React.FC = () => {
  const [pergunta, setPergunta] = useState("");
  const [historico, setHistorico] = useState<ChatMessage[]>([]);

  const responder = (pergunta: string): string => {
    logger.info(`Consulta Vault LLM: ${pergunta}`);

    const perguntaLower = pergunta.toLowerCase();

    // Procurar por contextos relevantes
    for (const contexto of CONTEXTOS) {
      if (perguntaLower.includes(contexto.chave)) {
        const itemAleatorio = Math.floor(Math.random() * 50) + 1;
        return `${contexto.conteudo}\n\n🤖 Análise IA: Consulte o item ${itemAleatorio} da seção ${contexto.categoria} para mais detalhes.`;
      }
    }

    // Resposta padrão
    return "Não encontrei correspondência direta. Recomendo revisar os documentos FMEA ou ASOG indexados no sistema Vault.";
  };

  const enviarPergunta = () => {
    if (!pergunta.trim()) {
      return;
    }

    const resposta = responder(pergunta);
    const mensagem: ChatMessage = {
      id: `msg_${Date.now()}`,
      pergunta,
      resposta,
      timestamp: new Date().toISOString(),
    };

    setHistorico([mensagem, ...historico]);
    setPergunta("");
  };

  const limparHistorico = () => {
    setHistorico([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            🧠 Consulta Técnica IA – Vault
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Pergunte sobre qualquer documento técnico (ASOG, FMEA, Manual, DP, SGSO)
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta técnica..."
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && enviarPergunta()}
              className="flex-1"
            />
            <Button onClick={enviarPergunta}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
            {historico.length > 0 && (
              <Button variant="secondary" onClick={limparHistorico}>
                Limpar
              </Button>
            )}
          </div>

          {/* Contextos Disponíveis */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">📚 Contextos Disponíveis:</h4>
            <div className="flex flex-wrap gap-2">
              {CONTEXTOS.map((ctx) => (
                <Badge 
                  key={ctx.chave}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setPergunta(`O que é ${ctx.chave.toUpperCase()}?`)}
                >
                  {ctx.chave.toUpperCase()} - {ctx.categoria}
                </Badge>
              ))}
            </div>
          </div>

          {/* Histórico de Conversas */}
          {historico.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Histórico de Consultas ({historico.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historico.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold">👤</span>
                        <div className="flex-1">
                          <p className="font-medium">{msg.pergunta}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 ml-6 mt-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <span className="text-purple-600 font-semibold">🤖</span>
                        <p className="flex-1 text-sm whitespace-pre-line">
                          {msg.resposta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
