/**
 * 🔮 Predictive Audit Page
 * Executive Dashboard for AI-powered audit predictions
 */

import { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';

const ExecutiveAuditDashboard = lazy(() => 
  import('@/modules/audits').then(m => ({ default: m.ExecutiveAuditDashboard }))
);

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function PredictiveAuditPage() {
  return (
    <>
      <Helmet>
        <title>Auditoria Preditiva AI | Nautilus One</title>
        <meta 
          name="description" 
          content="Dashboard executivo de auditoria com predição AI, análise ML de riscos, timeline 3D e insights acionáveis" 
        />
        <meta name="keywords" content="auditoria preditiva, IA, machine learning, risk analysis, compliance, maritime" />
        <link rel="canonical" href="/predictive-audit" />
      </Helmet>
      <Suspense fallback={<LoadingFallback />}>
        <ExecutiveAuditDashboard />
      </Suspense>
    </>
  );
}
