/**
 * RetryButton - Smart retry with exponential backoff
 * For failed queries/mutations with user feedback
 */
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  label?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  maxRetries?: number;
}

type Status = "idle" | "loading" | "success" | "error";

export function RetryButton({
  onRetry,
  label = "Tentar novamente",
  className,
  size = "default",
  variant = "outline",
  maxRetries = 3,
}: RetryButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [retryCount, setRetryCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const handleRetry = useCallback(async () => {
    if (status === "loading" || cooldown > 0) return;

    const attempt = retryCount + 1;
    setRetryCount(attempt);
    setStatus("loading");

    try {
      await Promise.resolve(onRetry());
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        let remaining = Math.ceil(backoffMs / 1000);
        setCooldown(remaining);

        const interval = setInterval(() => {
          remaining -= 1;
          setCooldown(remaining);
          if (remaining <= 0) {
            clearInterval(interval);
            setStatus("idle");
          }
        }, 1000);
      }
    }
  }, [onRetry, status, retryCount, maxRetries, cooldown]);

  const isDisabled = status === "loading" || cooldown > 0 || retryCount >= maxRetries;

  return (
    <Button
      onClick={handleRetry}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={cn("gap-2 min-w-32", className)}
    >
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <CheckCircle className="h-4 w-4 text-primary" />
          </motion.div>
        )}
        {(status === "idle" || status === "error") && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {status === "error" && retryCount >= maxRetries
              ? <AlertCircle className="h-4 w-4 text-destructive" />
              : <RefreshCw className="h-4 w-4" />
            }
          </motion.div>
        )}
      </AnimatePresence>

      <span>
        {status === "loading" && "Carregando..."}
        {status === "success" && "Sucesso!"}
        {cooldown > 0 && `Aguarde ${cooldown}s...`}
        {status === "idle" && cooldown === 0 && label}
        {status === "error" && cooldown === 0 && (retryCount >= maxRetries ? "Falhou" : label)}
      </span>
    </Button>
  );
}

export default RetryButton;
