import { useState } from "react";
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
  Home,
  MessageSquare,
  Bell,
  UserCog
} from "lucide-react";
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
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "RH",
    url: "hr", 
    icon: Users,
    permission: "certificates" as const,
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
];

interface AppSidebarProps {
  activeItem?: string;
  onItemChange?: (item: string) => void;
}

export function AppSidebar({ activeItem, onItemChange }: AppSidebarProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { canAccessModule, hasPermission, userRole } = usePermissions();

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
    if (item.permission) {
      return hasPermission(item.permission, 'read');
    }
    return true;
  };

  return (
    <Sidebar className="border-r">
      {/* Logo Header */}
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <img 
              src={nautilousLogo} 
              alt="Nautilus One" 
              className="w-6 h-6 object-cover rounded"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              NAUTILUS
            </h1>
            <span className="text-xs text-muted-foreground font-medium">
              Sistema Corporativo
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
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
                          <SidebarMenuButton className="w-full">
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.url}>
                                <SidebarMenuSubButton 
                                  onClick={() => onItemChange?.(subItem.url)}
                                  isActive={isItemActive(subItem.url)}
                                >
                                  <subItem.icon />
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Item simples
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton 
                      onClick={() => onItemChange?.(item.url)}
                      isActive={isItemActive(item.url)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Administração - Apenas para admins e gerentes de RH */}
              {canAccessModule('admin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onItemChange?.("admin")}
                    isActive={isItemActive("admin")}
                  >
                    <UserCog />
                    <span>Administração</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Versão 2.0.0</p>
          <p className="mt-1">© 2024 Nautilus</p>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}