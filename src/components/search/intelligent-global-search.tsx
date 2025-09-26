import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Ship, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  MapPin,
  Calendar,
  Award,
  MessageSquare,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'data' | 'action' | 'page';
  category: string;
  url: string;
  icon: React.ElementType;
  priority: number;
  metadata?: any;
}

interface IntelligentGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntelligentGlobalSearch: React.FC<IntelligentGlobalSearchProps> = ({
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const { currentOrganization, currentBranding } = useOrganization();

  // Base modules and pages
  const baseResults: SearchResult[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Principal',
      description: 'Visão geral da organização e métricas principais',
      type: 'page',
      category: 'Dashboard',
      url: '/',
      icon: BarChart3,
      priority: 10
    },
    {
      id: 'fleet-management',
      title: 'Gestão de Frota',
      description: 'Gerenciar embarcações e monitorar performance',
      type: 'module',
      category: 'Marítimo',
      url: '/fleet-management',
      icon: Ship,
      priority: 9
    },
    {
      id: 'fleet-tracking',
      title: 'Rastreamento de Frota',
      description: 'Monitoramento em tempo real das embarcações',
      type: 'module',
      category: 'Marítimo',
      url: '/fleet-tracking',
      icon: MapPin,
      priority: 9
    },
    {
      id: 'crew-management',
      title: 'Gestão de Tripulação',
      description: 'Gerenciar membros da tripulação e escalas',
      type: 'module',
      category: 'Marítimo',
      url: '/crew-management',
      icon: Users,
      priority: 8
    },
    {
      id: 'maritime-certifications',
      title: 'Certificações Marítimas',
      description: 'Gerenciar certificados e licenças da tripulação',
      type: 'module',
      category: 'Marítimo',
      url: '/maritime-certifications',
      icon: Award,
      priority: 8
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Dashboards e relatórios analíticos',
      type: 'module',
      category: 'Analytics',
      url: '/analytics',
      icon: BarChart3,
      priority: 7
    },
    {
      id: 'travel',
      title: 'Viagens Corporativas',
      description: 'Reservas de voos e hotéis com alertas de preço',
      type: 'module',
      category: 'Viagens',
      url: '/travel',
      icon: MapPin,
      priority: 7
    },
    {
      id: 'price-alerts',
      title: 'Alertas de Preços',
      description: 'Monitoramento de preços de voos e hotéis',
      type: 'module',
      category: 'Viagens',
      url: '/price-alerts',
      icon: Clock,
      priority: 6
    },
    {
      id: 'communication',
      title: 'Comunicação',
      description: 'Chat interno e sistema de mensagens',
      type: 'module',
      category: 'Colaboração',
      url: '/communication',
      icon: MessageSquare,
      priority: 6
    },
    {
      id: 'hr',
      title: 'Recursos Humanos',
      description: 'Gestão de funcionários e certificados',
      type: 'module',
      category: 'RH',
      url: '/hr',
      icon: Users,
      priority: 6
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Relatórios operacionais e gerenciais',
      type: 'module',
      category: 'Relatórios',
      url: '/reports',
      icon: FileText,
      priority: 5
    },
    {
      id: 'checklists-inteligentes',
      title: 'Checklists Inteligentes',
      description: 'Sistema de checklists operacionais com IA',
      type: 'module',
      category: 'Operações',
      url: '/checklists-inteligentes',
      icon: FileText,
      priority: 5
    },
    {
      id: 'peotram',
      title: 'PEOTRAM',
      description: 'Sistema de auditoria PEOTRAM',
      type: 'module',
      category: 'Auditoria',
      url: '/peotram',
      icon: FileText,
      priority: 5
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Configurações do sistema e usuário',
      type: 'page',
      category: 'Sistema',
      url: '/settings',
      icon: Settings,
      priority: 4
    },
    {
      id: 'organization-settings',
      title: 'Configurações da Organização',
      description: 'Configurar branding e módulos da organização',
      type: 'action',
      category: 'Admin',
      url: '/organization-settings',
      icon: Settings,
      priority: 4
    },
    {
      id: 'users',
      title: 'Gerenciar Usuários',
      description: 'Adicionar e gerenciar usuários da organização',
      type: 'action',
      category: 'Admin',
      url: '/users',
      icon: Users,
      priority: 4
    }
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('nautilus-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // Filter base results by query
      const filteredBase = baseResults.filter(result => {
        const searchText = `${result.title} ${result.description} ${result.category}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });

      // Search in database if organization exists
      let dataResults: SearchResult[] = [];
      if (currentOrganization && query.length >= 2) {
        await searchInDatabase(query, dataResults);
      }

      // Combine and sort results
      const allResults = [...filteredBase, ...dataResults]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 10);

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchInDatabase = async (searchQuery: string, dataResults: SearchResult[]) => {
    if (!currentOrganization) return;

    try {
      // Search in crew members
      const { data: crewData } = await supabase
        .from('crew_members')
        .select('id, full_name, position, status')
        .eq('organization_id', currentOrganization.id)
        .or(`full_name.ilike.%${searchQuery}%, position.ilike.%${searchQuery}%`)
        .limit(5);

      if (crewData) {
        crewData.forEach(crew => {
          dataResults.push({
            id: `crew-${crew.id}`,
            title: crew.full_name,
            description: `${crew.position} - Status: ${crew.status}`,
            type: 'data',
            category: 'Tripulação',
            url: '/crew-management',
            icon: Users,
            priority: 6,
            metadata: { id: crew.id, type: 'crew' }
          });
        });
      }

      // Search in vessels - commenting out until vessels table is properly created
      // const { data: vesselData } = await supabase
      //   .from('vessels')
      //   .select('id, name, type, status')
      //   .eq('organization_id', currentOrganization.id)
      //   .or(`name.ilike.%${searchQuery}%, type.ilike.%${searchQuery}%`)
      //   .limit(5);

      // if (vesselData) {
      //   vesselData.forEach(vessel => {
      //     dataResults.push({
      //       id: `vessel-${vessel.id}`,
      //       title: vessel.name,
      //       description: `${vessel.type} - Status: ${vessel.status}`,
      //       type: 'data',
      //       category: 'Embarcações',
      //       url: '/fleet-management',
      //       icon: Ship,
      //       priority: 7,
      //       metadata: { id: vessel.id, type: 'vessel' }
      //     });
      //   });
      // }

      // Search in checklists
      const { data: checklistData } = await supabase
        .from('operational_checklists')
        .select('id, title, type, status')
        .eq('organization_id', currentOrganization.id)
        .or(`title.ilike.%${searchQuery}%, type.ilike.%${searchQuery}%`)
        .limit(3);

      if (checklistData) {
        checklistData.forEach(checklist => {
          dataResults.push({
            id: `checklist-${checklist.id}`,
            title: checklist.title,
            description: `Checklist ${checklist.type} - Status: ${checklist.status}`,
            type: 'data',
            category: 'Checklists',
            url: '/checklists-inteligentes',
            icon: FileText,
            priority: 5,
            metadata: { id: checklist.id, type: 'checklist' }
          });
        });
      }

    } catch (error) {
      console.error('Database search error:', error);
    }
  };

  const saveRecentSearch = (searchTerm: string) => {
    if (searchTerm.length < 2) return;
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('nautilus-recent-searches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    navigate(result.url);
    onClose();
    setQuery('');
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('nautilus-recent-searches');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Marítimo': return Ship;
      case 'Tripulação': return Users;
      case 'Analytics': return BarChart3;
      case 'Viagens': return MapPin;
      case 'RH': return Users;
      case 'Operações': return FileText;
      case 'Auditoria': return FileText;
      case 'Admin': return Settings;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Marítimo': return 'bg-blue-100 text-blue-800';
      case 'Analytics': return 'bg-purple-100 text-purple-800';
      case 'Viagens': return 'bg-green-100 text-green-800';
      case 'RH': return 'bg-orange-100 text-orange-800';
      case 'Admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Busca Global</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar módulos, dados, ações..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[400px]">
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">Buscas Recentes</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs"
                  >
                    Limpar
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {query.length > 0 && (
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Buscando...</p>
                  </div>
                ) : results.length > 0 ? (
                  results.map((result) => {
                    const ResultIcon = result.icon;
                    const CategoryIcon = getCategoryIcon(result.category);
                    
                    return (
                      <div
                        key={result.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors group"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <ResultIcon className="w-4 h-4 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium truncate">{result.title}</h4>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getCategoryColor(result.category)}`}
                            >
                              {result.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </p>
                        </div>

                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum resultado encontrado para "{query}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">
              Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd> para abrir a busca rapidamente
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};