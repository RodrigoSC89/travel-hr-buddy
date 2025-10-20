/**
 * SemanticSearch Component
 * Busca contextual com correspondência semântica
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, ExternalLink } from "lucide-react";
import { VaultStorage } from "../services/vaultStorage";
import { VaultDocument, SearchResult } from "../types";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface SemanticSearchProps {
  onVoltar?: () => void;
}

/**
 * Calculate similarity score between two strings
 * Uses a simple fuzzy matching algorithm
 */
function calcularSimilaridade(texto1: string, texto2: string): number {
  const t1 = texto1.toLowerCase();
  const t2 = texto2.toLowerCase();

  // Exact match
  if (t1 === t2) return 1.0;

  // Contains match
  if (t1.includes(t2) || t2.includes(t1)) return 0.8;

  // Word overlap
  const palavras1 = t1.split(/\s+/);
  const palavras2 = t2.split(/\s+/);
  const overlap = palavras1.filter((p) => palavras2.includes(p)).length;
  const maxPalavras = Math.max(palavras1.length, palavras2.length);

  if (maxPalavras === 0) return 0;

  return overlap / maxPalavras;
}

export default function SemanticSearch({ onVoltar }: SemanticSearchProps) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<SearchResult[]>([]);
  const [buscar, setBuscar] = useState(false);

  const executarBusca = () => {
    if (!termo.trim()) {
      toast.error("❌ Digite um termo para buscar");
      return;
    }

    logger.info(`Busca semântica executada: ${termo}`);

    const documentos = VaultStorage.carregarIndice();
    const resultadosBusca: SearchResult[] = [];

    // Search in document names and paths
    documentos.forEach((doc) => {
      const similaridadeNome = calcularSimilaridade(doc.nome, termo);
      const similaridadeCaminho = calcularSimilaridade(doc.caminho, termo);
      const similaridadeTipo = doc.tipo
        ? calcularSimilaridade(doc.tipo, termo)
        : 0;

      const relevancia = Math.max(
        similaridadeNome,
        similaridadeCaminho,
        similaridadeTipo
      );

      if (relevancia > 0.2) {
        // Cutoff threshold
        resultadosBusca.push({
          documento: doc,
          relevancia,
        });
      }
    });

    // Sort by relevance
    resultadosBusca.sort((a, b) => b.relevancia - a.relevancia);

    // Limit to top 5 results
    const top5 = resultadosBusca.slice(0, 5);

    setResultados(top5);
    setBuscar(true);

    if (top5.length === 0) {
      toast.info("🔍 Nenhum documento encontrado");
    } else {
      toast.success(`✅ ${top5.length} documento(s) encontrado(s)`);
    }
  };

  const formatarRelevancia = (relevancia: number) => {
    const percentual = Math.round(relevancia * 100);
    let cor = "secondary";

    if (percentual >= 80) cor = "default";
    else if (percentual >= 50) cor = "secondary";
    else cor = "outline";

    return (
      <Badge variant={cor as "default" | "secondary" | "outline"}>
        {percentual}% relevante
      </Badge>
    );
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🔎 Busca Semântica de Documentos
          </h2>
          <p className="text-muted-foreground mt-1">
            Encontre documentos técnicos usando termos ou códigos
          </p>
        </div>
        {onVoltar && (
          <Button variant="outline" onClick={onVoltar}>
            ⏹ Voltar
          </Button>
        )}
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite termo técnico, código ou nome de documento..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && executarBusca()}
              className="flex-1"
            />
            <Button onClick={executarBusca}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Exemplos: "FMEA", "ASOG", "manual", "relatório"
          </p>
        </CardContent>
      </Card>

      {/* Search Results */}
      {buscar && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Resultados para "{termo}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>❌ Nenhum documento encontrado</p>
                <p className="text-sm mt-1">
                  Tente outros termos ou indexe novos documentos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultados.map((resultado, index) => {
                  const doc = resultado.documento;
                  return (
                    <div
                      key={doc.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {index + 1}. {doc.nome}
                            </span>
                            {doc.tipo && (
                              <Badge variant="outline" className="text-xs">
                                {doc.tipo}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            📁 {doc.caminho}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📅 Indexado: {formatarData(doc.dataIndexacao)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {formatarRelevancia(resultado.relevancia)}
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
