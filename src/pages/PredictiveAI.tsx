/**
 * PREDICTIVE AI PAGE - PHASE 1
 * Página de Recomendações Preditivas com IA
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import { PredictiveRecommendationsPanel } from "@/components/ai/PredictiveRecommendationsPanel";

const PredictiveAI: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>IA Preditiva | Nautilus One</title>
        <meta name="description" content="Sistema de recomendações preditivas baseado em IA para gestão marítima proativa" />
      </Helmet>
      
      <div className="container mx-auto p-6 max-w-7xl">
        <PredictiveRecommendationsPanel />
      </div>
    </>
  );
});

export default PredictiveAI;
