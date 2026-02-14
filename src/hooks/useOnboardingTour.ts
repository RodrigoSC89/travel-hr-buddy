/**
 * Onboarding Tour Hook - Driver.js guided tour
 * Deep Ocean Command Center themed
 */
import { useCallback, useEffect, useState } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "nautilus-onboarding-completed";

const tourSteps: DriveStep[] = [
  {
    element: '[data-sidebar="sidebar"]',
    popover: {
      title: "🧭 Navegação Principal",
      description: "Aqui está o menu lateral com todos os módulos do sistema. Use os Mega-Hubs para acessar rapidamente cada área.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="header-search"]',
    popover: {
      title: "🔍 Busca Inteligente",
      description: "Pressione Ctrl+K para abrir a paleta de comandos. Encontre qualquer funcionalidade instantaneamente.",
      side: "bottom",
    },
  },
  {
    element: 'main',
    popover: {
      title: "📊 Command Center",
      description: "Este é o seu centro de comando. Aqui você tem visão 360° de toda a operação marítima com KPIs em tempo real.",
      side: "left",
      align: "center",
    },
  },
  {
    popover: {
      title: "🚀 Tudo Pronto!",
      description: "Você está pronto para explorar o Nautilus One. Use o menu lateral para navegar entre os módulos. Boas operações!",
    },
  },
];

export function useOnboardingTour() {
  const [hasCompleted, setHasCompleted] = useState(() => {
    return localStorage.getItem(TOUR_KEY) === "true";
  });

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      steps: tourSteps,
      nextBtnText: "Próximo →",
      prevBtnText: "← Anterior",
      doneBtnText: "Começar! 🚀",
      progressText: "{{current}} de {{total}}",
      popoverClass: "nautilus-tour-popover",
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_KEY, "true");
        setHasCompleted(true);
        driverObj.destroy();
      },
    });

    driverObj.drive();
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_KEY);
    setHasCompleted(false);
  }, []);

  // Auto-start for new users (first visit)
  useEffect(() => {
    if (!hasCompleted) {
      const timer = setTimeout(startTour, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted, startTour]);

  return { startTour, resetTour, hasCompleted };
}
