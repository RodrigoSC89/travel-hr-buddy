import React, { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { SmartHeader } from "@/components/layout/SmartHeader";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mobileClasses } from "@/styles/mobile-ui-kit";
import { SkipToContent } from "@/components/ui/AccessibleButton";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { SmoothPageTransition } from "@/components/ui/SmoothPageTransition";
import { ModuleErrorBoundary } from "@/components/error/ModuleErrorBoundary";
import { ModulePageSkeleton } from "@/components/ui/LoadingSkeleton";

// Lazy load notification prompt and offline status
const NotificationPrompt = lazy(() => import("@/components/notifications/NotificationPrompt"));
const OfflineStatusBar = lazy(() => 
  import("@/components/offline/OfflineStatusBar").then(m => ({ default: m.OfflineStatusBar }))
);


export function SmartLayout() {
  // Restaurar posição do scroll entre navegações
  useScrollRestoration();
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      <TooltipProvider>
        {/* Skip to content link for accessibility */}
        <SkipToContent targetId="main-content" />
        
        <div className={`flex h-screen w-full overflow-hidden bg-background ${mobileClasses.safeAreaTop} ${mobileClasses.safeAreaBottom}`}>
          {/* Smart Sidebar - hidden on mobile by default */}
          <div className={mobileClasses.hideOnMobile}>
            <SmartSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Smart Header - responsive */}
            <SmartHeader />

            {/* Page Content - responsive padding */}
            <main 
              id="main-content"
              tabIndex={-1}
              className={`flex-1 overflow-y-auto bg-background ${mobileClasses.responsivePadding} focus:outline-none`}
            >
              <SmoothPageTransition>
                <ModuleErrorBoundary moduleName="Página">
                  <Suspense fallback={<ModulePageSkeleton />}>
                    <Outlet />
                  </Suspense>
                </ModuleErrorBoundary>
              </SmoothPageTransition>
            </main>
          </div>

          {/* Toast Notifications — single instance in App.tsx */}
          
          {/* Push Notification Prompt */}
          <Suspense fallback={null}>
            <NotificationPrompt />
          </Suspense>
          
          {/* Offline Status Bar */}
          <Suspense fallback={null}>
            <OfflineStatusBar position="bottom" />
          </Suspense>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default SmartLayout;
