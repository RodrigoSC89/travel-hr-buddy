/**
 * TabTriggerWithModules - Tab trigger com dropdown de módulos relacionados
 * Substitui a aba separada "📦 Módulos" por dropdowns contextuais nas tabs existentes
 * 
 * Cada tab principal pode ter sub-módulos acessíveis via ícone de "+"
 */
import React, { useState, useRef, useEffect } from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
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
}

export function TabTriggerWithModules({
  tabId,
  label,
  icon: Icon,
  modules = [],
  activeColor = 'bg-primary text-primary-foreground',
  onModuleSelect,
}: TabTriggerWithModulesProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

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
    <div className="relative" ref={dropdownRef}>
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
            setDropdownOpen(!dropdownOpen);
          }}
          className={cn(
            "h-8 px-1.5 rounded-r-md border-l border-border/30 flex items-center",
            "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            "transition-colors"
          )}
          title={`${modules.length} módulos relacionados`}
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", dropdownOpen && "rotate-180")} />
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[220px] max-h-[320px] overflow-y-auto rounded-lg border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="p-1.5">
            <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {modules.length} módulos
            </div>
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => {
                  onModuleSelect?.(mod.id);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm hover:bg-accent/80 transition-colors text-left group"
              >
                <mod.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{mod.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{mod.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TabTriggerWithModules;
