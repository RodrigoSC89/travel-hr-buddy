import React, { useState } from 'react';
import { useSidebarActions } from '@/hooks/use-sidebar-actions';
import { 
  LayoutDashboard, 
  Users, 
  Plane, 
  Hotel, 
  BarChart3,
  Calendar,
  Database,
  FileText, 
  Settings,
  ChevronDown,
  Bell,
  UserCog,
  Ship,
  Anchor,
  Bot,
  Zap,
  Target,
  Mic,
  Eye,
  Shield,
  Smartphone,
  Trophy,
  User,
  Activity,
  Globe,
  HelpCircle,
  TrendingUp,
  Brain,
  MessageSquare,
  Workflow,
  TestTube,
  MapPin,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import nautilusOneLogo from '@/assets/nautilus-one-logo.png';
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
    url: "/",
    icon: LayoutDashboard,
    alwaysVisible: true
  },
  {
    title: "Dashboard Executivo",
    url: "/executive-dashboard",
    icon: TrendingUp,
    requiresRole: ["admin", "owner"] as const,
  },
  {
    title: "Administração",
    url: "/admin",
    icon: UserCog,
    requiresRole: ["admin", "hr_manager"] as const,
  },
  {
    title: "Super Admin",
    url: "/super-admin",
    icon: Shield,
    requiresRole: ["admin"] as const,
  },
  {
    title: "Configurações da Organização",
    url: "/organization-settings",
    icon: Settings,
    requiresRole: ["admin", "owner"] as const,
  },
  {
    title: "RH",
    url: "/hr", 
    icon: Users,
    permission: "certificates" as const,
  },
  {
    title: "Sistema Marítimo",
    url: "/maritime",
    icon: Ship,
    items: [
      {
        title: "Dashboard Marítimo",
        url: "/maritime",
        icon: Ship,
      },
      {
        title: "Dashboard da Frota",
        url: "/fleet-dashboard",
        icon: Anchor,
      },
      {
        title: "Gestão de Frota",
        url: "/fleet-management",
        icon: Ship,
      },
      {
        title: "Rastreamento",
        url: "/fleet-tracking",
        icon: MapPin,
      },
      {
        title: "Colaboração",
        url: "/collaboration",
        icon: Users,
      },
      {
        title: "Tripulação",
        url: "/crew-management",
        icon: Users,
      },
      {
        title: "Certificações",
        url: "/maritime-certifications",
        icon: UserCog,
      },
      {
        title: "Gestão de Tarefas",
        url: "/task-management",
        icon: Target,
      },
      {
        title: "Documentos",
        url: "/document-management",
        icon: FileText,
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
        icon: Smartphone,
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
    url: "/portal",
    icon: User,
  },
  {
    title: "Viagens",
    url: "/travel",
    icon: Plane,
    items: [
      {
        title: "Voos",
        url: "/travel",
        icon: Plane,
      },
      {
        title: "Hotéis",
        url: "/travel", 
        icon: Hotel,
      },
    ],
  },
  {
    title: "Alertas de Preços",
    url: "/price-alerts",
    icon: Bell,
  },
  {
    title: "Hub de Integrações",
    url: "/integrations",
    icon: Globe,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    permission: "analytics" as const,
    items: [
      {
        title: "Analytics Básico",
        url: "/analytics",
        icon: BarChart3,
      },
      {
        title: "Métricas Avançadas",
        url: "/enhanced-metrics",
        icon: Activity,
      },
      {
        title: "IA Insights",
        url: "/ai-insights",
        icon: Brain,
      },
      {
        title: "Analytics Avançado",
        url: "/advanced-analytics",
        icon: TrendingUp,
      },
      {
        title: "Alertas Inteligentes",
        url: "/intelligent-alerts",
        icon: Zap,
      },
    ],
  },
  {
    title: "Reservas",
    url: "/reservations",
    icon: Calendar,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: FileText,
    permission: "reports" as const,
    items: [
      {
        title: "Relatórios Básicos",
        url: "/reports",
        icon: FileText,
      },
      {
        title: "Relatórios Avançados",
        url: "/advanced-reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Comunicação",
    url: "/communication",
    icon: MessageSquare,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Otimização",
    url: "optimization",
    icon: Zap,
    items: [
      {
        title: "Otimização Geral",
        url: "optimization",
        icon: Zap,
      },
      {
        title: "Performance",
        url: "performance-optimizer",
        icon: Target,
      },
    ],
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
  {
    title: "Centro de Notificações",
    url: "notification-center",
    icon: Bell,
  },
  {
    title: "Monitor de Sistema",
    url: "system-monitor",
    icon: Activity,
  },
  {
    title: "Administração",
    items: [
      { title: "Painel Admin", url: "/admin", icon: Settings },
      { title: "Backup & Auditoria", url: "/backup-audit", icon: Database },
      { title: "Segurança", url: "/security", icon: Shield },
      { title: "Usuários", url: "/users", icon: Users },
      { title: "Testes & Homologação", url: "/testing", icon: TestTube },
      { title: "Feedback Sistema", url: "/feedback", icon: MessageSquare },
      { title: "Sync Offline", url: "/offline-sync", icon: Database },
    ],
    requiresRole: ['admin']
  },
  {
    title: "Documentos",
    url: "/documents",
    icon: FileText
  },
  {
    title: "Colaboração",
    url: "/collaboration",
    icon: Users
  },
  {
    title: "Otimização Mobile",
    url: "/mobile-optimization",
    icon: Smartphone
  },
  {
    title: "Checklists Inteligentes",
    url: "/checklists-inteligentes", 
    icon: CheckCircle
  },
  {
    title: "PEOTRAM",
    url: "/peotram",
    icon: Shield
  },
  {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
  {
    title: "Analytics Avançado",
    url: "/advanced-analytics",
    icon: TrendingUp
  },
  {
    title: "Analytics Tempo Real", 
    url: "/real-time-analytics",
    icon: Activity
  },
  {
    title: "Monitor Avançado",
    url: "/advanced-system-monitor",
    icon: Activity
  },
  {
    title: "Documentos IA",
    url: "/intelligent-documents",
    icon: Brain
  },
  {
    title: "Assistente IA",
    url: "/ai-assistant",
    icon: MessageSquare
  },
  {
    title: "Business Intelligence",
    url: "/business-intelligence",
    icon: BarChart3
  },
  {
    title: "Smart Workflow",
    url: "/smart-workflow",
    icon: Workflow
  },
  {
    title: "Centro de Ajuda",
    url: "/help",
    icon: HelpCircle,
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
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <img 
              src={nautilusOneLogo} 
              alt="Nautilus One" 
              className="w-10 h-10 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate">
                NAUTILUS ONE
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

              {/* Visão Geral do Sistema */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleItemClick("system-overview")}
                  isActive={isItemActive("system-overview")}
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