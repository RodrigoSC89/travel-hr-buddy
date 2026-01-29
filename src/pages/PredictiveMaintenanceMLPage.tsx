/**
 * Predictive Maintenance ML Page
 * TensorFlow.js-powered failure prediction and maintenance planning
 */

import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const MaintenanceDashboardML = lazy(() => import("@/modules/predictive-maintenance"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function PredictiveMaintenanceMLPage() {
  return (
    <>
      <Helmet>
        <title>Manutenção Preditiva ML | TensorFlow.js</title>
        <meta 
          name="description" 
          content="Sistema de manutenção preditiva com Machine Learning usando TensorFlow.js, análise de Weibull e predição de falhas em tempo real" 
        />
      </Helmet>
      <Suspense fallback={<LoadingFallback />}>
        <MaintenanceDashboardML />
      </Suspense>
    </>
  );
}
