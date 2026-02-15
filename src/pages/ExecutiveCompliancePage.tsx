/**
 * Executive Compliance Dashboard Page
 * Consolidated KPIs + Cross-Framework Audit Readiness
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExecutiveComplianceDashboard } from '@/components/compliance/ExecutiveComplianceDashboard';
import { CrossFrameworkAuditDashboard } from '@/components/compliance/CrossFrameworkAuditDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Shield } from 'lucide-react';

export default function ExecutiveCompliancePage() {
  const [tab, setTab] = useState("cross-framework");
  return (
    <>
      <Helmet>
        <title>Dashboard Executivo de Compliance - Nauti One</title>
        <meta name="description" content="KPIs consolidados de PEOTRAM, PEO-DP, MLC e SGSO com análise de tendências e riscos" />
      </Helmet>
      <div className="container mx-auto py-6 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="cross-framework" className="gap-1"><Shield className="h-3.5 w-3.5" />Audit Readiness</TabsTrigger>
            <TabsTrigger value="executive" className="gap-1"><BarChart3 className="h-3.5 w-3.5" />Dashboard Executivo</TabsTrigger>
          </TabsList>
          <TabsContent value="cross-framework"><CrossFrameworkAuditDashboard /></TabsContent>
          <TabsContent value="executive"><ExecutiveComplianceDashboard /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
