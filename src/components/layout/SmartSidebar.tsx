/**
 * SmartSidebar Component
 * REFACTORED: Now consumes centralized routes from src/config/sidebar-routes.ts
 * 
 * This ensures a single source of truth for all navigation items.
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Ship
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SIDEBAR_ROUTES, findGroupByPath, type SidebarGroup } from "@/config/sidebar-routes";

interface SmartSidebarProps {
  className?: string;
}

export function SmartSidebar({ className }: SmartSidebarProps) {
  // Initialize with the section that has defaultOpen: true
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const defaultSection = SIDEBAR_ROUTES.find(g => g.defaultOpen);
    return defaultSection?.title || null;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // Auto-open section containing current route
  useEffect(() => {
    const currentGroup = findGroupByPath(location.pathname);
    if (currentGroup) {
      setOpenSection(currentGroup.title);
    } else {
      // If no active route, open the default section
      const defaultSection = SIDEBAR_ROUTES.find(g => g.defaultOpen);
      if (defaultSection && !openSection) {
        setOpenSection(defaultSection.title);
      }
    }
  }, [location.pathname]);

  // Render label with emoji if available
  const renderLabel = (item: { label: string; emoji?: string }) => {
    if (item.emoji) {
      return `${item.emoji} ${item.label}`;
    }
    return item.label;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-background text-sidebar-foreground shadow-lg border border-sidebar-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar-background text-sidebar-foreground h-screen overflow-y-auto shadow-lg transition-transform duration-300 border-r border-sidebar-border",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-bold text-xl flex items-center gap-2 text-sidebar-foreground">
            <Ship className="w-6 h-6 text-primary" />
            🧭 Nautilus One
          </h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Sistema Corporativo</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-2" aria-label="Navegação do sistema">
          {SIDEBAR_ROUTES.map((group: SidebarGroup) => (
            <div key={group.title}>
              <button
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-medium rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  openSection === group.title && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => toggleSection(group.title)}
                aria-expanded={openSection === group.title}
                aria-controls={`nav-section-${group.title.replace(/\s/g, '-')}`}
              >
                <span>{group.title}</span>
                {openSection === group.title ? (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              
              {openSection === group.title && (
                <div 
                  id={`nav-section-${group.title.replace(/\s/g, '-')}`}
                  className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-2"
                >
                  {group.items.map((item) => (
                    <Link
                      to={item.path}
                      key={`${group.title}-${item.path}`}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md transition-colors",
                        isActive(item.path)
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      aria-current={isActive(item.path) ? "page" : undefined}
                    >
                      {renderLabel(item)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border mt-4 text-xs text-sidebar-foreground/60 text-center">
          <p>Nautilus One v3.0.2</p>
          <p className="mt-1">© 2024-2025 Nautilus</p>
        </div>
      </aside>
    </>
  );
}

export default SmartSidebar;
