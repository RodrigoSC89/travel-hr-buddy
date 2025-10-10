import React from "react";
import { Outlet } from "react-router-dom";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { SmartHeader } from "@/components/layout/SmartHeader";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function SmartLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Smart Sidebar */}
        <SmartSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Smart Header */}
          <SmartHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-zinc-50 dark:bg-zinc-900">
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
