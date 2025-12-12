import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChainVisualizer } from "@/components/thought-chain/ChainVisualizer";
import { runLLMChain, parseNaturalLanguageToChain, CHAIN_TEMPLATES, ChainStep } from "@/lib/ai/llmChainEngine";
import { Play, FileText, Loader2, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ThoughtChainPage = () => {
  const [input, setInput] = useState("");
  const [chainSteps, setChainSteps] = useState<ChainStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const { toast } = useToast();

  const executeChain = async (steps: string[]) => {
    if (steps.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, adicione pelo menos um passo.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setChainSteps([]);
    setTotalTime(0);

    try {
      const result = await runLLMChain(steps, "global", (step) => {
        setChainSteps((prev) => {
          const existing = prev.findIndex((s) => s.id === step.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = step;
            return updated;
          }
          return [...prev, step];
  });
  });

      setTotalTime(result.totalTime);

      if (result.completed) {
        toast({
          title: "Cadeia Concluída",
          description: `${result.steps.length} etapas executadas em ${(result.totalTime / 1000).toFixed(2)}s`,
        });
      } else {
        toast({
          title: "Erro na Cadeia",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunChain = () => {
    const steps = parseNaturalLanguageToChain(input);
    executeChain(steps);
  };

  const loadTemplate = (template: string[]) => {
    setInput(template.join("\n"));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Chain of Thought</h1>
          <p className="text-muted-foreground">Sistema de Raciocínio em Cadeia da IA</p>
        </div>
      </div>

      <Tabs defaultValue="custom" className="space-y-6">
        <TabsList>
          <TabsTrigger value="custom">Comando Customizado</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Cadeia de Raciocínio</CardTitle>
              <CardDescription>
                Digite os passos da análise (um por linha) ou comando em linguagem natural
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Exemplo:&#10;Verificar status dos módulos críticos&#10;Identificar latências acima de 500ms&#10;Sugerir ações corretivas"
                value={input}
                onChange={handleChange}
                rows={8}
                disabled={isRunning}
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRunChain}
                  disabled={isRunning || !input.trim()}
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executando Cadeia...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Executar Cadeia
                    </>
                  )}
                </Button>
                {totalTime > 0 && (
                  <Badge variant="outline" className="text-sm">
                    <Clock className="mr-1 h-3 w-3" />
                    Total: {(totalTime / 1000).toFixed(2)}s
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleloadTemplate}>
              <CardHeader>
                <CardTitle className="text-base">Saúde do Sistema</CardTitle>
                <CardDescription>
                  Análise completa de status e performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>{CHAIN_TEMPLATES.systemHealth.length} etapas</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleloadTemplate}>
              <CardHeader>
                <CardTitle className="text-base">Análise de Frota</CardTitle>
                <CardDescription>
                  Avaliação operacional e riscos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>{CHAIN_TEMPLATES.fleetAnalysis.length} etapas</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleloadTemplate}>
              <CardHeader>
                <CardTitle className="text-base">Auditoria de Manutenção</CardTitle>
                <CardDescription>
                  Revisão de pendências e prioridades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>{CHAIN_TEMPLATES.maintenanceAudit.length} etapas</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleloadTemplate}>
              <CardHeader>
                <CardTitle className="text-base">Bem-estar da Tripulação</CardTitle>
                <CardDescription>
                  Análise de fadiga e suporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>{CHAIN_TEMPLATES.crewWellness.length} etapas</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleloadTemplate}>
              <CardHeader>
                <CardTitle className="text-base">Preparação SAR</CardTitle>
                <CardDescription>
                  Plano de resposta a emergências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>{CHAIN_TEMPLATES.sarPreparation.length} etapas</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {chainSteps.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Execução da Cadeia</CardTitle>
                <CardDescription>Visualização do raciocínio passo a passo</CardDescription>
              </div>
              {!isRunning && chainSteps.every(s => s.status === "completed") && (
                <Badge variant="outline" className="text-green-500">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Concluído
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ChainVisualizer steps={chainSteps} />
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default ThoughtChainPage;
