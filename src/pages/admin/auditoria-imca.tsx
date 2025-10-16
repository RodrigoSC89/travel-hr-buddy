/**
 * IMCA Audit Module
 * Admin page for generating AI-powered technical audit reports
 * for maritime Dynamic Positioning systems
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateIMCAAudit } from "@/lib/api/imca-audit";
import { AlertCircle } from "lucide-react";

export default function AuditoriaIMCA() {
  const [nomeNavio, setNomeNavio] = useState("");
  const [contexto, setContexto] = useState("");
  const [relatorio, setRelatorio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nomeNavio.trim() || !contexto.trim()) {
      setError("Por favor, preencha o nome do navio e o contexto operacional");
      return;
    }

    setLoading(true);
    setError(null);
    setRelatorio("");

    try {
      const result = await generateIMCAAudit({ nomeNavio, contexto });
      setRelatorio(result.output);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao gerar relatório";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Auditoria Técnica IMCA</h1>
        <p className="text-muted-foreground">
          Geração de relatórios de auditoria técnica para sistemas Dynamic
          Positioning seguindo padrões IMCA
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="nomeNavio">Nome do Navio</Label>
            <Input
              id="nomeNavio"
              placeholder="Ex: Aurora Explorer"
              value={nomeNavio}
              onChange={(e) => setNomeNavio(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contexto">Contexto da Operação</Label>
            <Textarea
              id="contexto"
              placeholder="Descreva falhas, operação DP, sensores, eventos, incidentes..."
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={6}
              disabled={loading}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium">Erro</p>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !nomeNavio.trim() || !contexto.trim()}
            className="w-full"
          >
            {loading ? "Gerando relatório..." : "Gerar Auditoria IMCA"}
          </Button>
        </CardContent>
      </Card>

      {relatorio && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Relatório Gerado</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(relatorio);
                }}
              >
                Copiar
              </Button>
            </div>
            <Textarea
              value={relatorio}
              readOnly
              className="w-full h-[500px] whitespace-pre-wrap font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
