/**
 * Advanced Search - Global search with filters, AI suggestions
 * MIGRATED: Now searches real Supabase data
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  X,
  FileText,
  Ship,
  Users,
  Wrench,
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles,
  History,
  ChevronRight,
  Brain,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id: string;
  type: "document" | "vessel" | "crew" | "maintenance" | "incident" | "contract";
  title: string;
  description: string;
  module: string;
  url: string;
  relevance: number;
  lastModified: Date;
  highlights: string[];
}

interface SearchFilter {
  modules: string[];
  types: string[];
  dateRange: { start: string; end: string };
  vessels: string[];
}

const AI_SUGGESTIONS = [
  "Manutenções vencidas nos últimos 30 dias",
  "Certificados expirando em 60 dias",
  "Tripulantes sem treinamento obrigatório",
  "Incidentes não investigados",
  "Equipamentos com saúde crítica"
];

// Hook for recent searches from localStorage
function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('nautilus_recent_searches');
    if (stored) {
      try {
        setSearches(JSON.parse(stored).slice(0, 5));
      } catch {
        setSearches([]);
      }
    }
  }, []);

  const addSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setSearches(prev => {
      const updated = [term, ...prev.filter(s => s !== term)].slice(0, 5);
      localStorage.setItem('nautilus_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { searches, addSearch };
}

// Hook to search across multiple tables
function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      const results: SearchResult[] = [];
      const searchTerm = `%${query}%`;

      // Search vessels
      const { data: vessels } = await supabase
        .from('vessels')
        .select('id, name, imo_number, updated_at')
        .ilike('name', searchTerm)
        .limit(5);

      vessels?.forEach(v => {
        results.push({
          id: v.id,
          type: 'vessel',
          title: v.name,
          description: `Embarcação - IMO ${v.imo_number || 'N/A'}`,
          module: 'Fleet',
          url: '/fleet-tracking',
          relevance: 90,
          lastModified: new Date(v.updated_at || Date.now()),
          highlights: ['vessel']
        });
      });

      // Search crew
      const { data: crew } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, email, updated_at')
        .or(`full_name.ilike.${searchTerm},rank.ilike.${searchTerm}`)
        .limit(5);

      crew?.forEach(c => {
        results.push({
          id: c.id,
          type: 'crew',
          title: c.full_name,
          description: c.rank || 'Tripulante',
          module: 'Crew',
          url: '/crew-management',
          relevance: 85,
          lastModified: new Date(c.updated_at || Date.now()),
          highlights: [c.rank || 'crew'].filter(Boolean)
        });
      });

      // Search maintenance tasks
      const { data: maintenance } = await supabase
        .from('maintenance_tasks')
        .select('id, title, description, status, updated_at')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      maintenance?.forEach(m => {
        results.push({
          id: m.id,
          type: 'maintenance',
          title: m.title || 'Ordem de Serviço',
          description: m.description || '',
          module: 'Maintenance',
          url: '/maintenance-command',
          relevance: 80,
          lastModified: new Date(m.updated_at || Date.now()),
          highlights: [m.status || 'maintenance'].filter(Boolean)
        });
      });

      // Search incidents
      const { data: incidents } = await supabase
        .from('safety_incidents')
        .select('id, title, description, severity, updated_at')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      incidents?.forEach(i => {
        results.push({
          id: i.id,
          type: 'incident',
          title: i.title || 'Incidente',
          description: i.description || '',
          module: 'Safety',
          url: '/safety-incidents',
          relevance: 75,
          lastModified: new Date(i.updated_at || Date.now()),
          highlights: [i.severity || 'incident'].filter(Boolean)
        });
      });

      // Sort by relevance
      return results.sort((a, b) => b.relevance - a.relevance);
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000
  });
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    modules: [],
    types: [],
    dateRange: { start: "", end: "" },
    vessels: []
  });

  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: results = [], isLoading: isSearching } = useGlobalSearch(debouncedQuery);
  const { searches: recentSearches, addSearch } = useRecentSearches();

  const handleSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    addSearch(searchTerm);
  }, [addSearch]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-4 w-4 text-blue-500" />;
      case "vessel": return <Ship className="h-4 w-4 text-cyan-500" />;
      case "crew": return <Users className="h-4 w-4 text-green-500" />;
      case "maintenance": return <Wrench className="h-4 w-4 text-orange-500" />;
      case "incident": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "contract": return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Busca Avançada</h2>
            <p className="text-sm text-muted-foreground">
              Pesquise em todos os módulos com dados reais
            </p>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Buscar documentos, embarcações, tripulação, manutenções..."
                className="pl-10 pr-10"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {(filters.modules.length > 0 || filters.types.length > 0) && (
                <Badge className="ml-2" variant="secondary">
                  {filters.modules.length + filters.types.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Módulo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="crew">Tripulação</SelectItem>
                      <SelectItem value="documents">Documentos</SelectItem>
                      <SelectItem value="safety">Segurança</SelectItem>
                      <SelectItem value="charter">Afretamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="vessel">Embarcação</SelectItem>
                      <SelectItem value="crew">Tripulante</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="incident">Incidente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Inicial</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Data Final</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="ghost" size="sm" onClick={() => setFilters({ modules: [], types: [], dateRange: { start: "", end: "" }, vessels: [] })}>
                  Limpar filtros
                </Button>
                <Button size="sm">Aplicar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {query.length < 2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Buscas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma busca recente</p>
                ) : (
                  recentSearches.map((search, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => handleSearch(search)}
                    >
                      <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                      {search}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Sugestões IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AI_SUGGESTIONS.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => handleSearch(suggestion)}
                  >
                    <Brain className="h-3 w-3 mr-2 text-purple-500" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  `${results.length} resultado(s) encontrado(s)`
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Mais relevantes</SelectItem>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{result.title}</h3>
                          <Badge variant="outline" className="text-xs">{result.module}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {result.relevance}% relevante
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {result.highlights.map((hl, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-warning/20 text-warning-foreground">
                              {hl}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Atualizado em {result.lastModified.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {!isSearching && results.length === 0 && query.length >= 2 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum resultado encontrado para "{query}"</p>
                    <p className="text-sm">Tente termos diferentes ou ajuste os filtros</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdvancedSearch;
