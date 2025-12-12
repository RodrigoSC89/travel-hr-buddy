/**
 * PATCH 838: Accessibility Manager
 * Comprehensive accessibility features for inclusive UX
 */

import { useState, useEffect, useCallback } from "react";

interface A11ySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  dyslexiaFont: boolean;
  textSpacing: "normal" | "wide" | "wider";
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
}

const DEFAULT_SETTINGS: A11ySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  focusIndicators: true,
  dyslexiaFont: false,
  textSpacing: "normal",
  colorBlindMode: "none",
};

class A11yManager {
  private settings: A11ySettings;
  private listeners: Set<(settings: A11ySettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
    this.detectSystemPreferences();
    this.applySettings();
  }

  private loadSettings(): A11ySettings {
    const saved = localStorage.getItem("a11y-settings");
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    localStorage.setItem("a11y-settings", JSON.stringify(this.settings));
  }

  private detectSystemPreferences(): void {
    // Detect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.settings.reducedMotion = true;
    }

    // Detect high contrast preference
    if (window.matchMedia("(prefers-contrast: more)").matches) {
      this.settings.highContrast = true;
    }

    // Listen for changes
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
      this.updateSetting("reducedMotion", e.matches);
    });

    window.matchMedia("(prefers-contrast: more)").addEventListener("change", (e) => {
      this.updateSetting("highContrast", e.matches);
    });
  }

  private applySettings(): void {
    const root = document.documentElement;
    const body = document.body;

    // High contrast
    root.classList.toggle("high-contrast", this.settings.highContrast);

    // Large text
    root.classList.toggle("large-text", this.settings.largeText);
    if (this.settings.largeText) {
      root.style.fontSize = "18px";
    } else {
      root.style.fontSize = "";
    }

    // Reduced motion
    root.classList.toggle("reduce-motion", this.settings.reducedMotion);
    if (this.settings.reducedMotion) {
      root.style.setProperty("--animation-duration", "0.01ms");
      root.style.setProperty("--transition-duration", "0.01ms");
    } else {
      root.style.removeProperty("--animation-duration");
      root.style.removeProperty("--transition-duration");
    }

    // Focus indicators
    root.classList.toggle("focus-visible-only", !this.settings.focusIndicators);

    // Dyslexia font
    root.classList.toggle("dyslexia-font", this.settings.dyslexiaFont);
    if (this.settings.dyslexiaFont) {
      body.style.fontFamily = "\"OpenDyslexic\", \"Comic Sans MS\", sans-serif";
    } else {
      body.style.fontFamily = "";
    }

    // Text spacing
    switch (this.settings.textSpacing) {
    case "wide":
      root.style.setProperty("--letter-spacing", "0.05em");
      root.style.setProperty("--word-spacing", "0.1em");
      root.style.setProperty("--line-height", "1.8");
      break;
    case "wider":
      root.style.setProperty("--letter-spacing", "0.1em");
      root.style.setProperty("--word-spacing", "0.2em");
      root.style.setProperty("--line-height", "2");
      break;
    default:
      root.style.removeProperty("--letter-spacing");
      root.style.removeProperty("--word-spacing");
      root.style.removeProperty("--line-height");
    }

    // Color blind modes
    root.classList.remove("protanopia", "deuteranopia", "tritanopia");
    if (this.settings.colorBlindMode !== "none") {
      root.classList.add(this.settings.colorBlindMode);
    }

    // Screen reader optimizations
    if (this.settings.screenReaderMode) {
      // Add more semantic information
      document.querySelectorAll("img:not([alt])").forEach(img => {
        img.setAttribute("alt", "Image");
      });
    }
  }

  // Update a single setting
  updateSetting<K extends keyof A11ySettings>(key: K, value: A11ySettings[K]): void {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  // Update multiple settings
  updateSettings(updates: Partial<A11ySettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  // Reset to defaults
  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.detectSystemPreferences();
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  // Get current settings
  getSettings(): A11ySettings {
    return { ...this.settings };
  }

  // Subscribe to changes
  subscribe(callback: (settings: A11ySettings) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const settings = this.getSettings();
    this.listeners.forEach(cb => cb(settings));
  }

  // Announce message to screen readers
  announce(message: string, priority: "polite" | "assertive" = "polite"): void {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Focus management
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleKeydown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeydown);
    };
  }

  // Skip to main content
  setupSkipLinks(): void {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Pular para o conteúdo principal";
    
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const main = document.getElementById("main-content") || document.querySelector("main");
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus();
      }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

export const a11yManager = new A11yManager();

// React hooks
export function useA11y() {
  const [settings, setSettings] = useState<A11ySettings>(a11yManager.getSettings());

  useEffect(() => {
    const unsubscribe = a11yManager.subscribe(setSettings);
    return unsubscribe;
  }, []);

  const updateSetting = useCallback(<K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
    a11yManager.updateSetting(key, value);
  }, []);

  const updateSettings = useCallback((updates: Partial<A11ySettings>) => {
    a11yManager.updateSettings(updates);
  }, []);

  const reset = useCallback(() => {
    a11yManager.reset();
  }, []);

  const announce = useCallback((message: string, priority?: "polite" | "assertive") => {
    a11yManager.announce(message, priority);
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    reset,
    announce,
    trapFocus: a11yManager.trapFocus.bind(a11yManager),
  };
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-contrast: more)");
    setHighContrast(mq.matches);

    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return highContrast;
}
