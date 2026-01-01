/**
 * StandardModuleWrapper - Wrapper de Padronização Visual
 * ETAPA 5: Padronização Visual (Via Wrappers, Não Modificação Direta)
 * 
 * Este wrapper adiciona camada de padronização SEM modificar módulos originais
 */

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface StandardModuleWrapperProps {
  children: ReactNode;
  moduleName: string;
  moduleIcon?: LucideIcon;
  version?: string;
  preserveOriginalLayout?: boolean;
  showVersionBadge?: boolean;
  className?: string;
}

export function StandardModuleWrapper({
  children,
  moduleName,
  moduleIcon: Icon,
  version = 'v1.0',
  preserveOriginalLayout = true,
  showVersionBadge = false,
  className,
}: StandardModuleWrapperProps) {
  if (preserveOriginalLayout) {
    // Modo preservação: apenas adiciona melhorias cosméticas leves
    return (
      <div className={cn('relative', className)}>
        {/* Badge de versão (opcional) */}
        {showVersionBadge && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="text-xs">
              {moduleName} {version}
            </Badge>
          </div>
        )}
        
        {/* Conteúdo original intacto */}
        {children}
      </div>
    );
  }

  // Modo layout novo (opt-in): aplica padronização completa
  return (
    <div className={cn(
      'min-h-screen bg-background',
      className
    )}>
      {/* Header padronizado */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold">{moduleName}</h1>
              <Badge variant="outline" className="text-xs">{version}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default StandardModuleWrapper;
