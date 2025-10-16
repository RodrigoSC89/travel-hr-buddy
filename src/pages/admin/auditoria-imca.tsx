import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateIMCAAudit } from "@/lib/api/imca-audit";

export default function AuditoriaIMCA() {
  const [nomeNavio, setNomeNavio] = useState("");
  const [contexto, setContexto] = useState("");
  const [relatorio, setRelatorio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await generateIMCAAudit({ nomeNavio, contexto });
      setRelatorio(result.output);
    } catch (error) {
      console.error("Erro ao gerar auditoria:", error);
      setRelatorio("❌ Erro ao gerar relatório. Verifique sua configuração de API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Auditoria Técnica IMCA</h1>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label>Nome do Navio</Label>
            <Input
              placeholder="Ex: Aurora Explorer"
              value={nomeNavio}
              onChange={(e) => setNomeNavio(e.target.value)}
            />
          </div>

          <div>
            <Label>Contexto da Operação</Label>
            <Textarea
              placeholder="Descreva falhas, operação DP, sensores, eventos..."
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Gerando relatório..." : "Gerar Auditoria IMCA"}
          </Button>
        </CardContent>
      </Card>

      {relatorio && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Relatório Gerado</h2>
            <Textarea
              value={relatorio}
              readOnly
              className="w-full h-[500px] whitespace-pre-wrap"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
