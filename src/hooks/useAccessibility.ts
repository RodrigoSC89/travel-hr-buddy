/**
 * Hook de Acessibilidade
 * React hooks para gerenciar acessibilidade
 * 
 * @author DeepAgent - Abacus.AI
 * @date 2025-12-11
 * @phase FASE 3.2
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createFocusTrap,
  announceToScreenReader,
  detectKeyboardNavigation,
  generateA11yId,
} from "@/utils/accessibility";

/**
 * Hook para gerenciar focus trap em modais
 */
export function useFocusTrap<T extends HTMLElement>(active = false) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const focusTrap = createFocusTrap(ref.current);
    focusTrap.activate();

    return () => {
      focusTrap.deactivate();
    };
  }, [active]);

  return ref;
}

/**
 * Hook para anunciar mensagens para screen readers
 */
export function useScreenReaderAnnouncement() {
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      announceToScreenReader(message, priority);
    },
    []
  );

  return announce;
}

/**
 * Hook para gerenciar IDs únicos acessíveis
 */
export function useA11yId(prefix?: string) {
  const [id] = useState(() => generateA11yId(prefix));
  return id;
}

/**
 * Hook para detectar navegação por teclado
 */
export function useKeyboardNavigation() {
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Tab") {
        setIsKeyboardNavigating(true);
      }
    }

    function handleMouseDown() {
      setIsKeyboardNavigating(false);
    }

    const cleanup = detectKeyboardNavigation();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      cleanup?.();
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return isKeyboardNavigating;
}

/**
 * Hook para gerenciar fechamento de modal com Escape
 */
export function useEscapeKey(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscape();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onEscape, active]);
}

/**
 * Hook para gerenciar foco em elemento específico
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}

/**
 * Hook para restaurar foco após unmount
 */
export function useFocusRestore<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  return ref;
}

/**
 * Hook para gerenciar estado expandido/colapsado com ARIA
 */
export function useAriaExpanded(initialExpanded = false) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const id = useA11yId("expandable");

  const triggerProps = {
    "aria-expanded": expanded,
    "aria-controls": id,
  };

  const contentProps = {
    id,
    hidden: !expanded,
  };

  return {
    expanded,
    setExpanded,
    toggle: () => setExpanded(prev => !prev),
    triggerProps,
    contentProps,
  };
}

/**
 * Hook para gerenciar tabs acessíveis
 */
export function useAccessibleTabs(tabCount: number, defaultIndex = 0) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % tabCount);
        break;
      case "ArrowLeft":
        event.preventDefault();
        setSelectedIndex(prev => (prev - 1 + tabCount) % tabCount);
        break;
      case "Home":
        event.preventDefault();
        setSelectedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setSelectedIndex(tabCount - 1);
        break;
      }
    },
    [tabCount]
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
}

/**
 * Hook para criar props de tooltip acessível
 */
export function useAccessibleTooltip(content: string) {
  const [visible, setVisible] = useState(false);
  const id = useA11yId("tooltip");

  const triggerProps = {
    "aria-describedby": visible ? id : undefined,
    onMouseEnter: () => setVisible(true),
    onMouseLeave: () => setVisible(false),
    onFocus: () => setVisible(true),
    onBlur: () => setVisible(false),
  };

  const tooltipProps = {
    id,
    role: "tooltip" as const,
    hidden: !visible,
  };

  return {
    visible,
    setVisible,
    triggerProps,
    tooltipProps,
    content,
  };
}

/**
 * Hook para gerenciar live regions (anúncios dinâmicos)
 */
export function useLiveRegion(priority: "polite" | "assertive" = "polite") {
  const [message, setMessage] = useState("");
  const id = useA11yId("live-region");

  useEffect(() => {
    if (message) {
      // Limpar mensagem após 3 segundos
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const regionProps = {
    id,
    role: "status" as const,
    "aria-live": priority,
    "aria-atomic": true,
    className: "sr-only",
  };

  return {
    message,
    announce: setMessage,
    regionProps,
  };
}
