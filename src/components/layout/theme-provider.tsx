/**
 * theme-provider.tsx - PATCH 859 - FINAL FIX
 * 
 * Using next-themes instead of custom implementation to avoid
 * React hooks conflict issues with multiple React instances.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

type Theme = "dark" | "light" | "system" | "nautilus" | "high-contrast";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark", "system", "nautilus", "high-contrast"]}
    >
      {children}
    </NextThemesProvider>
  );
}

// Re-export useTheme from next-themes for compatibility
export { useTheme } from "next-themes";
