// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Filter, Clock, TrendingUp, Upload, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VaultDocument {
  id: string;
  title: string;
  content: string;
  document_type: string;
  category: string;
  tags: string[];
  created_at: string;
  similarity_score?: number;
  highlighted_content?: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  document_type: string;
  category: string;
  similarity_score: number;
  highlighted_excerpt: string;
}

interface SearchLog {
  id: string;
  query: string;
  results_count: number;
  search_duration_ms: number;
  created_at: string;
}

export default function VaultAIComplete() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);

  useEffect(() => {
    loadDocuments();
    loadSearchLogs();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_documents')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadSearchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_search_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSearchLogs(data || []);
    } catch (error) {
      console.error('Error loading search logs:', error);
    }
  };

  const performVectorSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Atenção",
        description: "Digite uma consulta de busca",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      // First, generate embedding for the query (in real scenario, use OpenAI API)
      // For this demo, we'll use a mock embedding and perform text-based search
      
      // Simulate vector search with text matching and scoring
      const results = performMockVectorSearch(searchQuery, documents);
      
      const searchDuration = Date.now() - startTime;

      setSearchResults(results);

      // Log the search
      await supabase
        .from('vault_search_logs')
        .insert({
          query: searchQuery,
          results_count: results.length,
          search_duration_ms: searchDuration,
          top_result_id: results[0]?.id,
          top_similarity_score: results[0]?.similarity_score
        });

      toast({
        title: "Busca Concluída",
        description: `${results.length} resultados encontrados em ${searchDuration}ms`
      });

      loadSearchLogs();
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: "Erro",
        description: "Falha ao realizar busca",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performMockVectorSearch = (query: string, docs: VaultDocument[]): SearchResult[] => {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(' ').filter(t => t.length > 2);

    const results = docs
      .map(doc => {
        const contentLower = (doc.title + ' ' + doc.content).toLowerCase();
        
        // Calculate similarity score based on term matching
        let score = 0;
        queryTerms.forEach(term => {
          const occurrences = (contentLower.match(new RegExp(term, 'g')) || []).length;
          score += occurrences * 0.1;
        });

        // Boost score for title matches
        if (doc.title.toLowerCase().includes(queryLower)) {
          score += 0.5;
        }

        // Normalize score to 0-1 range
        score = Math.min(score, 1);

        // Find and highlight excerpt
        const excerpt = extractHighlightedExcerpt(doc.content, queryTerms);

        return {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          document_type: doc.document_type,
          category: doc.category,
          similarity_score: score,
          highlighted_excerpt: excerpt
        };
      })
      .filter(result => result.similarity_score >= similarityThreshold)
      .sort((a, b) => b.similarity_score - a.similarity_score);

    // Apply filters
    let filteredResults = results;
    
    if (filterType !== 'all') {
      filteredResults = filteredResults.filter(r => r.document_type === filterType);
    }
    
    if (filterCategory !== 'all') {
      filteredResults = filteredResults.filter(r => r.category === filterCategory);
    }

    return filteredResults.slice(0, 20); // Return top 20 results
  };

  const extractHighlightedExcerpt = (content: string, queryTerms: string[]): string => {
    const maxLength = 200;
    let bestExcerpt = '';
    let bestScore = 0;

    // Find the excerpt with most query term matches
    const words = content.split(' ');
    for (let i = 0; i < words.length - 20; i++) {
      const excerpt = words.slice(i, i + 30).join(' ');
      const excerptLower = excerpt.toLowerCase();
      
      let score = 0;
      queryTerms.forEach(term => {
        if (excerptLower.includes(term)) score++;
      });

      if (score > bestScore) {
        bestScore = score;
        bestExcerpt = excerpt;
      }
    }

    // Highlight query terms
    let highlighted = bestExcerpt || content.substring(0, maxLength);
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });

    return highlighted.length > maxLength 
      ? highlighted.substring(0, maxLength) + '...'
      : highlighted;
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'policy': return '📋';
      case 'procedure': return '📝';
      case 'manual': return '📖';
      case 'report': return '📊';
      case 'contract': return '📄';
      default: return '📁';
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const uniqueTypes = Array.from(new Set(documents.map(d => d.document_type).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Vault AI - Busca Vetorial Inteligente
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de recuperação de conhecimento com busca semântica
          </p>
        </div>
        <Badge variant="outline" className="text-lg">
          {documents.length} Documentos
        </Badge>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Semântica
          </CardTitle>
          <CardDescription>
            Digite sua consulta para buscar documentos usando busca vetorial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua busca... (ex: procedimentos de segurança, manutenção preventiva)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performVectorSearch()}
              className="flex-1"
            />
            <Button onClick={performVectorSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={similarityThreshold.toString()} onValueChange={(val) => setSimilarityThreshold(parseFloat(val))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.9">Muito Alta (90%)</SelectItem>
                <SelectItem value="0.7">Alta (70%)</SelectItem>
                <SelectItem value="0.5">Média (50%)</SelectItem>
                <SelectItem value="0.3">Baixa (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="results">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">
            Resultados ({searchResults.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documentos ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            Histórico de Buscas ({searchLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {searchResults.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-2xl">{getDocumentTypeIcon(result.document_type)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">#{index + 1}</Badge>
                                <h3 className="font-semibold text-lg">{result.title}</h3>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>{result.document_type}</Badge>
                                <Badge variant="outline">{result.category}</Badge>
                              </div>
                              <div 
                                className="text-sm text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: result.highlighted_excerpt }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getSimilarityColor(result.similarity_score)}`}>
                              {Math.round(result.similarity_score * 100)}%
                            </div>
                            <p className="text-xs text-muted-foreground">Similaridade</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {searchQuery ? 'Nenhum resultado encontrado. Tente ajustar sua busca ou filtros.' : 'Digite uma consulta para buscar documentos'}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getDocumentTypeIcon(doc.document_type)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {doc.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge>{doc.document_type}</Badge>
                          {doc.category && <Badge variant="outline">{doc.category}</Badge>}
                          {doc.tags && doc.tags.length > 0 && (
                            doc.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Consultas
              </CardTitle>
              <CardDescription>
                Registro de todas as buscas realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {searchLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{log.query}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>📊 {log.results_count} resultados</span>
                              <span>⚡ {log.search_duration_ms}ms</span>
                              <span>🕐 {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSearchQuery(log.query);
                              performVectorSearch();
                            }}
                          >
                            Repetir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Buscas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Última Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {searchLogs[0] ? formatDistanceToNow(new Date(searchLogs[0].created_at), { addSuffix: true, locale: ptBR }) : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchLogs.length > 0 
                ? Math.round(searchLogs.reduce((sum, log) => sum + log.search_duration_ms, 0) / searchLogs.length) 
                : 0}ms
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
