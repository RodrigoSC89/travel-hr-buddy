/**
 * Executive Compliance Dashboard Page
 * Consolidated KPIs for all compliance modules
 */

import { Helmet } from 'react-helmet-async';
import { ExecutiveComplianceDashboard } from '@/components/compliance/ExecutiveComplianceDashboard';

export default function ExecutiveCompliancePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard Executivo de Compliance - Nautilus One</title>
        <meta name="description" content="KPIs consolidados de PEOTRAM, PEO-DP, MLC e SGSO com análise de tendências e riscos" />
      </Helmet>
      <div className="container mx-auto py-6">
        <ExecutiveComplianceDashboard />
      </div>
    </>
  );
}
