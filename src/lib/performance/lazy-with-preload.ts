/**
 * Enhanced Lazy Loading com Preload
 * Otimiza carregamento de módulos em conexões lentas
 */

import { lazy, ComponentType } from "react";

interface PreloadableComponent<T extends ComponentType<Record<string, unknown>>> extends React.LazyExoticComponent<T> {
  preload: () => Promise<{ default: T }>;
}

/**
 * Cria um componente lazy com capacidade de preload
 * Útil para pré-carregar rotas que o usuário provavelmente acessará
 */
export function lazyWithPreload<T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const LazyComponent = lazy(importFunc) as PreloadableComponent<T>;
  LazyComponent.preload = importFunc;
  return LazyComponent;
}

/**
 * Estratégia de preload inteligente
 * Precarrega módulos durante idle time do navegador
 */
export const preloadStrategy = {
  // Precarrega durante idle time
  idle: (preloadFn: () => Promise<unknown>) => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => preloadFn());
    } else {
      // Fallback para navegadores sem requestIdleCallback
      setTimeout(() => preloadFn(), 1);
    }
  },

  // Precarrega após delay específico
  delayed: (preloadFn: () => Promise<unknown>, delay: number = 2000) => {
    setTimeout(() => preloadFn(), delay);
  },

  // Precarrega no hover (mouseenter)
  hover: (element: HTMLElement, preloadFn: () => Promise<unknown>) => {
    const handleMouseEnter = () => {
      preloadFn();
      element.removeEventListener("mouseenter", handleMouseEnter);
    };
    element.addEventListener("mouseenter", handleMouseEnter);
  },

  // Precarrega quando visível no viewport
  visible: (element: HTMLElement, preloadFn: () => Promise<unknown>) => {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadFn();
            observer.disconnect();
          }
        });
      });
      observer.observe(element);
    }
  },

  // Precarrega módulos críticos imediatamente
  critical: (preloadFns: Array<() => Promise<unknown>>) => {
    preloadFns.forEach(fn => fn());
  },
};

/**
 * Cache de módulos carregados para evitar recarregamento
 */
class ModuleCache {
  private cache = new Map<string, unknown>();

  set(key: string, value: unknown) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  has(key: string) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const moduleCache = new ModuleCache();
