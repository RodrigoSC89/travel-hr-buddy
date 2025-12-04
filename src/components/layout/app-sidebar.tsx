import React, { useState, useMemo } from "react";
import { useSidebarActions } from "@/hooks/use-sidebar-actions";
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
  Building2,
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
  CheckCircle,
  Scan,
  Satellite
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import nautilusLogo from "@/assets/nautilus-logo.png";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Navigation item interface
interface NavigationItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  alwaysVisible?: boolean;
  requiresRole?: readonly string[];
  permission?: string;
  items?: NavigationItem[];
}

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
      {
        title: "Scanner IA",
        url: "/advanced-documents",
        icon: Scan,
      },
    ],
  },
  {
    title: "IA & Inovação",
    url: "/innovation",
    icon: Bot,
    items: [
      {
        title: "Dashboard IA",
        url: "/ai-dashboard",
        icon: Brain,
      },
      {
        title: "Sugestões Workflow",
        url: "/workflow-suggestions",
        icon: Workflow,
      },
      {
        title: "Métricas de Adoção",
        url: "/ai-adoption",
        icon: TrendingUp,
      },
      {
        title: "Assistente IA",
        url: "/innovation",
        icon: Bot,
      },
      {
        title: "AI Insights",
        url: "/ai-insights",
        icon: Brain,
      },
      {
        title: "Análise Preditiva",
        url: "/predictive-analytics",
        icon: Brain,
      },
      {
        title: "Gamificação",
        url: "/gamification",
        icon: Trophy,
      },
      {
        title: "IoT Dashboard",
        url: "/iot",
        icon: Smartphone,
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
    title: "Módulos do Sistema",
    icon: Database,
    items: [
      {
        title: "Comunicação",
        url: "/comunicacao",
        icon: MessageSquare,
      },
      {
        title: "Tripulação",
        url: "/crew",
        icon: Users,
      },
      {
        title: "Documentos",
        url: "/documentos",
        icon: FileText,
      },
      {
        title: "DP Intelligence",
        url: "/dp-intelligence",
        icon: Brain,
      },
      {
        title: "Feedback",
        url: "/feedback",
        icon: MessageSquare,
      },
      {
        title: "Gestão de Frota",
        url: "/fleet",
        icon: Ship,
      },
      {
        title: "Performance",
        url: "/performance",
        icon: TrendingUp,
      },
      {
        title: "Portal Funcionário",
        url: "/portal-funcionario",
        icon: User,
      },
      {
        title: "Alertas Preços",
        url: "/alertas-precos",
        icon: Bell,
      },
      {
        title: "Relatórios",
        url: "/reports-module",
        icon: FileText,
      },
      {
        title: "Automação",
        url: "/automation",
        icon: Zap,
      },
      {
        title: "Workspace Tempo Real",
        url: "/real-time-workspace",
        icon: Activity,
      },
      {
        title: "Gerenciador Canais",
        url: "/channel-manager",
        icon: MessageSquare,
      },
      {
        title: "Checklists",
        url: "/checklists-inteligentes",
        icon: CheckCircle,
      },
      {
        title: "Academia Treinamento",
        url: "/training-academy",
        icon: Trophy,
      },
      {
        title: "Gestão de Riscos",
        url: "/risk-management",
        icon: Shield,
      },
      {
        title: "Planejador Manutenção",
        url: "/maintenance-planner",
        icon: Target,
      },
      {
        title: "Logs de Missões",
        url: "/mission-engine",
        icon: FileText,
      },
      {
        title: "Relatórios Incidentes",
        url: "/incident-reports",
        icon: Bell,
      },
      {
        title: "Otimizador Combustível",
        url: "/fuel-optimizer",
        icon: Activity,
      },
      {
        title: "Dashboard Meteorológico",
        url: "/weather-dashboard",
        icon: Globe,
      },
      {
        title: "Planejador Viagens",
        url: "/voyage-planner",
        icon: MapPin,
      },
      {
        title: "Automação Tarefas",
        url: "/automation",
        icon: Zap,
      },
      {
        title: "Centro Auditoria",
        url: "/audit-center",
        icon: Shield,
      },
      {
        title: "Hub Compliance",
        url: "/compliance-hub",
        icon: Shield,
      },
      {
        title: "PEOTRAM",
        url: "/peotram",
        icon: FileText,
      },
      {
        title: "SGSO",
        url: "/sgso",
        icon: Shield,
      },
      {
        title: "IMCA Audit",
        url: "/imca-audit",
        icon: CheckCircle,
      },
      {
        title: "Pre-OVID",
        url: "/admin/pre-ovid",
        icon: Scan,
      },
      {
        title: "AI Insights",
        url: "/ai-insights",
        icon: Brain,
      },
      {
        title: "Hub Logística",
        url: "/logistics-hub",
        icon: Database,
      },
      {
        title: "Bem-estar Tripulação",
        url: "/crew-wellbeing",
        icon: Users,
      },
      {
        title: "Rastreador Satélite",
        url: "/satellite-tracker",
        icon: Globe,
      },
      {
        title: "Timeline Projetos",
        url: "/project-timeline",
        icon: Calendar,
      },
      {
        title: "Gestão Usuários",
        url: "/user-management",
        icon: UserCog,
      },
      {
        title: "Resposta Emergências",
        url: "/emergency-response",
        icon: Bell,
      },
      {
        title: "Controle Missão",
        url: "/mission-engine",
        icon: Target,
      },
      {
        title: "Underwater Drone",
        url: "/underwater-drone",
        icon: Plane,
      },
      {
        title: "Sensors Hub",
        url: "/sensors-hub",
        icon: Activity,
      },
      {
        title: "Satcom",
        url: "/satcom",
        icon: Satellite,
      },
      {
        title: "Hub Financeiro",
        url: "/finance-hub",
        icon: BarChart3,
      },
      {
        title: "API Gateway",
        url: "/api-gateway",
        icon: Globe,
      },
      {
        title: "Analytics Core",
        url: "/analytics-core",
        icon: BarChart3,
      },
      {
        title: "Documentos IA",
        url: "/documents",
        icon: Brain,
      },
      {
        title: "Assistente Voz",
        url: "/assistant/voice",
        icon: Mic,
      },
      {
        title: "Centro Notificações",
        url: "/notifications-center",
        icon: Bell,
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
        url: "optimization-general",
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
    requiresRole: ["admin"]
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
    title: "PEO-DP",
    url: "/peo-dp",
    icon: Anchor
  },
  {
    title: "Centro de Inteligência DP",
    url: "/dp-intelligence",
    icon: Brain
  },
  {
    title: "SGSO",
    url: "/sgso",
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

// Helper: canonicalize URLs (aliases -> canonical)
const URL_ALIASES: Record<string, string> = {
  "/forecast/global": "/forecast-global",
  "/compliance-hub": "/compliance-hub", // keep
  "/logistics": "/logistics-hub",
  "/wellbeing": "/crew-wellbeing",
  "/weather": "/weather-dashboard",
  "/voyage": "/voyage-planner",
  "/risk": "/risk-management",
  "/notifications": "/notifications-center",
  "/portal-funcionario": "/portal",
  "/comunicacao": "/communication",
  "/documentos": "/documents",
  "/documentos-ia": "/documents",
  "/intelligent-documents": "/documents",
  "/document-ai": "/documents",
  "/emergency": "/emergency-response",
  "/voice-assistant-new": "/voice-assistant",
  "/peo-tram": "/peotram",
  "/patch-66": "/patch66",
  "/users": "/user-management",
  // New aliases to consolidate duplicates after reorg
  "/sistema-maritimo": "/maritime",
  "/alertas-precos": "/price-alerts",
  "/reservas": "/reservations",
  "/viagens": "/travel",
};

function canonicalizeUrl(url?: string): string | undefined {
  if (!url) return url;
  const absolute = url.startsWith("/") ? url : `/${url}`;
  return URL_ALIASES[absolute] || absolute;
}

// Helper: deduplicate navigation items by URL to avoid duplicates in the sidebar
function dedupeNavigation(items: NavigationItem[]): NavigationItem[] {
  const seen = new Set<string>();

  const dedupeItem = (item: NavigationItem): NavigationItem | null => {
    const canonicalUrl = canonicalizeUrl(item.url);
    const key = canonicalUrl || item.title;
    if (key && seen.has(key)) return null;
    if (key) seen.add(key);

    let children: NavigationItem[] | undefined;
    if (item.items && item.items.length) {
      const filtered = item.items
        .map(dedupeItem)
        .filter(Boolean) as NavigationItem[];
      if (filtered.length) children = filtered;
    }

    return { ...item, ...(canonicalUrl ? { url: canonicalUrl } : {}), ...(children ? { items: children } : {}) };
  };

  return items.map(dedupeItem).filter(Boolean) as NavigationItem[];
}


interface AppSidebarProps {
  activeItem?: string;
  onItemChange?: (item: string) => void;
}

export function AppSidebar({ activeItem, onItemChange }: AppSidebarProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessModule, hasPermission, getRoleDisplayName, userRole } = usePermissions();
  const { handleNavigation } = useSidebarActions();
  const { currentBranding } = useOrganization();
  const logoSrc = currentBranding?.logo_url || nautilusLogo;
  // Build a de-duplicated navigation list once
  const dedupedNav = useMemo(() => dedupeNavigation(navigationItems), []);

  // Build a Set of existing URLs to prevent duplicates when adding extra items
  const navUrlSet = useMemo(() => {
    const set = new Set<string>();
    const add = (items: NavigationItem[]) => {
      for (const it of items) {
        const u = canonicalizeUrl(it.url);
        if (u) set.add(u);
        if (it.items) add(it.items);
      }
    };
    add(dedupedNav);
    return set;
  }, [dedupedNav]);

  const hasUrl = (url: string) => {
    const u = canonicalizeUrl(url);
    return u ? navUrlSet.has(u) : false;
  };

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

  const canAccessItem = (item: NavigationItem) => {
    if (item.alwaysVisible) return true;
    
    // Verificar se requer role específico
    if (item.requiresRole) {
      return userRole && item.requiresRole.includes(userRole);
    }
    
    // Verificar permissão específica
    if (item.permission) {
      return hasPermission(item.permission as Permission, "read");
    }
    
    return true;
  };

  const handleItemClick = (item: string) => {
    handleNavigation(item);
    onItemChange?.(item);
  };

  // Determinar se o grupo de navegação principal deve estar aberto
  const isMainGroupOpen = dedupedNav.some(item => 
    item.items ? item.items.some(subItem => isItemActive(subItem.url ?? "")) : isItemActive(item.url ?? "")
  );

  return (
    <Sidebar 
      className={"border-r transition-all duration-300"}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <img 
              src={`${logoSrc}?v=3`}
              alt={currentBranding?.company_name || "Nautilus One"}
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
        <ScrollArea className="flex-1 overflow-hidden">
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {dedupedNav.map((item) => {
                // Verificar permissões para exibir o item
                  if (!canAccessItem(item)) {
                    return null;
                  }

                  // Item com subitens
                  if (item.items) {
                    return (
                      <Collapsible 
                        key={item.url || item.title}
                        open={openItems.includes(item.url || item.title)}
                        onOpenChange={() => toggleItem(item.url || item.title)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton 
                              className="w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nautilus-primary)]"
                              tabIndex={0}
                              role="button"
                              aria-label={`Expandir ${item.title}`}
                            >
                              <div className="flex items-center">
                                {item.icon && <item.icon className="h-4 w-4" />}
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
                                  <SidebarMenuSubItem key={subItem.url || subItem.title}>
                                    <SidebarMenuSubButton 
                                      onClick={() => handleItemClick(subItem.url || "")}
                                      isActive={isItemActive(subItem.url || "")}
                                      className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nautilus-primary)]"
                                      tabIndex={0}
                                      role="link"
                                      aria-label={`Navegar para ${subItem.title}`}
                                    >
                                      {subItem.icon && <subItem.icon className="h-4 w-4" />}
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
                    <SidebarMenuItem key={item.url || item.title}>
                      <SidebarMenuButton 
                        onClick={() => handleItemClick(item.url ?? "")}
                        isActive={isItemActive(item.url ?? "")}
                        className="w-full justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nautilus-primary)]"
                        title={collapsed ? item.title : undefined}
                        tabIndex={0}
                        role="link"
                        aria-label={`Navegar para ${item.title}`}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {!collapsed && <span className="ml-2">{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {/* Administração - Apenas para admins e gerentes de RH */}
                {canAccessModule("admin") && !hasUrl("/admin") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => handleItemClick("/admin")}
                      isActive={isItemActive("/admin")}
                      className="w-full justify-start"
                      title={collapsed ? "Administração" : undefined}
                    >
                      <UserCog className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">Administração</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* Automação IA - Para todos os usuários */}
                {!hasUrl("/automation") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => handleItemClick("/automation")}
                      isActive={isItemActive("/automation")}
                      className="w-full justify-start"
                      title={collapsed ? "Automação IA" : undefined}
                    >
                      <Zap className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">Automação IA</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* SaaS Manager - Para super admins */}
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

                {/* Dashboard Executivo - Para admins e gerentes */}
                {(userRole === "admin" || userRole === "hr_manager" || userRole === "department_manager") && !hasUrl("/executive-dashboard") && (
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
        </ScrollArea>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border">
        {!collapsed && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Você é: {getRoleDisplayName(userRole || "employee")}</p>
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