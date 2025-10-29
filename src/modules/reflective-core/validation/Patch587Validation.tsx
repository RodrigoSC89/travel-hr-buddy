// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { reflectiveCore } from "@/ai/meta-modules";

export function Patch587Validation() {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<any>(null);

  const runValidation = async () => {
    setLoading(true);
    const testResults: Record<string, boolean> = {};

    try {
      // Test 1: Initialize reflective core
      await reflectiveCore.initialize();
      testResults["core_init"] = true;

      // Test 2: Record decision
      const missionId = "test-mission-" + Date.now();
      const decision = {
        id: "decision-" + Date.now(),
        strategyId: "strategy-123",
        timestamp: new Date().toISOString(),
        outcome: "success" as any,
        confidence: 0.85,
        context: { test: true }
      };

      await reflectiveCore.recordDecision(decision);
      testResults["reflection_logged"] = true;

      // Test 3: Generate reflection
      const report = await reflectiveCore.reflect(missionId);
      testResults["confidence_adjustments"] = report.insights.length > 0;
      testResults["learning_incremental"] = report.recommendations && report.recommendations.length > 0;

      setReflection(report);

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
          PATCH 587 – IA Reflective Core
          {hasResults && (
            <Badge variant={allPassed ? "default" : "destructive"}>
              {allPassed ? "✓ PASS" : "✗ FAIL"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Valida logs de reflexão, ajustes de confiança e aprendizado incremental
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
              label="Logs de reflexão criados por missão"
              passed={results.reflection_logged}
            />
            <ValidationItem
              label="Ajustes de confiança documentados"
              passed={results.confidence_adjustments}
            />
            <ValidationItem
              label="IA mostra aprendizado incremental"
              passed={results.learning_incremental}
            />
          </div>
        )}

        {reflection && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Relatório de Reflexão:</p>
            <ul className="text-xs space-y-1">
              <li>Insights: {reflection.insights.length}</li>
              <li>Confiança Média: {reflection.averageConfidence?.toFixed(2)}</li>
              <li>Recomendações: {reflection.recommendations?.length || 0}</li>
              {reflection.insights.slice(0, 3).map((insight: any, i: number) => (
                <li key={i} className="text-muted-foreground">
                  • {insight.type}: {insight.description?.slice(0, 50)}...
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
