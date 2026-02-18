/**
 * SmartBreadcrumbs - Auto-detecting breadcrumbs with recently visited dropdown
 * Benchmark: Notion, Linear breadcrumb UX
 */

import React, { memo } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Home, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecentlyVisited } from "@/hooks/useRecentlyVisited";
import { spaNavigate } from "@/lib/navigation/spa-navigate";

interface BreadcrumbSegment {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

const HUB_MAP: Record<string, { label: string; color: string }> = {
  "/command": { label: "Comando", color: "text-hub-command" },
  "/ops": { label: "Operações", color: "text-hub-ops" },
  "/maintenance": { label: "Manutenção", color: "text-hub-maintenance" },
  "/compliance": { label: "Compliance", color: "text-hub-compliance" },
  "/ai-hub": { label: "Inteligência IA", color: "text-hub-ai" },
  "/tracking": { label: "Rastreamento", color: "text-hub-tracking" },
  "/workbench": { label: "Workbench", color: "text-hub-workbench" },
};

const TAB_LABELS: Record<string, string> = {
  overview: "Visão Geral",
  maritime: "Marítimo",
  fleet: "Frota",
  voyage: "Viagens",
  missions: "Missões",
  logistics: "Logística",
  contracts: "Contratos",
  manning: "Agentes Manning",
  "ai-copilot": "IA Copiloto",
  "ai-hub": "IA Hub",
  planning: "Planejamento",
  equipment: "Equipamentos",
  surveys: "Vistorias",
  predictive: "Preditiva",
  drydock: "Doca Seca",
  fuel: "Combustível",
  "digital-twin": "Gêmeo Digital",
  "waste-marpol": "MARPOL",
  esg: "ESG",
  gantt: "Gantt Chart",
  "sensor-logbook": "Sensor Logbook",
  operations: "Operações",
  executive: "Executivo",
  noc: "NOC 24/7",
  soc: "SOC Security",
  comms: "Comunicações",
  alerts: "Alertas",
  ceo: "CEO Dashboard",
  "my-dashboard": "Meu Dashboard",
  performance: "Performance",
};

export const SmartBreadcrumbs = memo(() => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { recentPages } = useRecentlyVisited();

  const path = location.pathname;
  const tab = searchParams.get("tab");

  const hubInfo = HUB_MAP[path];

  // Build segments
  const segments: BreadcrumbSegment[] = [];

  if (hubInfo) {
    segments.push({ label: hubInfo.label, href: tab ? path : undefined });
    if (tab) {
      segments.push({ label: TAB_LABELS[tab] || tab });
    }
  } else {
    // Non-hub pages - extract from path
    const parts = path.split("/").filter(Boolean);
    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1;
      segments.push({
        label: part
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        href: isLast ? undefined : "/" + parts.slice(0, i + 1).join("/"),
      });
    });
  }

  if (segments.length === 0) return null;

  return (
    <nav
      className="flex items-center gap-1.5 text-sm py-2 px-1"
      aria-label="Breadcrumb"
    >
      {/* Home */}
      <Link
        to="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent/50"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {/* Segments */}
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <React.Fragment key={`${seg.label}-${i}`}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
            {seg.href ? (
              <Link
                to={seg.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-md hover:bg-accent/50 font-medium truncate max-w-[150px]",
                  hubInfo && i === 0 && hubInfo.color
                )}
              >
                {seg.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-medium truncate max-w-[200px]",
                  isLast ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {seg.label}
              </span>
            )}
          </React.Fragment>
        );
      })}

      {/* Recently Visited Dropdown */}
      {recentPages.length > 1 && (
        <>
          <div className="ml-auto" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent/50"
                aria-label="Páginas recentes"
              >
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">Recentes</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs">
                Páginas visitadas recentemente
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentPages.slice(0, 10).map((page) => (
                <DropdownMenuItem
                  key={page.path}
                  onClick={() => spaNavigate(page.path)}
                  className="cursor-pointer text-sm"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate font-medium">{page.label}</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {new Date(page.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </nav>
  );
});

SmartBreadcrumbs.displayName = "SmartBreadcrumbs";

export default SmartBreadcrumbs;
