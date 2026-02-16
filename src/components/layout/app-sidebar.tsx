/**
 * AppSidebar Component - v11.0 World-Class Maritime Platform
 * 
 * Features:
 * - Premium glassmorphism design with Deep Ocean theme
 * - Search with Ctrl+K integration
 * - Pinned/favorite items with star toggle
 * - Recent modules memory
 * - Active state with animated indicator
 * - Collapsible groups with smooth transitions
 * - Version & system status in footer
 */
import React, { useState, useMemo, useCallback } from "react";
import { useSidebarActions } from "@/hooks/use-sidebar-actions";
import { 
  ChevronDown, LogOut, Building2, Search, Star, Clock, X,
  Sparkles, Wifi, WifiOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import nautiLogo from "@/assets/nauti-one-logo-hd.png";
import { usePermissions } from "@/hooks/use-permissions";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
import { SIDEBAR_ROUTES, type SidebarGroup as SidebarRouteGroup, type SidebarRoute, type UserRole } from "@/config/sidebar-routes";

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

/* ─── Badge Color Map ─── */
const badgeColorMap: Record<string, string> = {
  HUB: "bg-primary/20 text-primary border-primary/30",
  NEW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  AI: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  ML: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "3D": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  DEMO: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  IMCA: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "13E": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SMS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SSP: "bg-red-500/20 text-red-400 border-red-500/30",
  SOLAS: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DNV: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "10 AI": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "10": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "11": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  CV: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  GLOBAL: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  IoT: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  KPI: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PDF: "bg-red-500/20 text-red-400 border-red-500/30",
  PSC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

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
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

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
    return item.requiredRoles.includes(userRole as UserRole);
  };

  const canAccessGroup = (group: SidebarRouteGroup): boolean => {
    if (!group.requiredRoles || group.requiredRoles.length === 0) return true;
    if (!userRole) return false;
    return group.requiredRoles.includes(userRole as UserRole);
  };

  const filteredRoutes = SIDEBAR_ROUTES.filter(group => canAccessGroup(group));

  const getBadgeClasses = (badge: string) => {
    return badgeColorMap[badge] || "bg-muted text-muted-foreground border-border";
  };

  // Render single nav item
  const renderNavItem = (item: SidebarRoute & { groupTitle?: string }, showPin = true) => {
    const active = isItemActive(item.path);
    return (
      <button
        key={item.path}
        onClick={() => handleItemClick(item.path)}
        className={cn(
          "relative flex h-9 w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-all duration-200",
          "text-sidebar-foreground/80 outline-none ring-sidebar-ring",
          "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:translate-x-0.5",
          "focus-visible:ring-2 cursor-pointer group/nav-item",
          active && "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20"
        )}
        aria-label={`Navegar para ${item.label}`}
        aria-current={active ? "page" : undefined}
      >
        {/* Active indicator bar */}
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        
        {item.icon && <item.icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")} />}
        <span className="truncate flex-1 text-left">
          {item.emoji ? `${item.emoji} ${item.label}` : item.label}
        </span>
        {item.badge && (
          <Badge 
            variant="outline" 
            className={cn(
              "ml-auto text-[9px] px-1.5 py-0 h-4 font-semibold border",
              getBadgeClasses(item.badge)
            )}
          >
            {item.badge}
          </Badge>
        )}
        {showPin && (
          <button
            onClick={(e) => { e.stopPropagation(); togglePin(item.path); }}
            className={cn(
              "opacity-0 group-hover/nav-item:opacity-100 transition-opacity p-0.5 rounded hover:bg-sidebar-accent",
              isPinned(item.path) && "opacity-100 text-amber-400"
            )}
            aria-label={isPinned(item.path) ? "Desafixar" : "Fixar"}
          >
            <Star className={cn("h-3 w-3", isPinned(item.path) && "fill-current")} />
          </button>
        )}
      </button>
    );
  };

  const moduleCount = allItems.length;

  return (
    <Sidebar className="border-r border-border/50 transition-all duration-300 bg-sidebar" collapsible="offcanvas">
      {/* Header - Premium Design */}
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 p-1.5"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <img 
              src={`${logoSrc}?v=4`}
              alt={currentBranding?.company_name || "Nauti One"}
              className="w-full h-full object-contain"
            />
          </motion.div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold bg-gradient-to-r from-primary via-primary/90 to-cyan-400 bg-clip-text text-transparent truncate tracking-tight">
                NAUTI ONE
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  Maritime Platform
                </span>
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 bg-primary/10 text-primary border-primary/20 font-bold">
                  v11
                </Badge>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Search - Premium */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar módulos... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-sidebar-accent/30 border-sidebar-border/50 focus:border-primary/50 focus:bg-sidebar-accent/50 transition-all rounded-lg"
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
          {/* Module count indicator */}
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary/60" />
              {moduleCount} módulos disponíveis
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              {isOnline ? (
                <><Wifi className="h-3 w-3 text-green-500" /><span className="text-green-500">Online</span></>
              ) : (
                <><WifiOff className="h-3 w-3 text-amber-500" /><span className="text-amber-500">Offline</span></>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <SidebarContent>
        <ScrollArea className="flex-1 overflow-hidden">
          {/* Search results */}
          {filteredItems && !collapsed && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs text-primary/80">
                🔍 {filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-0.5 px-2">
                  <AnimatePresence>
                    {filteredItems.map((item, i) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        {renderNavItem(item)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
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
              <SidebarGroupLabel className="text-xs flex items-center gap-1 text-amber-400/80">
                <Star className="h-3 w-3 fill-amber-400/60" /> Fixados
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
              <SidebarGroupLabel className="text-xs flex items-center gap-1 text-muted-foreground">
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
              {!collapsed && <SidebarGroupLabel className="text-xs">Navegação</SidebarGroupLabel>}
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
                            className="w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-sidebar-accent/60 transition-all rounded-lg"
                            aria-label={`Expandir ${group.title}`}
                          >
                            <div className="flex items-center">
                              <span className={cn(collapsed ? "text-xs" : "font-semibold text-sm")}>{group.title}</span>
                            </div>
                            {!collapsed && (
                              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 text-muted-foreground" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent className="animate-in slide-in-from-top-1 duration-200">
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
              {!collapsed && <SidebarGroupLabel className="text-xs">Admin</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => handleItemClick("/saas-manager")}
                      isActive={isItemActive("/saas-manager")}
                      className="w-full justify-start rounded-lg"
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

      {/* Footer - Premium */}
      <SidebarFooter className="p-3 border-t border-border/50">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground/80">{getRoleDisplayName(userRole || "employee")}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pt-2 border-t border-border/30">
              <span>v11.0.0</span>
              <span>© 2024-2026 Nauti One</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
