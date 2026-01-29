/**
 * 💰 Finance Hub AI Page
 * NAUTILUS ONE v6.0 - AI-Powered Financial Intelligence
 * 
 * Features:
 * - Predictive cash flow with ML
 * - Fraud detection with anomaly analysis
 * - Budget optimization with AI
 * - Financial risk assessment
 */

import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const FinanceHub = lazy(() => import("@/modules/finance/FinanceHub"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando Finance AI...</p>
      </div>
    </div>
  );
}

export default function FinanceHubAIPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FinanceHub />
    </Suspense>
  );
}
