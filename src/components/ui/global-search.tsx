import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Users, MapPin, TrendingUp, Calendar, MessageSquare, Settings, Plane, Building, Anchor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'document' | 'employee' | 'alert' | 'reservation';
  route?: string;
  icon: React.ReactNode;
  category: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const searchableItems: SearchResult[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Principal',
      description: 'Visão geral do sistema e métricas importantes',
      type: 'page',
      route: '/',
      icon: <FileText className="h-4 w-4" />,
      category: 'Navegação'
    },
    {
      id: 'travel',
      title: 'Viagens',
      description: 'Busca de voos, hotéis e planejamento de viagens',
      type: 'page',
      route: '/travel',
      icon: <Plane className="h-4 w-4" />,
      category: 'Navegação'
    },
    {
      id: 'maritime',
      title: 'Sistema Marítimo',
      description: 'Gestão de embarcações, tripulação e certificados',
      type: 'page',
      route: '/maritime',
      icon: <Anchor className="h-4 w-4" />,
      category: 'Navegação'
    },
    {
      id: 'hr',
      title: 'Recursos Humanos',
      description: 'Gestão de pessoal e certificações',
      type: 'page',
      route: '/human-resources',
      icon: <Users className="h-4 w-4" />,
      category: 'Navegação'
    },
    {
      id: 'price-alerts',
      title: 'Alertas de Preços',
      description: 'Monitoramento e alertas de preços de combustível',
      type: 'page',
      route: '/price-alerts',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'Navegação'
    },
    {
      id: 'communication',
      title: 'Comunicação',
      description: 'Sistema de mensagens e comunicação interna',
      type: 'page',
      route: '/communication',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'Navegação'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Análises e relatórios do sistema',
      type: 'page',
      route: '/analytics',
      icon: <FileText className="h-4 w-4" />,
      category: 'Navegação'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Configurações do sistema e perfil do usuário',
      type: 'page',
      route: '/settings',
      icon: <Settings className="h-4 w-4" />,
      category: 'Navegação'
    }
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = searchableItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.route) {
      navigate(result.route);
      onOpenChange(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Global
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Digite para buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              autoFocus
            />
          </div>

          {results.length > 0 && (
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
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
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum resultado encontrado para "{query}"</p>
            </div>
          )}

          {!query && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Digite para buscar por páginas, documentos e funcionalidades</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <Badge variant="outline" className="text-xs">Dashboard</Badge>
                <Badge variant="outline" className="text-xs">Viagens</Badge>
                <Badge variant="outline" className="text-xs">Marítimo</Badge>
                <Badge variant="outline" className="text-xs">RH</Badge>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};