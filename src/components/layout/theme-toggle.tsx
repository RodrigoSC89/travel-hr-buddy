import { memo, useCallback } from "react";
import { Moon, Sun, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/layout/theme-provider";

// PATCH 620: Extended theme toggle with nautilus and high-contrast themes
export const ThemeToggle = memo(function() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 p-0 cursor-pointer"
          aria-label="Alternar tema"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[110]" sideOffset={8}>
        <DropdownMenuItem onClick={handleSetTheme} className="cursor-pointer">
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetTheme} className="cursor-pointer">
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetTheme} className="cursor-pointer">
          <Palette className="mr-2 h-4 w-4" />
          Nautilus
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetTheme} className="cursor-pointer">
          Alto Contraste
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetTheme} className="cursor-pointer">
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});