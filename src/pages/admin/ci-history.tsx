import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestResult {
  id: string;
  commit_hash: string;
  branch: string;
  status: string;
  coverage_percent: number | null;
  triggered_by: string;
  created_at: string;
}

export default function CIHistory() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("test_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error("Error fetching test results:", fetchError);
        setError(fetchError.message);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper>
        <ModuleHeader
          title="📊 Histórico de Builds e Testes"
          description="Visualize o histórico de execuções de CI/CD com status, cobertura e informações detalhadas"
          icon={TrendingUp}
        />
        
        <div className="p-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Execuções Recentes</CardTitle>
                  <CardDescription>
                    Histórico de builds e testes do pipeline CI/CD
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchResults}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Erro ao carregar dados</p>
                    <p className="text-sm text-red-600">{error}</p>
                    <p className="text-xs text-red-500 mt-2">
                      Verifique se a tabela &apos;test_results&apos; existe no Supabase e as variáveis de ambiente estão configuradas corretamente.
                    </p>
                  </div>
                </div>
              )}
              
              {loading && !error && (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Carregando resultados...</p>
                </div>
              )}
              
              {!loading && !error && results.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado de teste encontrado
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Os resultados de CI/CD aparecerão aqui assim que forem registrados
                  </p>
                </div>
              )}
              
              {!loading && !error && results.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commit</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Disparado por</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">
                          {r.commit_hash.slice(0, 7)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.branch}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={r.status === "success" ? "default" : "destructive"}
                            className={
                              r.status === "success"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : ""
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {r.coverage_percent !== null ? `${r.coverage_percent}%` : "—"}
                        </TableCell>
                        <TableCell>{r.triggered_by}</TableCell>
                        <TableCell>
                          {new Date(r.created_at).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
