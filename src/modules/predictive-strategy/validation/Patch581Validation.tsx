// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { predictiveStrategyEngine } from "@/ai/strategic-decision-system";

export function Patch581Validation() {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<any>(null);

  const runValidation = async () => {
    setLoading(true);
    const testResults: Record<string, boolean> = {};

    try {
      // Test 1: Initialize engine
      await predictiveStrategyEngine.initialize();
      testResults["engine_init"] = true;

      // Test 2: Receive signal
      const signal = {
        source: "VALIDATION_TEST" as any,
        type: "MISSION_CRITICAL" as any,
        data: { priority: "high", context: "Test validation" },
        timestamp: new Date().toISOString(),
        confidence: 0.95
      };
      await predictiveStrategyEngine.receiveSignal(signal);
      testResults["signal_received"] = true;

      // Test 3: Generate strategies
      const missionId = "test-mission-" + Date.now();
      const proposal = await predictiveStrategyEngine.generateStrategies(missionId);
      testResults["strategies_generated"] = proposal.strategies.length >= 3;
      testResults["distinct_scores"] = new Set(proposal.strategies.map(s => s.score)).size >= 3;
      testResults["context_aligned"] = proposal.strategies.every(s => s.context && s.context.length > 0);
      
      setStrategies(proposal);

      // Test 4: Provide feedback
      await predictiveStrategyEngine.provideFeedback({
        strategyId: proposal.topStrategy.id,
        outcome: "success" as any,
        actualMetrics: { effectiveness: 0.9 },
        notes: "Validation test feedback"
      });
      testResults["feedback_registered"] = true;

    } catch (error) {
      console.error("Validation error:", error);
      Object.keys(testResults).forEach(key => {
        if (testResults[key] === undefined) testResults[key] = false;
      });
    }

    setResults(testResults);
    setLoading(false);
  };

  const allPassed = Object.values(results).every(v => v === true);
  const hasResults = Object.keys(results).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          PATCH 581 – Predictive Strategy Engine
          {hasResults && (
            <Badge variant={allPassed ? "default" : "destructive"}>
              {allPassed ? "✓ PASS" : "✗ FAIL"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Valida geração de estratégias, scores e registro de feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runValidation} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Executar Validação
        </Button>

        {hasResults && (
          <div className="space-y-2">
            <ValidationItem
              label="IA propõe 3+ estratégias"
              passed={results.strategies_generated}
            />
            <ValidationItem
              label="Scores distintos entre estratégias"
              passed={results.distinct_scores}
            />
            <ValidationItem
              label="Estratégias alinhadas com contexto"
              passed={results.context_aligned}
            />
            <ValidationItem
              label="Feedback registrado no banco"
              passed={results.feedback_registered}
            />
          </div>
        )}

        {strategies && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Estratégias Geradas:</p>
            <ul className="text-xs space-y-1">
              {strategies.strategies.map((s: any, i: number) => (
                <li key={i}>
                  {i + 1}. {s.type} (Score: {s.score.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ValidationItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span>{label}</span>
    </div>
  );
}
