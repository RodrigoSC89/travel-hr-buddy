/**
 * Guided Product Tour — driver.js integration
 * Launches after onboarding to walk users through the main UI
 */
import { useEffect, useCallback, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslation } from "react-i18next";

const TOUR_STORAGE_KEY = "nauti-tour-completed-v1";

export function useGuidedTour() {
  const { t } = useTranslation();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const steps: DriveStep[] = [
      {
        popover: {
          title: t("tour.welcomeTitle"),
          description: t("tour.welcomeDesc"),
        },
      },
      {
        element: '[data-tour="sidebar"]',
        popover: {
          title: t("tour.sidebarTitle"),
          description: t("tour.sidebarDesc"),
          side: "right",
          align: "start",
        },
      },
      {
        element: '[data-tour="dashboard"]',
        popover: {
          title: t("tour.dashboardTitle"),
          description: t("tour.dashboardDesc"),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="search"]',
        popover: {
          title: t("tour.searchTitle"),
          description: t("tour.searchDesc"),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="notifications"]',
        popover: {
          title: t("tour.notificationsTitle"),
          description: t("tour.notificationsDesc"),
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="settings"]',
        popover: {
          title: t("tour.settingsTitle"),
          description: t("tour.settingsDesc"),
          side: "left",
          align: "end",
        },
      },
      {
        popover: {
          title: t("tour.doneTitle"),
          description: t("tour.doneDesc"),
        },
      },
    ];

    const d = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: t("tour.next"),
      prevBtnText: t("tour.prev"),
      doneBtnText: t("tour.finish"),
      animate: true,
      overlayColor: "rgba(0,0,0,0.6)",
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "nauti-tour-popover",
      steps,
      onDestroyed: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      },
    });

    driverRef.current = d;
    d.drive();
  }, [t]);

  const shouldShowTour = useCallback(() => {
    return localStorage.getItem(TOUR_STORAGE_KEY) !== "true";
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  return { startTour, shouldShowTour, resetTour };
}

/**
 * Auto-launch tour after onboarding completion
 * Add this hook to the main layout component
 */
export function useAutoTour() {
  const { startTour, shouldShowTour } = useGuidedTour();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("nauti-world-onboarding-v2") === "true";
    if (onboardingComplete && shouldShowTour()) {
      // Delay to let the dashboard render
      const timer = setTimeout(() => startTour(), 1500);
      return () => clearTimeout(timer);
    }
  }, [startTour, shouldShowTour]);
}
