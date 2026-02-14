import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Ship, 
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getActiveModules, getRoutableModules, ModuleDefinition } from "@/modules/registry";

/**
 * PATCH 178.0 - Dynamic Navigation Refactor & UI Cleanup
 * 
 * Features:
 * - Dynamic module loading from registry
 * - Status indicators: ✅ complete, 🟡 partial, ❌ inactive
 * - Collapsible sections for module categories
 * - Filter by implementation status
 * - Only shows functional/routable modules
 */

interface DynamicNavigationProps {
  className?: string;
}

type FilterMode = "all" | "complete" | "partial" | "incomplete";

export function DynamicNavigation({ className }: DynamicNavigationProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["core", "operations"]));
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const location = useLocation();

  const routableModules = getRoutableModules();

  // Group modules by category
  const groupedModules = routableModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleDefinition[]>);

  // Filter modules based on filter mode
  const filterModules = (modules: ModuleDefinition[]) => {
    if (filterMode === "all") return modules;
    
    return modules.filter(module => {
      if (filterMode === "complete") return module.completeness === "100%";
      if (filterMode === "partial") return module.completeness === "partial";
      if (filterMode === "incomplete") return module.status === "incomplete" || module.completeness === "broken";
      return true;
    });
  };

  const toggleSection = (category: string) => {
    const newSections = new Set(openSections);
    if (newSections.has(category)) {
      newSections.delete(category);
    } else {
      newSections.add(category);
    }
    setOpenSections(newSections);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getStatusIcon = (module: ModuleDefinition) => {
    if (module.completeness === "100%") {
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    } else if (module.completeness === "partial") {
      return <AlertCircle className="w-3 h-3 text-yellow-400" />;
    } else if (module.completeness === "broken" || module.status === "incomplete") {
      return <XCircle className="w-3 h-3 text-red-400" />;
    }
    return null;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      core: "🎯 Core Systems",
      operations: "⚓ Operations",
      compliance: "✅ Compliance",
      intelligence: "🧠 Intelligence",
      emergency: "🚨 Emergency",
      logistics: "📦 Logistics",
      planning: "📋 Planning",
      hr: "👥 Human Resources",
      maintenance: "🔧 Maintenance",
      connectivity: "🔌 Connectivity",
      workspace: "💼 Workspace",
      assistants: "🤖 AI Assistants",
      finance: "💰 Finance",
      documents: "📄 Documents",
      configuration: "⚙️ Configuration",
      features: "✨ Features"
    };
    return labels[category] || category.toUpperCase();
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const getFilterLabel = (mode: FilterMode) => {
    const labels: Record<FilterMode, string> = {
      all: "All Modules",
      complete: "✅ Complete",
      partial: "🟡 Partial",
      incomplete: "❌ Incomplete"
    };
    return labels[mode];
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-zinc-900 text-white shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar dark:bg-sidebar text-sidebar-foreground h-screen overflow-y-auto shadow-lg transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-bold text-xl flex items-center gap-2">
            <Ship className="w-6 h-6 text-primary" />
            🧭 Nauti One
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Sistema Corporativo - v177.0</p>
        </div>

        {/* Filter Controls */}
        <div className="p-3 border-b border-sidebar-border">
          <label className="text-xs text-muted-foreground mb-2 block">Filter by Status:</label>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="w-full p-2 text-sm bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground"
          >
            <option value="all">All Modules</option>
            <option value="complete">✅ Complete Only</option>
            <option value="partial">🟡 Partial Only</option>
            <option value="incomplete">❌ Incomplete Only</option>
          </select>
        </div>

        <nav className="space-y-1 p-2">
          {Object.entries(groupedModules).map(([category, modules]) => {
            const filteredModules = filterModules(modules);
            if (filteredModules.length === 0) return null;

            const isOpen = openSections.has(category);

            return (
              <div key={category} className="mb-2">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sm font-semibold"
                >
                  <span>{getCategoryLabel(category)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">({filteredModules.length})</span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-1 space-y-1">
                    {filteredModules.map((module) => (
                      <Link
                        key={module.id}
                        to={module.route || "#"}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center justify-between px-4 py-2 rounded-md text-sm transition-colors",
                          isActive(module.route || "")
                            ? "bg-primary text-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <span className="truncate">{module.name}</span>
                        {getStatusIcon(module)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Status Legend */}
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-400">
          <div className="font-semibold mb-2">Status Legend:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Complete & Functional</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-yellow-400" />
              <span>Partially Implemented</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-3 h-3 text-red-400" />
              <span>Incomplete/Broken</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
