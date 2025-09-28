import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Clock, 
  Hash, 
  FileText, 
  Users, 
  Ship, 
  Calculator,
  Zap,
  ArrowRight,
  Command,
  Star,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface GlobalSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  relevance: number;
  metadata?: {
    module?: string;
    lastAccessed?: string;
    popular?: boolean;
    tags?: string[];
  };
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Dados simulados para busca inteligente
  const searchData: SearchResult[] = [
    {
      id: '1',
      title: 'Auditoria PEOTRAM #2024-001',
      description: 'Auditoria completa da embarcação MV Ocean Explorer',
      category: 'Auditorias',
      icon: FileText,
      path: '/peotram',
      relevance: 0.95,
      metadata: {
        module: 'PEOTRAM',
        lastAccessed: '2h atrás',
        popular: true,
        tags: ['auditoria', 'ocean-explorer', 'certificação']
      }
    },
    {
      id: '2',
      title: 'Gestão da Frota',
      description: 'Painel de controle das embarcações',
      category: 'Módulos',
      icon: Ship,
      path: '/fleet-dashboard',
      relevance: 0.9,
      metadata: {
        module: 'Fleet',
        popular: true,
        tags: ['frota', 'embarcações', 'monitoramento']
      }
    },
    {
      id: '3',
      title: 'Certificados Marítimos',
      description: 'Gestão de certificações da tripulação',
      category: 'RH',
      icon: Users,
      path: '/hr',
      relevance: 0.85,
      metadata: {
        module: 'HR',
        tags: ['certificados', 'tripulação', 'stcw']
      }
    },
    {
      id: '4',
      title: 'Analytics Avançado',
      description: 'Relatórios e Business Intelligence',
      category: 'Relatórios',
      icon: TrendingUp,
      path: '/advanced-analytics',
      relevance: 0.8,
      metadata: {
        module: 'Analytics',
        tags: ['relatórios', 'bi', 'métricas']
      }
    },
    {
      id: '5',
      title: 'IA e Insights',
      description: 'Inteligência artificial aplicada',
      category: 'IA',
      icon: Zap,
      path: '/ai-insights',
      relevance: 0.75,
      metadata: {
        module: 'AI',
        tags: ['ia', 'automação', 'insights']
      }
    }
  ];

  // Busca inteligente com relevância
  useEffect(() => {
    if (query.trim()) {
      const filtered = searchData
        .filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.metadata?.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 6);
      
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      // Mostrar resultados populares quando não há busca
      setResults(searchData.filter(item => item.metadata?.popular).slice(0, 4));
    }
  }, [query]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Foco automático no input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleResultClick = (result: SearchResult) => {
    // Adicionar aos recentes
    setRecentSearches(prev => {
      const updated = [result.title, ...prev.filter(item => item !== result.title)].slice(0, 5);
      return updated;
    });

    // Navegar
    navigate(result.path);
    onOpenChange(false);
    setQuery('');

    toast({
      title: "Navegando",
      description: `Abrindo ${result.title}...`,
      duration: 2000
    });
  };

  const getCategoryIcon = (category: string): React.ComponentType<{ className?: string }> => {
    switch (category.toLowerCase()) {
      case 'auditorias': return FileText;
      case 'módulos': return Hash;
      case 'rh': return Users;
      case 'relatórios': return Calculator;
      case 'ia': return Zap;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'auditorias': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'módulos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'rh': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'relatórios': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ia': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-card border-2 border-primary/20 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Busca Global Inteligente
          </DialogTitle>
        </DialogHeader>

        {/* Campo de busca */}
        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar módulos, auditorias, relatórios... (use / para ativar)"
              className="pl-10 pr-16 h-12 text-base bg-background border-2 border-primary/20 focus:border-primary/40 text-foreground placeholder:text-muted-foreground"
              autoComplete="off"
            />
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <Badge variant="outline" className="text-xs border-primary/30 text-muted-foreground">
                <Command className="w-3 h-3 mr-1" />
                ⌘K
              </Badge>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() === '' && (
            <div className="p-6 pt-0">
              <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Mais Acessados
              </div>
            </div>
          )}

          {results.length > 0 ? (
            <div className="space-y-1 p-2">
              {results.map((result, index) => {
                const IconComponent = result.icon;
                const CategoryIcon = getCategoryIcon(result.category);
                
                return (
                  <Card
                    key={result.id}
                    className={`cursor-pointer transition-all duration-200 border-0 ${
                      index === selectedIndex
                        ? 'bg-primary/10 shadow-md scale-[1.02] border-primary/30 border-2'
                        : 'bg-background/50 hover:bg-accent/50 hover:shadow-sm'
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          index === selectedIndex 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate text-base">
                              {result.title}
                            </h3>
                            {result.metadata?.popular && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {result.description}
                          </p>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs ${getCategoryColor(result.category)}`}>
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {result.category}
                            </Badge>
                            
                            {result.metadata?.lastAccessed && (
                              <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                {result.metadata.lastAccessed}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-muted-foreground">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : query.trim() !== '' ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente termos como "PEOTRAM", "frota", "certificados" ou "relatórios"
              </p>
            </div>
          ) : null}
        </div>

        {/* Atalhos de teclado */}
        <div className="border-t border-border/50 p-4 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">↵</Badge>
                Selecionar
              </span>
              <span className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">↑↓</Badge>
                Navegar
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">Esc</Badge>
              Fechar
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;