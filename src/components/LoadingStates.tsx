/**
 * Loading States - Otimizado para conexões lentas
 * Fornece feedback visual durante carregamento de módulos
 */

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export const PageSkeleton = () => (
  <div className="space-y-6 p-6 animate-in fade-in duration-300">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

export const ModuleSkeleton = () => (
  <div className="space-y-4 p-6 animate-in fade-in duration-300">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = "Carregando módulo..." 
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      <div className="space-y-2">
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">
          Otimizado para conexões lentas
        </p>
      </div>
    </div>
  </div>
);

export const MinimalLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Loading component específico para offshore
export const OffshoreLoader: React.FC<{ 
  module?: string;
  progress?: number;
}> = ({ module, progress }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-6 max-w-md px-6">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        {progress !== undefined && (
          <div className="absolute -bottom-8 left-0 right-0">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2 pt-4">
        <p className="text-lg font-medium">
          {module ? `Carregando ${module}...` : "Carregando Nautilus One..."}
        </p>
        <p className="text-sm text-muted-foreground">
          Otimizado para internet lenta offshore
        </p>
        {progress !== undefined && (
          <p className="text-xs text-muted-foreground font-mono">
            {progress}% carregado
          </p>
        )}
      </div>
    </div>
  </div>
);
