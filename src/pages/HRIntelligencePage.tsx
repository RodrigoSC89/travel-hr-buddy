/**
 * HR Intelligence Page - Talent Analytics Dashboard
 * AI-powered talent matching, career development, and wellness monitoring
 */

import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const TalentAnalyticsDashboard = lazy(() => import("@/modules/hr-intelligence"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function HRIntelligencePage() {
  return (
    <>
      <Helmet>
        <title>HR Intelligence | Talent Analytics Dashboard</title>
        <meta 
          name="description" 
          content="Dashboard de inteligência de RH com matching de talentos por IA, desenvolvimento de carreira e monitoramento de bem-estar" 
        />
      </Helmet>
      <Suspense fallback={<LoadingFallback />}>
        <TalentAnalyticsDashboard />
      </Suspense>
    </>
  );
}
