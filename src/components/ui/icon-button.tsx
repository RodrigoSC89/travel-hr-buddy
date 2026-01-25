/**
 * Accessible Icon Button Component
 * WCAG 2.1 AA compliant button with proper aria-label for icon-only buttons
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface IconButtonProps extends Omit<ButtonProps, "children"> {
  /** Required accessible label describing the button action */
  label: string;
  /** Icon to render inside the button */
  icon: React.ReactNode;
  /** Show tooltip on hover (recommended for better UX) */
  showTooltip?: boolean;
  /** Tooltip placement */
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, showTooltip = true, tooltipSide = "top", className, ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        size="icon"
        aria-label={label}
        className={cn("flex-shrink-0", className)}
        {...props}
      >
        <span aria-hidden="true">{icon}</span>
        <span className="sr-only">{label}</span>
      </Button>
    );

    if (showTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
