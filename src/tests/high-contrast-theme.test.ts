/**
 * High Contrast Theme Hook Tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHighContrastTheme } from "@/hooks/useHighContrastTheme";

describe("useHighContrastTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("high-contrast");
    document.documentElement.removeAttribute("data-high-contrast");
  });

  it("starts with false by default", () => {
    const { result } = renderHook(() => useHighContrastTheme());
    expect(result.current.isHighContrast).toBe(false);
  });

  it("toggles high contrast mode", () => {
    const { result } = renderHook(() => useHighContrastTheme());
    
    act(() => {
      result.current.toggleHighContrast();
    });
    
    expect(result.current.isHighContrast).toBe(true);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
  });

  it("adds data attribute when enabled", () => {
    const { result } = renderHook(() => useHighContrastTheme());
    
    act(() => {
      result.current.setIsHighContrast(true);
    });
    
    expect(document.documentElement.getAttribute("data-high-contrast")).toBe("true");
  });

  it("removes class when disabled", () => {
    const { result } = renderHook(() => useHighContrastTheme());
    
    act(() => {
      result.current.setIsHighContrast(true);
    });
    act(() => {
      result.current.setIsHighContrast(false);
    });
    
    expect(document.documentElement.classList.contains("high-contrast")).toBe(false);
    expect(document.documentElement.getAttribute("data-high-contrast")).toBeNull();
  });
});
