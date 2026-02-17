/**
 * AccessibleIcon - Wrapper ensuring all icons have proper ARIA
 * Prevents ghost icons without accessible labels
 */
import { memo, forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibleIconProps {
  icon: LucideIcon;
  label: string;
  className?: string;
  size?: number;
  decorative?: boolean;
}

export const AccessibleIcon = memo(
  forwardRef<SVGSVGElement, AccessibleIconProps>(
    ({ icon: Icon, label, className, size = 16, decorative = false }, ref) => {
      if (decorative) {
        return (
          <Icon
            ref={ref}
            className={cn("shrink-0", className)}
            size={size}
            aria-hidden="true"
          />
        );
      }

      return (
        <Icon
          ref={ref}
          className={cn("shrink-0", className)}
          size={size}
          role="img"
          aria-label={label}
        />
      );
    }
  )
);

AccessibleIcon.displayName = "AccessibleIcon";
