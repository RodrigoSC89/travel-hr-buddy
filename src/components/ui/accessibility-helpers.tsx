import React from "react";
import { cn } from "@/lib/utils";

// Helper para textos acessíveis
interface AccessibleTextProps {
  children: React.ReactNode;
  variant?: "default" | "muted" | "heading" | "emphasis";
  className?: string;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  variant = "default",
  className
}) => {
  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    heading: "text-foreground font-semibold",
    emphasis: "text-primary font-medium"
  };

  return (
    <span className={cn(variantClasses[variant], className)}>
      {children}
    </span>
  );
};

// Helper para fundos contrastados
interface ContrastBackgroundProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}

export const ContrastBackground: React.FC<ContrastBackgroundProps> = ({
  children,
  variant = "primary",
  className
}) => {
  const variantClasses = {
    primary: "bg-primary/10 text-primary-foreground border border-primary/20",
    secondary: "bg-secondary/10 text-secondary-foreground border border-secondary/20",
    success: "bg-success/10 text-success-foreground border border-success/20",
    warning: "bg-warning/10 text-warning-foreground border border-warning/20",
    destructive: "bg-destructive/10 text-destructive-foreground border border-destructive/20",
    info: "bg-info/10 text-info-foreground border border-info/20"
  };

  return (
    <div className={cn("p-3 rounded-lg", variantClasses[variant], className)}>
      {children}
    </div>
  );
};

// Helper para indicadores visuais
interface VisualIndicatorProps {
  status: "online" | "offline" | "active" | "inactive" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  withPulse?: boolean;
  className?: string;
}

export const VisualIndicator: React.FC<VisualIndicatorProps> = ({
  status,
  size = "md",
  withPulse = false,
  className
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const statusClasses = {
    online: "bg-success",
    offline: "bg-muted",
    active: "bg-status-active",
    inactive: "bg-status-inactive",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive"
  };

  return (
    <div 
      className={cn(
        "rounded-full",
        sizeClasses[size],
        statusClasses[status],
        withPulse && "animate-pulse",
        className
      )}
    />
  );
};

// Helper para garantir leitura correta em screen readers
interface ScreenReaderTextProps {
  children: React.ReactNode;
}

export const ScreenReaderText: React.FC<ScreenReaderTextProps> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

// Helper para skips de navegação
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a 
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all"
    >
      {children}
    </a>
  );
};