/**
 * Nautilus Command Page - Entry point for the unified command center
 * PATCH UNIFY-COMMAND: Fusão de Command Center, Dashboard Executivo, Centro de Operações
 * 
 * Este é o ponto de entrada único para:
 * - Dashboard Executivo (KPIs, ROI, Receita, NPS)
 * - Centro de Operações (Real-time, Status, Mapa)
 * - Inteligência Artificial (Chat, Insights, Previsões)
 * - Central de Alertas (Críticos, Histórico)
 * - Configurações do Sistema
 */

import NautilusCommandCenterUnified from "@/modules/nautilus-command-center";
import { Helmet } from "react-helmet-async";

export default function NautilusCommand() {
  return (
    <>
      <Helmet>
        <title>Nauti Command Center | Centro de Comando Integrado</title>
        <meta 
          name="description" 
          content="Centro de comando unificado Nauti One com IA para gestão marítima avançada - Visão Geral, Operações, Análise Executiva, IA, Alertas e Configurações" 
        />
        <meta name="keywords" content="command center, maritime operations, IA, dashboard executivo, gestão marítima, nauti one" />
        <link rel="canonical" href="/nautilus-command" />
      </Helmet>
      <NautilusCommandCenterUnified />
    </>
  );
}
