import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, FileText, Users, Calendar, BarChart3, Settings, Plane, Hotel, Bot, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  path: string;
  keywords: string[];
}

const searchResults: SearchResult[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Principal',
    description: 'Visão geral do sistema com métricas e KPIs',
    category: 'Dashboard',
    icon: BarChart3,
    path: '/',
    keywords: ['painel', 'métricas', 'visão geral', 'kpi', 'estatísticas']
  },
  {
    id: 'hr',
    title: 'Recursos Humanos',
    description: 'Gestão de funcionários e certificados',
    category: 'RH',
    icon: Users,
    path: '/hr',
    keywords: ['funcionários', 'certificados', 'pessoas', 'rh', 'colaboradores']
  },
  {
    id: 'flights',
    title: 'Buscar Voos',
    description: 'Pesquisar e reservar passagens aéreas',
    category: 'Viagens',
    icon: Plane,
    path: '/flights',
    keywords: ['voos', 'passagens', 'aéreas', 'aviação', 'viagem']
  },
  {
    id: 'hotels',
    title: 'Buscar Hotéis',
    description: 'Encontrar e reservar hospedagem',
    category: 'Viagens',
    icon: Hotel,
    path: '/hotels',
    keywords: ['hotéis', 'hospedagem', 'quartos', 'acomodação', 'reserva']
  },
  {
    id: 'reservations',
    title: 'Reservas',
    description: 'Gerenciar todas as reservas do sistema',
    category: 'Gestão',
    icon: Calendar,
    path: '/reservations',
    keywords: ['reservas', 'agendamentos', 'bookings', 'agenda']
  },
  {
    id: 'reports',
    title: 'Relatórios',
    description: 'Gerar e visualizar relatórios detalhados',
    category: 'Analytics',
    icon: FileText,
    path: '/reports',
    keywords: ['relatórios', 'reports', 'documentos', 'análise']
  },
  {
    id: 'settings',
    title: 'Configurações',
    description: 'Ajustar preferências do sistema',
    category: 'Sistema',
    icon: Settings,
    path: '/settings',
    keywords: ['configurações', 'ajustes', 'preferências', 'settings']
  },
  {
    id: 'gamification',
    title: 'Gamificação',
    description: 'Sistema de pontuação e conquistas',
    category: 'Inovação',
    icon: Trophy,
    path: '/gamification',
    keywords: ['gamificação', 'pontos', 'conquistas', 'jogos', 'ranking']
  },
  {
    id: 'innovation',
    title: 'Assistente IA',
    description: 'Inteligência artificial para otimização',
    category: 'IA',
    icon: Bot,
    path: '/innovation',
    keywords: ['ia', 'inteligência artificial', 'assistente', 'bot', 'automação']
  }
];

export const SimpleGlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut to open search (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredResults = searchResults.filter((result) => {
    const searchLower = search.toLowerCase();
    return (
      result.title.toLowerCase().includes(searchLower) ||
      result.description.toLowerCase().includes(searchLower) ||
      result.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = (path: string) => {
    setOpen(false);
    setSearch('');
    navigate(path);
  };

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground h-9"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Buscar no sistema...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Digite para buscar módulos, funcionalidades..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            <div className="text-center py-6">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum resultado encontrado para "{search}"
              </p>
            </div>
          </CommandEmpty>
          
          {Object.entries(groupedResults).map(([category, results]) => (
            <CommandGroup key={category} heading={category}>
              {results.map((result) => {
                const IconComponent = result.icon;
                return (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => handleSelect(result.path)}
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {result.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {result.category}
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};