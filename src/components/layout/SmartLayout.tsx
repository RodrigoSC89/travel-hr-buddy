import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { SmartHeader } from "@/components/layout/SmartHeader";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { mobileClasses } from "@/styles/mobile-ui-kit";
import { SkipToContent } from "@/components/ui/AccessibleButton";

// Simple loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="text-center space-y-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      <p className="text-sm text-muted-foreground">Carregando módulo...</p>
    </div>
  </div>
);

export function SmartLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
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
            className={`flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 ${mobileClasses.responsivePadding} focus:outline-none`}
          >
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default SmartLayout;
