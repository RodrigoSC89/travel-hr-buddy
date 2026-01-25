/**
 * Focus Trap Hook
 * Traps focus within a container for modal dialogs (WCAG 2.1 AA requirement)
 */
import { useEffect, useRef, useCallback } from "react";

const FOCUSABLE_SELECTORS = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(", ");

export interface UseFocusTrapOptions {
  /** Whether the trap is currently active */
  isActive?: boolean;
  /** Element to focus when trap activates (defaults to first focusable) */
  initialFocus?: HTMLElement | null;
  /** Element to focus when trap deactivates */
  returnFocus?: HTMLElement | null;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
}

/**
 * useFocusTrap traps keyboard focus within a container element.
 * Essential for modal dialogs and other overlay components.
 * 
 * @example
 * function Modal({ isOpen, onClose }) {
 *   const containerRef = useFocusTrap({ isActive: isOpen, onEscape: onClose });
 *   
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       <button>First</button>
 *       <button>Last</button>
 *     </div>
 *   );
 * }
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isActive = true,
  initialFocus,
  returnFocus,
  onEscape,
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter(el => !el.hasAttribute("disabled") && el.tabIndex !== -1);
  }, []);

  // Handle tab key to trap focus
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    if (event.key === "Escape" && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    const activeElement = document.activeElement;

    // Shift+Tab on first element -> go to last
    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    // Tab on last element -> go to first
    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    // If focus is outside container, bring it back
    if (!containerRef.current.contains(activeElement as Node)) {
      event.preventDefault();
      firstElement.focus();
    }
  }, [isActive, onEscape, getFocusableElements]);

  // Activate trap
  useEffect(() => {
    if (!isActive) return;

    // Save currently focused element
    previouslyFocused.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable
    const focusTarget = initialFocus || getFocusableElements()[0];
    if (focusTarget) {
      // Delay to ensure DOM is ready
      requestAnimationFrame(() => {
        focusTarget.focus();
      });
    }

    // Add keydown listener
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      
      // Return focus when trap deactivates
      const returnTarget = returnFocus || previouslyFocused.current;
      if (returnTarget && typeof returnTarget.focus === "function") {
        returnTarget.focus();
      }
    };
  }, [isActive, initialFocus, returnFocus, handleKeyDown, getFocusableElements]);

  return containerRef;
}

export default useFocusTrap;
