import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { SmartHeader } from "@/components/layout/SmartHeader";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { mobileClasses } from "@/styles/mobile-ui-kit";
import ModuleErrorBoundary from "@/components/layout/module-error-boundary";

export function SmartLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      <div
        className={`flex h-screen w-full overflow-hidden bg-background ${mobileClasses.safeAreaTop} ${mobileClasses.safeAreaBottom}`}
      >
        <div className={mobileClasses.hideOnMobile}>
          <SmartSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <SmartHeader />

          <main
            className={`flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 ${mobileClasses.responsivePadding}`}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="text-center space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-sm text-muted-foreground">Carregando módulo...</p>
                  </div>
                </div>
              }
            >
              {/* evita “congelar” quando um módulo quebra */}
              <ModuleErrorBoundary moduleName="Rota">
                <Outlet />
              </ModuleErrorBoundary>
            </Suspense>
          </main>
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default SmartLayout;
