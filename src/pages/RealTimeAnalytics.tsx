import React from "react";
import RealTimeAnalytics from "@/components/analytics/real-time-analytics";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

const RealTimeAnalyticsPage = () => {
  return (
    <ModulePageWrapper gradient="green">
      <RealTimeAnalytics />
    </ModulePageWrapper>
  );
};

export default RealTimeAnalyticsPage;
