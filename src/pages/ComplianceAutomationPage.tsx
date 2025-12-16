/**
 * COMPLIANCE AUTOMATION PAGE - PHASE 6
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { ComplianceAutomation } from "@/components/compliance/ComplianceAutomation";

const ComplianceAutomationPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Conformidade Automatizada | Nautilus One</title>
        <meta name="description" content="Gestão automatizada de conformidade ISM, MLC, MARPOL e SOLAS" />
      </Helmet>
      <div className="container mx-auto p-6 max-w-7xl">
        <ComplianceAutomation />
      </div>
    </>
  );
};

export default ComplianceAutomationPage;
