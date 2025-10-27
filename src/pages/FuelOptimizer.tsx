import React from "react";
import { FuelOptimizer } from "@/components/fuel/fuel-optimizer";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";

const FuelOptimizerPage = () => {
  return (
    <div className="space-y-6">
      <BackToDashboard />
      <FuelOptimizer />
    </div>
  );
};

export default FuelOptimizerPage;
