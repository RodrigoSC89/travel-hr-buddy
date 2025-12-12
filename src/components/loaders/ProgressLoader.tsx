/**
 * ProgressLoader - FASE A.4
 * 
 * Loading state com progress bar para operações longas
 */

import { memo, memo, useEffect, useState, useCallback } from "react";;;
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressLoaderProps {
  /** Mensagem de carregamento */
  message?: string;
  /** Timeout em segundos (mostra aviso se exceder) */
  timeout?: number;
  /** Callback de timeout */
  onTimeout?: () => void;
  /** Classe CSS adicional */
  className?: string;
}

export const ProgressLoader = memo(function({
  message = "Carregando...",
  timeout = 10,
  onTimeout,
  className,
}: ProgressLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (timeout * 10);
        if (next >= 100) {
          setIsTimeout(true);
          onTimeout?.();
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeout, onTimeout]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      <Progress value={progress} className="w-64" />
      {isTimeout && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          ⚠️ Conexão lenta detectada. Continue aguardando...
        </p>
      )}
    </div>
  );
}
