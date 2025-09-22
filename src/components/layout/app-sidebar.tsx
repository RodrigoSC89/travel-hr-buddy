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
  Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarItem {
  title: string;
  url?: string;
  icon: React.ComponentType<any>;
  items?: Array<{
    title: string;
    url: string;
  }>;
}

const navigationItems: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Recursos Humanos",
    url: "hr",
    icon: Users,
  },
  {
    title: "Viagens",
    icon: Plane,
    items: [
      { title: "Buscar Voos", url: "flights" },
      { title: "Buscar Hotéis", url: "hotels" },
    ],
  },
  {
    title: "Analytics",
    url: "analytics",
    icon: BarChart3,
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
  },
  {
    title: "Configurações",
    url: "settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
}

export function AppSidebar({ activeItem, onItemChange }: AppSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Viagens"]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const handleItemClick = (moduleKey: string) => {
    console.log('Navegando para módulo:', moduleKey);
    onItemChange(moduleKey);
  };

  const isItemActive = (moduleKey: string) => {
    return activeItem === moduleKey;
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (item.items) {
                  const isExpanded = expandedGroups.includes(item.title);
                  const hasActiveChild = item.items.some(child => isItemActive(child.url));
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => toggleGroup(item.title)}
                        className={`w-full justify-between ${hasActiveChild ? 'bg-accent text-accent-foreground' : ''}`}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </SidebarMenuButton>
                      
                      {isExpanded && (
                        <SidebarMenuSub className="animate-accordion-down">
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                onClick={() => handleItemClick(subItem.url)}
                                className={`cursor-pointer ${isItemActive(subItem.url) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                              >
                                <span>{subItem.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => item.url && handleItemClick(item.url)}
                      className={`cursor-pointer ${isItemActive(item.url!) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}