/**
 * Multi-Agent Orchestrator Dashboard
 * Visualization of AI agents collaboration and consensus decisions
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMultiAgentOrchestrator } from "@/hooks/ai/useMultiAgentOrchestrator";
import type { Decision, Situation, ConsensusResult } from "@/lib/ai/engines/multi-agent-orchestrator";
import { 
  Bot, 
  Brain,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Shield,
  Anchor,
  Heart,
  Compass,
  Calculator,
  TrendingUp,
  MessageSquare,
  Wrench
} from "lucide-react";

const agentIcons: Record<string, React.ReactNode> = {
  captain: <Anchor className="h-5 w-5" />,
  engineer: <Wrench className="h-5 w-5" />,
  safety: <Shield className="h-5 w-5" />,
  wellness: <Heart className="h-5 w-5" />,
  navigator: <Compass className="h-5 w-5" />,
  economist: <Calculator className="h-5 w-5" />,
  predictor: <TrendingUp className="h-5 w-5" />,
  communicator: <MessageSquare className="h-5 w-5" />
};

export function MultiAgentDashboard() {
  const { 
    isLoading,
    decisions,
    analyzeSituation,
    clearDecisions
  } = useMultiAgentOrchestrator();
  
  const [situation, setSituation] = useState("");
  const [activeTab, setActiveTab] = useState("consensus");

  const lastDecision = decisions.length > 0 ? decisions[decisions.length - 1] : null;

  const handleRequestConsensus = async () => {
    if (!situation.trim()) return;
    
    const situationData: Situation = {
      id: crypto.randomUUID(),
      type: "operational",
      severity: "warning",
      description: situation,
      data: {
        timestamp: new Date().toISOString(),
        source: "manual_request"
      },
      affectedSystems: ["operations", "crew"],
      timestamp: new Date()
    };
    
    await analyzeSituation(situationData);
    setSituation("");
  };

  const getOutcomeColor = (achieved: boolean) => {
    return achieved 
      ? "bg-primary text-primary-foreground" 
      : "bg-orange-500 text-white";
  };

  const getAverageConfidence = (consensus: ConsensusResult): number => {
    if (!consensus.votes || consensus.votes.length === 0) return 0;
    return consensus.votes.reduce((acc, v) => acc + v.confidence, 0) / consensus.votes.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Agent Orchestrator</h2>
          <p className="text-muted-foreground">
            8 agentes IA especializados colaborando em decisões complexas
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={clearDecisions}
          disabled={decisions.length === 0}
        >
          Limpar Histórico
        </Button>
      </div>

      {/* Agent Status Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        {Object.entries(agentIcons).map(([role, icon]) => (
          <Card key={role} className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {icon}
                </div>
                <p className="text-xs font-medium capitalize">{role}</p>
                <Badge variant="outline" className="text-xs">Online</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Consensus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Solicitar Consenso
          </CardTitle>
          <CardDescription>
            Descreva a situação para os agentes analisarem colaborativamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: Tripulante reportou fadiga excessiva após turno de 12h. Condições climáticas adversas previstas para próximas 48h. Necessário decidir sobre alteração de rota ou escala adicional..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={4}
          />
          <Button 
            onClick={handleRequestConsensus} 
            disabled={isLoading || !situation.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando Agentes...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Solicitar Consenso dos 8 Agentes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="consensus">Última Decisão</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="consensus">
          {lastDecision ? (
            <div className="space-y-4">
              {/* Consensus Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Resultado do Consenso</CardTitle>
                    <Badge className={getOutcomeColor(lastDecision.consensus.achieved)}>
                      {lastDecision.consensus.achieved ? "CONSENSO" : "SEM CONSENSO"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Confiança: {(getAverageConfidence(lastDecision.consensus) * 100).toFixed(1)}% | 
                    Método: {lastDecision.consensus.method}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Nível de Consenso</span>
                      <span>{(getAverageConfidence(lastDecision.consensus) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={getAverageConfidence(lastDecision.consensus) * 100} className="h-2" />
                  </div>
                  
                  {lastDecision.selectedOption && (
                    <div>
                      <p className="text-sm font-medium mb-2">Opção Selecionada:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {lastDecision.selectedOption.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Individual Agent Votes */}
              <Card>
                <CardHeader>
                  <CardTitle>Votos dos Agentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {lastDecision.consensus.votes.map((vote, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                      >
                        <div className="p-2 bg-background rounded-full">
                          {agentIcons[vote.agent] || <Bot className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium capitalize">
                              {vote.agent}
                            </p>
                            {vote.vote === "approve" ? (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            ) : vote.vote === "reject" ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vote.reasoning}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={vote.confidence * 100} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {(vote.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Solicite um consenso para ver o resultado da colaboração dos agentes
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {decisions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhuma decisão registrada ainda
                </p>
              </CardContent>
            </Card>
          ) : (
            decisions.slice().reverse().slice(0, 10).map((decision: Decision, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Decisão #{decision.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={getOutcomeColor(decision.consensus.achieved)}>
                      {decision.consensus.achieved ? "CONSENSO" : "SEM CONSENSO"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {decision.createdAt ? new Date(decision.createdAt).toLocaleString("pt-BR") : "Data não disponível"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {decision.selectedOption?.description || decision.description || "Sem descrição"}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
