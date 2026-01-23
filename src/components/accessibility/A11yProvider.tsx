/**
 * Accessibility Provider
 * Centralized accessibility enhancements for the entire app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface A11yContextValue {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: "normal" | "large" | "x-large";
  announceMessage: (message: string, priority?: "polite" | "assertive") => void;
  setFontSize: (size: "normal" | "large" | "x-large") => void;
  setHighContrast: (enabled: boolean) => void;
}

const A11yContext = createContext<A11yContextValue | null>(null);

export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error("useA11y must be used within A11yProvider");
  }
  return context;
}

interface A11yProviderProps {
  children: React.ReactNode;
}

export function A11yProvider({ children }: A11yProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "x-large">("normal");

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Check for high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: more)");
    setHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    mediaQuery.addEventListener("change", handler);
    
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement;
    const sizes = {
      normal: "16px",
      large: "18px",
      "x-large": "20px",
    };
    root.style.fontSize = sizes[fontSize];
  }, [fontSize]);

  // Apply high contrast class
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  // Apply reduced motion class
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  // Screen reader announcement
  const announceMessage = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcer = document.getElementById("a11y-announcer");
    if (announcer) {
      announcer.setAttribute("aria-live", priority);
      announcer.textContent = "";
      // Use setTimeout to ensure the content change triggers announcement
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
  }, []);

  const handleSetHighContrast = useCallback((enabled: boolean) => {
    setHighContrast(enabled);
    localStorage.setItem("nautilus-high-contrast", String(enabled));
  }, []);

  const handleSetFontSize = useCallback((size: "normal" | "large" | "x-large") => {
    setFontSize(size);
    localStorage.setItem("nautilus-font-size", size);
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedHighContrast = localStorage.getItem("nautilus-high-contrast");
    const savedFontSize = localStorage.getItem("nautilus-font-size") as "normal" | "large" | "x-large" | null;
    
    if (savedHighContrast === "true") {
      setHighContrast(true);
    }
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  return (
    <A11yContext.Provider
      value={{
        reducedMotion,
        highContrast,
        fontSize,
        announceMessage,
        setFontSize: handleSetFontSize,
        setHighContrast: handleSetHighContrast,
      }}
    >
      {children}
      {/* Screen reader announcer */}
      <div
        id="a11y-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </A11yContext.Provider>
  );
}

/**
 * Skip to content link for keyboard navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, active = true) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    firstElement.focus();

    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [ref, active]);
}

/**
 * Accessibility settings panel component
 */
export function A11ySettingsPanel() {
  const { fontSize, highContrast, setFontSize, setHighContrast } = useA11y();

  return (
    <div className="space-y-4 p-4 border rounded-lg" role="group" aria-label="Accessibility settings">
      <h3 className="font-semibold text-lg">Accessibility Settings</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Font Size</label>
        <div className="flex gap-2">
          {(["normal", "large", "x-large"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-3 py-1 rounded border ${
                fontSize === size 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background hover:bg-muted"
              }`}
              aria-pressed={fontSize === size}
            >
              {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="high-contrast" className="text-sm font-medium">
          High Contrast
        </label>
        <button
          id="high-contrast"
          role="switch"
          aria-checked={highContrast}
          onClick={() => setHighContrast(!highContrast)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            highContrast ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              highContrast ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default A11yProvider;
