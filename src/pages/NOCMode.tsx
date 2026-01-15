/**
 * NOC Mode Page - 24/7 Operations Center View
 */
import { Helmet } from "react-helmet-async";
import NOCModeLayout from "@/modules/nauti-command-center/components/NOCModeLayout";

export default function NOCModePage() {
  return (
    <>
      <Helmet>
        <title>NOC Mode | Nauti One</title>
        <meta name="description" content="Centro de Operações 24/7 - Monitoramento em tempo real" />
      </Helmet>
      <NOCModeLayout />
    </>
  );
}