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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Grouped modules by category
const groupedModules = [
  {
    title: "Dashboard & Visão Geral",
    icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
    items: [
      { label: "Dashboard Principal", path: "/" },
      { label: "Visão Geral", path: "/dashboard" },
    ],
  },
  {
    title: "Sistema Marítimo",
    icon: <Ship className="w-4 h-4 mr-2" />,
    items: [
      { label: "Sistema Marítimo", path: "/maritime" },
      { label: "Checklists Inteligentes", path: "/checklists" },
      { label: "Otimização", path: "/optimization" },
      { label: "Otimização Mobile", path: "/mobile-optimization" },
      { label: "PEOTRAM", path: "/peotram" },
      { label: "PEO-DP", path: "/peo-dp" },
      { label: "SGSO", path: "/sgso" },
      { label: "Monitor de Sistema", path: "/system-monitor" },
    ],
  },
  {
    title: "Colaboração & IA",
    icon: <Brain className="w-4 h-4 mr-2" />,
    items: [
      { label: "IA & Inovação", path: "/innovation" },
      { label: "Automação IA", path: "/automation" },
      { label: "Assistente IA", path: "/ai-assistant" },
      { label: "Assistente de Voz", path: "/voice" },
      { label: "Documentos IA", path: "/intelligent-documents" },
    ],
  },
  {
    title: "Comunicação & Alertas",
    icon: <Bell className="w-4 h-4 mr-2" />,
    items: [
      { label: "Comunicação", path: "/communication" },
      { label: "Centro de Notificações", path: "/notification-center" },
      { label: "Alertas de Preços", path: "/price-alerts" },
      { label: "Centro de Ajuda", path: "/help" },
    ],
  },
  {
    title: "Gestão e Analytics",
    icon: <BarChart2 className="w-4 h-4 mr-2" />,
    items: [
      { label: "Analytics Avançado", path: "/analytics" },
      { label: "Analytics Tempo Real", path: "/real-time-analytics" },
      { label: "Monitor Avançado", path: "/advanced-system-monitor" },
      { label: "Business Intelligence", path: "/business-intelligence" },
      { label: "Smart Workflow", path: "/smart-workflow" },
    ],
  },
  {
    title: "Outros Módulos",
    icon: <Folder className="w-4 h-4 mr-2" />,
    items: [
      { label: "Templates", path: "/templates" },
      { label: "Reservas", path: "/reservations" },
      { label: "Viagens", path: "/travel" },
      { label: "Hub de Integrações", path: "/integrations" },
      { label: "Documentos", path: "/documents" },
      { label: "Colaboração", path: "/collaboration" },
      { label: "Portal do Funcionário", path: "/portal" },
      { label: "Configurações", path: "/settings" },
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
          <p>Versão 2.1.0</p>
          <p className="mt-1">© 2024 Nautilus</p>
        </div>
      </aside>
    </>
  );
}
