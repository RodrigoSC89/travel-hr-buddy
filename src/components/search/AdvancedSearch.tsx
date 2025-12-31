/**
 * Advanced Search - Global search with filters, AI suggestions
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Star,
  TrendingUp,
  ChevronRight,
  Brain
} from "lucide-react";
import { useDebounce } from "@/hooks/unified";
import { toast } from "sonner";

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

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", type: "maintenance", title: "Ordem de Serviço #12345", description: "Manutenção preventiva do motor principal BB", module: "Maintenance", url: "/maintenance-command", relevance: 95, lastModified: new Date(), highlights: ["motor principal", "preventiva"] },
  { id: "2", type: "document", title: "Manual do Motor CAT 3512", description: "Manual técnico completo do motor Caterpillar", module: "Documents", url: "/documents", relevance: 88, lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), highlights: ["motor", "CAT", "manual"] },
  { id: "3", type: "vessel", title: "PSV Atlantic Star", description: "Platform Supply Vessel - IMO 9876543", module: "Fleet", url: "/fleet-tracking", relevance: 82, lastModified: new Date(), highlights: ["PSV", "Atlantic"] },
  { id: "4", type: "crew", title: "João Silva - Chief Engineer", description: "Engenheiro Chefe com certificações STCW", module: "Crew", url: "/crew-management", relevance: 78, lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), highlights: ["engineer", "STCW"] },
  { id: "5", type: "incident", title: "Incidente #789 - Vazamento de óleo", description: "Vazamento menor no sistema hidráulico", module: "Safety", url: "/safety-incidents", relevance: 75, lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), highlights: ["vazamento", "óleo", "hidráulico"] },
  { id: "6", type: "contract", title: "Contrato de Afretamento - Petrobras", description: "Time charter para operações no pré-sal", module: "Charter", url: "/charter-party", relevance: 70, lastModified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), highlights: ["Petrobras", "pré-sal"] }
];

const RECENT_SEARCHES = [
  "motor principal",
  "certificado STCW",
  "inspeção PSC",
  "ordem de serviço pendente",
  "relatório ESG"
];

const AI_SUGGESTIONS = [
  "Manutenções vencidas nos últimos 30 dias",
  "Certificados expirando em 60 dias",
  "Tripulantes sem treinamento obrigatório",
  "Incidentes não investigados",
  "Equipamentos com saúde crítica"
];

export function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    modules: [],
    types: [],
    dateRange: { start: "", end: "" },
    vessels: []
  });

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filtered = MOCK_RESULTS.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).sort((a, b) => b.relevance - a.relevance);

      setResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

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

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl">
            <Search className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Busca Avançada</h2>
            <p className="text-sm text-muted-foreground">
              Pesquise em todos os módulos com filtros inteligentes
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
                {RECENT_SEARCHES.map((search, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                    {search}
                  </Button>
                ))}
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
                    onClick={() => handleSuggestionClick(suggestion)}
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
              <CardTitle className="text-sm">
                {isSearching ? "Buscando..." : `${results.length} resultado(s) encontrado(s)`}
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
                            <Badge key={idx} variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700">
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

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default AdvancedSearch;
