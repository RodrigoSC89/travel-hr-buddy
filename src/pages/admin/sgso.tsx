/**
 * Admin SGSO - Orchestrator
 * Refactored: tabs extracted to src/pages/sgso/
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck } from "lucide-react";
import { SGSOTabs } from "@/pages/sgso/SGSOTabs";

const AdminSGSO = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Shield className="h-8 w-8 text-primary" />Painel Administrativo SGSO</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestão de Segurança Operacional - Métricas e Compliance</p>
        </div>
        <Badge variant="default" className="text-sm"><FileCheck className="mr-2 h-4 w-4" />Compliance ANP 43/2007</Badge>
      </div>
      <SGSOTabs />
    </div>
  );
};

export default AdminSGSO;
