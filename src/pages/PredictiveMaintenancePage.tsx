/**
 * Predictive Maintenance Page
 * Machine learning-powered equipment failure prediction
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PredictiveMaintenanceDashboard } from '@/components/maintenance/PredictiveMaintenanceDashboard';

export default function PredictiveMaintenancePage() {
  return (
    <>
      <Helmet>
        <title>Manutenção Preditiva | Nautilus One</title>
        <meta name="description" content="Sistema de manutenção preditiva com ML para análise de equipamentos marítimos" />
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manutenção Preditiva</h1>
          <p className="text-muted-foreground">
            Sistema ML para previsão de falhas e otimização de manutenção
          </p>
        </div>
        
        <PredictiveMaintenanceDashboard />
      </div>
    </>
  );
}
