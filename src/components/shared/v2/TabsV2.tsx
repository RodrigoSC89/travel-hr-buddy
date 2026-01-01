/**
 * TabsV2 - Tabs Padronizados V2
 * ETAPA 2: Componentes V2 - NÃO SUBSTITUI tabs existentes
 */

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export interface TabItemV2 {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsV2Props {
  tabs: TabItemV2[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
}

export function TabsV2({
  tabs,
  defaultTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
  listClassName,
  contentClassName,
}: TabsV2Props) {
  const sizeStyles = {
    sm: 'text-xs h-8',
    md: 'text-sm h-10',
    lg: 'text-base h-12',
  };

  const variantListStyles = {
    default: 'bg-muted/50 p-1 rounded-lg',
    pills: 'bg-transparent gap-2',
    underline: 'bg-transparent border-b border-border rounded-none',
  };

  const variantTriggerStyles = {
    default: 'data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md',
    pills: 'bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4',
    underline: 'rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent',
  };

  return (
    <Tabs 
      defaultValue={defaultTab || tabs[0]?.id} 
      onValueChange={onTabChange}
      className={cn('w-full', className)}
    >
      <TabsList className={cn(
        variantListStyles[variant],
        fullWidth && 'w-full',
        listClassName
      )}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              sizeStyles[size],
              variantTriggerStyles[variant],
              fullWidth && 'flex-1',
              'flex items-center gap-2 transition-all'
            )}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <Badge 
                variant={tab.badgeVariant || 'secondary'} 
                className="text-xs px-1.5 py-0 h-5 min-w-[20px]"
              >
                {tab.badge}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent 
          key={tab.id} 
          value={tab.id}
          className={cn('mt-4', contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default TabsV2;
