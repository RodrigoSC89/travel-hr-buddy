/**
 * Skip Link Component for Keyboard Navigation
 * WCAG 2.1 AA requirement - allows users to skip to main content
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkipLinkProps {
  /** The ID of the main content container to skip to */
  targetId?: string;
  /** Custom label for the skip link */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkipLink provides a way for keyboard users to skip navigation and go directly to main content.
 * This is a WCAG 2.1 AA requirement for keyboard accessibility.
 * 
 * @example
 * // In your layout component
 * <SkipLink />
 * <header>Navigation...</header>
 * <main id="main-content">Content...</main>
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = "main-content",
  label = "Skip to main content",
  className,
}) => {
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, [targetId]);

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visually hidden by default
        "fixed top-0 left-0 z-[9999]",
        "sr-only focus:not-sr-only",
        // Visible when focused
        "focus:absolute focus:top-4 focus:left-4",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200",
        className
      )}
    >
      {label}
    </a>
  );
};

export default SkipLink;
