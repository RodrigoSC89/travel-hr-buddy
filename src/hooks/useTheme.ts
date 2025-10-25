/**
 * useTheme Hook
 * React hook for theme management
 * PATCH 129.0 - Dark Mode + Config Persistente
 */

import { useState, useEffect, useCallback } from "react";
import {
  Theme,
  getCurrentTheme,
  setTheme as setThemeUtil,
  getEffectiveTheme,
  isDarkMode as checkIsDarkMode,
  initializeTheme,
} from "@/lib/theme/theme-utils";

interface UseThemeReturn {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Hook for managing application theme
 * 
 * @example
 * ```tsx
 * const { theme, isDark, toggleTheme } = useTheme();
 * 
 * return (
 *   <button onClick={toggleTheme}>
 *     {isDark ? 'Light Mode' : 'Dark Mode'}
 *   </button>
 * );
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => getCurrentTheme());
  const [isDark, setIsDark] = useState<boolean>(() => checkIsDarkMode());

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
    setIsDark(checkIsDarkMode());
  }, []);

  // Update theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeUtil(newTheme);
    setThemeState(newTheme);
    setIsDark(checkIsDarkMode());
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const currentEffective = getEffectiveTheme(theme);
    const newTheme: Theme = currentEffective === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setIsDark(checkIsDarkMode());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  const effectiveTheme = getEffectiveTheme(theme);

  return {
    theme,
    effectiveTheme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
