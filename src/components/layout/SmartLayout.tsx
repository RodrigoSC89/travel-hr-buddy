import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { SmartHeader } from "@/components/layout/SmartHeader";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { mobileClasses } from "@/styles/mobile-ui-kit";
import { SkipToContent } from "@/components/ui/AccessibleButton";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { PreloadManager } from "@/components/lazy/PreloadManager";

// Simple loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="text-center space-y-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      <p className="text-sm text-muted-foreground">Carregando módulo...</p>
    </div>
  </div>
);

export const SmartLayout = memo(function() {
  // Restaurar posição do scroll entre navegações
  useScrollRestoration();
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
      {/* FASE 2.5: Preload Manager para lazy loading inteligente */}
      <PreloadManager />
      
      {/* FASE 3.2: Skip to content link for accessibility (WCAG 2.4.1) */}
      <SkipToContent targetId="main-content" />
      
      <div 
        className={`flex h-screen w-full overflow-hidden bg-background ${mobileClasses.safeAreaTop} ${mobileClasses.safeAreaBottom}`}
        role="application"
        aria-label="Nautilus One - Sistema de Gestão Marítima"
      >
        {/* FASE 3.2: Navigation Landmark - Smart Sidebar (WCAG 2.4.1) */}
        <aside 
          className={mobileClasses.hideOnMobile}
          role="navigation"
          aria-label="Navegação principal"
        >
          <SmartSidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* FASE 3.2: Banner Landmark - Smart Header (WCAG 2.4.1) */}
          <header role="banner" aria-label="Cabeçalho principal">
            <SmartHeader />
          </header>

          {/* FASE 3.2: Main Landmark - Page Content (WCAG 2.4.1) */}
          <main 
            id="main-content"
            role="main"
            tabIndex={-1}
            aria-label="Conteúdo principal"
            className={`flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 ${mobileClasses.responsivePadding} focus:outline-none`}
          >
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>

        {/* Toast Notifications - Live Region (WCAG 4.1.3) */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
});

export default SmartLayout;
