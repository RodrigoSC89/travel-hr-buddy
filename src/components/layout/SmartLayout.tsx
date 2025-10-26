import React from "react";
import { Outlet } from "react-router-dom";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { SmartHeader } from "@/components/layout/SmartHeader";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { mobileClasses } from "@/styles/mobile-ui-kit";

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

          {/* Page Content - responsive padding */}
          <main className={`flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 ${mobileClasses.responsivePadding}`}>
            <Outlet />
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default SmartLayout;
