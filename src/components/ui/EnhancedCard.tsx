/**
 * Enhanced Card Component - PATCH 754
 * Card with improved contrast, accessibility and performance
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border border-border shadow-sm",
        elevated: "bg-card text-card-foreground border border-border/50 shadow-md hover:shadow-lg",
        glass: "bg-card/80 backdrop-blur-sm text-card-foreground border border-border/30 shadow-soft",
        professional: "bg-gradient-to-br from-card to-muted/20 text-card-foreground border border-primary/10 shadow-elegant",
        ocean: "bg-gradient-ocean text-white border-0 shadow-azure",
        muted: "bg-muted/50 text-foreground border border-muted shadow-sm",
      },
      contrast: {
        normal: "",
        high: "[&_*]:font-medium [&_.text-muted-foreground]:text-foreground/80",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      }
    },
    defaultVariants: {
      variant: "default",
      contrast: "normal",
      padding: "none",
    },
  }
);

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, contrast, padding, loading, children, ...props }, ref) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            cardVariants({ variant, contrast, padding }),
            "animate-pulse",
            className
          )}
          {...props}
        >
          <div className="h-full w-full bg-muted/50 rounded-lg min-h-[100px]" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, contrast, padding }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg sm:text-xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground/70", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-6 pt-0", className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  cardVariants,
});
