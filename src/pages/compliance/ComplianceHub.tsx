// @ts-nocheck
import React from "react";
import ComplianceReporter from "@/components/compliance/ComplianceReporter";
import ISMChecklist from "@/components/compliance/ISMChecklist";

export default function ComplianceHub() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <ComplianceReporter />
      <ISMChecklist />
    </div>
  );
}
