import React from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { OptimizationGeneralHub } from "@/components/optimization/optimization-general-hub";

const OptimizationGeneral = () => {
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col">
        <OptimizationGeneralHub />
      </div>
    </MainLayout>
  );
};

export default OptimizationGeneral;