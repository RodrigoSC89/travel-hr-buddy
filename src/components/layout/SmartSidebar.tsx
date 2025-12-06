import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Ship, 
  Brain, 
  Bell, 
  BarChart2, 
  Folder,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Users,
  Shield,
  Plane,
  Settings,
  Anchor,
  Waves,
  Bot,
  TrendingUp,
  Leaf,
  ShoppingCart,
  Stethoscope,
  Recycle,
  GraduationCap,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

// Grouped modules by category - UPDATED WITH ALL NEW MODULES
const groupedModules = [
  {
    title: "Dashboard & Visão Geral",
    icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
    items: [
      { label: "Dashboard Principal", path: "/" },
      { label: "Visão Geral", path: "/dashboard" },
      { label: "Dashboard Executivo", path: "/executive-dashboard" },
      { label: "Monitor de Sistema", path: "/system-monitor" },
    ],
  },
  {
    title: "Sistema Marítimo",
    icon: <Ship className="w-4 h-4 mr-2" />,
    items: [
      { label: "Sistema Marítimo", path: "/maritime" },
      { label: "Gestão de Frota", path: "/fleet" },
      { label: "Tripulação", path: "/crew" },
      { label: "Planejador de Manutenção", path: "/maintenance-planner" },
      { label: "MMI - Manutenção Industrial", path: "/mmi" },
      { label: "Registros de Missão", path: "/mission-logs" },
      { label: "Planejador de Viagem", path: "/voyage-planner" },
      { label: "Otimizador de Combustível", path: "/fuel-optimizer" },
      { label: "Dashboard Meteorológico", path: "/weather-dashboard" },
      { label: "Rastreador de Satélite", path: "/satellite-tracker" },
      { label: "Controle de Missão", path: "/mission-control" },
      { label: "Resposta a Emergências", path: "/emergency-response" },
      { label: "Otimização", path: "/optimization" },
    ],
  },
  {
    title: "Operações Submarinas",
    icon: <Anchor className="w-4 h-4 mr-2" />,
    items: [
      { label: "Ocean Sonar AI", path: "/ocean-sonar" },
      { label: "Underwater Drone", path: "/underwater-drone" },
      { label: "AutoSub Mission", path: "/auto-sub" },
      { label: "Sonar AI Enhancement", path: "/sonar-ai" },
      { label: "Deep Risk AI", path: "/deep-risk-ai" },
    ],
  },
  {
    title: "IA & Inovação",
    icon: <Brain className="w-4 h-4 mr-2" />,
    items: [
      { label: "Dashboard IA", path: "/ai-dashboard" },
      { label: "Sugestões Workflow", path: "/workflow-suggestions" },
      { label: "Métricas de Adoção", path: "/ai-adoption" },
      { label: "IA & Inovação", path: "/innovation" },
      { label: "DP Intelligence", path: "/dp-intelligence" },
      { label: "Insights de IA", path: "/ai-insights" },
      { label: "Documentos IA", path: "/documents" },
      { label: "Assistente de Voz", path: "/assistant/voice" },
      { label: "Automação IA", path: "/automation" },
    ],
  },
  {
    title: "Comunicação & Alertas",
    icon: <Bell className="w-4 h-4 mr-2" />,
    items: [
      { label: "Centro de Comunicação", path: "/communication" },
      { label: "Workspace em Tempo Real", path: "/real-time-workspace" },
      { label: "Gerenciador de Canais", path: "/channel-manager" },
      { label: "Centro de Notificações", path: "/notifications-center" },
      { label: "Alertas de Preços", path: "/price-alerts" },
    ],
  },
  {
    title: "Gestão e Analytics",
    icon: <BarChart2 className="w-4 h-4 mr-2" />,
    items: [
      { label: "Relatórios", path: "/reports" },
      { label: "Analytics Core", path: "/analytics" },
      { label: "Dashboard Operacional", path: "/operations-dashboard" },
      { label: "Finanças", path: "/finance" },
      { label: "Workflow", path: "/workflow" },
      { label: "Gestão de Usuários", path: "/users" },
    ],
  },
  {
    title: "RH & Pessoas",
    icon: <Users className="w-4 h-4 mr-2" />,
    items: [
      { label: "Academia de Treinamento", path: "/training-academy" },
      { label: "Nautilus Academy", path: "/nautilus-academy" },
      { label: "PEOTRAM", path: "/peotram" },
      { label: "PEO-DP", path: "/peo-dp" },
      { label: "Enfermaria Digital", path: "/medical-infirmary" },
    ],
  },
  {
    title: "Compliance & Segurança",
    icon: <Shield className="w-4 h-4 mr-2" />,
    items: [
      { label: "Compliance Hub", path: "/compliance-hub" },
      { label: "SGSO", path: "/sgso" },
      { label: "IMCA Audit", path: "/imca-audit" },
      { label: "Pre-OVID Inspection", path: "/admin/pre-ovid" },
      { label: "MLC Inspection", path: "/mlc-inspection" },
      { label: "Safety Guardian", path: "/safety-guardian" },
      { label: "SOLAS & ISM Training", path: "/solas-training" },
      { label: "Gestão de Resíduos", path: "/waste-management" },
      { label: "Checklists Inteligentes", path: "/admin/checklists" },
      { label: "Relatórios de Incidentes", path: "/incident-reports" },
    ],
  },
  {
    title: "ESG & Sustentabilidade",
    icon: <Leaf className="w-4 h-4 mr-2" />,
    items: [
      { label: "ESG & Emissões", path: "/esg-emissions" },
      { label: "Gestão de Resíduos", path: "/waste-management" },
    ],
  },
  {
    title: "Viagens & Logística",
    icon: <Plane className="w-4 h-4 mr-2" />,
    items: [
      { label: "Viagens", path: "/travel" },
      { label: "Smart Mobility", path: "/smart-mobility" },
      { label: "Reservas", path: "/reservations" },
      { label: "Autonomous Procurement", path: "/autonomous-procurement" },
    ],
  },
  {
    title: "Integrações & Sistema",
    icon: <Settings className="w-4 h-4 mr-2" />,
    items: [
      { label: "Hub de Integrações", path: "/integrations" },
      { label: "API Gateway", path: "/api-gateway" },
      { label: "Colaboração", path: "/collaboration" },
      { label: "Templates", path: "/templates" },
      { label: "Configurações", path: "/settings" },
      { label: "QA Preview", path: "/qa/preview" },
    ],
  },
];

