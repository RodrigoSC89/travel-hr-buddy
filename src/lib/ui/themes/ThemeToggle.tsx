/**
 * PATCH 550 – Theme Toggle Component
 * Componente para alternar temas no header
 */

import React from "react";
import { Sun, Moon, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeManager, type Theme } from "./useThemeManager";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeManager();

  const themeOptions: Array<{
    value: Theme;
    label: string;
    icon: React.ReactNode;
  }> = [
    { value: "light", label: "Claro", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Escuro", icon: <Moon className="h-4 w-4" /> },
    { value: "mission", label: "Missão", icon: <Target className="h-4 w-4" /> },
  ];

  const currentThemeOption = themeOptions.find((opt) => opt.value === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {currentThemeOption?.icon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className="flex items-center gap-2"
          >
            {option.icon}
            {option.label}
            {theme === option.value && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
