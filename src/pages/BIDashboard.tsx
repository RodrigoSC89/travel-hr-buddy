/**
 * BI DASHBOARD PAGE - PHASE 3
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { BIDashboardBuilder } from "@/components/bi/BIDashboardBuilder";

const BIDashboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Business Intelligence | Nautilus One</title>
        <meta name="description" content="Dashboards customizáveis com consultas assistidas por IA" />
      </Helmet>
      <div className="container mx-auto p-6 max-w-7xl">
        <BIDashboardBuilder />
      </div>
    </>
  );
});

export default BIDashboard;
