import { safeLazyImport } from "@/utils/safeLazyImport";

const TacticalRiskPanel = safeLazyImport(
  () => React.lazy(() => import(import("@/modules/risk-audit/TacticalRiskPanel"))),
  "Tactical Risk Panel"
);

export default function RiskAuditPage() {
  return <TacticalRiskPanel />;
}
