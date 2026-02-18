/**
 * KeyboardShortcutsHelp - Modal showing all available keyboard shortcuts
 * Triggered by ? key or help button
 */

import React, { memo, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navegação Global",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Busca global" },
      { keys: ["⌘", "B"], description: "Toggle sidebar" },
      { keys: ["⌘", "/"], description: "IA Copilot" },
      { keys: ["?"], description: "Esta ajuda" },
    ],
  },
  {
    title: "Mega-Hubs",
    shortcuts: [
      { keys: ["G", "C"], description: "Ir para Comando" },
      { keys: ["G", "O"], description: "Ir para Operações" },
      { keys: ["G", "M"], description: "Ir para Manutenção" },
      { keys: ["G", "P"], description: "Ir para Compliance" },
      { keys: ["G", "I"], description: "Ir para IA Hub" },
      { keys: ["G", "T"], description: "Ir para Rastreamento" },
      { keys: ["G", "W"], description: "Ir para Workbench" },
    ],
  },
  {
    title: "Ações Rápidas",
    shortcuts: [
      { keys: ["N", "V"], description: "Nova viagem" },
      { keys: ["N", "O"], description: "Nova ordem de serviço" },
      { keys: ["N", "D"], description: "Novo documento" },
      { keys: ["Esc"], description: "Fechar modal / painel" },
    ],
  },
];

export const KeyboardShortcutsHelp = memo(() => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ? key (shift + /) when not in input
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className="text-[10px] text-muted-foreground mx-0.5">
                              +
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-xs font-mono bg-muted/50 min-w-[28px] justify-center"
                          >
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

        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Pressione <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono">?</Badge> a qualquer momento para abrir esta referência
        </p>
      </DialogContent>
    </Dialog>
  );
});

KeyboardShortcutsHelp.displayName = "KeyboardShortcutsHelp";

export default KeyboardShortcutsHelp;
