import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { QuickActionsBar } from '@/components/ui/quick-actions-bar';
import VoiceInterface from '@/components/voice/VoiceInterface';
import IntelligentChatbot from '@/components/voice/IntelligentChatbot';
import { useSystemActions } from '@/hooks/use-system-actions';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/layout/theme-provider';

export const AppLayout: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useSystemActions();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
          
          {/* Floating Components */}
          <QuickActionsBar onOpenSearch={() => setIsSearchOpen(true)} />
          <VoiceInterface />
          <IntelligentChatbot />
          
          {/* Toast Notifications */}
          <Toaster />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default AppLayout;