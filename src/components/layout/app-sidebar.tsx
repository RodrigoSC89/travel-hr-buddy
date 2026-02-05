/**
 * AppSidebar Component - v8.0 FUSION COMPLETE
 * REFACTORED: Uses SIDEBAR_ROUTES_V8 (10 HUBs otimizados)
 * Total: 68 itens no menu, 154 aliases para compatibilidade
 * Zero funcionalidades perdidas
 */
import React, { useState } from "react";
import { useSidebarActions } from "@/hooks/use-sidebar-actions";
import { 
  ChevronDown,
  LogOut,
  Building2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import nautiLogo from "@/assets/nauti-one-logo.png";
import { usePermissions } from "@/hooks/use-permissions";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Badge } from "@/components/ui/badge";
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

// Import centralized sidebar routes - SINGLE SOURCE OF TRUTH
import { SIDEBAR_ROUTES, type SidebarGroup as SidebarRouteGroup, type SidebarRoute } from "@/config/sidebar-routes";

interface AppSidebarProps {
  activeItem?: string;
  onItemChange?: (item: string) => void;
}

export function AppSidebar({ activeItem, onItemChange }: AppSidebarProps) {
  // Initialize with sections that have defaultOpen
  const [openItems, setOpenItems] = useState<string[]>(() => {
    return SIDEBAR_ROUTES
      .filter(group => group.defaultOpen)
      .map(group => group.title);
  });
  
  // All hooks must be called unconditionally at the top
  const { state, isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { getRoleDisplayName, userRole } = usePermissions();
  const { handleNavigation } = useSidebarActions();
  const { currentBranding } = useOrganization();
  const { signOut } = useAuth();
  
  // Derived state (not hooks) - on mobile, never show collapsed state
  const collapsed = isMobile ? false : state === "collapsed";
  const logoSrc = currentBranding?.logo_url || nautiLogo;

  const handleLogout = async () => {
    await signOut();
    if (isMobile) setOpenMobile(false);
    navigate("/auth");
  };

  const toggleItem = (groupTitle: string) => {
    setOpenItems(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(item => item !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const isItemActive = (path: string) => {
    // Handle paths with query params
    const basePath = path.split('?')[0];
    return location.pathname === basePath || location.pathname === path;
  };

  const handleItemClick = (url: string) => {
    handleNavigation(url);
    onItemChange?.(url);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Render label with emoji
  const renderLabel = (item: SidebarRoute) => {
    if (item.emoji) {
      return `${item.emoji} ${item.label}`;
    }
    return item.label;
  };

  // Render badge if present
  const renderBadge = (item: SidebarRoute) => {
    if (item.badge) {
      return (
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
          {item.badge}
        </Badge>
      );
    }
    return null;
  };

  // Check if user can access route based on roles
  const canAccessRoute = (item: SidebarRoute): boolean => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }
    if (!userRole) return false;
    return item.requiredRoles.includes(userRole as any);
  };

  // Check if user can access group
  const canAccessGroup = (group: SidebarRouteGroup): boolean => {
    if (!group.requiredRoles || group.requiredRoles.length === 0) {
      return true;
    }
    if (!userRole) return false;
    return group.requiredRoles.includes(userRole as any);
  };

  // Filter routes based on user role
  const filteredRoutes = SIDEBAR_ROUTES.filter(group => canAccessGroup(group));

  return (
    <Sidebar 
      className="border-r transition-all duration-300 bg-sidebar"
      collapsible="offcanvas"
    >
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
                Sistema Marítimo v7.0
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Content - SINGLE SOURCE: SIDEBAR_ROUTES */}
      <SidebarContent>
        <ScrollArea className="flex-1 overflow-hidden">
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
                                <button
                                  onClick={() => handleItemClick(item.path)}
                                  className={cn(
                                    "flex h-7 w-full min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground text-sm cursor-pointer",
                                    isItemActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                                  )}
                                  aria-label={`Navegar para ${item.label}`}
                                  aria-current={isItemActive(item.path) ? "page" : undefined}
                                >
                                  {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                                  <span className="ml-2 truncate">{renderLabel(item)}</span>
                                  {renderBadge(item)}
                                </button>
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

          {/* SaaS Manager - Super Admin Only */}
          {userRole === "admin" && (
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
              <p className="font-medium">Você é: {getRoleDisplayName(userRole || "employee")}</p>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
            
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
              <p>Versão 7.0.0</p>
              <p className="mt-1">© 2024-2026 Nauti One</p>
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
