/**
 * VOYAGE SIMULATOR PAGE - PHASE 5
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { VoyageSimulator } from "@/components/voyage/VoyageSimulator";

const VoyageSimulatorPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Simulador de Viagem | Nautilus One</title>
        <meta name="description" content="Simule rotas marítimas com previsão de consumo, clima e otimização por IA" />
      </Helmet>
      <div className="container mx-auto p-6 max-w-7xl">
        <VoyageSimulator />
      </div>
    </>
  );
});

export default VoyageSimulatorPage;
