/**
 * Executive BI Dashboard - Strategic KPIs and Analytics
 */

import { Helmet } from "react-helmet-async";
import { ExecutiveDashboard } from "@/components/executive/ExecutiveDashboard";

export default function ExecutiveBIDashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard Executivo BI | Nautilus One</title>
        <meta 
          name="description" 
          content="Dashboard executivo com KPIs estratégicos, métricas de performance e análise de negócios para gestão marítima" 
        />
        <meta name="keywords" content="BI, dashboard executivo, KPIs, analytics, gestão marítima" />
        <link rel="canonical" href="/executive-bi" />
      </Helmet>
      <ExecutiveDashboard />
    </>
  );
}
