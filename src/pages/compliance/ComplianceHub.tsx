// @ts-nocheck
import React from "react";
import ComplianceReporter from "@/components/compliance/ComplianceReporter";
import ISMChecklist from "@/components/compliance/ISMChecklist";

export default function ComplianceHub() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-cyan-400">Compliance Hub</h1>
        <p className="text-gray-400">
          Centro de Gestão de Conformidade e Regulamentações Marítimas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComplianceReporter />
        <ISMChecklist />
      </div>
    </div>
  );
}
