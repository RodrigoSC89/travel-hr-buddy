/**
 * KPI Error Boundary Component
 * PATCH 622 - Isolated error handling for dashboard metrics
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  kpiName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class KPIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`[KPIErrorBoundary] Error in ${this.props.kpiName}:`, error, { componentStack: errorInfo.componentStack });
    
    // Optional: Log to analytics/monitoring service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <div>
                <p className="text-sm font-medium">Erro no {this.props.kpiName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Não foi possível carregar este indicador
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.handleReset}
                className="mt-2"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
