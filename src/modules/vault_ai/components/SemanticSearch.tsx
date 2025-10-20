/**
 * SemanticSearch Component
 * Contextual search functionality for Vault AI
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, ExternalLink } from "lucide-react";
import { searchDocuments } from "../services/vaultStorage";
import type { VaultDocument } from "../types";

export function SemanticSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<VaultDocument[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      return;
    }

    const searchResults = searchDocuments(searchTerm.trim());
    setResults(searchResults);
    setHasSearched(true);
  };

  const calculateRelevance = (doc: VaultDocument, term: string): number => {
    const lowerTerm = term.toLowerCase();
    const lowerName = doc.nome.toLowerCase();
    const lowerPath = doc.caminho.toLowerCase();
    
    let score = 0;
    
    // Exact match in name gets highest score
    if (lowerName === lowerTerm) score += 100;
    else if (lowerName.includes(lowerTerm)) score += 50;
    
    // Match in path
    if (lowerPath.includes(lowerTerm)) score += 25;
    
    // Match in tags
    if (doc.tags?.some(tag => tag.toLowerCase().includes(lowerTerm))) {
      score += 30;
    }
    
    return score;
  };

  const sortedResults = [...results].sort((a, b) => {
    const scoreA = calculateRelevance(a, searchTerm);
    const scoreB = calculateRelevance(b, searchTerm);
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Semântica
          </CardTitle>
          <CardDescription>
            Pesquise documentos técnicos por termo, código ou categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite termo técnico, código ou palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados da Busca</span>
              <Badge variant="secondary">
                {results.length} {results.length === 1 ? "documento" : "documentos"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Resultados para "{searchTerm}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum documento encontrado</p>
                <p className="text-sm">Tente usar termos diferentes ou mais genéricos</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {sortedResults.map((doc) => {
                    const relevance = calculateRelevance(doc, searchTerm);
                    
                    return (
                      <Card key={doc.id} className="p-4 hover:bg-accent/50 transition-colors">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">{doc.nome}</span>
                              {doc.tipo && (
                                <Badge variant="outline" className="text-xs">
                                  {doc.tipo}
                                </Badge>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {relevance}% relevante
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate">{doc.caminho}</span>
                          </div>
                          
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {doc.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Indexado em: {new Date(doc.dataIndexacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
