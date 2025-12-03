import React from "react";
import UserOnboardingCenter from "@/components/onboarding/user-onboarding-center";
import { UserPlus } from "lucide-react";

const UserOnboardingPage = () => {
  return (
    <div className="p-6 space-y-6">
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
    </div>
  );
};

export default UserOnboardingPage;