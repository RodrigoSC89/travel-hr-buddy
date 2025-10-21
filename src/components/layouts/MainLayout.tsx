import React, { Suspense, lazy } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader } from "@/components/ui/loader";

const AppSidebar = lazy(() => import("@/components/layout/app-sidebar").then(module => ({ default: module.AppSidebar })));

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader /></div>}>
        <div className="min-h-screen flex w-full bg-[var(--nautilus-bg)] text-[var(--nautilus-text)]">
          <AppSidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </Suspense>
    </SidebarProvider>
  );
};