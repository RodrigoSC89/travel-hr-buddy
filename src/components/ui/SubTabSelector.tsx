/**
 * SubTabSelector - Reusable sub-tab navigation within grouped tabs
 * Extracted from AIMegaHub for use across all Mega-Hubs
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface SubTabOption {
  id: string;
  label: string;
}

interface SubTabSelectorProps {
  options: SubTabOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SubTabSelector({ options, active, onChange, className }: SubTabSelectorProps) {
  return (
    <div className={cn("flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit", className)} data-testid="subtab-selector">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-md transition-colors",
            active === opt.id 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default SubTabSelector;
