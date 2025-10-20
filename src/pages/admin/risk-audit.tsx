import { lazy, Suspense } from "react";

const TacticalRiskPanel = lazy(() => import("@/modules/risk-audit/TacticalRiskPanel"));

export default function RiskAuditPage() {
  return (
    <Suspense fallback={<p>Carregando painel de auditoria de risco...</p>}>
      <TacticalRiskPanel />
    </Suspense>
  );
}
