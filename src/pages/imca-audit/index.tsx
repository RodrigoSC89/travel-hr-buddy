/**
 * IMCA Audit Page
 * Main page for IMCA technical audit generation and management
 */

import React from "react";
import IMCAAuditGenerator from "@/components/imca-audit/imca-audit-generator";

const IMCAAuditPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <IMCAAuditGenerator />
    </div>
  );
};

export default IMCAAuditPage;
