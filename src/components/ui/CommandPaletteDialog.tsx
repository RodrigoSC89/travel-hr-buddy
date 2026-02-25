/**
 * CommandPaletteDialog - Visual command palette (Cmd+K)
 * Inspired by Linear, Raycast, and Spotlight
 */

import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowRight } from "lucide-react";
import { useCommandPalette, type CommandItem } from "@/hooks/useCommandPalette";
import { cn } from "@/lib/utils";

export function CommandPaletteDialog() {
  const { isOpen, search, setSearch, commands, close } = useCommandPalette();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      selectedRef.current = 0;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedRef.current = Math.min(selectedRef.current + 1, commands.length - 1);
      // Force re-render via search state (lightweight)
      setSearch(search + "");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedRef.current = Math.max(selectedRef.current - 1, 0);
      setSearch(search + "");
    } else if (e.key === "Enter" && commands[selectedRef.current]) {
      e.preventDefault();
      commands[selectedRef.current].action();
    }
  };

  const grouped = commands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    const cat = cmd.category === "navigation" ? "Navegação" 
      : cmd.category === "action" ? "Ações" 
      : cmd.category === "ai" ? "IA" 
      : "Recentes";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cmd);
    return acc;
  }, {});

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        {/* Search Input */}
        <div className="flex items-center border-b border-border/50 px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              selectedRef.current = 0;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar comandos, módulos, ações..."
            className="border-0 focus-visible:ring-0 shadow-none h-12 text-sm"
          />
          <Badge variant="outline" className="text-[10px] shrink-0 opacity-60">ESC</Badge>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[360px]">
          <div className="p-1">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                {items.map((cmd, i) => {
                  const globalIndex = commands.indexOf(cmd);
                  const isSelected = globalIndex === selectedRef.current;

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <span className="text-base shrink-0">{cmd.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-muted-foreground">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                          {cmd.shortcut}
                        </Badge>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            ))}

            {commands.length === 0 && (
              <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                Nenhum comando encontrado para "{search}"
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/50 px-3 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>↑↓ Navegar</span>
          <span>↵ Selecionar</span>
          <span>ESC Fechar</span>
          <span className="ml-auto">G+tecla → Hub | N+tecla → Criar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
