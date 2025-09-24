import React, { useState } from 'react';
import { useSidebarActions } from '@/hooks/use-sidebar-actions';
import { 
  LayoutDashboard, 
  Users, 
  Plane, 
  Hotel, 
  BarChart3, 
  Calendar, 
  FileText, 
  Settings,
  ChevronDown,
  MessageSquare,
  Bell,
  UserCog,
  Ship,
  Anchor,
  Bot,
  Zap,
  Target,
  Brain,
  Mic,
  Eye,
  Shield,
  Radio,
  Trophy,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import nautilousLogo from '@/assets/nautilus-logo.jpg';
import { usePermissions } from "@/hooks/use-permissions";

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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Navigation items with improved structure
const navigationItems = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: LayoutDashboard,
    alwaysVisible: true
  },
  {
    title: "Administração",
    url: "admin",
    icon: UserCog,
    requiresRole: ["admin", "hr_manager"] as const,
  },
  {
    title: "RH",
    url: "hr", 
    icon: Users,
    permission: "certificates" as const,
  },
  {
    title: "Sistema Marítimo",
    url: "maritime",
    icon: Ship,
    items: [
      {
        title: "Dashboard Marítimo",
        url: "maritime",
        icon: Ship,
      },
      {
        title: "Gestão de Frota",
        url: "fleet-management",
        icon: Anchor,
      },
      {
        title: "Tripulação",
        url: "crew-management",
        icon: Users,
      },
      {
        title: "Certificações",
        url: "maritime-certifications",
        icon: UserCog,
      },
    ],
  },
  {
    title: "IA & Inovação",
    url: "innovation",
    icon: Bot,
    items: [
      {
        title: "Assistente IA",
        url: "innovation",
        icon: Bot,
      },
      {
        title: "Análise Preditiva",
        url: "predictive-analytics",
        icon: Brain,
      },
      {
        title: "Gamificação",
        url: "gamification",
        icon: Trophy,
      },
      {
        title: "Realidade Aumentada",
        url: "ar",
        icon: Eye,
      },
      {
        title: "IoT Dashboard",
        url: "iot",
        icon: Radio,
      },
      {
        title: "Blockchain",
        url: "blockchain",
        icon: Shield,
      },
    ],
  },
  {
    title: "Portal do Funcionário",
    url: "portal",
    icon: User,
  },
  {
    title: "Viagens",
    url: "travel",
    icon: Plane,
    items: [
      {
        title: "Voos",
        url: "flights",
        icon: Plane,
      },
      {
        title: "Hotéis",
        url: "hotels", 
        icon: Hotel,
      },
    ],
  },
  {
    title: "Alertas de Preços",
    url: "price-alerts",
    icon: Bell,
  },
  {
    title: "Analytics",
    url: "analytics",
    icon: BarChart3,
    permission: "analytics" as const,
  },
  {
    title: "Reservas",
    url: "reservations",
    icon: Calendar,
  },
  {
    title: "Relatórios",
    url: "reports",
    icon: FileText,
    permission: "reports" as const,
  },
  {
    title: "Comunicação",
    url: "communication",
    icon: MessageSquare,
  },
  {
    title: "Configurações",
    url: "settings",
    icon: Settings,
  },
  {
    title: "Otimização",
    url: "optimization",
    icon: Zap,
  },
  {
    title: "Centro Estratégico",
    url: "strategic",
    icon: Target,
    permission: "analytics" as const,
  },
  {
    title: "Assistente de Voz",
    url: "voice",
    icon: Mic,
  },
];

interface AppSidebarProps {
  activeItem?: string;
  onItemChange?: (item: string) => void;
}

export function AppSidebar({ activeItem, onItemChange }: AppSidebarProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { canAccessModule, hasPermission, getRoleDisplayName, userRole } = usePermissions();
  const { handleNavigation } = useSidebarActions();

  const toggleItem = (itemUrl: string) => {
    setOpenItems(prev => 
      prev.includes(itemUrl) 
        ? prev.filter(item => item !== itemUrl)
        : [...prev, itemUrl]
    );
  };

  const isItemActive = (moduleKey: string) => {
    return activeItem === moduleKey;
  };

  const canAccessItem = (item: any) => {
    if (item.alwaysVisible) return true;
    
    // Verificar se requer role específico
    if (item.requiresRole) {
      return userRole && item.requiresRole.includes(userRole);
    }
    
    // Verificar permissão específica
    if (item.permission) {
      return hasPermission(item.permission, 'read');
    }
    
    return true;
  };

  const handleItemClick = (item: string) => {
    handleNavigation(item);
    onItemChange?.(item);
  };

  // Determinar se o grupo de navegação principal deve estar aberto
  const isMainGroupOpen = navigationItems.some(item => 
    item.items ? item.items.some(subItem => isItemActive(subItem.url)) : isItemActive(item.url)
  );

  return (
    <Sidebar 
      className={`border-r transition-all duration-300`}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm flex-shrink-0">
            <img 
              src={nautilousLogo} 
              alt="Nautilus One" 
              className="w-5 h-5 object-cover rounded"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate">
                NAUTILUS
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
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // Verificar permissões para exibir o item
                if (!canAccessItem(item)) {
                  return null;
                }

                // Item com subitens
                if (item.items) {
                  return (
                    <Collapsible 
                      key={item.url}
                      open={openItems.includes(item.url)}
                      onOpenChange={() => toggleItem(item.url)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between">
                            <div className="flex items-center">
                              <item.icon className="h-4 w-4" />
                              {!collapsed && <span className="ml-2">{item.title}</span>}
                            </div>
                            {!collapsed && (
                              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton 
                                    onClick={() => handleItemClick(subItem.url)}
                                    isActive={isItemActive(subItem.url)}
                                    className="w-full"
                                  >
                                    <subItem.icon className="h-4 w-4" />
                                    <span className="ml-2">{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Item simples
                return (
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
                );
              })}

              {/* Administração - Apenas para admins e gerentes de RH */}
              {canAccessModule('admin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleItemClick("admin")}
                    isActive={isItemActive("admin")}
                    className="w-full justify-start"
                    title={collapsed ? "Administração" : undefined}
                  >
                    <UserCog className="h-4 w-4" />
                    {!collapsed && <span className="ml-2">Administração</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Dashboard Executivo - Para admins e gerentes */}
              {(userRole === 'admin' || userRole === 'hr_manager' || userRole === 'department_manager') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleItemClick("executive")}
                    isActive={isItemActive("executive")}
                    className="w-full justify-start"
                    title={collapsed ? "Dashboard Executivo" : undefined}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span className="ml-2">Dashboard Executivo</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border">
        {!collapsed && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Você é: {getRoleDisplayName(userRole || 'employee')}</p>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              <p>Versão 2.1.0</p>
              <p className="mt-1">© 2024 Nautilus</p>
            </div>
          </div>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}