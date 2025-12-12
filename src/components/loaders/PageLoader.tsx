/**
 * PageLoader - FASE A.4
 * 
 * Loading state para páginas inteiras
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message = "Carregando...", className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-4",
        className
      )}
    >
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
