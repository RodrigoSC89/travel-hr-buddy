/**
 * UniversalSearchAI Component
 * PATCH 1000 - Command Palette com busca inteligente via IA
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Sparkles,
  Navigation,
  Zap,
  FileText,
  Clock,
  ArrowRight,
  Brain,
  TrendingUp,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useUniversalSearch } from "@/hooks/useUniversalSearch";
import { cn } from "@/lib/utils";

interface UniversalSearchAIProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  navegação: <Navigation className="h-4 w-4" />,
  ação: <Zap className="h-4 w-4" />,
  documento: <FileText className="h-4 w-4" />,
  configuração: <Settings className="h-4 w-4" />,
  ai: <Brain className="h-4 w-4" />,
};

const QUICK_COMMANDS = [
  { id: "dashboard", label: "Ir para Dashboard", path: "/dashboard", icon: TrendingUp },
  { id: "command", label: "Centro de Comando IA", path: "/nautilus-command", icon: Brain },
  { id: "alerts", label: "Ver Alertas", path: "/nautilus-command?tab=alerts", icon: AlertTriangle },
  { id: "maintenance", label: "Manutenção", path: "/maintenance-command", icon: Zap },
];

export function UniversalSearchAI({ open: controlledOpen, onOpenChange }: UniversalSearchAIProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  
  const { results, aiSuggestion, isLoading, search, clearResults, recentSearches, addToRecent } = useUniversalSearch();

  // Handle controlled/uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search, clearResults]);

  // Handle selection
  const handleSelect = useCallback((path: string, label: string) => {
    addToRecent(label);
    setOpen(false);
    setQuery("");
    clearResults();
    navigate(path);
  }, [navigate, addToRecent, setOpen, clearResults]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof results> = {};
    for (const result of results) {
      const cat = result.category || "outros";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(result);
    }
    return groups;
  }, [results]);

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Buscar rotas, ações, documentos... (ou pergunte algo)"
          value={query}
          onValueChange={setQuery}
          className="border-0 focus:ring-0"
        />
        {isLoading && (
          <div className="ml-2 flex items-center gap-1">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
          </div>
        )}
      </div>

      <CommandList className="max-h-[400px]">
        {/* Loading state */}
        {isLoading && results.length === 0 && (
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        )}

        {/* AI Suggestion (highlighted) */}
        {aiSuggestion && (
          <CommandGroup heading="✨ Sugestão da IA">
            <CommandItem
              onSelect={() => handleSelect(aiSuggestion.route, aiSuggestion.label)}
              className="bg-primary/5 border border-primary/20"
            >
              <Brain className="mr-2 h-4 w-4 text-primary" />
              <div className="flex flex-col flex-1">
                <span className="font-medium">{aiSuggestion.label}</span>
                <span className="text-xs text-muted-foreground">{aiSuggestion.explanation}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-primary" />
            </CommandItem>
          </CommandGroup>
        )}

        {/* Search Results */}
        {Object.entries(groupedResults).map(([category, items]) => (
          <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
            {items.map((result, idx) => (
              <CommandItem
                key={`${result.path}-${idx}`}
                onSelect={() => handleSelect(result.path, result.label)}
              >
                {CATEGORY_ICONS[result.category] || <FileText className="h-4 w-4" />}
                <span className="ml-2 flex-1">{result.label}</span>
                {result.type === "action" && (
                  <Badge variant="secondary" className="ml-2 text-xs">Ação</Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {/* Empty state */}
        {!isLoading && query && results.length === 0 && !aiSuggestion && (
          <CommandEmpty>
            <div className="text-center py-6">
              <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">Nenhum resultado para "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">Tente reformular sua busca</p>
            </div>
          </CommandEmpty>
        )}

        {/* Quick Commands (when no query) */}
        {!query && (
          <>
            <CommandGroup heading="Acesso Rápido">
              {QUICK_COMMANDS.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleSelect(cmd.path, cmd.label)}
                >
                  <cmd.icon className="mr-2 h-4 w-4" />
                  <span>{cmd.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Pesquisas Recentes">
                  {recentSearches.map((recent, idx) => (
                    <CommandItem
                      key={`recent-${idx}`}
                      onSelect={() => setQuery(recent)}
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{recent}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>

      {/* Footer */}
      <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
          <span>para abrir</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Busca com IA</span>
        </div>
      </div>
    </CommandDialog>
  );
}

export default UniversalSearchAI;