interface SmartSidebarProps {
  className?: string;
}

export function SmartSidebar({ className }: SmartSidebarProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // Auto-open section containing current route
  React.useEffect(() => {
    const currentGroup = groupedModules.find(group => 
      group.items.some(item => item.path === location.pathname)
    );
    if (currentGroup && openSection !== currentGroup.title) {
      setOpenSection(currentGroup.title);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-zinc-900 text-white shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-zinc-900 dark:bg-zinc-950 text-white h-screen overflow-y-auto shadow-lg transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="p-4 border-b border-zinc-800">
          <h1 className="font-bold text-xl flex items-center gap-2">
            <Ship className="w-6 h-6 text-blue-400" />
            🧭 Nautilus One
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Sistema Corporativo</p>
        </div>

        <nav className="space-y-1 p-2">
          {groupedModules.map((group) => (
            <div key={group.title}>
              <button
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-medium rounded-md transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-900",
                  openSection === group.title && "bg-zinc-800 dark:bg-zinc-900"
                )}
                onClick={() => toggleSection(group.title)}
              >
                <div className="flex items-center">
                  {group.icon}
                  <span>{group.title}</span>
                </div>
                {openSection === group.title ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {openSection === group.title && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-zinc-700 pl-2">
                  {group.items.map((item) => (
                    <Link
                      to={item.path}
                      key={item.path}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md transition-colors",
                        isActive(item.path)
                          ? "bg-blue-600 text-white font-medium"
                          : "text-zinc-300 hover:bg-zinc-800 dark:hover:bg-zinc-900 hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 mt-4 text-xs text-zinc-400 text-center">
          <p>Versão 2.2.0</p>
          <p className="mt-1">© 2024 Nautilus</p>
        </div>
      </aside>
    </>
  );
}
