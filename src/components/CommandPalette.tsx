// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAUTILUS_MODULES } from "@/lib/registry/modules-definition";
import { ModuleDefinition } from "@/lib/registry/ModuleRegistry";
import { 
  Home, Settings, Search, Zap, Brain, Ship, 
  Activity, FileText, Users, Shield, Workflow 
} from "lucide-react";

const quickActions = [
  { id: "home", label: "Ir para Dashboard", icon: Home, action: "/" },
  { id: "settings", label: "Configurações", icon: Settings, action: "/settings" },
  { id: "operations", label: "Operations Dashboard", icon: Ship, action: "/operations-dashboard" },
  { id: "ai-insights", label: "AI Insights Dashboard", icon: Brain, action: "/ai-insights" },
  { id: "nautilus-llm", label: "Nautilus LLM Core", icon: Brain, action: "/mission-control/llm" },
  { id: "ai-command", label: "AI Command Center", icon: Brain, action: "/mission-control/ai-command" },
  { id: "workflows", label: "Workflow Engine", icon: Workflow, action: "/mission-control/workflows" },
  { id: "autonomy", label: "Autonomy Console", icon: Zap, action: "/mission-control/autonomy" },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar módulos, ações ou comandos..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Ações Rápidas">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.id}
                onSelect={() => handleSelect(() => navigate(action.action))}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading="Módulos do Sistema">
          {NAUTILUS_MODULES.slice(0, 15).map((module: ModuleDefinition) => (
            <CommandItem
              key={module.id}
              onSelect={() => handleSelect(() => navigate(module.path))}
            >
              <Ship className="mr-2 h-4 w-4" />
              <span>{module.name}</span>
              {module.aiEnabled && (
                <Brain className="ml-auto h-3 w-3 text-primary" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
