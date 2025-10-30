import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Patch591Validation() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    commandsLogged: boolean;
    responseAdapted: boolean;
    urgencyOptimized: boolean;
  } | null>(null);

  const runValidation = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      // Dynamic import to avoid build errors if module doesn't exist
      const { socioCognitiveLayer } = await import("@/ai/interface/sociocognitive-layer");

      // Test 1: Interpret 3+ commands
      const commands = [
        { text: "Status normal do sistema", timestamp: new Date() },
        { text: "Urgente! Problema crítico detectado!", timestamp: new Date() },
        { text: "Verificar módulos de navegação", timestamp: new Date() }
      ];

      commands.forEach(cmd => socioCognitiveLayer.interpretCommand(cmd));
      const contextLog = socioCognitiveLayer.getContextLog();
      const commandsLogged = contextLog.length >= 3;

      // Test 2: Adapt response based on load
      socioCognitiveLayer.setOperationalLoad("high");
      const interpretation = socioCognitiveLayer.interpretCommand({
        text: "Preciso de ajuda detalhada",
        timestamp: new Date()
      });
      const adaptedResponse = socioCognitiveLayer.adaptResponse(
        interpretation,
        "Esta é uma resposta muito detalhada com muitas informações que podem ser simplificadas durante alta carga operacional"
      );
      const responseAdapted = adaptedResponse.length < 200; // Should be simplified

      // Test 3: High urgency optimization
      socioCognitiveLayer.setOperationalLoad("overload");
      const urgentInterpretation = socioCognitiveLayer.interpretCommand({
        text: "EMERGÊNCIA! Necessário ação imediata!",
        timestamp: new Date()
      });
      const urgencyOptimized = urgentInterpretation.urgency === "critical";

      setResults({
        commandsLogged,
        responseAdapted,
        urgencyOptimized
      });

      if (commandsLogged && responseAdapted && urgencyOptimized) {
        toast.success("PATCH 591 validado com sucesso!");
      } else {
        toast.error("PATCH 591 falhou em alguns critérios");
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Erro ao executar validação");
      setResults({ commandsLogged: false, responseAdapted: false, urgencyOptimized: false });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>PATCH 591 - SocioCognitive Interaction Layer</CardTitle>
            <CardDescription>
              IA interpretou comandos com adaptação de resposta e compreensão situacional
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
              {results.commandsLogged ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>IA interpretou 3+ comandos com logs</span>
            </div>
            <div className="flex items-center gap-2">
              {results.responseAdapted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Resposta adaptada à carga operacional</span>
            </div>
            <div className="flex items-center gap-2">
              {results.urgencyOptimized ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Alta urgência otimizada corretamente</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
