/**
 * 🤝 MultiAgentConsensus - Multi-agent collaboration panel
 * Checkpoint 3.5: Multiple agents analyze the same question and reach consensus
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, Send, Loader2, CheckCircle2, AlertTriangle,
  Ship, Wrench, Shield, Heart, DollarSign, Navigation,
  Leaf, Package, Radio, Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_CONTEXTS, getAllAgents } from "@/lib/ai/agentContexts";
import { callAgent } from "@/lib/ai/callAgent";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ICON_MAP: Record<string, React.ElementType> = {
  Ship, Wrench, Shield, Heart, DollarSign, Navigation,
  Leaf, Package, Users: Users, Radio,
};

interface AgentResponse {
  agentId: string;
  agentName: string;
  response: string;
  status: "pending" | "loading" | "done" | "error";
  error?: string;
  responseTimeMs?: number;
}

export default function MultiAgentConsensus() {
  const [question, setQuestion] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    "captain-ai", "safety-ai", "engineer-ai"
  ]);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [consensus, setConsensus] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const agents = getAllAgents();
  const completedCount = responses.filter((r) => r.status === "done").length;
  const totalSelected = selectedAgents.length;
  const progress = totalSelected > 0 ? (completedCount / totalSelected) * 100 : 0;

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const runConsensus = useCallback(async () => {
    if (!question.trim() || selectedAgents.length < 2) {
      toast.error("Selecione pelo menos 2 agentes e escreva uma pergunta.");
      return;
    }

    setIsRunning(true);
    setConsensus(null);

    // Initialize responses
    const initialResponses: AgentResponse[] = selectedAgents.map((id) => ({
      agentId: id,
      agentName: AGENT_CONTEXTS[id]?.name || id,
      response: "",
      status: "pending",
    }));
    setResponses(initialResponses);

    // Query all agents in parallel
    const results = await Promise.allSettled(
      selectedAgents.map(async (agentId) => {
        setResponses((prev) =>
          prev.map((r) =>
            r.agentId === agentId ? { ...r, status: "loading" } : r
          )
        );

        const start = Date.now();
        try {
          const response = await callAgent(agentId, question, {
            context: `Esta é uma consulta de CONSENSO MULTI-AGENTE. Outros agentes também estão respondendo a mesma pergunta. 
Forneça sua análise técnica da perspectiva do seu papel específico. Seja objetivo, conciso e destaque os pontos mais críticos.
Formato: Inicie com "ANÁLISE [Seu Papel]:" seguido da sua avaliação.`,
          });
          const elapsed = Date.now() - start;

          setResponses((prev) =>
            prev.map((r) =>
              r.agentId === agentId
                ? { ...r, response, status: "done", responseTimeMs: elapsed }
                : r
            )
          );
          return { agentId, response };
        } catch (err) {
          const elapsed = Date.now() - start;
          setResponses((prev) =>
            prev.map((r) =>
              r.agentId === agentId
                ? { ...r, status: "error", error: String(err), responseTimeMs: elapsed }
                : r
            )
          );
          throw err;
        }
      })
    );

    // Generate consensus summary
    const successfulResponses = results
      .filter((r): r is PromiseFulfilledResult<{ agentId: string; response: string }> => r.status === "fulfilled")
      .map((r) => r.value);

    if (successfulResponses.length >= 2) {
      try {
        const summaryPrompt = `Você recebeu análises de ${successfulResponses.length} agentes especializados sobre a seguinte questão:

"${question}"

Respostas dos agentes:
${successfulResponses.map((r) => `### ${AGENT_CONTEXTS[r.agentId]?.name || r.agentId}\n${r.response}`).join("\n\n---\n\n")}

Gere um CONSENSO EXECUTIVO que:
1. Identifique os pontos de concordância entre os agentes
2. Destaque divergências significativas
3. Forneça uma RECOMENDAÇÃO FINAL unificada
4. Atribua um nível de confiança do consenso (Alto/Médio/Baixo)

Formato: Comece com "## 🤝 Consenso Multi-Agente" e finalize com a recomendação.`;

        const consensusResponse = await callAgent("captain-ai", summaryPrompt, {
          context: "Você está atuando como MODERADOR de um painel multi-agente. Sintetize as respostas de forma imparcial.",
        });
        setConsensus(consensusResponse);
      } catch {
        setConsensus("Não foi possível gerar o consenso automaticamente. Revise as respostas individuais acima.");
      }
    }

    setIsRunning(false);
    toast.success(`Consenso concluído: ${successfulResponses.length}/${totalSelected} agentes responderam`);
  }, [question, selectedAgents, totalSelected]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Consenso Multi-Agente</h2>
          <p className="text-sm text-muted-foreground">
            Consulte múltiplos agentes simultaneamente para decisões críticas
          </p>
        </div>
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Selecionar Agentes ({selectedAgents.length}/10)</CardTitle>
          <CardDescription className="text-xs">Mínimo 2 agentes para consenso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {agents.map((agent) => {
              const IconComp = ICON_MAP[agent.icon] || Bot;
              const isSelected = selectedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  disabled={isRunning}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  <IconComp className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{agent.name.replace(" AI", "")}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question Input */}
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runConsensus();
            }}
            className="flex gap-3 items-end"
          >
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Descreva a situação ou pergunta para análise multi-agente..."
              className="min-h-[80px]"
              disabled={isRunning}
            />
            <Button
              type="submit"
              disabled={!question.trim() || selectedAgents.length < 2 || isRunning}
              className="shrink-0 h-[80px] px-6"
            >
              {isRunning ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Consultar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress */}
      {responses.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso do consenso</span>
            <span className="font-medium">{completedCount}/{totalSelected} agentes</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Agent Responses */}
      {responses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {responses.map((resp) => {
            const agent = AGENT_CONTEXTS[resp.agentId];
            const IconComp = agent ? ICON_MAP[agent.icon] || Bot : Bot;
            return (
              <Card key={resp.agentId} className={cn(
                "transition-all",
                resp.status === "done" && "border-green-500/20",
                resp.status === "error" && "border-destructive/20",
                resp.status === "loading" && "border-primary/20 animate-pulse"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComp className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">{resp.agentName}</CardTitle>
                    </div>
                    {resp.status === "done" && (
                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {resp.responseTimeMs ? `${(resp.responseTimeMs / 1000).toFixed(1)}s` : "OK"}
                      </Badge>
                    )}
                    {resp.status === "loading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {resp.status === "error" && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[200px]">
                    {resp.status === "pending" && (
                      <p className="text-xs text-muted-foreground">Aguardando...</p>
                    )}
                    {resp.status === "loading" && (
                      <p className="text-xs text-muted-foreground">Analisando...</p>
                    )}
                    {resp.status === "done" && (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                        <ReactMarkdown>{resp.response}</ReactMarkdown>
                      </div>
                    )}
                    {resp.status === "error" && (
                      <p className="text-xs text-destructive">{resp.error}</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Consensus Summary */}
      {consensus && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Consenso Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{consensus}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
