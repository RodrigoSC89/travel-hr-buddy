/**
 * Theme Management Utilities
 * PATCH 129.0 - Dark Mode + Config Persistente
 * 
 * Provides utilities for managing light/dark theme with localStorage persistence
 */

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme-preference";

/**
 * Get the current theme preference from localStorage
 */
export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch (error) {
    console.warn("Failed to get stored theme:", error);
  }
  
  return "system";
};

/**
 * Store theme preference in localStorage
 */
export const setStoredTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Failed to store theme:", error);
  }
};

/**
 * Get system color scheme preference
 */
export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export const getEffectiveTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
};

/**
 * Apply theme to document root
 */
export const applyTheme = (theme: "light" | "dark"): void => {
  if (typeof window === "undefined") return;
  
  const root = document.documentElement;
  
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

/**
 * Initialize theme on app load
 * Call this in your app entry point
 */
export const initializeTheme = (): void => {
  if (typeof window === "undefined") return;
  
  const storedTheme = getStoredTheme();
  const effectiveTheme = getEffectiveTheme(storedTheme);
  applyTheme(effectiveTheme);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    const currentTheme = getStoredTheme();
    if (currentTheme === "system") {
      const newEffectiveTheme = getSystemTheme();
      applyTheme(newEffectiveTheme);
    }
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleChange);
  } else {
    // Legacy browsers
    mediaQuery.addListener(handleChange);
  }
};

/**
 * Toggle between light and dark theme
 */
export const toggleTheme = (): Theme => {
  const currentTheme = getStoredTheme();
  const effectiveTheme = getEffectiveTheme(currentTheme);
  const newTheme: "light" | "dark" = effectiveTheme === "light" ? "dark" : "light";
  
  setStoredTheme(newTheme);
  applyTheme(newTheme);
  
  return newTheme;
};

/**
 * Set specific theme
 */
export const setTheme = (theme: Theme): void => {
  setStoredTheme(theme);
  const effectiveTheme = getEffectiveTheme(theme);
  applyTheme(effectiveTheme);
};

/**
 * Get current theme
 */
export const getCurrentTheme = (): Theme => {
  return getStoredTheme();
};

/**
 * Check if dark mode is currently active
 */
export const isDarkMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};
