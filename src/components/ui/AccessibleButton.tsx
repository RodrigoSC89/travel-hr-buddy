/**
import { useEffect, useCallback } from "react";;
 * Accessible Button Component
 * WCAG 2.1 AA compliant button with proper focus management
 */

import React, { forwardRef } from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AccessibleButtonProps extends ButtonProps {
  /** Loading state */
  isLoading?: boolean;
  /** Loading text for screen readers */
  loadingText?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: "left" | "right";
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Announce to screen readers on click */
  announceOnClick?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    isLoading = false,
    loadingText = "Carregando...",
    icon,
    iconPosition = "left",
    shortcut,
    announceOnClick,
    disabled,
    className,
    onClick,
    ...props
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (announceOnClick) {
        announceToScreenReader(announceOnClick);
      }
      onClick?.(e);
    });

    const isDisabled = disabled || isLoading;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          // Enhanced focus styles for accessibility
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "focus-visible:outline-none",
          // Minimum touch target size (44x44px)
          "min-h-[44px] min-w-[44px]",
          className
        )}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
            <span className="sr-only">{loadingText}</span>
            <span aria-hidden="true">{children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="mr-2" aria-hidden="true">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="ml-2" aria-hidden="true">{icon}</span>
            )}
            {shortcut && (
              <kbd className="ml-2 text-xs opacity-60 hidden sm:inline" aria-hidden="true">
                {shortcut}
              </kbd>
            )}
          </>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite") {
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

/**
 * Skip to main content link
 */
export const SkipToContent: React.FC<{ targetId?: string }> = ({ targetId = "main-content" }) => (
  <a
    href={`#${targetId}`}
    className={cn(
      "sr-only focus:not-sr-only",
      "fixed top-4 left-4 z-[9999]",
      "bg-primary text-primary-foreground",
      "px-4 py-2 rounded-md font-medium",
      "focus:outline-none focus:ring-2 focus:ring-ring"
    )}
  >
    Pular para o conteúdo principal
  </a>
);

/**
 * Focus trap for modals and dialogs
 */
export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    });
  }, [isActive, containerRef]);
});

export { announceToScreenReader };
