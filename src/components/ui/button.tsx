import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-premium hover:bg-primary/90 hover:shadow-premium-md",
        destructive: "bg-destructive text-destructive-foreground shadow-premium hover:bg-destructive/90 hover:shadow-premium-md",
        outline: "border border-border bg-background text-foreground shadow-premium-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-primary/30",
        secondary: "bg-secondary text-secondary-foreground shadow-premium-sm hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent/50 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        ocean: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-premium-md hover:shadow-premium-lg hover:brightness-110",
        nautical: "bg-gradient-to-r from-azure-600 to-azure-700 text-white shadow-premium-md hover:shadow-premium-lg hover:brightness-110",
        success: "bg-success text-success-foreground shadow-premium hover:bg-success/90 hover:shadow-premium-md",
        warning: "bg-warning text-warning-foreground shadow-premium hover:bg-warning/90 hover:shadow-premium-md",
        premium: "bg-gradient-to-r from-primary-dark to-primary text-primary-foreground shadow-premium-md hover:shadow-premium-lg hover:brightness-105",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 shadow-premium hover:shadow-premium-md",
        // Maritime offshore high-contrast variants
        maritime: "bg-azure-900 text-white border-2 border-azure-800 shadow-premium hover:bg-azure-800 hover:shadow-premium-md font-semibold focus:ring-4 focus:ring-azure-400/50",
        "maritime-success": "bg-success text-success-foreground border-2 border-success/80 shadow-premium hover:bg-success/90 hover:shadow-premium-md font-semibold focus:ring-4 focus:ring-success/50",
        "maritime-danger": "bg-danger text-danger-foreground border-2 border-danger/80 shadow-premium hover:bg-danger/90 hover:shadow-premium-md font-semibold focus:ring-4 focus:ring-danger/50",
        "maritime-warning": "bg-warning text-warning-foreground border-2 border-warning/80 shadow-premium hover:bg-warning/90 hover:shadow-premium-md font-semibold focus:ring-4 focus:ring-warning/50",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm font-medium min-h-[44px]",
        sm: "h-9 rounded-md px-3.5 text-xs font-medium min-h-[36px]",
        lg: "h-12 rounded-lg px-7 py-3 text-base font-semibold min-h-[48px]",
        xl: "h-14 rounded-xl px-10 py-4 text-lg font-bold min-h-[56px]",
        icon: "h-10 w-10 rounded-lg min-h-[40px] min-w-[40px]",
        // Offshore optimized sizes
        offshore: "h-12 px-8 py-3 text-base font-bold min-h-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  label?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, onClick, children, ariaLabel, label, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    // When asChild is true, we can't add extra children (like the loader)
    // because Slot expects exactly one child element
    if (asChild) {
      return (
        <Slot 
          className={cn(
            buttonVariants({ variant, size }),
            "focus:outline-none focus:ring-2 focus:ring-[var(--nautilus-primary)]",
            className
          )} 
          ref={ref as React.Ref<HTMLElement>}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    return (
      <button 
        className={cn(
          buttonVariants({ variant, size }),
          "focus:outline-none focus:ring-2 focus:ring-[var(--nautilus-primary)]",
          className
        )} 
        ref={ref} 
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel || label || (typeof children === "string" ? children : "Botão Nautilus")}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
