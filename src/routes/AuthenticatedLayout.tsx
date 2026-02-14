/**
 * AuthenticatedLayout - Main layout for authenticated users
 * Includes sidebar, header, mobile nav, and global overlays
 */
import { Suspense, lazy } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
import { useDemoMode } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { LogIn, Eye } from "lucide-react";

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

export const AuthenticatedLayout = () => {
  // Global real-time toast notifications for critical events
  useRealtimeToasts();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const navigate = useNavigate();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-primary/90 text-primary-foreground py-1.5 px-4 flex items-center justify-center gap-3 text-sm backdrop-blur-sm">
            <Eye className="h-4 w-4" />
            <span className="font-medium">Modo Demo — Dados de demonstração. Algumas funções podem estar limitadas.</span>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-xs px-3"
              onClick={() => {
                disableDemoMode();
                navigate('/auth');
              }}
            >
              <LogIn className="mr-1 h-3 w-3" />
              Criar Conta / Login
            </Button>
          </div>
        )}
        <AppSidebar />
        <div className={`flex-1 flex flex-col min-w-0 w-full ${isDemoMode ? 'pt-9' : ''}`}>
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
      </div>
    </SidebarProvider>
  );
};
