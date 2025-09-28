import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';

import { useSystemActions } from '@/hooks/use-system-actions';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { SEOWrapper } from '@/components/layout/seo-wrapper';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import GlobalSearch from '@/components/ui/global-search';

import EnhancedNotifications from '@/components/ui/enhanced-notifications';

export const AppLayout: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useSystemActions();
  const [isAssistantMinimized, setIsAssistantMinimized] = React.useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      <SEOWrapper>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <OfflineIndicator />
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 overflow-auto pr-4 pb-28 md:pb-40 md:pr-6">
                <Outlet />
              </main>
            </div>
            
            {/* Enhanced Global Features */}
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