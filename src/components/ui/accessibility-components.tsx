import React from "react";

/**
 * Screen Reader Only Text
 * Visually hidden but accessible to screen readers
 */
export const SrOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};

/**
 * Loading State with Accessibility
 */
export const AccessibleLoading: React.FC<{
  message?: string;
  size?: "sm" | "md" | "lg";
}> = ({ message = "Carregando...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className={`offshore-loading ${sizeClasses[size]}`} aria-hidden="true" />
      <span className="text-sm font-semibold text-gray-700">{message}</span>
      <SrOnly>{message}</SrOnly>
    </div>
  );
};

/**
 * Accessible Button with proper ARIA labels
 */
interface AccessibleButtonProps {
  children: React.ReactNode;
  ariaLabel?: string;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: string;
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  ariaLabel,
  isLoading,
  onClick,
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      className={`min-h-[44px] ${className}`}
      {...props}
    >
      {isLoading && <SrOnly>Carregando...</SrOnly>}
      {children}
    </button>
  );
};

/**
 * Skip to Main Content Link (WCAG 2.1 requirement)
 */
export const SkipToMain: React.FC = () => {
  return (
    <a href="#main-content" className="skip-to-main">
      Pular para o conteúdo principal
    </a>
  );
};

/**
 * Live Region for Dynamic Content Announcements
 */
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
}> = ({ children, politeness = "polite", atomic = true }) => {
  return (
    <div role="status" aria-live={politeness} aria-atomic={atomic} className="sr-only">
      {children}
    </div>
  );
};

export default {
  SrOnly,
  AccessibleLoading,
  AccessibleButton,
  SkipToMain,
  LiveRegion,
};
