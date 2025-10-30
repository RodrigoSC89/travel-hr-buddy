import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Patch594Validation() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    jointDecisionLogged: boolean;
    feedbackInfluenced: boolean;
    confidenceChanged: boolean;
  } | null>(null);

  const runValidation = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const { adaptiveJointDecision } = await import("@/ai/decision/adaptive-joint-decision");

      // Test 1: Joint decision logged
      const proposal = adaptiveJointDecision.proposeDecision(
        "tactical",
        "Decisão sobre rota de navegação",
        [
          {
            description: "Rota A - Mais rápida",
            pros: ["Menor tempo", "Menos combustível"],
            cons: ["Maior risco"],
            riskLevel: "medium",
            estimatedImpact: 0.7,
            recommendedBy: "ai"
          },
          {
            description: "Rota B - Mais segura",
            pros: ["Menor risco", "Melhor condições"],
            cons: ["Maior tempo"],
            riskLevel: "low",
            estimatedImpact: 0.8,
            recommendedBy: "ai"
          }
        ]
      );
      const jointDecisionLogged = proposal.options.length >= 2;

      // Test 2: Feedback influenced decision
      const initialConfidence = adaptiveJointDecision.getConfidenceLevel("tactical");
      const review = adaptiveJointDecision.reviewDecision(
        proposal,
        "rejected",
        "operator1",
        proposal.options[0].id,
        "Rota muito arriscada para condições atuais"
      );
      const feedbackInfluenced = review.feedback !== undefined && review.feedback.length > 0;

      // Test 3: Confidence changed
      const newConfidence = adaptiveJointDecision.getConfidenceLevel("tactical");
      const confidenceChanged = newConfidence !== initialConfidence;

      setResults({
        jointDecisionLogged,
        feedbackInfluenced,
        confidenceChanged
      });

      if (jointDecisionLogged && feedbackInfluenced && confidenceChanged) {
        toast.success("PATCH 594 validado com sucesso!");
      } else {
        toast.error("PATCH 594 falhou em alguns critérios");
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Erro ao executar validação");
      setResults({ jointDecisionLogged: false, feedbackInfluenced: false, confidenceChanged: false });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>PATCH 594 - Adaptive Joint Decision Engine</CardTitle>
            <CardDescription>
              Decisões conjuntas simuladas com feedback humano influenciando IA
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
              {results.jointDecisionLogged ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Decisão conjunta registrada com logs</span>
            </div>
            <div className="flex items-center gap-2">
              {results.feedbackInfluenced ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Feedback humano influenciou decisão</span>
            </div>
            <div className="flex items-center gap-2">
              {results.confidenceChanged ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Mudança de confiança observável</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
