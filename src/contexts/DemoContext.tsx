/**
 * DemoContext - Provides demo mode state across the app
 * When active, ProtectedRoute allows access without authentication
 */
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  demoUser: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

const DEMO_USER = {
  id: "demo-user-00000000-0000-0000-0000-000000000000",
  email: "demo@nautione.com.br",
  full_name: "Usuário Demo",
  role: "admin",
};

const DEMO_STORAGE_KEY = "nautilus-demo-mode";

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemoMode = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    return {
      isDemoMode: false,
      enableDemoMode: () => {},
      disableDemoMode: () => {},
      demoUser: DEMO_USER,
    };
  }
  return context;
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return sessionStorage.getItem(DEMO_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    try {
      sessionStorage.setItem(DEMO_STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    try {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo(
    () => ({ isDemoMode, enableDemoMode, disableDemoMode, demoUser: DEMO_USER }),
    [isDemoMode, enableDemoMode, disableDemoMode]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
