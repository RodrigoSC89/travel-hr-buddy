import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { QuickActionsBar } from '@/components/ui/quick-actions-bar';
import { NotificationSystem } from '@/components/ui/notification-system';
import VoiceInterface from '@/components/voice/VoiceInterface';
import IntelligentChatbot from '@/components/voice/IntelligentChatbot';
import NautilusCopilot from '@/components/ai/nautilus-copilot';
import { useSystemActions } from '@/hooks/use-system-actions';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ErrorBoundary } from '@/components/layout/error-boundary';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Zap } from 'lucide-react';

export const EnterpriseLayout: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useSystemActions();
  const { user } = useAuth();

  return (
    <ThemeProvider defaultTheme="system" storageKey="nautilus-ui-theme">
      <ErrorBoundary>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background relative">
            {/* Main Layout */}
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              <Header />
              
              {/* Status Bar */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b px-6 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">Sistema Operacional</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Online
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-xs font-medium">Segurança</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Ativa
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="text-xs font-medium">Performance</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        95%
                      </Badge>
                    </div>
                  </div>
                  
                   <div className="flex items-center gap-4">
                     <div className="text-xs text-muted-foreground">
                       Usuário: {user?.email?.split('@')[0] || 'Anonimo'} | Sessão Ativa
                     </div>
                     <NotificationSystem />
                   </div>
                </div>
              </div>
              
              {/* Main Content Area */}
              <main className="flex-1 overflow-auto">
                <div className="min-h-full">
                  <Outlet />
                </div>
              </main>
            </div>
            
            {/* Floating Components */}
            <QuickActionsBar onOpenSearch={() => setIsSearchOpen(true)} />
            <VoiceInterface />
            <IntelligentChatbot />
            <NautilusCopilot />
            
            {/* Toast Notifications */}
            <Toaster />
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default EnterpriseLayout;