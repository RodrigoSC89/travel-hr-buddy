/**
 * Production Readiness Panel
 * PATCH 950: Painel de validação para go-live
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Shield,
  Wifi,
  Cpu,
  Eye,
  Brain,
  Loader2
} from "lucide-react";
import { useProductionReadiness, type ValidationResult } from "@/lib/validation/production-readiness";
import { testPlan, type TestCase } from "@/lib/testing/test-plan";

const statusIcons = {
  pass: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  fail: <XCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />
};

const categoryIcons: Record<string, React.ReactNode> = {
  Offline: <Wifi className="h-4 w-4" />,
  Performance: <Cpu className="h-4 w-4" />,
  Security: <Shield className="h-4 w-4" />,
  Accessibility: <Eye className="h-4 w-4" />,
  LLM: <Brain className="h-4 w-4" />,
  Network: <Wifi className="h-4 w-4" />,
  Integrations: <RefreshCw className="h-4 w-4" />
};

function ValidationResultItem({ result }: { result: ValidationResult }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {statusIcons[result.status]}
        <div>
          <p className="font-medium text-sm text-foreground">{result.name}</p>
          <p className="text-xs text-muted-foreground">{result.message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {result.critical && (
          <Badge variant="destructive" className="text-xs">
            Crítico
          </Badge>
        )}
        <Badge
          variant={result.status === "pass" ? "default" : result.status === "fail" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {result.status === "pass" ? "OK" : result.status === "fail" ? "FALHA" : "ATENÇÃO"}
        </Badge>
      </div>
    </div>
  );
}

function TestCaseItem({ test }: { test: TestCase }) {
  const [expanded, setExpanded] = useState(false);
  
  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">{test.id}</Badge>
          <span className="font-semibold text-foreground">{test.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={priorityColors[test.priority]}>
            {test.priority === "high" ? "Alta" : test.priority === "medium" ? "Média" : "Baixa"}
          </Badge>
          {test.automated && (
            <Badge variant="secondary">Auto</Badge>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">{test.objective}</p>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setExpanded(!expanded)}
        className="text-xs"
      >
        {expanded ? "Ocultar detalhes" : "Ver procedimento"}
      </Button>
      
      {expanded && (
        <div className="space-y-3 pt-2 border-t">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Procedimento:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {test.procedure.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Resultado Esperado:</p>
            <p className="text-xs text-muted-foreground">{test.expectedResult}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Observações:</p>
            <p className="text-xs text-muted-foreground">{test.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductionReadinessPanel() {
  const { readiness, isValidating, validate } = useProductionReadiness();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = readiness 
    ? [...new Set(readiness.results.map(r => r.category))]
    : [];

  const filteredResults = readiness?.results.filter(
    r => activeCategory === "all" || r.category === activeCategory
  ) || [];

  const overallStatusColors = {
    "ready": "bg-emerald-500",
    "not-ready": "bg-red-500",
    "ready-with-restrictions": "bg-amber-500"
  };

  const overallStatusText = {
    "ready": "PRONTO PARA PRODUÇÃO",
    "not-ready": "NÃO PRONTO",
    "ready-with-restrictions": "PRONTO COM RESTRIÇÕES"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground font-bold">
                Validação de Produção
              </CardTitle>
              <CardDescription>
                Análise completa de prontidão para go-live
              </CardDescription>
            </div>
            <Button onClick={validate} disabled={isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Validação
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {readiness && (
          <CardContent className="space-y-4">
            {/* Status geral */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${overallStatusColors[readiness.overallStatus]} text-white font-bold`}>
                {overallStatusText[readiness.overallStatus]}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">Score de Prontidão</span>
                  <span className="font-bold text-foreground">{readiness.score}%</span>
                </div>
                <Progress value={readiness.score} className="h-2" />
              </div>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {readiness.summary.passed}
                </div>
                <div className="text-xs text-muted-foreground">Passou</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {readiness.summary.failed}
                </div>
                <div className="text-xs text-muted-foreground">Falhou</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {readiness.summary.warnings}
                </div>
                <div className="text-xs text-muted-foreground">Alertas</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20">
                <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                  {readiness.summary.critical}
                </div>
                <div className="text-xs text-muted-foreground">Críticos</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">Resultados</TabsTrigger>
          <TabsTrigger value="tests">Plano de Testes</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="validation">
          {readiness && (
            <Card>
              <CardHeader>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={activeCategory === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveCategory("all")}
                  >
                    Todos
                  </Badge>
                  {categories.map(cat => (
                    <Badge
                      key={cat}
                      variant={activeCategory === cat ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {categoryIcons[cat]}
                      <span className="ml-1">{cat}</span>
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredResults.map((result, i) => (
                  <ValidationResultItem key={i} result={result} />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Plano de Testes v{testPlan.version}</CardTitle>
              <CardDescription>
                {testPlan.testCases.length} casos de teste definidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testPlan.testCases.map(test => (
                <TestCaseItem key={test.id} test={test} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Checklist Final de Produção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testPlan.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                    <input type="checkbox" className="h-4 w-4" />
                    <span className="text-sm text-foreground">{item.replace("[ ] ", "")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recomendações */}
      {readiness && readiness.recommendations.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {readiness.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-foreground p-2 bg-muted/30 rounded">
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProductionReadinessPanel;
