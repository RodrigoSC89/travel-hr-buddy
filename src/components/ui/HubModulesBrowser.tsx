/**
 * HubModulesBrowser - Renderiza módulos absorvidos dentro de um Mega-Hub
 * Cada módulo standalone vira um card clicável. Ao clicar, renderiza o componente lazy inline.
 * ZERO perda de funcionalidades - cada componente original é preservado integralmente.
 */
import React, { Suspense, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Layers, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AbsorbedModule {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

interface HubModulesBrowserProps {
  modules: AbsorbedModule[];
  hubName: string;
  hubColor: string;
  activeModuleId?: string | null;
  onModuleSelect?: (moduleId: string | null) => void;
}

const ModuleLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

export function HubModulesBrowser({ 
  modules, 
  hubName, 
  hubColor, 
  activeModuleId, 
  onModuleSelect 
}: HubModulesBrowserProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group by category
  const categories = useMemo(() => {
    const cats = new Set(modules.map(m => m.category));
    return ['all', ...Array.from(cats).sort()];
  }, [modules]);

  const filteredModules = useMemo(() => {
    let result = modules;
    if (selectedCategory !== 'all') {
      result = result.filter(m => m.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [modules, selectedCategory, search]);

  // If a module is selected, render it inline
  if (activeModuleId) {
    const activeModule = modules.find(m => m.id === activeModuleId);
    if (activeModule) {
      const ModuleComponent = activeModule.component;
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onModuleSelect?.(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos módulos
            </Button>
            <Badge variant="outline" className={hubColor}>
              {activeModule.category}
            </Badge>
            <span className="text-sm font-medium">{activeModule.name}</span>
          </div>
          <Suspense fallback={<ModuleLoadingSkeleton />}>
            <ModuleComponent />
          </Suspense>
        </div>
      );
    }
  }

  // Module browser grid
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Módulos Integrados — {hubName}
          </h3>
          <Badge variant="secondary">{modules.length}</Badge>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap text-xs"
            >
              {cat === 'all' ? 'Todos' : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredModules.map(module => (
          <Card
            key={module.id}
            className="group cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 bg-card/50"
            onClick={() => onModuleSelect?.(module.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <module.icon className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {module.category}
                </Badge>
              </div>
              <h4 className="text-sm font-medium mb-1 line-clamp-1">{module.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {module.description}
              </p>
              <div className="flex items-center justify-end">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum módulo encontrado</p>
        </div>
      )}
    </div>
  );
}

export default HubModulesBrowser;
