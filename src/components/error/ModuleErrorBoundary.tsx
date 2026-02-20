/**
 * ModuleErrorBoundary - Granular per-module error handling
 * Shows friendly error UI without crashing the whole app
 */
import React, { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  moduleName?: string;
  compact?: boolean;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error(`[ModuleErrorBoundary:${this.props.moduleName ?? "unknown"}]`, {
      message: error.message,
      stack: info.componentStack,
    });
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { moduleName, compact } = this.props;
    const { error, showDetails } = this.state;

    if (compact) {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-muted-foreground flex-1">
            Erro no módulo {moduleName ?? ""}
          </span>
          <Button size="sm" variant="ghost" onClick={this.handleRetry} className="h-7 px-2 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-6 text-center"
      >
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-destructive/10 blur-xl scale-150" />
          <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-1">
          {moduleName ? `Erro em ${moduleName}` : "Erro no módulo"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-5">
          Este módulo encontrou um problema. Os outros módulos continuam funcionando normalmente.
        </p>

        <div className="flex gap-2">
          <Button onClick={this.handleRetry} size="sm" className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </div>

        {/* Dev details toggle */}
        {import.meta.env.DEV && error && (
          <div className="mt-4 w-full max-w-md text-left">
            <button
              onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Detalhes técnicos
            </button>
            {showDetails && (
              <div className={cn(
                "mt-2 p-3 rounded-lg bg-muted/50 border border-border/40 text-xs font-mono",
                "text-destructive whitespace-pre-wrap break-all max-h-32 overflow-auto"
              )}>
                {error.message}
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  }
}

export default ModuleErrorBoundary;
