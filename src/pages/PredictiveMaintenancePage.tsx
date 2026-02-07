/**
 * Predictive Maintenance Page
 * ML-powered equipment failure prediction + AI deep analysis
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PredictiveMaintenanceDashboard } from '@/components/maintenance/PredictiveMaintenanceDashboard';
import MaintenanceDashboard from '@/components/maintenance/MaintenanceDashboard';

export default function PredictiveMaintenancePage() {
  return (
    <>
      <Helmet>
        <title>Manutenção Preditiva | Nautilus One</title>
        <meta name="description" content="Sistema de manutenção preditiva com ML e IA para análise de equipamentos marítimos" />
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manutenção Preditiva</h1>
          <p className="text-muted-foreground">
            Sistema ML + IA para previsão de falhas e otimização de manutenção
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Dashboard - 3 cols */}
          <div className="lg:col-span-3">
            <PredictiveMaintenanceDashboard />
          </div>

          {/* Side Panel - 1 col */}
          <div className="space-y-6">
            <MaintenanceDashboard />
          </div>
        </div>
      </div>
    </>
  );
}
