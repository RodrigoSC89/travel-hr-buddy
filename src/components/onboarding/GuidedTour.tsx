/**
 * Guided Tour Component using Driver.js
 * Interactive step-by-step tour of the Nauti One system
 */

import { useEffect, useCallback, useState } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle, Play, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const TOUR_STORAGE_KEY = "nautilus_guided_tour_completed";

// Tour steps for the Command Center
const COMMAND_CENTER_STEPS: DriveStep[] = [
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: "🧭 Menu de Navegação",
      description: "Acesse todos os módulos do sistema aqui. São mais de 50 funcionalidades organizadas por categoria.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: "🔍 Busca Universal",
      description: "Encontre qualquer módulo, tripulante, embarcação ou documento rapidamente. Use Cmd+K para abrir.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="tabs"]',
    popover: {
      title: "📊 Abas do Command Center",
      description: "Navegue entre Visão Geral, Operações, Executivo, IA, Resiliência, Alertas e Configurações.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="metrics"]',
    popover: {
      title: "📈 Métricas em Tempo Real",
      description: "Acompanhe KPIs críticos: frota ativa, receita, alertas e eficiência da IA.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="chart"]',
    popover: {
      title: "📉 Operações ao Vivo",
      description: "Visualize a atividade operacional das últimas 24 horas em tempo real.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="status"]',
    popover: {
      title: "🚦 Status dos Sistemas",
      description: "Monitore o status de Frota, Tripulação, Manutenção e Compliance em um só lugar.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="activities"]',
    popover: {
      title: "📋 Atividades Recentes",
      description: "Veja as últimas ações do sistema: viagens, manutenções e atualizações de documentos.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="ia-button"]',
    popover: {
      title: "🤖 IA Ativa",
      description: "O assistente de IA está sempre disponível para análises, previsões e recomendações.",
      side: "bottom",
      align: "end",
    },
  },
];

// Tour steps for IA tab
const IA_TAB_STEPS: DriveStep[] = [
  {
    element: '[data-tour="ia-chat"]',
    popover: {
      title: "💬 Chat com IA",
      description: "Converse com o Nautilus AI Assistant. Powered by Gemini 2.5 Flash para análises em tempo real.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="ia-context"]',
    popover: {
      title: "🎯 Contexto Operacional",
      description: "A IA tem acesso ao contexto atual: frota, tripulação, manutenções e documentos pendentes.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="ia-prompts"]',
    popover: {
      title: "⚡ Prompts Rápidos",
      description: "Use sugestões pré-configuradas para análises comuns: performance, riscos e tendências.",
      side: "top",
      align: "center",
    },
  },
];

interface GuidedTourProps {
  autoStart?: boolean;
}

export function GuidedTour({ autoStart = false }: GuidedTourProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [tourCompleted, setTourCompleted] = useState(() => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  });

  const startTour = useCallback((steps: DriveStep[]) => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "hsl(var(--background) / 0.9)",
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: "nautilus-tour-popover",
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Próximo →",
      prevBtnText: "← Anterior",
      doneBtnText: "Concluir ✓",
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        setTourCompleted(true);
        driverObj.destroy();
      },
      steps,
    });

    driverObj.drive();
  }, []);

  const startCommandCenterTour = useCallback(() => {
    if (location.pathname !== "/command") {
      navigate("/command");
      setTimeout(() => startTour(COMMAND_CENTER_STEPS), 500);
    } else {
      startTour(COMMAND_CENTER_STEPS);
    }
  }, [location.pathname, navigate, startTour]);

  const startIATour = useCallback(() => {
    if (!location.pathname.includes("/command") && !location.pathname.includes("/ai")) {
      navigate("/ai");
      setTimeout(() => startTour(IA_TAB_STEPS), 500);
    } else {
      startTour(IA_TAB_STEPS);
    }
  }, [location.pathname, navigate, startTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setTourCompleted(false);
  }, []);

  // Auto-start tour for new users
  useEffect(() => {
    if (autoStart && !tourCompleted && location.pathname === "/central-comando/visao-geral") {
      const timer = setTimeout(() => {
        startTour(COMMAND_CENTER_STEPS);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, tourCompleted, location.pathname, startTour]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          aria-label="Tour guiado"
        >
          <HelpCircle className="h-5 w-5" />
          {!tourCompleted && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={startCommandCenterTour}>
          <Play className="h-4 w-4 mr-2" />
          Tour do Command Center
        </DropdownMenuItem>
        <DropdownMenuItem onClick={startIATour}>
          <Play className="h-4 w-4 mr-2" />
          Tour da IA
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={resetTour}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reiniciar Tours
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Custom styles for the tour popover
export const tourStyles = `
  .nautilus-tour-popover {
    background: hsl(var(--card)) !important;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 12px !important;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important;
  }
  
  .nautilus-tour-popover .driver-popover-title {
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    color: hsl(var(--foreground)) !important;
  }
  
  .nautilus-tour-popover .driver-popover-description {
    color: hsl(var(--muted-foreground)) !important;
    font-size: 0.95rem !important;
    line-height: 1.5 !important;
  }
  
  .nautilus-tour-popover .driver-popover-progress-text {
    color: hsl(var(--muted-foreground)) !important;
    font-size: 0.8rem !important;
  }
  
  .nautilus-tour-popover .driver-popover-prev-btn,
  .nautilus-tour-popover .driver-popover-next-btn {
    background: hsl(var(--primary)) !important;
    color: hsl(var(--primary-foreground)) !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 8px 16px !important;
    font-weight: 500 !important;
    transition: opacity 0.2s !important;
  }
  
  .nautilus-tour-popover .driver-popover-prev-btn:hover,
  .nautilus-tour-popover .driver-popover-next-btn:hover {
    opacity: 0.9 !important;
  }
  
  .nautilus-tour-popover .driver-popover-prev-btn {
    background: hsl(var(--secondary)) !important;
    color: hsl(var(--secondary-foreground)) !important;
  }
  
  .nautilus-tour-popover .driver-popover-close-btn {
    color: hsl(var(--muted-foreground)) !important;
  }
  
  .nautilus-tour-popover .driver-popover-arrow-side-left {
    border-left-color: hsl(var(--card)) !important;
  }
  
  .nautilus-tour-popover .driver-popover-arrow-side-right {
    border-right-color: hsl(var(--card)) !important;
  }
  
  .nautilus-tour-popover .driver-popover-arrow-side-top {
    border-top-color: hsl(var(--card)) !important;
  }
  
  .nautilus-tour-popover .driver-popover-arrow-side-bottom {
    border-bottom-color: hsl(var(--card)) !important;
  }
`;

export default GuidedTour;
