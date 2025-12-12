/**
 * Ripple Button - PATCH 836
 * Button with Material Design ripple effect
 */

import React, { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRippleEffect } from "@/lib/ux/micro-interactions";
import { useHapticFeedback } from "@/lib/ux/haptic-feedback";
import { cn } from "@/lib/utils";

interface RippleButtonProps extends ButtonProps {
  hapticType?: "light" | "medium" | "heavy";
  disableRipple?: boolean;
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, className, hapticType = "light", disableRipple = false, onClick, ...props }, ref) => {
    const { ripples, createRipple } = useRippleEffect();
    const { trigger } = useHapticFeedback();
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableRipple) {
        createRipple(e);
      }
      trigger(hapticType);
      onClick?.(e);
    };
    
    return (
      <Button
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
        {!disableRipple && ripples.map(({ x, y, id }) => (
          <span
            key={id}
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: x - 50,
              top: y - 50,
              width: 100,
              height: 100,
            }}
          />
        ))}
      </Button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export default RippleButton;
