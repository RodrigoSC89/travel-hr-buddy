import React from "react";
import { CompleteSecurity } from "@/components/security/complete-security";
import { Shield } from "lucide-react";

const Security = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Centro de Segurança</h1>
          <p className="text-muted-foreground">
            Proteção avançada e monitoramento
          </p>
        </div>
      </div>
      <CompleteSecurity />
    </div>
  );
};

export default Security;