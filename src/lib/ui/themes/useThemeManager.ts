/**
 * PATCH 550 - UI Theme Manager
 * SSR-safe theme management hook with three themes: light, dark, mission
 */

import { useEffect, useState } from "react";

export type AppTheme = "light" | "dark" | "mission";

const STORAGE_KEY = "app-theme";

/**
 * SSR-safe theme manager hook with localStorage persistence
 */
export function useThemeManager() {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    // SSR-safe initialization
    if (typeof window === "undefined") {
      return "light";
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "mission") {
        return stored;
      }
    } catch (error) {
      console.error("Error reading theme from localStorage:", error);
    }

    return "light";
  });

  const [mounted, setMounted] = useState(false);

  // Mark as mounted after first render (SSR safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "mission");

    // Add current theme class
    root.classList.add(theme);

    // Add data attribute for easier CSS targeting
    root.setAttribute("data-theme", theme);

    // Apply theme-specific styles
    applyThemeStyles(theme);

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }, [theme, mounted]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    const themes: AppTheme[] = ["light", "dark", "mission"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Don't render theme-dependent content until mounted (SSR safety)
  if (!mounted) {
    return {
      theme: "light" as AppTheme,
      setTheme: () => {},
      cycleTheme: () => {},
      mounted: false,
    };
  }

  return {
    theme,
    setTheme,
    cycleTheme,
    mounted,
  };
}

/**
 * Apply theme-specific CSS custom properties
 */
function applyThemeStyles(theme: AppTheme) {
  const root = document.documentElement;

  if (theme === "mission") {
    // Mission theme: Dark background with tactical accent colors
    root.style.setProperty("--background", "222.2 84% 4.9%"); // Very dark blue-gray
    root.style.setProperty("--foreground", "210 40% 98%"); // Off-white
    root.style.setProperty("--card", "222.2 84% 6%");
    root.style.setProperty("--card-foreground", "210 40% 98%");
    root.style.setProperty("--popover", "222.2 84% 6%");
    root.style.setProperty("--popover-foreground", "210 40% 98%");
    root.style.setProperty("--primary", "142.1 76.2% 36.3%"); // Tactical green
    root.style.setProperty("--primary-foreground", "355.7 100% 97.3%");
    root.style.setProperty("--secondary", "217.2 91.2% 59.8%"); // Tactical blue
    root.style.setProperty("--secondary-foreground", "222.2 47.4% 11.2%");
    root.style.setProperty("--muted", "217.2 32.6% 17.5%");
    root.style.setProperty("--muted-foreground", "215 20.2% 65.1%");
    root.style.setProperty("--accent", "217.2 32.6% 17.5%");
    root.style.setProperty("--accent-foreground", "210 40% 98%");
    root.style.setProperty("--destructive", "0 62.8% 30.6%");
    root.style.setProperty("--destructive-foreground", "210 40% 98%");
    root.style.setProperty("--border", "217.2 32.6% 17.5%");
    root.style.setProperty("--input", "217.2 32.6% 17.5%");
    root.style.setProperty("--ring", "142.1 76.2% 36.3%");
    root.style.setProperty("--radius", "0.5rem");
  } else if (theme === "dark") {
    // Default dark theme
    root.style.setProperty("--background", "222.2 84% 4.9%");
    root.style.setProperty("--foreground", "210 40% 98%");
    root.style.setProperty("--card", "222.2 84% 4.9%");
    root.style.setProperty("--card-foreground", "210 40% 98%");
    root.style.setProperty("--popover", "222.2 84% 4.9%");
    root.style.setProperty("--popover-foreground", "210 40% 98%");
    root.style.setProperty("--primary", "210 40% 98%");
    root.style.setProperty("--primary-foreground", "222.2 47.4% 11.2%");
    root.style.setProperty("--secondary", "217.2 32.6% 17.5%");
    root.style.setProperty("--secondary-foreground", "210 40% 98%");
    root.style.setProperty("--muted", "217.2 32.6% 17.5%");
    root.style.setProperty("--muted-foreground", "215 20.2% 65.1%");
    root.style.setProperty("--accent", "217.2 32.6% 17.5%");
    root.style.setProperty("--accent-foreground", "210 40% 98%");
    root.style.setProperty("--destructive", "0 62.8% 30.6%");
    root.style.setProperty("--destructive-foreground", "210 40% 98%");
    root.style.setProperty("--border", "217.2 32.6% 17.5%");
    root.style.setProperty("--input", "217.2 32.6% 17.5%");
    root.style.setProperty("--ring", "212.7 26.8% 83.9%");
  } else {
    // Light theme
    root.style.setProperty("--background", "0 0% 100%");
    root.style.setProperty("--foreground", "222.2 84% 4.9%");
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", "222.2 84% 4.9%");
    root.style.setProperty("--popover", "0 0% 100%");
    root.style.setProperty("--popover-foreground", "222.2 84% 4.9%");
    root.style.setProperty("--primary", "222.2 47.4% 11.2%");
    root.style.setProperty("--primary-foreground", "210 40% 98%");
    root.style.setProperty("--secondary", "210 40% 96.1%");
    root.style.setProperty("--secondary-foreground", "222.2 47.4% 11.2%");
    root.style.setProperty("--muted", "210 40% 96.1%");
    root.style.setProperty("--muted-foreground", "215.4 16.3% 46.9%");
    root.style.setProperty("--accent", "210 40% 96.1%");
    root.style.setProperty("--accent-foreground", "222.2 47.4% 11.2%");
    root.style.setProperty("--destructive", "0 84.2% 60.2%");
    root.style.setProperty("--destructive-foreground", "210 40% 98%");
    root.style.setProperty("--border", "214.3 31.8% 91.4%");
    root.style.setProperty("--input", "214.3 31.8% 91.4%");
    root.style.setProperty("--ring", "222.2 84% 4.9%");
  }
}

/**
 * Get theme from localStorage (useful for SSR)
 */
export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "mission") {
      return stored;
    }
  } catch (error) {
    console.error("Error reading theme from localStorage:", error);
  }

  return "light";
}
