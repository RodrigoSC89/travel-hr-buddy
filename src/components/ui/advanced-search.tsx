import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Users, Anchor, TrendingUp, Calendar, MessageSquare, Settings, Filter, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOfflineStorage } from "@/hooks/use-offline-storage";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "page" | "document" | "employee" | "alert" | "reservation" | "task";
  route?: string;
  icon: React.ReactNode;
  category: string;
  tags?: string[];
  lastAccessed?: Date;
  priority?: "low" | "medium" | "high";
}

interface AdvancedSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const { saveToCache, getFromCache } = useOfflineStorage();

  const searchableItems: SearchResult[] = [
    {
      id: "dashboard",
      title: "Dashboard Principal",
      description: "Visão geral do sistema e métricas importantes",
      type: "page",
      route: "/",
      icon: <FileText className="h-4 w-4" />,
      category: "Navegação",
      tags: ["overview", "metrics", "home"]
    },
    {
      id: "travel",
      title: "Viagens",
      description: "Busca de voos, hotéis e planejamento de viagens",
      type: "page",
      route: "/travel",
      icon: <Calendar className="h-4 w-4" />,
      category: "Navegação",
      tags: ["flights", "hotels", "booking"]
    },
    {
      id: "maritime",
      title: "Sistema Marítimo",
      description: "Gestão de embarcações, tripulação e certificados",
      type: "page",
      route: "/maritime",
      icon: <Anchor className="h-4 w-4" />,
      category: "Navegação",
      tags: ["vessels", "crew", "certificates"]
    },
    {
      id: "hr",
      title: "Recursos Humanos",
      description: "Gestão de pessoal e certificações",
      type: "page",
      route: "/hr",
      icon: <Users className="h-4 w-4" />,
      category: "Navegação",
      tags: ["employees", "hr", "staff"]
    },
    {
      id: "price-alerts",
      title: "Alertas de Preços",
      description: "Monitoramento e alertas de preços de combustível",
      type: "page",
      route: "/price-alerts",
      icon: <TrendingUp className="h-4 w-4" />,
      category: "Navegação",
      tags: ["prices", "fuel", "alerts"]
    },
    {
      id: "communication",
      title: "Comunicação",
      description: "Sistema de mensagens e comunicação interna",
      type: "page",
      route: "/communication",
      icon: <MessageSquare className="h-4 w-4" />,
      category: "Navegação",
      tags: ["messages", "chat", "communication"]
    },
    {
      id: "settings",
      title: "Configurações",
      description: "Configurações do sistema e perfil do usuário",
      type: "page",
      route: "/settings",
      icon: <Settings className="h-4 w-4" />,
      category: "Navegação",
      tags: ["settings", "config", "profile"]
    }
  ];

  useEffect(() => {
    // Load recent searches and favorites from cache
    const loadCachedData = async () => {
      const cached = await getFromCache("search_data");
      if (cached) {
        setRecentSearches(cached.recent || []);
        setFavorites(cached.favorites || []);
      }
    };
    
    loadCachedData();
  }, [getFromCache]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = searchableItems.filter(item => {
      const searchText = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchText)))
      );
    });

    // Apply filter
    const filteredByType = activeFilter === "all" 
      ? filtered 
      : filtered.filter(item => item.type === activeFilter);

    setResults(filteredByType);
  }, [query, activeFilter]);

  const handleResultClick = (result: SearchResult) => {
    if (result.route) {
      // Add to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      
      // Save to cache
      saveToCache("search_data", {
        recent: newRecent,
        favorites
      });

      navigate(result.route);
      onOpenChange(false);
      setQuery("");
    }
  };

  const toggleFavorite = (result: SearchResult) => {
    const isFavorite = favorites.some(f => f.id === result.id);
    const newFavorites = isFavorite
      ? favorites.filter(f => f.id !== result.id)
      : [...favorites, result];
    
    setFavorites(newFavorites);
    saveToCache("search_data", {
      recent: recentSearches,
      favorites: newFavorites
    });
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results.length > 0) {
      handleResultClick(results[0]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const filterTypes = [
    { key: "all", label: "Todos", icon: <Search className="h-3 w-3" /> },
    { key: "page", label: "Páginas", icon: <FileText className="h-3 w-3" /> },
    { key: "document", label: "Documentos", icon: <FileText className="h-3 w-3" /> },
    { key: "employee", label: "Funcionários", icon: <Users className="h-3 w-3" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Avançada
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Digite para buscar páginas, documentos, funcionários..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 text-base"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterTypes.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.key)}
                className="flex items-center gap-1"
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
          </div>

          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="mt-4">
              {results.length > 0 ? (
                <ScrollArea className="max-h-96">
                  <div className="space-y-2">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex-shrink-0 text-primary">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{result.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {result.category}
                            </Badge>
                            {result.tags && result.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(result);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star 
                            className={`h-4 w-4 ${
                              favorites.some(f => f.id === result.id) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : ""
                            }`} 
                          />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : query ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum resultado encontrado para "{query}"</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Digite para buscar por páginas, documentos e funcionalidades</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="mt-4">
              {recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleRecentSearch(search)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma busca recente</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-4">
              {favorites.length > 0 ? (
                <div className="space-y-2">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleResultClick(favorite)}
                    >
                      <div className="flex-shrink-0 text-primary">
                        {favorite.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{favorite.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {favorite.description}
                        </p>
                      </div>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum favorito salvo</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};