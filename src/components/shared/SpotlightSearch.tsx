/**
 * Spotlight Search - Enhanced global search with categories
 * Premium UX component for instant navigation
 */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Ship, Users, FileText, Wrench, Shield, Brain, 
  BarChart3, MapPin, Clock, Compass, Settings, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  path: string;
  keywords: string[];
}

const searchIndex: SearchResult[] = [
  // Command
  { id: "cmd-overview", title: "Central de Comando", description: "Dashboard principal operacional", category: "Comando", icon: <Compass className="h-4 w-4" />, path: "/command", keywords: ["dashboard", "comando", "principal", "home"] },
  { id: "cmd-noc", title: "NOC 24/7", description: "Centro de operações de rede", category: "Comando", icon: <Activity className="h-4 w-4" />, path: "/command?tab=noc", keywords: ["noc", "rede", "monitoramento"] },
  { id: "cmd-ceo", title: "CEO Dashboard", description: "Visão executiva consolidada", category: "Comando", icon: <BarChart3 className="h-4 w-4" />, path: "/command?tab=ceo", keywords: ["ceo", "executivo", "kpi"] },
  
  // Operations
  { id: "ops-fleet", title: "Gestão de Frota", description: "Embarcações e status operacional", category: "Operações", icon: <Ship className="h-4 w-4" />, path: "/ops", keywords: ["frota", "navio", "embarcação", "vessel"] },
  { id: "ops-voyage", title: "Planejamento de Viagem", description: "Rotas e escalas de viagem", category: "Operações", icon: <MapPin className="h-4 w-4" />, path: "/ops?tab=voyage", keywords: ["viagem", "rota", "voyage", "escala"] },
  
  // Crew
  { id: "crew-mgmt", title: "Gestão de Tripulação", description: "Cadastro e gestão de tripulantes", category: "Tripulação", icon: <Users className="h-4 w-4" />, path: "/workbench?section=people", keywords: ["tripulação", "crew", "marinheiro", "oficial"] },
  
  // Maintenance
  { id: "maint-tasks", title: "Tarefas de Manutenção", description: "Work orders e manutenção preventiva", category: "Manutenção", icon: <Wrench className="h-4 w-4" />, path: "/maintenance", keywords: ["manutenção", "reparo", "work order", "preventiva"] },
  
  // Documents
  { id: "docs-hub", title: "Hub de Documentos", description: "Gestão centralizada de documentos", category: "Documentos", icon: <FileText className="h-4 w-4" />, path: "/workbench?section=docs", keywords: ["documento", "certificado", "contrato"] },
  
  // Compliance
  { id: "comp-mlc", title: "Compliance MLC 2006", description: "Convenção do Trabalho Marítimo", category: "Compliance", icon: <Shield className="h-4 w-4" />, path: "/compliance", keywords: ["mlc", "compliance", "norma", "regulação"] },
  
  // AI
  { id: "ai-hub", title: "IA Copiloto", description: "Assistente inteligente com IA", category: "IA", icon: <Brain className="h-4 w-4" />, path: "/ai", keywords: ["ia", "ai", "inteligência", "copiloto", "assistente"] },
  
  // Tracking
  { id: "track-map", title: "Rastreamento AIS", description: "Posição em tempo real de embarcações", category: "Tracking", icon: <MapPin className="h-4 w-4" />, path: "/tracking", keywords: ["rastreamento", "ais", "posição", "mapa", "gps"] },
  
  // Settings
  { id: "settings", title: "Configurações", description: "Preferências do sistema", category: "Sistema", icon: <Settings className="h-4 w-4" />, path: "/settings", keywords: ["configuração", "preferência", "perfil", "conta"] },
];

export const SpotlightSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return searchIndex.slice(0, 8);
    const q = query.toLowerCase();
    return searchIndex
      .filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.keywords.some(k => k.includes(q))
      )
      .slice(0, 10);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const categories = [...new Set(results.map(r => r.category))];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 max-w-lg overflow-hidden gap-0">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar módulos, funcionalidades, páginas..."
            className="flex-1 py-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">ESC</Badge>
        </div>

        <ScrollArea className="max-h-[350px]">
          <div className="p-2">
            {categories.map(category => (
              <div key={category}>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  {category}
                </p>
                {results
                  .filter(r => r.category === category)
                  .map((result, i) => {
                    const globalIndex = results.indexOf(result);
                    return (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          globalIndex === selectedIndex 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-muted/50">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                        </div>
                        {globalIndex === selectedIndex && (
                          <Badge variant="outline" className="text-[10px] px-1 shrink-0">↵</Badge>
                        )}
                      </motion.button>
                    );
                  })}
              </div>
            ))}
            {results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum resultado para "{query}"</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] px-1 py-0">↑↓</Badge> navegar
            </span>
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] px-1 py-0">↵</Badge> abrir
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] px-1 py-0">?</Badge> atalhos
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
