import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl focus:ring-2 focus:ring-primary/50 hover:scale-105 transition-all duration-300",
        destructive: "bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl focus:ring-2 focus:ring-destructive/50 hover:scale-105",
        outline: "border-2 border-primary bg-background text-primary shadow-md hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary/50 hover:scale-105 transition-all duration-300",
        secondary: "bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 focus:ring-2 focus:ring-secondary/50 hover:scale-105 transition-all duration-300",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-accent/50 hover:scale-105 transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline focus:ring-2 focus:ring-primary/50 hover:scale-105 transition-all duration-300",
        ocean: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-xl hover:shadow-2xl hover:from-primary-dark hover:to-primary transition-all duration-300 focus:ring-2 focus:ring-primary/50 transform hover:scale-105",
        nautical: "bg-gradient-to-r from-azure-600 to-azure-700 text-white shadow-xl hover:shadow-2xl hover:from-azure-700 hover:to-azure-800 transition-all duration-300 focus:ring-2 focus:ring-azure-500/50 transform hover:scale-105",
        success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl focus:ring-2 focus:ring-emerald-500/50 hover:scale-105 transition-all duration-300",
        warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600 hover:shadow-xl focus:ring-2 focus:ring-amber-500/50 hover:scale-105 transition-all duration-300",
        premium: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl hover:shadow-2xl hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500/50 transform hover:scale-105 transition-all duration-300",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-primary/50 hover:scale-105 transition-all duration-300",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm font-medium",
        sm: "h-9 rounded-md px-4 text-xs font-medium",
        lg: "h-13 rounded-lg px-8 py-3 text-base font-semibold",
        xl: "h-16 rounded-xl px-10 py-4 text-lg font-bold",
        icon: "h-11 w-11 rounded-lg",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
