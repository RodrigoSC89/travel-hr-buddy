/**
 * Utilitários de Acessibilidade
 * Funções helper para melhorar a acessibilidade da aplicação
 * 
 * @author DeepAgent - Abacus.AI
 * @date 2025-12-11
 * @phase FASE 3.2
 */

/**
 * Verifica se o elemento está visível para screen readers
 */
export function isScreenReaderVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return !(
    style.display === "none" ||
    style.visibility === "hidden" ||
    element.hasAttribute("aria-hidden") && element.getAttribute("aria-hidden") === "true"
  );
}

/**
 * Adiciona suporte a navegação por teclado a um elemento com onClick
 * @param onClick - Função a ser executada
 * @returns Objeto com handlers de teclado
 */
export function makeKeyboardAccessible(
  onClick: (event: React.MouseEvent | React.KeyboardEvent) => void
) {
  return {
    onClick,
    onKeyDown: (event: React.KeyboardEvent) => {
      // Enter ou Espaço ativam o elemento
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(event);
      }
    },
    role: "button",
    tabIndex: 0,
  };
}

/**
 * Gera um ID único para associar labels e inputs
 */
let idCounter = 0;
export function generateA11yId(prefix = "a11y"): string {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Cria props ARIA para um input com label
 */
export function createInputAriaProps(options: {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const { label, description, error, required, disabled } = options;
  const inputId = generateA11yId("input");
  const descriptionId = description ? generateA11yId("description") : undefined;
  const errorId = error ? generateA11yId("error") : undefined;

  return {
    inputProps: {
      id: inputId,
      "aria-describedby": [
        descriptionId,
        errorId,
      ].filter(Boolean).join(" ") || undefined,
      "aria-invalid": error ? true : undefined,
      "aria-required": required ? true : undefined,
      disabled,
    },
    labelProps: {
      htmlFor: inputId,
    },
    descriptionProps: descriptionId ? {
      id: descriptionId,
    } : undefined,
    errorProps: errorId ? {
      id: errorId,
      role: "alert",
      "aria-live": "polite" as const,
    } : undefined,
  };
}

/**
 * Gerencia focus trap em modais
 */
export function createFocusTrap(containerElement: HTMLElement | null) {
  if (!containerElement) return { activate: () => {}, deactivate: () => {} };

  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex=\"-1\"])",
  ].join(", ");

  let previousActiveElement: HTMLElement | null = null;

  function getFocusableElements() {
    return Array.from(
      containerElement.querySelectorAll<HTMLElement>(focusableSelectors)
    );
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: voltar
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: avançar
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  function activate() {
    previousActiveElement = document.activeElement as HTMLElement;
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    containerElement.addEventListener("keydown", handleKeyDown);
  }

  function deactivate() {
    containerElement.removeEventListener("keydown", handleKeyDown);
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  return { activate, deactivate };
}

/**
 * Anuncia mensagem para screen readers usando live region
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", priority);
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.className = "sr-only";
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  // Remover após 1 segundo
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * Verifica se o contraste entre duas cores atende WCAG AA
 * @param foreground - Cor do texto (hex)
 * @param background - Cor de fundo (hex)
 * @param largeText - Se é texto grande (18pt+ ou 14pt+ bold)
 * @returns true se o contraste atende WCAG AA
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = largeText ? 3 : 4.5; // WCAG AA
  return ratio >= minRatio;
}

/**
 * Calcula o ratio de contraste entre duas cores
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calcula a luminância relativa de uma cor
 */
function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ]
    : null;
}

/**
 * Props ARIA comuns para diferentes tipos de componentes
 */
export const ariaPresets = {
  button: (label: string, pressed?: boolean) => ({
    role: "button",
    "aria-label": label,
    "aria-pressed": pressed,
    tabIndex: 0,
  }),

  link: (label: string, external?: boolean) => ({
    "aria-label": label,
    ...(external && {
      "aria-label": `${label} (abre em nova janela)`,
      rel: "noopener noreferrer",
    }),
  }),

  tab: (label: string, selected: boolean, controls: string) => ({
    role: "tab",
    "aria-label": label,
    "aria-selected": selected,
    "aria-controls": controls,
    tabIndex: selected ? 0 : -1,
  }),

  tabpanel: (labelledBy: string, hidden: boolean) => ({
    role: "tabpanel",
    "aria-labelledby": labelledBy,
    hidden,
    tabIndex: 0,
  }),

  dialog: (label: string, describedBy?: string) => ({
    role: "dialog",
    "aria-label": label,
    "aria-describedby": describedBy,
    "aria-modal": true,
  }),

  menu: (label: string, expanded: boolean) => ({
    role: "menu",
    "aria-label": label,
    "aria-expanded": expanded,
  }),

  menuitem: (label: string) => ({
    role: "menuitem",
    "aria-label": label,
    tabIndex: -1,
  }),
};

/**
 * Hook para detectar navegação por teclado
 */
export function detectKeyboardNavigation() {
  if (typeof window === "undefined") return;

  let isUsingKeyboard = false;

  function handleMouseDown() {
    isUsingKeyboard = false;
    document.body.classList.remove("keyboard-navigation");
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Tab") {
      isUsingKeyboard = true;
      document.body.classList.add("keyboard-navigation");
    }
  }

  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Valida se um elemento tem acessibilidade adequada
 */
export interface A11yValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateElementA11y(
  element: HTMLElement
): A11yValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar se imagens têm alt
  if (element.tagName === "IMG") {
    if (!element.hasAttribute("alt")) {
      errors.push("Imagem sem atributo alt");
    }
  }

  // Verificar se botões têm label acessível
  if (element.tagName === "BUTTON") {
    const hasText = element.textContent?.trim();
    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledBy = element.hasAttribute("aria-labelledby");

    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      errors.push("Botão sem texto ou aria-label");
    }
  }

  // Verificar se inputs têm labels
  if (element.tagName === "INPUT") {
    const hasLabel = document.querySelector(`label[for="${element.id}"]`);
    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledBy = element.hasAttribute("aria-labelledby");

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      warnings.push("Input sem label associado");
    }
  }

  // Verificar se elementos clicáveis são acessíveis por teclado
  const hasOnClick = element.hasAttribute("onclick") || element.onclick;
  if (hasOnClick) {
    const isButton = element.tagName === "BUTTON";
    const isLink = element.tagName === "A";
    const hasTabIndex = element.hasAttribute("tabindex");
    const hasRole = element.getAttribute("role") === "button";

    if (!isButton && !isLink && !hasTabIndex && !hasRole) {
      errors.push("Elemento clicável não é acessível por teclado");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
