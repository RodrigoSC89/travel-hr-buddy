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
import { ModuleErrorBoundary } from "@/components/layout/module-error-boundary";
import { RouteModuleGuard } from "@/components/modules/RouteModuleGuard";
import { useRealtimeToasts } from "@/hooks/useRealtimeToasts";
import { useAutonomousMonitor } from "@/hooks/useAutonomousMonitor";
import { useSmartPrefetch } from "@/lib/performance/smart-prefetch";
import { useEventReactor } from "@/hooks/useEventReactor";
import { useTacticalMonitor } from "@/hooks/useTacticalMonitor";

// Lazy load non-critical layout components
const PresenceAvatars = lazy(() => 
  import("@/components/ui/PresenceAvatars").then(mod => ({ default: mod.PresenceAvatars }))
);
const HealthStatusBar = lazy(() => 
  import("@/components/ui/HealthStatusBar").then(mod => ({ default: mod.HealthStatusBar }))
);
const ProactiveAlertsBanner = lazy(() => 
  import("@/components/dashboard/ProactiveAlertsBanner").then(mod => ({ default: mod.ProactiveAlertsBanner }))
);
const ProductOnboardingTour = lazy(() => 
  import("@/components/onboarding/ProductOnboardingTour").then(mod => ({ default: mod.ProductOnboardingTour }))
);

const OfflineStatusBar = lazy(() => 
  import("@/components/offline/OfflineStatusBar").then(mod => ({ default: mod.OfflineStatusBar }))
);
const CommandPalette = lazy(() => import("@/components/shared/CommandPalette"));
const CommandPaletteDialogLazy = lazy(() => 
  import("@/components/ui/CommandPaletteDialog").then(mod => ({ default: mod.CommandPaletteDialog }))
);
const GlobalAIAssistant = lazy(() => 
  import("@/components/ai/GlobalAIAssistant").then(mod => ({ default: mod.GlobalAIAssistant }))
);
const GlobalAICopilot = lazy(() => 
  import("@/components/ai/GlobalAICopilot").then(mod => ({ default: mod.GlobalAICopilot }))
);
const PEOTRAMVoiceButton = lazy(() => 
  import("@/components/ai/peotram-voice-button").then(mod => ({ default: mod.PEOTRAMVoiceButton }))
);
const FloatingActionButton = lazy(() => 
  import("@/components/ui/floating-action-button").then(mod => ({ default: mod.FloatingActionButton }))
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
const SmartContextActionsBar = lazy(() => 
  import("@/components/layout/SmartContextActionsBar").then(mod => ({ default: mod.SmartContextActionsBar }))
);

export const AuthenticatedLayout = () => {
  useRealtimeToasts();
  useSmartPrefetch();
  useEventReactor();
  useTacticalMonitor({ enabled: true, autoResolveThreshold: 0.80 });
  const { alerts, dismissAlert } = useAutonomousMonitor({ enabled: true });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          {/* System status strip */}
          <div className="flex items-center justify-between px-4 py-1 border-b border-border/30 bg-card/30 backdrop-blur-sm">
            <Suspense fallback={<div className="h-5" />}><HealthStatusBar /></Suspense>
            <Suspense fallback={null}><PresenceAvatars /></Suspense>
          </div>
          {/* Smart context actions strip */}
          <Suspense fallback={null}><SmartContextActionsBar /></Suspense>
          <main className="flex-1 overflow-auto px-3 pb-24 md:px-6 md:pb-6 lg:px-8 xl:px-10 2xl:px-12">
            {alerts.length > 0 && (
              <div className="mt-3 mb-1">
                <Suspense fallback={null}>
                  <ProactiveAlertsBanner alerts={alerts} onDismiss={dismissAlert} maxVisible={3} />
                </Suspense>
              </div>
            )}
            <ModuleErrorBoundary moduleName="Page">
              <RouteModuleGuard>
                <SmoothPageTransition>
                  <Outlet />
                </SmoothPageTransition>
              </RouteModuleGuard>
            </ModuleErrorBoundary>
          </main>
        </div>
        <MobileBottomNav />
        <Suspense fallback={null}><ProductOnboardingTour /></Suspense>
        <Suspense fallback={null}><OfflineStatusBar position="bottom" showDetails={true} /></Suspense>
        <Suspense fallback={null}><CommandPalette /></Suspense>
        <Suspense fallback={null}><CommandPaletteDialogLazy /></Suspense>
        <Suspense fallback={null}><GlobalAIAssistant /></Suspense>
        <Suspense fallback={null}><InstallPrompt /></Suspense>
        <Suspense fallback={null}><UpdatePrompt /></Suspense>
        <Suspense fallback={null}><KeyboardShortcutsPanel /></Suspense>
        <Suspense fallback={null}><SpotlightSearch /></Suspense>
        <Suspense fallback={null}><PEOTRAMVoiceButton /></Suspense>
        {/* FloatingActionButton removed from global layout - 
            GlobalAIAssistant (right-4) + PEOTRAMVoiceButton (right-20) already occupy the corner.
            FAB actions (search, notifications, settings) are accessible via header/sidebar */}
      </div>
    </SidebarProvider>
  );
};
