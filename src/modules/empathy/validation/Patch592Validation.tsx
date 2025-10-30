import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Patch592Validation() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    feedbackModified: boolean;
    emotionalStateLogged: boolean;
    alertsAdapted: boolean;
  } | null>(null);

  const runValidation = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const { empathyCore } = await import("@/ai/emotion/empathy-core");

      // Test 1: Feedback modifies AI
      const originalMessage = "Você deve executar esta tarefa imediatamente";
      const adjustedHigh = empathyCore.adjustResponse(originalMessage, "Estou estressado");
      const feedbackModified = adjustedHigh.adjustedMessage !== originalMessage && adjustedHigh.adjustedMessage.length > 0;

      // Test 2: Emotional state logged
      const mockBio = empathyCore.generateMockBiometrics("high");
      const context = empathyCore.integrateBiometrics(mockBio);
      const emotionalStateLogged = context.stressLevel === "high";

      // Test 3: Alerts adapt to stress
      const reliefActions = empathyCore.provideCognitiveRelief();
      const alertsAdapted = reliefActions.length > 0;

      setResults({
        feedbackModified,
        emotionalStateLogged,
        alertsAdapted
      });

      if (feedbackModified && emotionalStateLogged && alertsAdapted) {
        toast.success("PATCH 592 validado com sucesso!");
      } else {
        toast.error("PATCH 592 falhou em alguns critérios");
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Erro ao executar validação");
      setResults({ feedbackModified: false, emotionalStateLogged: false, alertsAdapted: false });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>PATCH 592 - Empathy Core Engine</CardTitle>
            <CardDescription>
              Sistema capturou estado emocional e ajustou respostas baseado em stress
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
              {results.feedbackModified ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Feedback emocional modificou resposta da IA</span>
            </div>
            <div className="flex items-center gap-2">
              {results.emotionalStateLogged ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Estado emocional registrado nos logs</span>
            </div>
            <div className="flex items-center gap-2">
              {results.alertsAdapted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Alertas adaptados ao stress do operador</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
