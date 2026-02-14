/**
 * AuthenticatedLayout - Main layout for authenticated users
 * Includes sidebar, header, mobile nav, and global overlays
 */
import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ProductOnboardingTour } from "@/components/onboarding/ProductOnboardingTour";
import { ModuleErrorBoundary } from "@/components/layout/module-error-boundary";
import { PresenceAvatars } from "@/components/ui/PresenceAvatars";
import { HealthStatusBar } from "@/components/ui/HealthStatusBar";

const OfflineStatusBar = lazy(() => 
  import("@/components/offline/OfflineStatusBar").then(mod => ({ default: mod.OfflineStatusBar }))
);
const CommandPalette = lazy(() => import("@/components/shared/CommandPalette"));
const GlobalAIAssistant = lazy(() => 
  import("@/components/ai/GlobalAIAssistant").then(mod => ({ default: mod.GlobalAIAssistant }))
);

export const AuthenticatedLayout = () => {
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
              <Outlet />
            </ModuleErrorBoundary>
          </main>
        </div>
        <MobileBottomNav />
        <ProductOnboardingTour />
        <Suspense fallback={null}><OfflineStatusBar position="bottom" showDetails={true} /></Suspense>
        <Suspense fallback={null}><CommandPalette /></Suspense>
        <Suspense fallback={null}><GlobalAIAssistant /></Suspense>
      </div>
    </SidebarProvider>
  );
};
