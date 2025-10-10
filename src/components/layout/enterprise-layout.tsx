import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { NotificationSystem } from "@/components/ui/notification-system";
import { useSystemActions } from "@/hooks/use-system-actions";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Zap } from "lucide-react";

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
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b px-6 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Sistema Operacional
                      </span>
                      <Badge
                        variant="success"
                        className="bg-success/20 text-success-foreground border-success/40"
                      >
                        Online
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">Segurança</span>
                      <Badge
                        variant="info"
                        className="bg-info/20 text-info-foreground border-info/40"
                      >
                        Ativa
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="text-xs font-medium text-foreground">Performance</span>
                      <Badge
                        variant="warning"
                        className="bg-warning/20 text-warning-foreground border-warning/40"
                      >
                        95%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs text-foreground/80">
                      Usuário: {user?.email?.split("@")[0] || "Anonimo"} | Sessão Ativa
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

            {/* Toast Notifications */}
            <Toaster />
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default EnterpriseLayout;
