/**
 * NOC Monitoring Page - Network Operations Center
 */

import { Helmet } from "react-helmet-async";
import { NOCMonitoringCenter } from "@/components/noc/NOCMonitoringCenter";

export default function NOCMonitoring() {
  return (
    <>
      <Helmet>
        <title>Centro de Monitoramento NOC | Nautilus One</title>
        <meta 
          name="description" 
          content="Centro de operações de rede 24/7 com monitoramento proativo, alertas inteligentes e resposta automatizada" 
        />
        <meta name="keywords" content="NOC, monitoramento, alertas, operações, tempo real" />
        <link rel="canonical" href="/noc-monitoring" />
      </Helmet>
      <NOCMonitoringCenter />
    </>
  );
}
