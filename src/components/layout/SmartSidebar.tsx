import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Ship
} from "lucide-react";
import { cn } from "@/lib/utils";

// Grouped modules by category - PATCH UNIFY-COMMAND: Fusão realizada
const groupedModules = [
  {
    title: "🛡️ Operações & Segurança",
    defaultOpen: true,
    items: [
      { label: "🔒 Security Center", path: "/security-center" },
      { label: "🤖 AI Operations Center", path: "/ai-operations-center" },
      { label: "📊 Telemetria Preditiva", path: "/predictive-telemetry" },
      { label: "⚠️ Simulador Incidentes", path: "/simulador" },
      { label: "🔗 Central Integrações", path: "/integracoes" },
      { label: "🖥️ NOC 24/7", path: "/noc" },
      { label: "📋 Auditoria de Segurança", path: "/auditoria-seguranca" },
      { label: "📈 Executive BI Dashboard", path: "/executive-bi" },
      { label: "📡 NOC Monitoring Center", path: "/noc-monitoring" },
      { label: "🎙️ Voice Assistant IA", path: "/voice-assistant" },
      { label: "🛰️ Telemetria 360°", path: "/telemetria" },
    ],
  },
  {
    title: "🎯 Centro de Comando",
    items: [
      { label: "🧠 Nautilus Command Center", path: "/nautilus-command" },
      { label: "📡 Telemetria", path: "/telemetry" },
      { label: "🌤️ Weather Command", path: "/weather-command" },
    ],
  },
  {
    title: "⚓ Sistema Marítimo",
    items: [
      { label: "⚓ Maritime Command", path: "/maritime-command" },
      { label: "🚢 Fleet Command Center", path: "/fleet-command" },
      { label: "🔧 Maintenance Command", path: "/maintenance-command" },
      { label: "🏗️ Drydock Management", path: "/drydock-management" },
      { label: "🎯 Mission Command", path: "/mission-command" },
      { label: "🗺️ Voyage Command", path: "/voyage-command" },
      { label: "🌉 Bridge Link", path: "/bridge-link" },
    ],
  },
  {
    title: "🌊 Operações Submarinas",
    items: [
      { label: "🔊 Ocean Sonar AI", path: "/ocean-sonar" },
      { label: "🤖 Underwater Drone", path: "/underwater-drone" },
      { label: "🛸 AutoSub Mission", path: "/auto-sub" },
      { label: "📶 Sonar AI Enhancement", path: "/sonar-ai" },
      { label: "⚠️ Deep Risk AI", path: "/deep-risk-ai" },
    ],
  },
  {
    title: "🧠 IA & Inovação",
    items: [
      { label: "🧠 AI Command Center", path: "/ai-command" },
      { label: "🔄 Workflow Command", path: "/workflow-command" },
      { label: "📅 Calendário Operacional", path: "/operational-calendar" },
      { label: "🚨 Modo Emergência", path: "/emergency-mode" },
      { label: "📝 Journaling IA", path: "/ai-journaling" },
      { label: "📡 Conectividade", path: "/maritime-connectivity" },
      { label: "❤️ Bem-estar Tripulação", path: "/crew-wellbeing" },
      { label: "🎙️ Assistente de Voz", path: "/assistant/voice" },
    ],
  },
  {
    title: "📁 Relatórios e Documentos",
    items: [
      { label: "📊 Reports Command", path: "/reports-command" },
      { label: "📄 Documentos IA", path: "/documents" },
      { label: "📋 Templates", path: "/templates" },
      { label: "✅ Checklists Inteligentes", path: "/admin/checklists" },
    ],
  },
  {
    title: "📢 Comunicação & Alertas",
    items: [
      { label: "📡 Communication Command", path: "/communication-command" },
      { label: "🚨 Alerts Command", path: "/alerts-command" },
      { label: "⏱️ Workspace em Tempo Real", path: "/real-time-workspace" },
    ],
  },
  {
    title: "📊 Gestão e Analytics",
    items: [
      { label: "📊 Analytics Command", path: "/analytics-command" },
      { label: "⚙️ Operations Command", path: "/operations-command" },
      { label: "💰 Finance Command", path: "/finance-command" },
      { label: "👥 Gestão de Usuários", path: "/users" },
      { label: "📋 Gestão de Tarefas", path: "/task-management" },
    ],
  },
  {
    title: "🎓 Treinamentos",
    items: [
      { label: "🎓 Nautilus Academy", path: "/nautilus-academy" },
      { label: "📚 SOLAS, ISPS & ISM Training", path: "/solas-isps-training" },
      { label: "🧑‍🏫 Mentor DP", path: "/mentor-dp" },
      { label: "🧭 DP Intelligence", path: "/dp-intelligence" },
    ],
  },
  {
    title: "👥 RH & Pessoas",
    items: [
      { label: "👥 Nautilus People Hub", path: "/nautilus-people" },
      { label: "🏥 Enfermaria Digital", path: "/medical-infirmary" },
    ],
  },
  {
    title: "🔍 Auditorias",
    items: [
      { label: "📋 PEO-DP", path: "/peo-dp" },
      { label: "📋 PEOTRAM", path: "/peotram" },
      { label: "📋 SGSO", path: "/sgso" },
      { label: "🔍 IMCA Audit", path: "/imca-audit" },
      { label: "🔍 Pre-OVID Inspection", path: "/pre-ovid-inspection" },
      { label: "🔍 MLC Inspection", path: "/mlc-inspection" },
      { label: "📄 Workflow Documentos ISM/MLC", path: "/document-workflow" },
      { label: "🛡️ Gerador Pacotes PSC", path: "/psc-package" },
      { label: "🤖 Auditoria de IA", path: "/ai-audit" },
    ],
  },
  {
    title: "🛡️ Compliance & Segurança",
    items: [
      { label: "🛡️ Compliance Hub", path: "/compliance-hub" },
      { label: "⛑️ Safety Guardian", path: "/safety-guardian" },
    ],
  },
  {
    title: "🌱 ESG & Sustentabilidade",
    items: [
      { label: "🌱 ESG & Emissões", path: "/esg-emissions" },
      { label: "♻️ Gestão de Resíduos", path: "/waste-management" },
    ],
  },
  {
    title: "✈️ Viagens & Logística",
    items: [
      { label: "✈️ Travel Command", path: "/travel-command" },
      { label: "🛒 Procurement Command", path: "/procurement-command" },
    ],
  },
  {
    title: "⚙️ Integrações & Sistema",
    items: [
      { label: "🔗 Hub de Integrações", path: "/integrations" },
      { label: "🌐 API Gateway", path: "/api-gateway" },
      { label: "🤝 Colaboração", path: "/collaboration" },
      { label: "📊 IoT Dashboard", path: "/iot" },
      { label: "🎮 Gamificação", path: "/gamification" },
      { label: "⚙️ Configurações", path: "/settings" },
      { label: "🧪 QA Preview", path: "/qa/preview" },
      { label: "🚀 Production Deploy", path: "/production-deploy" },
    ],
  },
];

