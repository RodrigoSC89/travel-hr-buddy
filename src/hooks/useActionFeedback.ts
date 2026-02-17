/**
 * useActionFeedback - Premium action feedback hook
 * Provides visual + haptic feedback for save/delete/submit actions
 */
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

type FeedbackState = "idle" | "loading" | "success" | "error";

interface ActionFeedbackOptions {
  successMessage?: string;
  errorMessage?: string;
  successDuration?: number;
  haptic?: boolean;
}

export function useActionFeedback(options: ActionFeedbackOptions = {}) {
  const {
    successMessage = "Operação realizada com sucesso",
    errorMessage = "Erro ao realizar operação",
    successDuration = 2000,
    haptic = true,
  } = options;

  const [state, setState] = useState<FeedbackState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerHaptic = useCallback((type: "success" | "error") => {
    if (!haptic || !("vibrate" in navigator)) return;
    navigator.vibrate(type === "success" ? [30] : [50, 30, 50]);
  }, [haptic]);

  const execute = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState("loading");

      try {
        const result = await action();
        setState("success");
        triggerHaptic("success");
        toast.success(successMessage);

        timeoutRef.current = setTimeout(() => setState("idle"), successDuration);
        return result;
      } catch (err) {
        setState("error");
        triggerHaptic("error");
        const msg = err instanceof Error ? err.message : errorMessage;
        toast.error(msg);

        timeoutRef.current = setTimeout(() => setState("idle"), successDuration);
        return null;
      }
    },
    [successMessage, errorMessage, successDuration, triggerHaptic]
  );

  return {
    state,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    execute,
    reset: () => setState("idle"),
  };
}
