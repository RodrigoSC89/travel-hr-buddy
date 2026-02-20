/**
 * ModuleLauncherModal - Premium App Launcher para sub-módulos
 * Estilo fullscreen modal com grid de cards, busca e categorias
 * Substitui os dropdowns com uma experiência imersiva
 */
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, Sparkles } from 'lucide-react';
import type { AbsorbedModule } from '@/components/ui/HubModulesBrowser';
import { cn } from '@/lib/utils';

interface ModuleLauncherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubName: string;
  hubIcon?: React.ReactNode;
  hubColor?: string;
  modules: AbsorbedModule[];
  onModuleSelect: (moduleId: string) => void;
}

export function ModuleLauncherModal({
  open,
  onOpenChange,
  hubName,
  hubIcon,
  hubColor = 'text-primary',
  modules,
  onModuleSelect,
}: ModuleLauncherModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(modules.map(m => m.category || 'Geral'));
    return Array.from(cats).sort();
  }, [modules]);

  // Filter modules
  const filtered = useMemo(() => {
    let result = modules;
    if (selectedCategory) {
      result = result.filter(m => (m.category || 'Geral') === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [modules, search, selectedCategory]);

  // Group by category for display
  const grouped = useMemo(() => {
    const map: Record<string, AbsorbedModule[]> = {};
    filtered.forEach(m => {
      const cat = m.category || 'Geral';
      if (!map[cat]) map[cat] = [];
      map[cat].push(m);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleSelect = (moduleId: string) => {
    onModuleSelect(moduleId);
    onOpenChange(false);
    setSearch('');
    setSelectedCategory(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden bg-background/98 backdrop-blur-xl border-border/50">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/50 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {hubIcon && <div className={cn("p-2 rounded-lg bg-primary/10", hubColor)}>{hubIcon}</div>}
              <div>
                <h2 className="text-lg font-bold text-foreground">{hubName}</h2>
                <p className="text-xs text-muted-foreground">
                  {modules.length} módulos especializados disponíveis
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5 bg-primary/5 border-primary/20 text-primary">
              <Sparkles className="h-3 w-3" />
              {modules.length} módulos
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar módulo por nome, descrição ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/80 border-border/40 focus-visible:ring-primary/30"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                !selectedCategory
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Todos ({modules.length})
            </button>
            {categories.map(cat => {
              const count = modules.filter(m => (m.category || 'Geral') === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Module Grid */}
        <div className="overflow-y-auto px-6 py-4 max-h-[55vh]">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-8 w-8 mb-3 opacity-40" />
              <p className="text-sm font-medium">Nenhum módulo encontrado</p>
              <p className="text-xs mt-1">Tente buscar com outro termo</p>
            </div>
          ) : (
            grouped.map(([category, mods]) => (
              <div key={category} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category}</h3>
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-[10px] text-muted-foreground/60">{mods.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {mods.map(mod => (
                    <button
                      key={mod.id}
                      onClick={() => handleSelect(mod.id)}
                      className={cn(
                        "group relative flex items-start gap-3 p-3.5 rounded-xl border border-border/40",
                        "bg-card/50 hover:bg-accent/60 hover:border-primary/30 hover:shadow-md",
                        "transition-all duration-200 text-left active:scale-[0.98]"
                      )}
                    >
                      <div className="p-2 rounded-lg bg-primary/8 group-hover:bg-primary/15 transition-colors flex-shrink-0">
                        <mod.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {mod.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                          {mod.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 bg-muted/20 px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} de {modules.length} módulos
          </span>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
            <span>navegar</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd>
            <span>abrir</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd>
            <span>fechar</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModuleLauncherModal;
