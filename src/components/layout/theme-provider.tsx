/**
 * theme-provider.tsx - PATCH 862 - PURE REACT SOLUTION
 * 
 * Removed next-themes dependency to fix React duplicate instances error.
 * This is a pure React implementation with NO external dependencies.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light" | "system" | "nautilus" | "high-contrast";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: string;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "dark",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

function getSystemTheme(): string {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && ["dark", "light", "system", "nautilus", "high-contrast"].includes(stored)) {
        return stored as Theme;
      }
    } catch {
      // Ignore localStorage errors
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<string>(() => {
    if (theme === "system") return getSystemTheme();
    return theme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "nautilus", "high-contrast");
    
    // Calculate resolved theme
    let resolved: string;
    if (theme === "system") {
      resolved = getSystemTheme();
    } else {
      resolved = theme;
    }
    
    // Apply theme class
    root.classList.add(resolved);
    setResolvedTheme(resolved);
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      const resolved = getSystemTheme();
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value: ThemeProviderState = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
