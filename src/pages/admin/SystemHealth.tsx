import React, { useEffect, useState } from "react";
import { runAutomatedTests, AutomatedTestsResult } from "@/lib/systemHealth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, TestTube, Clock } from "lucide-react";

/**
 * System Health Page
 * Displays automated test results and system validation status
 */
const SystemHealth: React.FC = () => {
  const [status, setStatus] = useState<AutomatedTestsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      setLoading(true);
      try {
        const result = await runAutomatedTests();
        setStatus(result);
      } catch (error) {
        console.error("Failed to fetch test results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Validação do Sistema</h1>
        <p className="text-muted-foreground">
          Status dos testes automatizados e validação técnica do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Testes Automatizados
          </CardTitle>
          <CardDescription>
            Resultados da última execução dos testes de validação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">⏳ Carregando validação...</span>
            </div>
          ) : status ? (
            <div className="space-y-6">
              {/* Test Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Status */}
                <Card className={status.failed === 0 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Status dos Testes
                        </p>
                        <div className="flex items-center gap-2">
                          {status.failed === 0 ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                100% Passed
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                {status.failed} Falha{status.failed > 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={status.failed === 0 ? "default" : "destructive"}
                        className="text-lg px-3 py-1"
                      >
                        {status.failed === 0 ? "✅" : "❌"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Tests */}
                <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Total de Casos
                        </p>
                        <div className="flex items-center gap-2">
                          <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {status.total}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        🧪
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Last Run */}
                <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Último Teste
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 truncate">
                            {formatDate(status.lastRun)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1 flex-shrink-0">
                        ⏱️
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Detalhes da Validação</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">✅ Testes Automatizados:</span>
                    <span className={status.failed === 0 ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                      {status.failed === 0 ? "100% Passed" : `${status.failed} Falhas`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">🧪 Total de Testes:</span>
                    <span className="font-semibold">{status.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">⏱️ Último Teste:</span>
                    <span className="font-semibold">{formatDate(status.lastRun)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">🔁 Resultado:</span>
                    <Badge variant={status.failed === 0 ? "default" : "destructive"}>
                      {status.failed === 0 ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              ❌ Erro ao carregar dados de validação
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealth;
