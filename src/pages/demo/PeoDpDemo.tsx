/**
 * PEO-DP Demo Page
 * Demonstration page for the PEO-DP AI monitoring system
 */

import React from "react";
import { PeoDpMonitoringDemo } from "@/components/peo-dp/peo-dp-monitoring-demo";

const PeoDpDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <PeoDpMonitoringDemo />
      </div>
    </div>
  );
};

export default PeoDpDemo;
