/**
 * SubTabSelector v2 - Premium sub-tab navigation with animations
 * Used across all Mega-Hubs for grouped tab navigation
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SubTabOption {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
}

interface SubTabSelectorProps {
  options: SubTabOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SubTabSelector({ options, active, onChange, className, size = 'md' }: SubTabSelectorProps) {
  return (
    <div 
      className={cn(
        "inline-flex gap-1 p-1 bg-muted/60 rounded-xl border border-border/30 backdrop-blur-sm flex-wrap",
        className
      )} 
      data-testid="subtab-selector"
      role="tablist"
    >
      {options.map(opt => {
        const isActive = active === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg font-medium transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              "active:scale-[0.97] touch-manipulation",
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              isActive 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground/80 hover:bg-muted/50'
            )}
          >
            {/* Active background with layout animation */}
            {isActive && (
              <motion.div
                layoutId="subtab-active-bg"
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/40"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            {/* Content */}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className={cn("shrink-0", size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
              <span className="whitespace-nowrap">{opt.label}</span>
              {opt.badge && (
                <span className={cn(
                  "inline-flex items-center justify-center rounded-full font-bold shrink-0",
                  size === 'sm' ? 'h-4 min-w-4 px-1 text-[8px]' : 'h-[18px] min-w-[18px] px-1 text-[9px]',
                  isActive 
                    ? 'bg-primary/15 text-primary' 
                    : 'bg-muted-foreground/10 text-muted-foreground'
                )}>
                  {opt.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SubTabSelector;
