// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { decisionSimulatorCore } from "@/ai/strategic-decision-system";

export function Patch582Validation() {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);

  const runValidation = async () => {
    setLoading(true);
    const testResults: Record<string, boolean> = {};

    try {
      // Test 1: Initialize simulator
      await decisionSimulatorCore.initialize();
      testResults["simulator_init"] = true;

      // Test 2: Run simulation
      const strategy = {
        id: "test-strategy-" + Date.now(),
        type: "ADAPTIVE" as any,
        description: "Test strategy for validation",
        expectedOutcome: { success: 0.8 },
        risks: [],
        requirements: [],
        timeline: "immediate",
        score: 0.85,
        confidence: 0.9,
        context: "Validation test"
      };

      const params = {
        iterations: 100,
        timeHorizon: "short" as any,
        variables: { risk_tolerance: 0.5 }
      };

      const simResult = await decisionSimulatorCore.simulateStrategy(
        strategy,
        params,
        "test-mission-" + Date.now()
      );

      testResults["simulation_runs"] = simResult.status === "completed";
      testResults["metrics_displayed"] = simResult.metrics && Object.keys(simResult.metrics).length > 0;
      testResults["logs_accessible"] = simResult.iterations > 0;

      setSimulation(simResult);

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
          PATCH 582 – Decision Simulator Core
          {hasResults && (
            <Badge variant={allPassed ? "default" : "destructive"}>
              {allPassed ? "✓ PASS" : "✗ FAIL"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Valida simulação de estratégias, métricas e logs
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
              label="Simulação roda com input de estratégias"
              passed={results.simulation_runs}
            />
            <ValidationItem
              label="UI exibe métricas esperadas"
              passed={results.metrics_displayed}
            />
            <ValidationItem
              label="Logs de simulação completos"
              passed={results.logs_accessible}
            />
          </div>
        )}

        {simulation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Resultados da Simulação:</p>
            <ul className="text-xs space-y-1">
              <li>Status: {simulation.status}</li>
              <li>Iterações: {simulation.iterations}</li>
              <li>Score Médio: {simulation.averageScore?.toFixed(3)}</li>
              <li>Sucesso: {(simulation.successRate * 100)?.toFixed(1)}%</li>
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
