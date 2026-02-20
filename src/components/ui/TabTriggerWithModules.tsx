/**
 * TabTriggerWithModules - Tab trigger com botão para abrir Module Launcher
 * v2.0 - Substituiu dropdown por modal premium
 */
import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AbsorbedModule } from '@/components/ui/HubModulesBrowser';
import { cn } from '@/lib/utils';

interface TabTriggerWithModulesProps {
  tabId: string;
  label: string;
  icon: LucideIcon;
  modules?: AbsorbedModule[];
  activeColor?: string;
  onModuleSelect?: (moduleId: string) => void;
  onOpenLauncher?: () => void;
}

export function TabTriggerWithModules({
  tabId,
  label,
  icon: Icon,
  modules = [],
  activeColor = 'bg-primary text-primary-foreground',
  onModuleSelect,
  onOpenLauncher,
}: TabTriggerWithModulesProps) {
  if (modules.length === 0) {
    return (
      <TabsTrigger
        value={tabId}
        className={cn("gap-2", `data-[state=active]:${activeColor}`)}
      >
        <Icon className="h-4 w-4" />
        {label}
      </TabsTrigger>
    );
  }

  return (
    <div className="flex items-center">
      <TabsTrigger
        value={tabId}
        className={cn("gap-2 rounded-r-none pr-1.5", `data-[state=active]:${activeColor}`)}
      >
        <Icon className="h-4 w-4" />
        {label}
      </TabsTrigger>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenLauncher?.();
        }}
        className={cn(
          "h-8 px-1.5 rounded-r-md border-l border-border/30 flex items-center",
          "bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary",
          "transition-colors"
        )}
        title={`${modules.length} módulos especializados`}
      >
        <Grid3X3 className="h-3 w-3" />
      </button>
    </div>
  );
}

export default TabTriggerWithModules;
