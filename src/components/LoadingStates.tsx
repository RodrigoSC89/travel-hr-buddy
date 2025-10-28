/**
 * Loading States - Design Profissional para Conexões Lentas
 * Mantém identidade visual durante carregamento
 */

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Ship, Waves } from "lucide-react";

export const PageSkeleton = () => (
  <div className="space-y-6 p-6 animate-in fade-in duration-500">
    <div className="space-y-2">
      <Skeleton className="h-10 w-80 bg-gradient-to-r from-primary/20 to-primary/10" />
      <Skeleton className="h-5 w-[600px] bg-muted/50" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-primary/10">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <Card className="border-primary/10">
      <CardHeader>
        <Skeleton className="h-7 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full rounded-lg" />
      </CardContent>
    </Card>
  </div>
);

export const ModuleSkeleton = () => (
  <div className="space-y-6 p-6 animate-in fade-in duration-500">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-[500px]" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border-primary/10">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Loading profissional com branding Nautilus
export const OffshoreLoader: React.FC<{ 
  module?: string;
  progress?: number;
}> = ({ module, progress }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
    <div className="text-center space-y-8 max-w-md px-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Ship className="h-10 w-10 text-primary/30 animate-pulse" />
        </div>
        <Loader2 className="h-20 w-20 animate-spin text-primary mx-auto" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Nautilus One
          </h2>
        </div>
        
        <div className="space-y-2">
          <p className="text-base font-medium text-foreground">
            {module ? `Carregando ${module}` : "Inicializando sistema"}
          </p>
          <p className="text-sm text-muted-foreground">
            Otimizado para conexões offshore
          </p>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {progress}% concluído
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const MinimalLoader = () => (
  <div className="flex items-center justify-center p-12">
    <div className="flex items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  </div>
);

export const LoadingSpinner = OffshoreLoader;
