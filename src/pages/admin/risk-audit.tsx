// @ts-nocheck
import { safeLazyImport } from "@/utils/safeLazyImport";
import React from "react";

const TacticalRiskPanel = safeLazyImport(
  () => import("@/modules/risk-audit/TacticalRiskPanel"),
  "Tactical Risk Panel"
);

export default function RiskAuditPage() {
  return <TacticalRiskPanel />;
}
