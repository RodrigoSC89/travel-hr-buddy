/**
 * SemanticSearch Component
 * Semantic search with fuzzy matching and relevance scoring
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Search } from "lucide-react";
import { searchDocuments, getAllDocuments } from "../services/vaultStorage";
import type { VaultDocument, SearchResult } from "../types";

interface SemanticSearchProps {
  onBack: () => void;
}

export default function SemanticSearch({ onBack }: SemanticSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);

  useEffect(() => {
    setTotalDocs(getAllDocuments().length);
  }, []);

  const calculateRelevance = (doc: VaultDocument, searchQuery: string): number => {
    const lowerQuery = searchQuery.toLowerCase();
    let score = 0;

    // Exact name match
    if (doc.nome.toLowerCase() === lowerQuery) {
      score = 100;
    }
    // Name contains query
    else if (doc.nome.toLowerCase().includes(lowerQuery)) {
      score = 80;
    }
    // Path contains query
    else if (doc.caminho.toLowerCase().includes(lowerQuery)) {
      score = 60;
    }
    // Tag match
    else if (doc.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
      score = 70;
    }
    // Partial match
    else {
      const nameWords = doc.nome.toLowerCase().split(/\s+/);
      const queryWords = lowerQuery.split(/\s+/);
      const matches = queryWords.filter((qw) => nameWords.some((nw) => nw.includes(qw)));
      score = (matches.length / queryWords.length) * 50;
    }

    return Math.round(score);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const foundDocs = searchDocuments(query);
    const resultsWithRelevance: SearchResult[] = foundDocs
      .map((doc) => ({
        ...doc,
        relevance: calculateRelevance(doc, query),
      }))
      .sort((a, b) => b.relevance - a.relevance);

    setResults(resultsWithRelevance);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            🔎 Busca Semântica de Documentos
          </CardTitle>
          <CardDescription>
            Busca contextual com correspondência fuzzy e ranking de relevância
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite palavras-chave, tags ou caminho do documento..."
              className="flex-1"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </form>

          <div className="mt-4 text-sm text-muted-foreground">
            Total de documentos no vault: {totalDocs}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {query && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>
              {results.length} documento(s) encontrado(s) para "{query}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum documento encontrado. Tente outros termos de busca.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{result.nome}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{result.caminho}</p>
                          </div>
                          <Badge
                            variant={
                              result.relevance >= 80
                                ? "default"
                                : result.relevance >= 60
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {result.relevance}% relevante
                          </Badge>
                        </div>

                        <Progress value={result.relevance} className="h-2" />

                        <div className="flex gap-2">
                          {result.tipo && <Badge variant="outline">{result.tipo}</Badge>}
                          {result.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Indexado em: {new Date(result.dataIndexacao).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
