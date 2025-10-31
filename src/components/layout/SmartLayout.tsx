import React, { Suspense, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { SmartHeader } from "@/components/layout/SmartHeader";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { mobileClasses } from "@/styles/mobile-ui-kit";
import { logger } from "@/lib/logger";

// Fallback timeout para prevenir travamentos no Suspense
const SuspenseWithTimeout = ({ children, fallback, timeout = 5000 }: { 
  children: React.ReactNode; 
  fallback: React.ReactNode;
  timeout?: number;
}) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
      logger.warn("⚠️ Suspense timeout - forçando fallback");
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (timedOut) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
};

export function SmartLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      <div className={`flex h-screen w-full overflow-hidden bg-background ${mobileClasses.safeAreaTop} ${mobileClasses.safeAreaBottom}`}>
        {/* Smart Sidebar - hidden on mobile by default */}
        <div className={mobileClasses.hideOnMobile}>
          <SmartSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Smart Header - responsive */}
          <SmartHeader />

          {/* Page Content - responsive padding with timeout protection */}
          <main className={`flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 ${mobileClasses.responsivePadding}`}>
            <SuspenseWithTimeout 
              fallback={
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="text-center space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-sm text-muted-foreground">Carregando módulo...</p>
                  </div>
                </div>
              }
              timeout={5000}
            >
              <Outlet />
            </SuspenseWithTimeout>
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default SmartLayout;
