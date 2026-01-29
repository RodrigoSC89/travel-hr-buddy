/**
 * 🚚 Smart Logistics AI Page
 * NAUTILUS ONE v6.0 - Autonomous Supply Chain Intelligence
 * 
 * Features:
 * - Predictive inventory management
 * - Demand forecasting with ML
 * - Autonomous reordering system
 * - Supply chain optimization
 */

import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const SmartLogistics = lazy(() => import("@/modules/smart-logistics"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando Logistics AI...</p>
      </div>
    </div>
  );
}

export default function SmartLogisticsAIPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SmartLogistics />
    </Suspense>
  );
}
