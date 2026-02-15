/**
 * AuthenticatedLayout - Main layout for authenticated users
 * Includes sidebar, header, mobile nav, and global overlays
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

const OfflineStatusBar = lazy(() => 
  import("@/components/offline/OfflineStatusBar").then(mod => ({ default: mod.OfflineStatusBar }))
);
const CommandPalette = lazy(() => import("@/components/shared/CommandPalette"));
const GlobalAIAssistant = lazy(() => 
  import("@/components/ai/GlobalAIAssistant").then(mod => ({ default: mod.GlobalAIAssistant }))
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
  // Global real-time toast notifications for critical events
  useRealtimeToasts();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          {/* Health + Presence bar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/40 bg-card/50">
            <HealthStatusBar />
            <PresenceAvatars />
          </div>
          <main className="flex-1 overflow-auto px-3 pb-20 md:px-6 md:pb-6">
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
      </div>
    </SidebarProvider>
  );
};
