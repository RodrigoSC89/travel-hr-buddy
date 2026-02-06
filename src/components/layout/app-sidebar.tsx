/**
 * AppSidebar Component - v8.0 Tier-1 UX
 * 
 * Features:
 * - Search across all modules (Ctrl+K integration)
 * - Pinned/favorite items
 * - Recent modules memory
 * - Correct version display
 * - Collapsible groups with active state
 */
import React, { useState, useMemo, useCallback } from "react";
import { useSidebarActions } from "@/hooks/use-sidebar-actions";
import { 
  ChevronDown, LogOut, Building2, Search, Star, Clock, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import nautiLogo from "@/assets/nauti-one-logo.png";
import { usePermissions } from "@/hooks/use-permissions";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SIDEBAR_ROUTES, type SidebarGroup as SidebarRouteGroup, type SidebarRoute } from "@/config/sidebar-routes";

/* ─── Local Storage Keys ─── */
const PINNED_KEY = "nauti-sidebar-pinned";
const RECENT_KEY = "nauti-sidebar-recent";
const MAX_RECENT = 5;

function usePinnedItems() {
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(PINNED_KEY) || "[]");
    } catch { return []; }
  });

  const togglePin = useCallback((path: string) => {
    setPinned(prev => {
      const next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      localStorage.setItem(PINNED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isPinned = useCallback((path: string) => pinned.includes(path), [pinned]);

  return { pinned, togglePin, isPinned };
}

function useRecentItems() {
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch { return []; }
  });

  const addRecent = useCallback((path: string) => {
    setRecent(prev => {
      const next = [path, ...prev.filter(p => p !== path)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recent, addRecent };
}

/* ─── Main Component ─── */

interface AppSidebarProps {
  activeItem?: string;
  onItemChange?: (item: string) => void;
}

export function AppSidebar({ activeItem, onItemChange }: AppSidebarProps) {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    return SIDEBAR_ROUTES.filter(group => group.defaultOpen).map(group => group.title);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const { state, isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { getRoleDisplayName, userRole } = usePermissions();
  const { handleNavigation } = useSidebarActions();
  const { currentBranding } = useOrganization();
  const { signOut } = useAuth();
  const { pinned, togglePin, isPinned } = usePinnedItems();
  const { recent, addRecent } = useRecentItems();

  const collapsed = isMobile ? false : state === "collapsed";
  const logoSrc = currentBranding?.logo_url || nautiLogo;

  const handleLogout = async () => {
    await signOut();
    if (isMobile) setOpenMobile(false);
    navigate("/auth");
  };

  const toggleItem = (groupTitle: string) => {
    setOpenItems(prev => 
      prev.includes(groupTitle) ? prev.filter(item => item !== groupTitle) : [...prev, groupTitle]
    );
  };

  const isItemActive = (path: string) => {
    const basePath = path.split('?')[0];
    const currentBase = location.pathname;
    return currentBase === basePath;
  };

  const handleItemClick = (url: string) => {
    handleNavigation(url);
    addRecent(url);
    onItemChange?.(url);
    setSearchQuery("");
    if (isMobile) setOpenMobile(false);
  };

  // All items flat for search
  const allItems = useMemo(() => {
    return SIDEBAR_ROUTES.flatMap(group => 
      group.items.map(item => ({ ...item, groupTitle: group.title }))
    );
  }, []);

  // Search filtered items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.label.toLowerCase().includes(q) || 
      item.path.toLowerCase().includes(q) ||
      item.badge?.toLowerCase().includes(q) ||
      item.groupTitle.toLowerCase().includes(q)
    );
  }, [searchQuery, allItems]);

  // Pinned items data
  const pinnedItems = useMemo(() => {
    return allItems.filter(item => isPinned(item.path));
  }, [allItems, isPinned]);

  // Recent items data
  const recentItems = useMemo(() => {
    return recent.map(path => allItems.find(item => item.path === path)).filter(Boolean) as typeof allItems;
  }, [recent, allItems]);

  const canAccessRoute = (item: SidebarRoute): boolean => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    if (!userRole) return false;
    return item.requiredRoles.includes(userRole as any);
  };

  const canAccessGroup = (group: SidebarRouteGroup): boolean => {
    if (!group.requiredRoles || group.requiredRoles.length === 0) return true;
    if (!userRole) return false;
    return group.requiredRoles.includes(userRole as any);
  };

  const filteredRoutes = SIDEBAR_ROUTES.filter(group => canAccessGroup(group));

  // Render single nav item
  const renderNavItem = (item: SidebarRoute & { groupTitle?: string }, showPin = true) => (
    <button
      key={item.path}
      onClick={() => handleItemClick(item.path)}
      className={cn(
        "flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2 text-sm transition-colors",
        "text-sidebar-foreground outline-none ring-sidebar-ring",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2 cursor-pointer group/nav-item",
        isItemActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      )}
      aria-label={`Navegar para ${item.label}`}
      aria-current={isItemActive(item.path) ? "page" : undefined}
    >
      {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
      <span className="truncate flex-1 text-left">
        {item.emoji ? `${item.emoji} ${item.label}` : item.label}
      </span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">
          {item.badge}
        </Badge>
      )}
      {showPin && (
        <button
          onClick={(e) => { e.stopPropagation(); togglePin(item.path); }}
          className={cn(
            "opacity-0 group-hover/nav-item:opacity-100 transition-opacity p-0.5 rounded hover:bg-sidebar-accent",
            isPinned(item.path) && "opacity-100 text-primary"
          )}
          aria-label={isPinned(item.path) ? "Desafixar" : "Fixar"}
        >
          <Star className={cn("h-3 w-3", isPinned(item.path) && "fill-current")} />
        </button>
      )}
    </button>
  );

  return (
    <Sidebar className="border-r transition-all duration-300 bg-sidebar" collapsible="offcanvas">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <img 
              src={`${logoSrc}?v=4`}
              alt={currentBranding?.company_name || "Nauti One"}
              className="w-10 h-10 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate">
                NAUTI ONE
              </h1>
              <span className="text-xs text-muted-foreground font-medium truncate">
                Maritime Platform v8.0
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar módulos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="pl-8 h-8 text-xs bg-sidebar-accent/50 border-sidebar-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <SidebarContent>
        <ScrollArea className="flex-1 overflow-hidden">
          {/* Search results */}
          {filteredItems && !collapsed && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">
                {filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-0.5 px-2">
                  {filteredItems.map(item => renderNavItem(item))}
                  {filteredItems.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                      Nenhum módulo encontrado
                    </p>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Pinned items */}
          {!filteredItems && pinnedItems.length > 0 && !collapsed && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs flex items-center gap-1">
                <Star className="h-3 w-3" /> Fixados
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-0.5 px-2">
                  {pinnedItems.map(item => renderNavItem(item, false))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Recent items */}
          {!filteredItems && recentItems.length > 0 && !collapsed && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" /> Recentes
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-0.5 px-2">
                  {recentItems.slice(0, 3).map(item => renderNavItem(item))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Main navigation */}
          {!filteredItems && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Navegação</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredRoutes.map((group: SidebarRouteGroup) => (
                    <Collapsible 
                      key={group.title}
                      open={openItems.includes(group.title)}
                      onOpenChange={() => toggleItem(group.title)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className="w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`Expandir ${group.title}`}
                          >
                            <div className="flex items-center">
                              <span className={collapsed ? "text-xs" : "font-medium"}>{group.title}</span>
                            </div>
                            {!collapsed && (
                              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {group.items.filter(canAccessRoute).map((item) => (
                                <SidebarMenuSubItem key={`${group.title}-${item.path}`}>
                                  {renderNavItem(item)}
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* SaaS Manager - Super Admin Only */}
          {userRole === "admin" && !filteredItems && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Admin</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => handleItemClick("/saas-manager")}
                      isActive={isItemActive("/saas-manager")}
                      className="w-full justify-start"
                      title={collapsed ? "SaaS Manager" : undefined}
                    >
                      <Building2 className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">SaaS Manager</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </ScrollArea>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">{getRoleDisplayName(userRole || "employee")}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
              <p>v8.0.0 • © 2024-2026</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
