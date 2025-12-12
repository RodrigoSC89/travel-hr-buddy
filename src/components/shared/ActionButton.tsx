/**
import { useState, useCallback } from "react";;
 * ActionButton - Reusable button with integrated action handling
 * Provides consistent behavior across all modules
 */

import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ActionButtonProps extends Omit<ButtonProps, "onClick"> {
  action: () => Promise<any> | void;
  successMessage?: string;
  errorMessage?: string;
  confirmMessage?: string;
  loadingText?: string;
  children: React.ReactNode;
}

export const ActionButton = memo(function({
  action,
  successMessage,
  errorMessage = "Ocorreu um erro. Tente novamente.",
  confirmMessage,
  loadingText = "Processando...",
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (confirmMessage) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const result = await action();
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (error) {
      console.error("ActionButton error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Button 
      onClick={handleClick} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default ActionButton;
