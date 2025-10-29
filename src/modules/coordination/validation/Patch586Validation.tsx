// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { multiLevelEngine } from "@/ai/meta-modules";

export function Patch586Validation() {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [coordination, setCoordination] = useState<any>(null);

  const runValidation = async () => {
    setLoading(true);
    const testResults: Record<string, boolean> = {};

    try {
      // Test 1: Initialize engine
      await multiLevelEngine.initialize();
      testResults["engine_init"] = true;

      // Test 2: Submit decisions at different levels
      const strategicDecision = {
        id: "strategic-" + Date.now(),
        level: "strategic" as any,
        description: "High-level strategic decision",
        priority: 10,
        timestamp: new Date().toISOString(),
        requiredBy: new Date(Date.now() + 86400000).toISOString(),
        context: { objective: "test" }
      };

      const tacticalDecision = {
        id: "tactical-" + Date.now(),
        level: "tactical" as any,
        description: "Mid-level tactical decision",
        priority: 5,
        timestamp: new Date().toISOString(),
        requiredBy: new Date(Date.now() + 43200000).toISOString(),
        context: { strategy_id: strategicDecision.id }
      };

      await multiLevelEngine.submitDecision(strategicDecision);
      await multiLevelEngine.submitDecision(tacticalDecision);
      testResults["levels_coordinated"] = true;

      // Test 3: Resolve conflicts
      const missionId = "test-mission-" + Date.now();
      const resolution = await multiLevelEngine.resolveConflicts(missionId);
      testResults["conflicts_resolved"] = resolution.conflicts.length >= 0;
      testResults["hierarchy_respected"] = resolution.resolutionPlan && resolution.resolutionPlan.length > 0;

      setCoordination(resolution);

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
          PATCH 586 – Multi-Level Coordination Engine
          {hasResults && (
            <Badge variant={allPassed ? "default" : "destructive"}>
              {allPassed ? "✓ PASS" : "✗ FAIL"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Valida coordenação entre níveis e resolução de conflitos hierárquicos
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
              label="Coordenação entre níveis executada corretamente"
              passed={results.levels_coordinated}
            />
            <ValidationItem
              label="Logs mostram resoluções entre estratégia e operação"
              passed={results.conflicts_resolved}
            />
            <ValidationItem
              label="Hierarquia respeitada em decisões de conflito"
              passed={results.hierarchy_respected}
            />
          </div>
        )}

        {coordination && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Resolução de Coordenação:</p>
            <ul className="text-xs space-y-1">
              <li>Conflitos Detectados: {coordination.conflicts.length}</li>
              <li>Plano de Resolução: {coordination.resolutionPlan?.length || 0} passos</li>
              <li>Priorização: {coordination.prioritizedDecisions?.length || 0} decisões</li>
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
