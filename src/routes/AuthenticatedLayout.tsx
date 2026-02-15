/**
 * AuthenticatedLayout v11 - World-Class Maritime Platform Layout
 * Premium layout with glassmorphism, health monitoring, and global overlays
 */
import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { SmoothPageTransition } from "@/components/ui/SmoothPageTransition";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ProductOnboardingTour } from "@/components/onboarding/ProductOnboardingTour";
import { ModuleErrorBoundary } from "@/components/layout/module-error-boundary";
import { PresenceAvatars } from "@/components/ui/PresenceAvatars";
import { HealthStatusBar } from "@/components/ui/HealthStatusBar";
import { useRealtimeToasts } from "@/hooks/useRealtimeToasts";
import { useAutonomousMonitor } from "@/hooks/useAutonomousMonitor";
import { ProactiveAlertsBanner } from "@/components/dashboard/ProactiveAlertsBanner";
import { useSmartPrefetch } from "@/lib/performance/smart-prefetch";

const OfflineStatusBar = lazy(() => 
  import("@/components/offline/OfflineStatusBar").then(mod => ({ default: mod.OfflineStatusBar }))
);
const CommandPalette = lazy(() => import("@/components/shared/CommandPalette"));
const GlobalAIAssistant = lazy(() => 
  import("@/components/ai/GlobalAIAssistant").then(mod => ({ default: mod.GlobalAIAssistant }))
);
const GlobalAICopilot = lazy(() => 
  import("@/components/ai/GlobalAICopilot").then(mod => ({ default: mod.GlobalAICopilot }))
);
const InstallPrompt = lazy(() => 
  import("@/components/pwa/InstallPrompt").then(mod => ({ default: mod.InstallPrompt }))
);
const UpdatePrompt = lazy(() => 
  import("@/components/pwa/UpdatePrompt").then(mod => ({ default: mod.UpdatePrompt }))
);
const KeyboardShortcutsPanel = lazy(() => 
  import("@/components/shared/KeyboardShortcutsPanel").then(mod => ({ default: mod.KeyboardShortcutsPanel }))
);
const SpotlightSearch = lazy(() => 
  import("@/components/shared/SpotlightSearch").then(mod => ({ default: mod.SpotlightSearch }))
);

export const AuthenticatedLayout = () => {
  useRealtimeToasts();
  useSmartPrefetch();
  const { alerts, dismissAlert } = useAutonomousMonitor({ enabled: true });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          {/* System status strip */}
          <div className="flex items-center justify-between px-4 py-1 border-b border-border/30 bg-card/30 backdrop-blur-sm">
            <HealthStatusBar />
            <PresenceAvatars />
          </div>
          <main className="flex-1 overflow-auto px-3 pb-20 md:px-6 md:pb-6">
            {alerts.length > 0 && (
              <div className="mt-3 mb-1">
                <ProactiveAlertsBanner alerts={alerts} onDismiss={dismissAlert} maxVisible={3} />
              </div>
            )}
            <ModuleErrorBoundary moduleName="Page">
              <SmoothPageTransition>
                <Outlet />
              </SmoothPageTransition>
            </ModuleErrorBoundary>
          </main>
        </div>
        <MobileBottomNav />
        <ProductOnboardingTour />
        <Suspense fallback={null}><OfflineStatusBar position="bottom" showDetails={true} /></Suspense>
        <Suspense fallback={null}><CommandPalette /></Suspense>
        <Suspense fallback={null}><GlobalAIAssistant /></Suspense>
        <Suspense fallback={null}><InstallPrompt /></Suspense>
        <Suspense fallback={null}><UpdatePrompt /></Suspense>
        <Suspense fallback={null}><KeyboardShortcutsPanel /></Suspense>
        <Suspense fallback={null}><SpotlightSearch /></Suspense>
        {/* GlobalAICopilot removed - GlobalAIAssistant already provides AI access */}
      </div>
    </SidebarProvider>
  );
};
