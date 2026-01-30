/**
 * SmartSidebar Component - PATCH 862
 * Enhanced with: Search, Dynamic Badges, Role-based Filtering
 * 
 * Features:
 * - Command+K search shortcut
 * - Dynamic badge counters (alerts, notifications, tasks)
 * - Role-based route filtering
 * - Responsive mobile menu
 * - PWA Safe Area Support
 * - Body scroll lock when open
 * - GPU-accelerated animations
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Ship,
  Search,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  SIDEBAR_ROUTES, 
  findGroupByPath, 
  getAllRoutes,
  ROLE_HIERARCHY,
  type SidebarGroup, 
  type SidebarRoute,
  type UserRole 
} from "@/config/sidebar-routes";
import { usePermissions } from "@/hooks/use-permissions";
import { useSidebarBadges } from "@/hooks/use-sidebar-badges";

interface SmartSidebarProps {
  className?: string;
}

export function SmartSidebar({ className }: SmartSidebarProps) {
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const defaultSection = SIDEBAR_ROUTES.find(g => g.defaultOpen);
    return defaultSection?.title || null;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, isLoading: roleLoading } = usePermissions();
  const { formatBadge } = useSidebarBadges();

  // Check if user can access a route based on roles
  const canAccessRoute = useCallback((route: SidebarRoute): boolean => {
    if (!route.requiredRoles || route.requiredRoles.length === 0) {
      return true; // No restriction
    }
    
    if (!userRole) return false;
    
    // Check if user has one of the required roles
    return route.requiredRoles.includes(userRole as UserRole);
  }, [userRole]);

  // Check if user can access a group based on roles
  const canAccessGroup = useCallback((group: SidebarGroup): boolean => {
    if (!group.requiredRoles || group.requiredRoles.length === 0) {
      return true;
    }
    
    if (!userRole) return false;
    
    return group.requiredRoles.includes(userRole as UserRole);
  }, [userRole]);

  // Filter routes based on user role and search
  const filteredRoutes = useMemo(() => {
    return SIDEBAR_ROUTES
      .filter(group => canAccessGroup(group))
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          // Role check
          if (!canAccessRoute(item)) return false;
          
          // Search filter
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
              item.label.toLowerCase().includes(query) ||
              item.path.toLowerCase().includes(query) ||
              (item.emoji && item.emoji.includes(query))
            );
          }
          
          return true;
        })
      }))
      .filter(group => group.items.length > 0); // Remove empty groups
  }, [searchQuery, canAccessRoute, canAccessGroup]);

  // Flat search results for quick navigation
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return getAllRoutes()
      .filter(route => canAccessRoute(route))
      .filter(route => {
        const query = searchQuery.toLowerCase();
        return (
          route.label.toLowerCase().includes(query) ||
          route.path.toLowerCase().includes(query)
        );
      })
      .slice(0, 8); // Limit to 8 results
  }, [searchQuery, canAccessRoute]);

  // Command+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("sidebar-search");
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // ESC to clear search
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
        setIsSearchFocused(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  // Navigate to first search result on Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      navigate(searchResults[0].path);
      setSearchQuery("");
      setIsSearchFocused(false);
      closeMobileMenu();
    }
  };

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // CORREÇÃO 1: Auto-close sidebar ao navegar (pathname change)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // CORREÇÃO 2: Bloquear scroll do body quando sidebar está aberta
  useEffect(() => {
    if (isMobileOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileOpen]);

  // CORREÇÃO 4: Click outside fecha sidebar (mousedown + touchstart)
  useEffect(() => {
    if (!isMobileOpen) return;
    
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        setIsMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isMobileOpen]);

  // Auto-open section containing current route
  useEffect(() => {
    const currentGroup = findGroupByPath(location.pathname);
    if (currentGroup) {
      setOpenSection(currentGroup.title);
    } else {
      const defaultSection = SIDEBAR_ROUTES.find(g => g.defaultOpen);
      if (defaultSection && !openSection) {
        setOpenSection(defaultSection.title);
      }
    }
  }, [location.pathname, openSection]);

  // Render label with emoji
  const renderLabel = (item: SidebarRoute) => {
    const label = item.emoji ? `${item.emoji} ${item.label}` : item.label;
    return label;
  };

  // Render dynamic badge
  const renderBadge = (item: SidebarRoute) => {
    // Static badge
    if (item.badge && !item.badgeType) {
      return (
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
          {item.badge}
        </Badge>
      );
    }
    
    // Dynamic badge
    if (item.badgeType && item.badgeType !== 'static') {
      const badgeValue = formatBadge(item.badgeType as 'alerts' | 'notifications' | 'tasks');
      if (badgeValue) {
        const badgeVariant = item.badgeType === "alerts" ? "destructive" : "secondary";
        return (
          <Badge variant={badgeVariant} className="ml-auto text-xs px-1.5 py-0">
            {badgeValue}
          </Badge>
        );
      }
    }
    
    return null;
  };

  return (
    <>
      {/* CORREÇÃO 6: Mobile menu button - Touch target ≥ 44px com safe-area */}
      <button
        className="lg:hidden fixed z-[60] min-h-[44px] min-w-[44px] p-3 rounded-md bg-sidebar-background text-sidebar-foreground shadow-lg border border-sidebar-border touch-manipulation active:scale-95 transition-transform"
        style={{
          top: 'max(env(safe-area-inset-top, 16px), 16px)',
          left: 'max(env(safe-area-inset-left, 16px), 16px)',
        }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* CORREÇÃO 5: Overlay with higher z-index */}
      {isMobileOpen && (
        <div
          ref={overlayRef}
          className="lg:hidden fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* CORREÇÃO 3, 5, 9: Sidebar with safe-area, z-index, GPU transform */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-[80] w-[85vw] max-w-[320px] lg:w-64 lg:max-w-none",
          "bg-sidebar-background text-sidebar-foreground",
          "h-screen shadow-xl lg:shadow-lg",
          "border-r border-sidebar-border flex flex-col",
          // CORREÇÃO 9: GPU-accelerated transform animation
          "transition-transform duration-300 ease-out",
          "will-change-transform backface-hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        style={{
          // CORREÇÃO 3: Safe Area PWA iOS
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        }}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-bold text-xl flex items-center gap-2 text-sidebar-foreground">
            <Ship className="w-6 h-6 text-primary" />
            🧭 Nauti One
          </h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Sistema Corporativo Marítimo</p>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="sidebar-search"
              type="search"
              placeholder="Buscar módulos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onKeyDown={handleSearchKeyDown}
              className="pl-8 pr-12 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              <Command className="w-3 h-3" />K
            </kbd>
          </div>
          
          {/* Quick search results dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((result) => (
                <Link
                  key={result.path}
                  to={result.path}
                  onClick={() => {
                    setSearchQuery("");
                    closeMobileMenu();
                  }}
                  className="block px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  {result.emoji} {result.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CORREÇÃO 10: Navigation with iOS smooth scroll */}
        <nav 
          className="flex-1 space-y-1 p-2 overflow-y-auto overscroll-contain" 
          style={{ WebkitOverflowScrolling: 'touch' }}
          aria-label="Navegação do sistema"
        >
          {roleLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            filteredRoutes.map((group: SidebarGroup) => (
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
                          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                          isActive(item.path)
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                        aria-current={isActive(item.path) ? "page" : undefined}
                      >
                        <span className="truncate">{renderLabel(item)}</span>
                        {renderBadge(item)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* No results message */}
          {searchQuery && filteredRoutes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum módulo encontrado</p>
              <p className="text-xs mt-1">Tente outra busca</p>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60 text-center">
          <p>Nauti One v4.0.0</p>
          <p className="mt-1">© 2024-2025 Nauti One</p>
        </div>
      </aside>
    </>
  );
}

export default SmartSidebar;