interface SmartSidebarProps {
  className?: string;
}

export function SmartSidebar({ className }: SmartSidebarProps) {
  // Inicializar com seção que tem defaultOpen: true
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const defaultSection = groupedModules.find(g => g.defaultOpen);
    return defaultSection?.title || null;
  });
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

  // Auto-open section containing current route (mas preservar Operações & Segurança se nenhuma rota ativa)
  useEffect(() => {
    const currentGroup = groupedModules.find(group => 
      group.items.some(item => item.path === location.pathname)
    );
    if (currentGroup) {
      setOpenSection(currentGroup.title);
    } else {
      // Se não houver rota ativa, abrir a seção padrão
      const defaultSection = groupedModules.find(g => g.defaultOpen);
      if (defaultSection && !openSection) {
        setOpenSection(defaultSection.title);
      }
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-background text-sidebar-foreground shadow-lg border border-sidebar-border"
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
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar-background text-sidebar-foreground h-screen overflow-y-auto shadow-lg transition-transform duration-300 border-r border-sidebar-border",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-bold text-xl flex items-center gap-2 text-sidebar-foreground">
            <Ship className="w-6 h-6 text-primary" />
            🧭 Nautilus One
          </h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Sistema Corporativo</p>
        </div>

        <nav className="space-y-1 p-2">
          {groupedModules.map((group) => (
            <div key={group.title}>
              <button
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-medium rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  openSection === group.title && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => toggleSection(group.title)}
              >
                <span>{group.title}</span>
                {openSection === group.title ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {openSection === group.title && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-2">
                  {group.items.map((item) => (
                    <Link
                      to={item.path}
                      key={item.path}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md transition-colors",
                        isActive(item.path)
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

        <div className="p-4 border-t border-sidebar-border mt-4 text-xs text-sidebar-foreground/60 text-center">
          <p>Nautilus One v3.0.0</p>
          <p className="mt-1">© 2024-2025 Nautilus</p>
        </div>
      </aside>
    </>
  );
}

export default SmartSidebar;
