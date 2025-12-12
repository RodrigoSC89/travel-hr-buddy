/**
 * Preview Validator Component
 * PATCH 624 - Componente visual para validação de preview
 */

import { memo, memo, useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Play, RefreshCw } from "lucide-react";
import { LovableValidator, ValidationResult } from "@/lib/qa/LovableValidator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreviewValidatorProps {
  componentName: string;
  autoRun?: boolean;
  showDetails?: boolean;
}

export const PreviewValidator = memo(function({ 
  componentName, 
  autoRun = false,
  showDetails = true 
}: PreviewValidatorProps) {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runValidation = async () => {
    setLoading(true);
    LovableValidator.reset();
    
    try {
      const validationResult = await LovableValidator.run(componentName);
      setResult(validationResult);
    } catch (error) {
      console.error("Erro ao executar validação:", error);
    } finally {
      setLoading(false);
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "text-red-500";
    case "high": return "text-orange-500";
    case "medium": return "text-yellow-500";
    case "low": return "text-blue-500";
    default: return "text-muted-foreground";
    }
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
    case "critical":
    case "high":
      return <XCircle className="h-4 w-4" />;
    case "medium":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <CheckCircle2 className="h-4 w-4" />;
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Lovable Preview Validator
              {result && (
                <Badge variant={result.passed ? "default" : "destructive"}>
                  {result.passed ? "✓ PASS" : "✗ FAIL"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Validando: <code className="text-sm font-mono">{componentName}</code>
            </CardDescription>
          </div>
          <Button 
            onClick={runValidation} 
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : result ? (
              <RefreshCw className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {result ? "Re-validar" : "Executar"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {result && (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Render Time"
                value={`${result.performance.renderTime.toFixed(2)}ms`}
                status={result.performance.renderTime < 3000 ? "good" : "bad"}
              />
              <MetricCard
                label="Data Size"
                value={`${(result.performance.dataSize / 1024).toFixed(2)}KB`}
                status={result.performance.dataSize < 3072 ? "good" : "bad"}
              />
              <MetricCard
                label="Re-renders"
                value={result.performance.reRenderCount.toString()}
                status={result.performance.reRenderCount < 10 ? "good" : "bad"}
              />
              <MetricCard
                label="Memory"
                value={
                  result.performance.memoryUsage 
                    ? `${(result.performance.memoryUsage / 1024 / 1024).toFixed(2)}MB`
                    : "N/A"
                }
                status="neutral"
              />
            </div>

            {/* Issues */}
            {showDetails && result.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Issues Detectados ({result.issues.length})</h4>
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {result.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                      >
                        <span className={getSeverityColor(issue.severity)}>
                          {getSeverityIcon(issue.severity)}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {issue.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {issue.component}
                            </span>
                          </div>
                          <p className="text-sm">{issue.description}</p>
                          {issue.fix && (
                            <p className="text-xs text-muted-foreground">
                              💡 {issue.fix}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Warnings */}
            {showDetails && result.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Avisos ({result.warnings.length})</h4>
                <div className="space-y-1">
                  {result.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success message */}
            {result.passed && result.issues.length === 0 && (
              <div className="flex items-center gap-2 p-4 rounded-md bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  Todos os testes passaram! Componente está preview-safe.
                </span>
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            Clique em "Executar" para iniciar a validação
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string; 
  status: "good" | "bad" | "neutral";
}) {
  const statusColors = {
    good: "text-green-500",
    bad: "text-red-500",
    neutral: "text-muted-foreground"
  });

  return (
    <div className="p-3 rounded-md border bg-card">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-semibold ${statusColors[status]}`}>
        {value}
      </p>
    </div>
  );
});
