import { useState, Suspense, lazy } from "react";
import type { FC } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

import { useSystemActions } from "@/hooks/use-system-actions";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SEOWrapper } from "@/components/layout/seo-wrapper";
import GlobalSearch from "@/components/ui/global-search";

import EnhancedNotifications from "@/components/ui/enhanced-notifications";

// Lazy load offline components
const OfflineStatusBar = lazy(() => 
  import('@/components/offline/OfflineStatusBar').then(m => ({ default: m.OfflineStatusBar }))
);

export const AppLayout: FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useSystemActions();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
            <AppSidebar />
            
            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
              <Header />
              <main className="flex-1 overflow-auto px-3 pb-20 md:px-6 md:pb-6">
                <Outlet />
              </main>
            </div>
            
            {/* Mobile Bottom Navigation - only shows on mobile */}
            <MobileBottomNav />
            
            {/* Global Features */}
            <GlobalSearch 
              isOpen={isSearchOpen} 
              onOpenChange={setIsSearchOpen} 
            />
            <EnhancedNotifications 
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
            
            {/* Toast Notifications */}
            <Toaster />
          </div>
        </SidebarProvider>
      </SEOWrapper>
    </ThemeProvider>
  );
};

export default AppLayout;
