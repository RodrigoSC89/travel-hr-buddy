/**
 * Nautilus Command Page - Entry point for the unified command center
 * PATCH UNIFY-COMMAND: Fusão de Command Center, Dashboard Executivo, Centro de Operações
 */

import NautilusCommandCenterUnified from "@/modules/nautilus-command-center";
import { Helmet } from "react-helmet-async";

export default function NautilusCommand() {
  return (
    <>
      <Helmet>
        <title>Nautilus Command Center | Nautilus One</title>
        <meta 
          name="description" 
          content="Centro de comando unificado com IA para gestão marítima avançada - Visão Geral, Operações, Análise Executiva, IA, Alertas e Configurações" 
        />
      </Helmet>
      <NautilusCommandCenterUnified />
    </>
  );
}
