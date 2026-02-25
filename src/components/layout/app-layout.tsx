import { useState, Suspense, lazy, useMemo } from "react";
import type { FC } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

import { useSystemActions } from "@/hooks/use-system-actions";
// Toaster removed — single instance in App.tsx
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SEOWrapper } from "@/components/layout/seo-wrapper";
import { useSessionSecurity } from "@/hooks/useSessionSecurity";
import { useCrossModuleAutomation } from "@/hooks/useCrossModuleAutomation";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useAutoTour } from "@/hooks/useGuidedTour";
import { ModuleErrorBoundary } from "@/components/error/ModuleErrorBoundary";
import { ModulePageSkeleton } from "@/components/ui/LoadingSkeleton";

// Lazy load heavy layout components
const GlobalSearch = lazy(() => import("@/components/ui/global-search"));
const EnhancedNotifications = lazy(() => import("@/components/ui/enhanced-notifications"));
const SmartBreadcrumbs = lazy(() => 
  import("@/components/layout/SmartBreadcrumbs").then(m => ({ default: m.SmartBreadcrumbs }))
);

// Lazy load offline components
const OfflineStatusBar = lazy(() => 
  import('@/components/offline/OfflineStatusBar').then(m => ({ default: m.OfflineStatusBar }))
);
const QuickActionFAB = lazy(() => 
  import('@/components/ui/QuickActionFAB').then(m => ({ default: m.QuickActionFAB }))
);
const KeyboardShortcutsHelp = lazy(() => 
  import('@/components/ui/KeyboardShortcutsHelp').then(m => ({ default: m.KeyboardShortcutsHelp }))
);
const PageTransition = lazy(() => import('@/components/ui/PageTransition'));


export const AppLayout: FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useSystemActions();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Global security, automation & shortcuts hooks
  useSessionSecurity({ idleTimeoutMs: 30 * 60 * 1000 });
  const { criticalCount } = useCrossModuleAutomation();
  useRealtimeAlerts();
  useGlobalShortcuts();
  useAutoTour();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      <SEOWrapper>
        <SidebarProvider defaultOpen={true}>
          <div className="min-h-screen flex w-full bg-background">
            {/* Offline Status Bar */}
            <Suspense fallback={null}>
              <OfflineStatusBar position="bottom" />
            </Suspense>
            
            {/* Sidebar - renders as Sheet on mobile, fixed on desktop */}
            <div data-tour="sidebar">
              <AppSidebar />
            </div>
            
            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
              <Header />
              <main className="flex-1 overflow-auto px-3 pb-24 md:px-6 md:pb-6 lg:px-8 xl:px-10 2xl:px-12" data-tour="main-content">
                <Suspense fallback={null}><SmartBreadcrumbs /></Suspense>
                <ModuleErrorBoundary moduleName="Módulo">
                  <Suspense fallback={<ModulePageSkeleton />}>
                    <Suspense fallback={null}>
                      <PageTransition>
                        <Outlet />
                      </PageTransition>
                    </Suspense>
                  </Suspense>
                </ModuleErrorBoundary>
              </main>
            </div>
            
            {/* Mobile Bottom Navigation - only shows on mobile */}
            <MobileBottomNav criticalAlerts={criticalCount} />
            
            {/* Global Features */}
            <Suspense fallback={null}>
              <GlobalSearch 
                isOpen={isSearchOpen} 
                onOpenChange={setIsSearchOpen} 
              />
            </Suspense>
            <Suspense fallback={null}>
              <EnhancedNotifications 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </Suspense>
            {/* Quick Action FAB */}
            <Suspense fallback={null}>
              <QuickActionFAB />
            </Suspense>
            <Suspense fallback={null}>
              <KeyboardShortcutsHelp />
            </Suspense>
            
            {/* Toast Notifications — single instance in App.tsx */}
          </div>
        </SidebarProvider>
      </SEOWrapper>
    </ThemeProvider>
  );
};

export default AppLayout;
