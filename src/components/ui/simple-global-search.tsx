import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, Ship, Users, Wrench, FileText, Shield, Anchor, Settings, BarChart3, Bot, Loader2, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const MODULE_RESULTS: SearchResult[] = [
  { id: "command", title: "Central de Comando", description: "Dashboard principal", category: "Navegação", icon: BarChart3, path: "/command" },
  { id: "fleet", title: "Frota", description: "Gestão de embarcações", category: "Navegação", icon: Ship, path: "/fleet" },
  { id: "hr", title: "Recursos Humanos", description: "Tripulação e documentos", category: "Navegação", icon: Users, path: "/hr" },
  { id: "maintenance", title: "Manutenção", description: "PMS e work orders", category: "Navegação", icon: Wrench, path: "/maintenance" },
  { id: "compliance", title: "Compliance", description: "ISM, MLC, ISPS, SOLAS", category: "Navegação", icon: Shield, path: "/compliance" },
  { id: "peo-dp", title: "PEO-DP", description: "Dynamic Positioning", category: "Compliance", icon: Anchor, path: "/peo-dp" },
  { id: "peotram", title: "PEOTRAM", description: "Emergência e ambiental", category: "Compliance", icon: Leaf, path: "/peotram" },
  { id: "sgso", title: "SGSO ANP", description: "Segurança operacional", category: "Compliance", icon: Shield, path: "/sgso" },
  { id: "ops", title: "Operações", description: "Voyages, noon reports, bunker", category: "Navegação", icon: Ship, path: "/ops" },
  { id: "ai", title: "Assistente IA", description: "Nauti Brain", category: "IA", icon: Bot, path: "/ai" },
  { id: "settings", title: "Configurações", description: "Preferências do sistema", category: "Sistema", icon: Settings, path: "/settings" },
];

export const SimpleGlobalSearch: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);
  const [isSearchingDB, setIsSearchingDB] = useState(false);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Real DB search
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setDbResults([]);
      return;
    }

    let cancelled = false;
    const searchDB = async () => {
      setIsSearchingDB(true);
      try {
        const q = `%${debouncedSearch}%`;
        const [vessels, crew, maint] = await Promise.all([
          supabase.from('vessels').select('id, name, imo_number, vessel_type').ilike('name', q).limit(4),
          supabase.from('crew_members').select('id, full_name, rank, nationality').ilike('full_name', q).limit(4),
          supabase.from('maintenance_tasks').select('id, title, status, priority').ilike('title', q).limit(4),
        ]);

        if (cancelled) return;

        const results: SearchResult[] = [
          ...(vessels.data ?? []).map(v => ({
            id: `vessel-${v.id}`, title: v.name, description: `${v.vessel_type || 'Vessel'} • IMO ${v.imo_number || '—'}`,
            category: "Embarcações", icon: Ship, path: `/fleet`,
          })),
          ...(crew.data ?? []).map(c => ({
            id: `crew-${c.id}`, title: c.full_name, description: `${c.rank || '—'} • ${c.nationality || '—'}`,
            category: "Tripulação", icon: Users, path: `/hr`,
          })),
          ...(maint.data ?? []).map(m => ({
            id: `maint-${m.id}`, title: m.title, description: `${m.status || '—'} • ${m.priority || '—'}`,
            category: "Manutenção", icon: Wrench, path: `/maintenance`,
          })),
        ];
        setDbResults(results);
      } catch (error) {
        logger.error("Search error:", error);
      } finally {
        if (!cancelled) setIsSearchingDB(false);
      }
    };

    searchDB();
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const filteredModules = MODULE_RESULTS.filter((r) => {
    const s = search.toLowerCase();
    return r.title.toLowerCase().includes(s) || r.description.toLowerCase().includes(s);
  });

  const handleSelect = (path: string) => {
    setOpen(false);
    setSearch("");
    navigate(path);
  };

  const groupedDB = dbResults.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
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
        <span className="hidden lg:inline-flex">{t('header.searchPlaceholder', 'Buscar no sistema...')}</span>
        <span className="inline-flex lg:hidden">{t('header.search', 'Buscar...')}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={t('header.searchPlaceholder', 'Buscar módulos, tripulantes, navios...')}
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            <div className="text-center py-6">
              {isSearchingDB ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
              ) : (
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {isSearchingDB ? 'Buscando...' : `Nenhum resultado para "${search}"`}
              </p>
            </div>
          </CommandEmpty>
          
          {/* Real DB results */}
          {Object.entries(groupedDB).map(([category, results]) => (
            <CommandGroup key={category} heading={`🔍 ${category}`}>
              {results.map((r) => {
                const Icon = r.icon;
                return (
                  <CommandItem key={r.id} value={r.id} onSelect={() => handleSelect(r.path)} className="flex items-center gap-3 p-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/50">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}

          {/* Module navigation */}
          {filteredModules.length > 0 && (
            <CommandGroup heading="Módulos">
              {filteredModules.map((r) => {
                const Icon = r.icon;
                return (
                  <CommandItem key={r.id} value={r.id} onSelect={() => handleSelect(r.path)} className="flex items-center gap-3 p-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{r.category}</Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {isSearchingDB && (
            <div className="flex items-center justify-center py-2 gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Buscando no banco de dados...
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
