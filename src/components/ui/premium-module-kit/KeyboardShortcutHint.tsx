/**
 * KeyboardShortcutHint - Dicas de atalhos inline
 * Benchmark: Linear, Notion, Figma
 */

import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface KeyboardShortcutHintProps {
  keys: string[];
  className?: string;
}

export const KeyboardShortcutHint = memo(({ keys, className }: KeyboardShortcutHintProps) => (
  <span className={cn("inline-flex items-center gap-0.5", className)}>
    {keys.map((key, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span className="text-muted-foreground/40 text-[10px] mx-0.5">+</span>}
        <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border/50 rounded shadow-sm">
          {key}
        </kbd>
      </React.Fragment>
    ))}
  </span>
));

KeyboardShortcutHint.displayName = "KeyboardShortcutHint";
