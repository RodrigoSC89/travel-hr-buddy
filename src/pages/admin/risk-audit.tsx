import { safeLazyImport } from "@/utils/safeLazyImport";

const TacticalRiskPanel = safeLazyImport(() => import("@/modules/risk-audit/TacticalRiskPanel"), "Tactical Risk Panel");

export default function RiskAuditPage() {
  return <TacticalRiskPanel />;
}
