/**
 * Operations Intelligence Page - 3D Fleet Visualization
 * AI-powered voyage optimization and real-time monitoring
 */

import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const OperationsDashboard3D = lazy(() => import("@/modules/operations-intelligence"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function OperationsIntelligencePage() {
  return (
    <>
      <Helmet>
        <title>Operations Intelligence | Dashboard 3D de Operações</title>
        <meta 
          name="description" 
          content="Dashboard 3D de operações marítimas com IA para otimização de viagens, monitoramento em tempo real e visualização de frota" 
        />
      </Helmet>
      <Suspense fallback={<LoadingFallback />}>
        <OperationsDashboard3D />
      </Suspense>
    </>
  );
}
