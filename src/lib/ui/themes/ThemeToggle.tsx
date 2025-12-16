/**
 * PATCH 550 - Theme Toggle Component
 * Toggle button for switching between light, dark, and mission themes
 */

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Target } from "lucide-react";
import { useThemeManager, type AppTheme } from "./useThemeManager";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, mounted } = useThemeManager();

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const getThemeIcon = (currentTheme: AppTheme) => {
    switch (currentTheme) {
    case "light":
      return <Sun className="h-4 w-4" />;
    case "dark":
      return <Moon className="h-4 w-4" />;
    case "mission":
      return <Target className="h-4 w-4" />;
    default:
      return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {getThemeIcon(theme)}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("mission")}>
          <Target className="mr-2 h-4 w-4" />
          <span>Mission</span>
          {theme === "mission" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
