import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Patch593Validation() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    pauseDetected: boolean;
    humanContextLogged: boolean;
    criticalConfirmation: boolean;
  } | null>(null);

  const runValidation = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const { neuroHumanAdapter } = await import("@/ai/interface/neuro-adapter");

      // Test 1: Detects pauses/hesitation
      const reaction1 = neuroHumanAdapter.processAdaptiveInput({
        type: "text",
        content: "Eu acho que...",
        timestamp: new Date()
      });
      const pauseDetected = reaction1.reaction === "wait" || reaction1.reaction === "clarify";

      // Test 2: Human context logged
      const context = neuroHumanAdapter.getHumanContext();
      const humanContextLogged = context.inputHistory.length > 0;

      // Test 3: Critical confirmation
      const reaction2 = neuroHumanAdapter.processAdaptiveInput({
        type: "text",
        content: "Deletar todos os dados",
        timestamp: new Date()
      });
      const criticalConfirmation = reaction2.requiresConfirmation;

      setResults({
        pauseDetected,
        humanContextLogged,
        criticalConfirmation
      });

      if (pauseDetected && humanContextLogged && criticalConfirmation) {
        toast.success("PATCH 593 validado com sucesso!");
      } else {
        toast.error("PATCH 593 falhou em alguns critérios");
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Erro ao executar validação");
      setResults({ pauseDetected: false, humanContextLogged: false, criticalConfirmation: false });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>PATCH 593 - Neuro-Human Interface Adapter</CardTitle>
            <CardDescription>
              IA reagiu a hesitações, pausas e pediu confirmação em ações críticas
            </CardDescription>
          </div>
          <Badge variant={results ? "default" : "secondary"}>
            {results ? "Testado" : "Pendente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runValidation} disabled={isRunning}>
          {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Executar Validação
        </Button>

        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {results.pauseDetected ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Detecção de pauses e hesitação</span>
            </div>
            <div className="flex items-center gap-2">
              {results.humanContextLogged ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Contexto humano registrado</span>
            </div>
            <div className="flex items-center gap-2">
              {results.criticalConfirmation ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Confirmação exigida em ações críticas</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
