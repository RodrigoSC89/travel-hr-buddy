// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { strategicConsensusBuilder } from "@/ai/strategic-decision-system";

export function Patch584Validation() {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [consensus, setConsensus] = useState<any>(null);

  const runValidation = async () => {
    setLoading(true);
    const testResults: Record<string, boolean> = {};

    try {
      // Test 1: Initialize consensus builder
      await strategicConsensusBuilder.initialize();
      testResults["consensus_init"] = true;

      // Test 2: Build consensus
      const strategy = {
        id: "consensus-strategy-" + Date.now(),
        type: "BALANCED" as any,
        description: "Strategy requiring multi-agent consensus",
        expectedOutcome: { success: 0.75 },
        risks: ["MODERATE_RISK"],
        requirements: [],
        timeline: "medium",
        score: 0.78,
        confidence: 0.85,
        context: "Testing consensus building"
      };

      const consensusResult = await strategicConsensusBuilder.buildConsensus(
        strategy,
        "test-mission-" + Date.now()
      );

      testResults["votes_registered"] = consensusResult.votes.length > 0;
      testResults["disagreements_documented"] = consensusResult.disagreements !== undefined;
      testResults["consensus_reached"] = consensusResult.status === "CONSENSUS_REACHED" || 
                                         consensusResult.status === "MAJORITY_CONSENSUS";

      setConsensus(consensusResult);

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
          PATCH 584 – Strategic Consensus Builder
          {hasResults && (
            <Badge variant={allPassed ? "default" : "destructive"}>
              {allPassed ? "✓ PASS" : "✗ FAIL"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Valida votação entre agentes, desacordos e consenso
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
              label="Votação entre agentes registrada"
              passed={results.votes_registered}
            />
            <ValidationItem
              label="Desacordos documentados"
              passed={results.disagreements_documented}
            />
            <ValidationItem
              label="Consenso alcançado em testes"
              passed={results.consensus_reached}
            />
          </div>
        )}

        {consensus && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Resultado do Consenso:</p>
            <ul className="text-xs space-y-1">
              <li>Status: {consensus.status}</li>
              <li>Votos: {consensus.votes.length}</li>
              <li>Confiança: {(consensus.confidence * 100)?.toFixed(1)}%</li>
              <li>Desacordos: {consensus.disagreements?.length || 0}</li>
            </ul>
            {consensus.votes.map((vote: any, i: number) => (
              <div key={i} className="text-xs mt-1">
                • {vote.agentId}: {vote.vote === 1 ? "✓ Aprova" : vote.vote === -1 ? "✗ Rejeita" : "~ Neutro"}
              </div>
            ))}
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
