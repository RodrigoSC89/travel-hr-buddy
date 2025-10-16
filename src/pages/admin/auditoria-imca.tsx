/**
 * Módulo: Auditoria Técnica IMCA
 * Local: /admin/auditoria-imca
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateIMCAAudit } from "@/lib/api/imca-audit";
import { Loader2, FileText, AlertCircle, Ship } from "lucide-react";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

export default function AuditoriaIMCA() {
  const [nomeNavio, setNomeNavio] = useState("");
  const [contexto, setContexto] = useState("");
  const [relatorio, setRelatorio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nomeNavio.trim()) {
      setError("Por favor, informe o nome do navio");
      return;
    }
    if (!contexto.trim()) {
      setError("Por favor, descreva o contexto da operação");
      return;
    }

    setLoading(true);
    setError(null);
    setRelatorio("");

    try {
      const result = await generateIMCAAudit({ nomeNavio, contexto });
      
      if (result.success) {
        setRelatorio(result.output);
      } else {
        setError(result.error || "Erro ao gerar auditoria");
      }
    } catch (err) {
      setError("Erro inesperado ao gerar auditoria");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNomeNavio("");
    setContexto("");
    setRelatorio("");
    setError(null);
  };

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper>
        <ModuleHeader 
          title="Auditoria Técnica IMCA"
          description="Geração de relatórios de auditoria técnica baseados em normas IMCA, IMO e MTS"
          icon={Ship}
        />

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="nomeNavio">Nome do Navio</Label>
                <Input
                  id="nomeNavio"
                  placeholder="Ex: Aurora Explorer"
                  value={nomeNavio}
                  onChange={(e) => setNomeNavio(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="contexto">Contexto da Operação</Label>
                <Textarea
                  id="contexto"
                  placeholder="Descreva falhas, operação DP, sensores, eventos..."
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  rows={6}
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando relatório...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar Auditoria IMCA
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleClear} 
                  disabled={loading} 
                  variant="outline"
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {relatorio && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Relatório Gerado
                </h2>
                <Textarea
                  value={relatorio}
                  readOnly
                  className="w-full h-[500px] whitespace-pre-wrap font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
