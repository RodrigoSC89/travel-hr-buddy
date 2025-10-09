import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import UserOnboardingCenter from "@/components/onboarding/user-onboarding-center";
import { UserPlus } from "lucide-react";


const UserOnboardingPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Onboarding de Usuários</h1>
              <p className="text-muted-foreground">
                Centro de gestão de novos usuários e treinamento
              </p>
            </div>
          </div>
          <UserOnboardingCenter />
        </main>
        
      </div>
    </SidebarProvider>
  );
};

export default UserOnboardingPage;