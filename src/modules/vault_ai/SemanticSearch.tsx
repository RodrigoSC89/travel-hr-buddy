/**
 * SemanticSearch Component
 * Busca contextual com correspondência semântica (base vetorizada local)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";
import { logger } from "@/lib/logger";
import { DocumentIndex, SearchResult } from "./types";

const STORAGE_KEY = "nautilus_vault_index";

export const SemanticSearch: React.FC = () => {
  const [index, setIndex] = useState<DocumentIndex[]>([]);
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<SearchResult[]>([]);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  useEffect(() => {
    // Carregar índice do localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setIndex(JSON.parse(stored));
      } catch (error) {
        logger.error("Erro ao carregar índice de documentos", error);
      }
    }
  }, []);

  /**
   * Calcula similaridade entre strings usando algoritmo de correspondência fuzzy
   */
  const calcularSimilaridade = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Correspondência exata
    if (s1 === s2) return 1.0;
    
    // Contém a string
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Algoritmo de Levenshtein simplificado
    const len1 = s1.length;
    const len2 = s2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 0;

    let matches = 0;
    for (let i = 0; i < Math.min(len1, len2); i++) {
      if (s1[i] === s2[i]) matches++;
    }

    return matches / maxLen;
  };

  const buscar = () => {
    if (!termo.trim()) {
      logger.warn("Termo de busca vazio");
      return;
    }

    logger.info(`Busca semântica executada: ${termo}`);

    // Realizar busca semântica
    const resultadosEncontrados: SearchResult[] = index
      .map((doc) => {
        const similaridadeNome = calcularSimilaridade(doc.nome, termo);
        const similaridadeCaminho = calcularSimilaridade(doc.caminho, termo);
        const relevancia = Math.max(similaridadeNome, similaridadeCaminho);

        return {
          documento: doc,
          relevancia,
          contexto: `Encontrado em: ${doc.nome}`,
        };
      })
      .filter((result) => result.relevancia > 0.2)
      .sort((a, b) => b.relevancia - a.relevancia)
      .slice(0, 5);

    setResultados(resultadosEncontrados);
    setBuscaRealizada(true);
  };

  const limparBusca = () => {
    setTermo("");
    setResultados([]);
    setBuscaRealizada(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-green-600" />
            🔍 Busca Semântica de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite termo técnico ou código (ex: ASOG, FMEA, manual)"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && buscar()}
              className="flex-1"
            />
            <Button onClick={buscar}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            {buscaRealizada && (
              <Button variant="secondary" onClick={limparBusca}>
                Limpar
              </Button>
            )}
          </div>

          {buscaRealizada && (
            <div className="space-y-2">
              <h3 className="font-semibold">
                🔍 Resultados para '{termo}': {resultados.length} encontrado(s)
              </h3>

              {resultados.length === 0 ? (
                <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-muted-foreground">
                    ❌ Nenhum documento encontrado.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente usar termos diferentes ou indexe novos documentos.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resultados.map((resultado, idx) => (
                    <div
                      key={resultado.documento.id}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="font-medium">
                              → {resultado.documento.nome}
                            </span>
                            <Badge variant="secondary">
                              {resultado.documento.tipo}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className="bg-green-50 dark:bg-green-950"
                            >
                              {Math.round(resultado.relevancia * 100)}% relevância
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            📁 {resultado.documento.caminho}
                          </p>
                          {resultado.contexto && (
                            <p className="text-xs text-green-600 mt-1">
                              {resultado.contexto}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
