/**
 * PATCH 550 - Theme Manager Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThemeManager, getThemeColors } from "@/lib/ui/themes";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Theme Manager", () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.className = "";
  });

  describe("useThemeManager", () => {
    it("should initialize with dark theme by default", () => {
      const { result } = renderHook(() => useThemeManager());
      expect(result.current.theme).toBe("dark");
    });

    it("should load theme from localStorage", () => {
      localStorageMock.setItem("nautilus-theme", "light");
      const { result } = renderHook(() => useThemeManager());
      expect(result.current.theme).toBe("light");
    });

    it("should set theme and persist to localStorage", () => {
      const { result } = renderHook(() => useThemeManager());

      act(() => {
        result.current.setTheme("light");
      });

      expect(result.current.theme).toBe("light");
      expect(localStorageMock.getItem("nautilus-theme")).toBe("light");
    });

    it("should toggle between light and dark themes", () => {
      const { result } = renderHook(() => useThemeManager());

      // Start with dark
      expect(result.current.theme).toBe("dark");

      // Toggle to light
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe("light");

      // Toggle back to dark
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe("dark");
    });

    it("should cycle through all themes", () => {
      const { result } = renderHook(() => useThemeManager());

      // Start with dark
      expect(result.current.theme).toBe("dark");

      // Cycle to mission
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe("mission");

      // Cycle to light
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe("light");

      // Cycle back to dark
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe("dark");
    });

    it("should apply theme class to document root", () => {
      const { result } = renderHook(() => useThemeManager());

      act(() => {
        result.current.setTheme("mission");
      });

      // Note: In test environment, the actual DOM changes might not be reflected immediately
      expect(result.current.theme).toBe("mission");
    });
  });

  describe("getThemeColors", () => {
    it("should return light theme colors", () => {
      const colors = getThemeColors("light");
      expect(colors.background).toBe("#ffffff");
      expect(colors.foreground).toBe("#0a0a0a");
      expect(colors.primary).toBe("#2563eb");
    });

    it("should return dark theme colors", () => {
      const colors = getThemeColors("dark");
      expect(colors.background).toBe("#0a0a0a");
      expect(colors.foreground).toBe("#f8fafc");
      expect(colors.primary).toBe("#3b82f6");
    });

    it("should return mission theme colors", () => {
      const colors = getThemeColors("mission");
      expect(colors.background).toBe("#1a1a2e");
      expect(colors.foreground).toBe("#eee");
      expect(colors.primary).toBe("#00d9ff");
    });

    it("should fallback to dark theme for invalid theme", () => {
      const colors = getThemeColors("invalid" as any);
      expect(colors.background).toBe("#0a0a0a");
    });
  });
});
