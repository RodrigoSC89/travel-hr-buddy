/**
 * AppSidebar Component
 * REFACTORED: Now consumes centralized routes from src/config/sidebar-routes.ts
 * v4.0.0 - Added logout button and stable hooks
 */
import React, { useState } from "react";
import { useSidebarActions } from "@/hooks/use-sidebar-actions";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3,
  Database,
  FileText, 
  Settings,
  ChevronDown,
  Bell,
  UserCog,
  Building2,
  Ship,
  Zap,
  Activity,
  Brain,
  MessageSquare,
  TestTube,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import nautiLogo from "@/assets/nauti-one-logo.png";
import { usePermissions, Permission } from "@/hooks/use-permissions";
import { useOrganization } from "@/contexts/OrganizationContext";
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
  SidebarMenuSubButton,
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

// Import centralized sidebar routes
import { SIDEBAR_ROUTES, type SidebarGroup as SidebarRouteGroup } from "@/config/sidebar-routes";

// Quick access items that appear at the top
const quickAccessItems = [
  {
    title: "Nauti Command",
    url: "/nautilus-command",
    icon: Brain,
  },
  {
    title: "IA Revolucionária",
    url: "/revolutionary-ai",
    icon: Zap,
  },
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

// Admin-only items
const adminItems = [
  { title: "Painel Admin", url: "/admin", icon: Settings },
  { title: "Backup & Auditoria", url: "/backup-audit", icon: Database },
  { title: "Usuários", url: "/users", icon: Users },
  { title: "Testes & Homologação", url: "/testing", icon: TestTube },
  { title: "Feedback Sistema", url: "/feedback", icon: MessageSquare },
];

interface AppSidebarProps {
  activeItem?: string;
  onItemChange?: (item: string) => void;
}

export function AppSidebar({ activeItem, onItemChange }: AppSidebarProps) {
  // Initialize with all sections collapsed
  const [openItems, setOpenItems] = useState<string[]>([]);
  
  // All hooks must be called unconditionally at the top
  const { state, isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessModule, getRoleDisplayName, userRole } = usePermissions();
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
    return location.pathname === path;
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
  const renderLabel = (item: { label: string; emoji?: string }) => {
    if (item.emoji) {
      return `${item.emoji} ${item.label}`;
    }
    return item.label;
  };

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
                Sistema Corporativo
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <ScrollArea className="flex-1 overflow-hidden">
          {/* Quick Access Section */}
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Acesso Rápido</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {quickAccessItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton 
                      onClick={() => handleItemClick(item.url)}
                      isActive={isItemActive(item.url)}
                      className="w-full justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Main Navigation from SIDEBAR_ROUTES */}
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {SIDEBAR_ROUTES.map((group: SidebarRouteGroup) => (
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
                            <span className={collapsed ? "text-xs" : ""}>{group.title}</span>
                          </div>
                          {!collapsed && (
                            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {group.items.map((item) => (
                              <SidebarMenuSubItem key={`${group.title}-${item.path}`}>
                                <SidebarMenuSubButton 
                                  onClick={() => handleItemClick(item.path)}
                                  isActive={isItemActive(item.path)}
                                  className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                  aria-label={`Navegar para ${item.label}`}
                                  aria-current={isItemActive(item.path) ? "page" : undefined}
                                >
                                  {item.icon && <item.icon className="h-4 w-4" />}
                                  <span className="ml-2">{renderLabel(item)}</span>
                                </SidebarMenuSubButton>
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

          {/* Admin Section */}
          {canAccessModule("admin") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Administração</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton 
                        onClick={() => handleItemClick(item.url)}
                        isActive={isItemActive(item.url)}
                        className="w-full justify-start"
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="ml-2">{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  
                  {/* SaaS Manager - Super Admin Only */}
                  {userRole === "admin" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => navigate("/saas-manager")}
                        isActive={location.pathname === "/saas-manager"}
                        className="w-full justify-start"
                        title={collapsed ? "SaaS Manager" : undefined}
                      >
                        <Building2 className="h-4 w-4" />
                        {!collapsed && <span className="ml-2">SaaS Manager</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Executive Dashboard - Managers */}
          {(userRole === "admin" || userRole === "hr_manager" || userRole === "department_manager") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Executivo</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => handleItemClick("/executive-dashboard")}
                      isActive={isItemActive("/executive-dashboard")}
                      className="w-full justify-start"
                      title={collapsed ? "Dashboard Executivo" : undefined}
                    >
                      <BarChart3 className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">Dashboard Executivo</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => handleItemClick("/system-overview")}
                      isActive={isItemActive("/system-overview")}
                      className="w-full justify-start"
                      title={collapsed ? "Visão Geral" : undefined}
                    >
                      <Activity className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">Visão Geral</span>}
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
              <p>Versão 4.0.0</p>
              <p className="mt-1">© 2024-2025 Nauti One</p>
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
