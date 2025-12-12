/**
 * Action Button Component - PATCH 750
 * Reusable button with built-in loading state and feedback
 */

import { forwardRef, useCallback, useState } from "react";;;
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { executeAction, ActionConfig, ActionResult } from "@/lib/actions/action-handler";
import { cn } from "@/lib/utils";

export interface ActionButtonProps extends Omit<ButtonProps, "onClick"> {
  /** Action configuration */
  action?: ActionConfig;
  /** Simple click handler (alternative to action config) */
  onClick?: () => void | Promise<void | ActionResult>;
  /** Success message to show */
  successMessage?: string;
  /** Error message to show */
  errorMessage?: string;
  /** Confirmation message before action */
  confirmMessage?: string;
  /** Loading text */
  loadingText?: string;
  /** Icon to show */
  icon?: React.ReactNode;
  /** Show loading spinner */
  showLoader?: boolean;
  /** Callback after action completes */
  onComplete?: (result: ActionResult) => void;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    {
      action,
      onClick,
      successMessage,
      errorMessage,
      confirmMessage,
      loadingText,
      icon,
      showLoader = true,
      onComplete,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async () => {
      if (isLoading || disabled) return;

      // If action config provided, use executeAction
      if (action) {
        const result = await executeAction(
          {
            ...action,
            successMessage: successMessage || action.successMessage,
            errorMessage: errorMessage || action.errorMessage,
            confirmMessage: confirmMessage || action.confirmMessage,
          },
          setIsLoading
        );
        onComplete?.(result);
        return;
      }

      // If simple onClick provided
      if (onClick) {
        // Show confirmation if needed
        if (confirmMessage) {
          const confirmed = window.confirm(confirmMessage);
          if (!confirmed) return;
        }

        try {
          setIsLoading(true);
          const result = await onClick();
          
          if (result && typeof result === "object" && "success" in result) {
            onComplete?.(result);
          } else {
            onComplete?.({ success: true });
          }
        } catch (error) {
          onComplete?.({ 
            success: false, 
            message: error instanceof Error ? error.message : "Erro desconhecido" 
          });
        } finally {
          setIsLoading(false);
        }
      }
    }, [action, onClick, successMessage, errorMessage, confirmMessage, onComplete, isLoading, disabled]);

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          "transition-all duration-200",
          isLoading && "cursor-wait",
          className
        )}
        {...props}
      >
        {isLoading && showLoader ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </Button>
    );
  }
);

export default ActionButton;
