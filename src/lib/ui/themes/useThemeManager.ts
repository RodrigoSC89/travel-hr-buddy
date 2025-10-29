/**
 * PATCH 550 – UI Theme Manager (v1)
 * Sistema de temas claro/escuro/missão com persistência
 */

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "mission";

const THEME_KEY = "nautilus-theme";
const DEFAULT_THEME: Theme = "dark";

export interface ThemeConfig {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
}

/**
 * Hook para gerenciar temas da aplicação
 */
export function useThemeManager(): ThemeConfig {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load theme from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && ["light", "dark", "mission"].includes(stored)) {
        return stored as Theme;
      }
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "mission");

    // Add current theme class
    root.classList.add(theme);

    // Store in localStorage
    localStorage.setItem(THEME_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: "#ffffff",
        dark: "#0a0a0a",
        mission: "#1a1a2e",
      };
      metaThemeColor.setAttribute("content", colors[theme]);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  /**
   * Toggle between light and dark themes only
   * (excludes mission theme for simple binary toggle)
   */
  const toggleTheme = () => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  };

  /**
   * Cycle through all available themes: light -> dark -> mission -> light
   */
  const cycleTheme = () => {
    setThemeState((current) => {
      const themes: Theme[] = ["light", "dark", "mission"];
      const currentIndex = themes.indexOf(current);
      const nextIndex = (currentIndex + 1) % themes.length;
      return themes[nextIndex];
    });
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    cycleTheme,
  };
}

/**
 * Get theme colors for current theme
 */
export function getThemeColors(theme: Theme): Record<string, string> {
  const themes = {
    light: {
      background: "#ffffff",
      foreground: "#0a0a0a",
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#f59e0b",
      muted: "#f1f5f9",
      border: "#e2e8f0",
    },
    dark: {
      background: "#0a0a0a",
      foreground: "#f8fafc",
      primary: "#3b82f6",
      secondary: "#94a3b8",
      accent: "#fbbf24",
      muted: "#1e293b",
      border: "#334155",
    },
    mission: {
      background: "#1a1a2e",
      foreground: "#eee",
      primary: "#00d9ff",
      secondary: "#16213e",
      accent: "#ff6b6b",
      muted: "#0f3460",
      border: "#16213e",
    },
  };

  return themes[theme] || themes.dark;
}
