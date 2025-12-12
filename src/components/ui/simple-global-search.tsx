import { useEffect, useState, useCallback } from "react";;;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, FileText, Users, Calendar, BarChart3, Settings, Plane, Hotel, Bot, Trophy, Ship, Shield, Anchor, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  keywords: string[];
}

// Static base results for core system modules
const staticResults: SearchResult[] = [
  {
    id: "dashboard",
    title: "Dashboard Principal",
    description: "Visão geral do sistema com métricas e KPIs",
    category: "Dashboard",
    icon: BarChart3,
    path: "/",
    keywords: ["painel", "métricas", "visão geral", "kpi", "estatísticas"]
  },
  {
    id: "hr",
    title: "Recursos Humanos",
    description: "Gestão de funcionários e certificados",
    category: "RH",
    icon: Users,
    path: "/hr",
    keywords: ["funcionários", "certificados", "pessoas", "rh", "colaboradores"]
  },
  {
    id: "peo-dp",
    title: "PEO-DP",
    description: "Plano de Operações com Dynamic Positioning",
    category: "Compliance",
    icon: Anchor,
    path: "/peo-dp",
    keywords: ["peo", "dp", "dynamic positioning", "operações", "imca"]
  },
  {
    id: "sgso",
    title: "SGSO",
    description: "Sistema de Gestão de Segurança Operacional",
    category: "Compliance",
    icon: Shield,
    path: "/sgso",
    keywords: ["sgso", "segurança", "anp", "compliance", "gestão"]
  },
  {
    id: "peotram",
    title: "PEOTRAM",
    description: "Plano de Emergência e Gestão Ambiental",
    category: "Compliance",
    icon: Leaf,
    path: "/peotram",
    keywords: ["peotram", "emergência", "ambiental", "esg", "meio ambiente"]
  },
  {
    id: "vessels",
    title: "Embarcações",
    description: "Gestão da frota e operações marítimas",
    category: "Operações",
    icon: Ship,
    path: "/fleet",
    keywords: ["embarcações", "frota", "vessels", "navios", "operações"]
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Ajustar preferências do sistema",
    category: "Sistema",
    icon: Settings,
    path: "/settings",
    keywords: ["configurações", "ajustes", "preferências", "settings"]
  },
  {
    id: "innovation",
    title: "Assistente IA",
    description: "Inteligência artificial para otimização",
    category: "IA",
    icon: Bot,
    path: "/innovation",
    keywords: ["ia", "inteligência artificial", "assistente", "bot", "automação"]
  }
];

export const SimpleGlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>(staticResults);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load additional modules from database
  useEffect(() => {
    if (open) {
      loadDynamicModules();
    }
  }, [open]);

  const loadDynamicModules = async () => {
    try {
      setLoading(true);
      
      // Try to query registered modules from tenant_modules or fall back to static results
      const { data: modules, error } = await supabase
        .from("tenant_modules")
        .select("module_name, config, enabled")
        .eq("enabled", true);
      
      if (error) {
        setSearchResults(staticResults);
        return;
      }
      
      // Merge with static results - tenant_modules augments static list
      const dynamicResults: SearchResult[] = modules?.map(module => {
        const config = module.config as Record<string, unknown> | null;
        return {
          id: module.module_name,
          title: module.module_name,
          description: (config?.description as string) || `Módulo ${module.module_name}`,
          category: (config?.category as string) || "Sistema",
          icon: BarChart3, // Default icon
          path: (config?.route as string) || `/${module.module_name}`,
          keywords: (config?.keywords as string[]) || []
        };
      }) || [];
      
      // Combine and deduplicate by id
      const allResults = [...staticResults];
      dynamicResults.forEach(dynResult => {
        if (!allResults.some(r => r.id === dynResult.id)) {
          allResults.push(dynResult);
        }
      });
      
      setSearchResults(allResults);
    } catch (error) {
      console.error("Error loading modules:", error);
      console.error("Error loading modules:", error);
      // Fallback to static results on error
      setSearchResults(staticResults);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut to open search (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
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
    setSearch("");
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
        onClick={handleSetOpen}
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
                Nenhum resultado encontrado para &quot;{search}&quot;
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
                    onSelect={() => handleSelect(result.path}
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