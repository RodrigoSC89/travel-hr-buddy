/**
 * Keyboard Shortcuts Panel
 * Shows available shortcuts and allows customization
 */
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Keyboard, Search, Command, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  action?: () => void;
}

export const KeyboardShortcutsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    // Navigation
    { keys: ["Ctrl", "K"], description: "Abrir Command Palette", category: "Navegação" },
    { keys: ["G", "D"], description: "Ir para Dashboard", category: "Navegação", action: () => navigate("/command") },
    { keys: ["G", "O"], description: "Ir para Operações", category: "Navegação", action: () => navigate("/ops") },
    { keys: ["G", "M"], description: "Ir para Manutenção", category: "Navegação", action: () => navigate("/maintenance") },
    { keys: ["G", "C"], description: "Ir para Compliance", category: "Navegação", action: () => navigate("/compliance") },
    { keys: ["G", "T"], description: "Ir para Tracking", category: "Navegação", action: () => navigate("/tracking") },
    { keys: ["G", "A"], description: "Ir para IA Hub", category: "Navegação", action: () => navigate("/ai") },
    { keys: ["G", "W"], description: "Ir para Workbench", category: "Navegação", action: () => navigate("/workbench") },
    
    // Actions
    { keys: ["N"], description: "Nova viagem", category: "Ações" },
    { keys: ["Ctrl", "S"], description: "Salvar alterações", category: "Ações" },
    { keys: ["Ctrl", "E"], description: "Exportar dados", category: "Ações" },
    { keys: ["Ctrl", "Shift", "R"], description: "Atualizar dados", category: "Ações" },
    
    // UI
    { keys: ["?"], description: "Mostrar atalhos", category: "Interface" },
    { keys: ["Esc"], description: "Fechar dialogs", category: "Interface" },
    { keys: ["Ctrl", "\\"], description: "Toggle sidebar", category: "Interface" },
    { keys: ["T"], description: "Alternar tema", category: "Interface" },
  ];

  const filteredShortcuts = shortcuts.filter(
    s => s.description.toLowerCase().includes(filter.toLowerCase()) ||
         s.category.toLowerCase().includes(filter.toLowerCase())
  );

  const categories = [...new Set(filteredShortcuts.map(s => s.category))];

  // Listen for ? key to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filtrar atalhos..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </p>
                <div className="space-y-1">
                  {filteredShortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, ki) => (
                            <React.Fragment key={ki}>
                              {ki > 0 && <span className="text-xs text-muted-foreground">+</span>}
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono">
                                {key}
                              </Badge>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <p className="text-xs text-muted-foreground text-center">
          Pressione <Badge variant="outline" className="text-[10px] px-1 py-0 mx-1">?</Badge> a qualquer momento para abrir este painel
        </p>
      </DialogContent>
    </Dialog>
  );
};
